import type { BotContext } from '../index.js';
import prisma from '../../db/index.js';
import { getProjectWikiPages, appendActivityLog, updateProjectIndex } from '../../services/wiki.js';
import { triggerSynthesis, spawnOpenClawAgent, pollForSynthesis } from '../../services/openclaw.js';
import { parseOpenClawResponse, formatSynthesisForTelegram } from '../../services/synthesis.js';
import { crystallizeSynthesis } from '../../services/crystallize.js';
import { OPENCLAW_WORKSPACE } from '../../config.js';
import { unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Handle /generate — triggers OpenClaw synthesis for the active project.
 * Only works in group chats.
 */
export async function handleGenerate(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);

  if (!ctx.from) {
    await ctx.reply('⚠️ Could not identify your account.');
    return;
  }

  // Determine project
  let projectId = ctx.session.projectId;

  if (!projectId && (ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup')) {
    const groupId = String(ctx.chat.id);
    const linkedProject = await prisma.project.findFirst({
      where: { groupId },
    });
    projectId = linkedProject?.id ?? null;
  }

  if (!projectId) {
    await ctx.reply(
      `⚠️ No active project found.\n` +
        `DM me to create or link a project first.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Verify project has a challenge
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    await ctx.reply('⚠️ Project not found.');
    return;
  }

  if (!project.challengeStatement) {
    await ctx.reply(
      `⚠️ No challenge statement set.\n` +
        `Use /define-challenge in DM to set one first.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Fetch confirmed contributions
  const contributions = await prisma.contribution.findMany({
    where: { projectId, confirmed: true },
  });

  if (contributions.length === 0) {
    // Also include unconfirmed if nothing confirmed
    const allContributions = await prisma.contribution.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (allContributions.length === 0) {
      await ctx.reply('⚠️ No contributions yet. Use /insight <text> first.');
      return;
    }

    await ctx.reply(
      `⏳ No confirmed contributions yet — using recent ones for synthesis.`
    );
    // Use unconfirmed for synthesis
    contributions.push(...allContributions);
  }

  await ctx.reply(`🧠 *Synthesis triggered...*\n\nThis may take up to 2 minutes.`);

  try {
    // Create synthesis task in OpenClaw
    const { taskId, taskFile } = await triggerSynthesis({
      projectId,
      challenge: project.challengeStatement,
      contributions,
    });

    // Spawn OpenClaw agent to process it
    const { success } = await spawnOpenClawAgent({ projectId, taskFile });

    // Store task for tracking
    const task = await prisma.task.create({
      data: {
        id: taskId,
        taskType: 'synthesize',
        status: 'processing',
        payload: JSON.stringify({ projectId, challenge: project.challengeStatement }),
        projectId,
      },
    });

    if (success) {
      // Brief acknowledgment while polling
      await ctx.reply(
        `✅ *Synthesis started*\n\n` +
          `Task: ${taskId}\n` +
          `Contributions: ${contributions.length}\n\n` +
          `I'll report results when ready.`,
        { parse_mode: 'Markdown' }
      );
    }

    // Log activity
    await appendActivityLog({
      projectId,
      event: 'synthesis_triggered',
      userId,
      detail: `Task ${taskId}, ${contributions.length} contributions`,
    });
  } catch (err) {
    console.error(`[Generate] Synthesis error: ${err}`);
    await ctx.reply('⚠️ Synthesis failed to start. Please try again.');
  }
}

/**
 * Handle /generate-result — retrieve synthesis results after polling.
 * Can be triggered manually or after synthesis completes.
 */
export async function handleGenerateResult(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);
  let projectId = ctx.session.projectId;

  if (!projectId) {
    if (ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup') {
      const groupId = String(ctx.chat.id);
      const linkedProject = await prisma.project.findFirst({
        where: { groupId },
      });
      projectId = linkedProject?.id ?? null;
    }
  }

  if (!projectId) {
    await ctx.reply('⚠️ No active project.');
    return;
  }

  // Find latest synthesis task with result
  // Step 1: If OpenClaw wrote back to task.result (Option A — DB), use it
  const latestTask = await prisma.task.findFirst({
    where: { projectId, taskType: 'synthesize', status: 'done' },
    orderBy: { createdAt: 'desc' },
  });

  let rawResult: string | null = latestTask?.result ?? null;

  // Step 2: If no task.result in DB, poll synthesis-latest.md (Option B — file polling)
  if (!rawResult) {
    await ctx.reply('🧠 *Checking for synthesis results...*', { parse_mode: 'Markdown' });
    const pollingStart = Date.now();
    const POLL_TIMEOUT = 120000; // 2 minutes
    const POLL_INTERVAL = 10000; // 10 seconds

    let pollResult: { parsed: any; rawContent: string; taskId: string | null } | null = null;

    while (Date.now() - pollingStart < POLL_TIMEOUT) {
      pollResult = await pollForSynthesis({ projectId, timeoutMs: POLL_INTERVAL });
      if (pollResult) break;
    }

    if (!pollResult) {
      await ctx.reply(
        '⚠️ Synthesis timed out (2 minutes). OpenClaw may not be monitoring the TASKS directory.\n' +
        'Run `/generate` again, or check that OpenClaw is running and processing TASKS files.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Successfully polled — update task.result in DB if taskId known (TASKS Monitor sidecar)
    if (pollResult.taskId && latestTask) {
      try {
        await prisma.task.update({
          where: { id: latestTask.id },
          data: { status: 'done', result: pollResult.rawContent },
        });
        // Delete sidecar file after DB update to keep workspace clean
        const sidecarFile = join(
          OPENCLAW_WORKSPACE,
          'memory/03-projects',
          projectId,
          `task-result-${pollResult.taskId}.txt`
        );
        await unlink(sidecarFile).catch(() => {/* sidecar may not exist */});
      } catch (err) {
        // Non-fatal — synthesis still works even if DB update fails
        console.error(`[Generate] Could not update task result in DB: ${err}`);
      }
    }

    // Use raw content for the raw LlmaResponse field
    rawResult = pollResult.rawContent;

    // Use the parsed sections directly to reconstruct proper markdown with ## headers.
    // The rawContent may not have the expected ## heading structure, so we rebuild
    // the markdown cleanly from the parsed fields — this ensures re-parsing works.
    const polled = pollResult.parsed;
    const nextStepsMd = (polled.nextSteps ?? [])
      .map((s: { step: string; votes?: number }, i: number) => `## Next Steps\n${i + 1}. ${s.step}${s.votes ? ` (${s.votes} votes)` : ''}`)
      .join('\n');
    rawResult = `## Commonalities\n${polled.commonalities ?? ''}\n\n## Divergences\n${polled.divergences ?? ''}\n\n## Cross-links\n${polled.crossLinksSummary ?? ''}\n\n## Structured Outline\n${polled.structuredOutline ?? ''}\n\n${nextStepsMd}`;
  }

  try {
    const parsed = parseOpenClawResponse(rawResult!);
    const formatted = formatSynthesisForTelegram(parsed);

    // Store synthesis output in DB with quality score
    const synthesisOutput = await prisma.synthesisOutput.create({
      data: {
        commonalities: parsed.commonalities,
        divergences: parsed.divergences,
        crossLinksSummary: parsed.crossLinksSummary,
        structuredOutline: parsed.structuredOutline,
        nextSteps: JSON.stringify(parsed.nextSteps),
        rawLlmaResponse: rawResult,
        qualityScore: 0.7, // TODO: LLM-assess quality
        projectId,
        generatedById: userId,
      },
    });

    // Crystallize: file results back into wiki pages
    try {
      const { pagesCreated } = await crystallizeSynthesis({
        synthesisId: synthesisOutput.id,
        projectId,
        generatedById: userId,
      });
      await ctx.reply(
        `✅ Synthesis complete. ${pagesCreated} wiki pages updated from this synthesis.`,
        { parse_mode: 'Markdown' }
      );
    } catch (crystallizeErr) {
      console.error(`[Crystallize] Error: ${crystallizeErr}`);
      // Non-fatal: still show results
    }

    await ctx.reply(formatted, { parse_mode: 'MarkdownV2' });
  } catch (err) {
    console.error(`[Generate] Format error: ${err}`);
    await ctx.reply('⚠️ Failed to format synthesis results.');
  }
}
