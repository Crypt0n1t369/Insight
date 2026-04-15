import type { BotContext } from '../index.js';
import prisma from '../../db/index.js';
import { formatContributionForTelegram } from '../../services/synthesis.js';
import { markContributorReady, evaluateContextHealth } from '../../services/engine.js';

/**
 * Handle /my-insights — lists all contributions by the user across projects.
 * DM-only command.
 */
export async function handlePersonalInsights(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);

  if (!ctx.from) {
    await ctx.reply('⚠️ Could not identify your account.');
    return;
  }

  try {
    const contributions = await prisma.contribution.findMany({
      where: { userId },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (contributions.length === 0) {
      await ctx.reply(
        `👤 *Your Insights*\n\n` +
        `You haven't shared any insights yet.\n\n` +
        `Use /insight <text> in a group to contribute.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const lines: string[] = [`👤 *Your Insights* (${contributions.length})\n`];

    const byProject = new Map<string, typeof contributions>();
    for (const c of contributions) {
      const pid = c.projectId;
      if (!byProject.has(pid)) byProject.set(pid, []);
      byProject.get(pid)!.push(c);
    }

    for (const [projectId, contribs] of byProject) {
      const projectName = contribs[0]?.project?.name ?? projectId.slice(0, 8);
      lines.push(`\n📁 *${projectName}*`);
      for (const c of contribs.slice(0, 3)) {
        const preview = c.content.slice(0, 60) + (c.content.length > 60 ? '...' : '');
        const confirmed = c.confirmed ? '✅' : '⏳';
        lines.push(`${confirmed} ${preview}`);
      }
      if (contribs.length > 3) {
        lines.push(`  +${contribs.length - 3} more`);
      }
    }

    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(`[Personal] Insights error: ${err}`);
    await ctx.reply('⚠️ Failed to load your insights.');
  }
}

/**
 * Handle /confirm — mark a contribution as approved for synthesis.
 * Usage: /confirm <contribution-id>
 */
export async function handleConfirm(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);
  const text = ctx.message?.text ?? '';
  const args = text.replace('/confirm', '').trim();

  if (!ctx.from) {
    await ctx.reply('⚠️ Could not identify your account.');
    return;
  }

  if (!args) {
    await ctx.reply(
      `✅ *Confirm a Contribution*\n\n` +
      `Usage: /confirm <contribution-id>\n\n` +
      `Find contribution IDs with /myinsights\n\n` +
      `Your contributions are confirmed automatically when shared.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  let contributionId = args;
  if (args.length < 36) {
    const match = await prisma.contribution.findFirst({
      where: { id: { startsWith: args }, userId },
    });
    if (match) {
      contributionId = match.id;
    } else {
      await ctx.reply('⚠️ Contribution not found. Check /myinsights for IDs.');
      return;
    }
  }

  try {
    const contribution = await prisma.contribution.findUnique({ where: { id: contributionId } });

    if (!contribution) {
      await ctx.reply('⚠️ Contribution not found.');
      return;
    }

    if (contribution.userId !== userId) {
      await ctx.reply('⚠️ You can only confirm your own contributions.');
      return;
    }

    await prisma.contribution.update({
      where: { id: contributionId },
      data: { confirmed: true },
    });

    await prisma.personalSpace.upsert({
      where: { contributionId },
      update: { approvedShare: true },
      create: { contributionId, userId, approvedShare: true },
    });

    await ctx.reply(
      `✅ *Confirmed*\n\n` +
      `Contribution has been approved for synthesis.\n\n` +
      `Use /generate in the group when ready.`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error(`[Confirm] Error: ${err}`);
    await ctx.reply('⚠️ Failed to confirm contribution.');
  }
}

/**
 * Handle /ready — signals contributor is done contributing.
 * Bot checks consensus and either confirms or shows waiting status.
 * If all (or threshold) contributors ready → triggers auto-synthesis.
 */
export async function handleReady(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);

  if (!ctx.from) {
    await ctx.reply('⚠️ Could not identify your account.');
    return;
  }

  // Get current project from session
  let projectId = ctx.session.projectId;

  if (!projectId) {
    const latestProject = await prisma.project.findFirst({
      where: {
        contributors: { some: { userId } },
      },
      orderBy: { createdAt: 'desc' },
    });
    projectId = latestProject?.id ?? null;
  }

  if (!projectId) {
    await ctx.reply(
      `📋 No project found. Use /newproject in DM first.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  try {
    const result = await markContributorReady(projectId, userId);

    await ctx.reply(result.message, { parse_mode: 'Markdown' });

    // If consensus reached, trigger auto-synthesis prompt in group
    if (result.isConsensus) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (project?.groupId) {
        // Post consensus notification to group
        const groupMsg =
          `✅ *Consensus reached!*\n\n` +
          `All ${result.totalContributors} contributors ready.\n` +
          `Type /generate to trigger synthesis, or wait 60s for auto-trigger.`;
        // Note: we'd need bot token to send to group — stored in groupId
        console.log(`[Engine] Consensus reached for project ${projectId} — groupId: ${project.groupId}`);
      }
    }
  } catch (err) {
    console.error(`[Ready] Error: ${err}`);
    await ctx.reply('⚠️ Failed to register readiness.');
  }
}

/**
 * Handle /status — shows project status including readiness consensus.
 */
export async function handleStatusWithReadiness(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);

  if (!ctx.from) {
    await ctx.reply('⚠️ Could not identify your account.');
    return;
  }

  try {
    let projects;

    if (ctx.chat?.type === 'private') {
      projects = await prisma.project.findMany({
        where: { createdById: userId },
        include: {
          _count: { select: { contributions: true, contributors: true } },
          contributors: { include: { readinessSignal: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });
    } else {
      const groupId = String(ctx.chat?.id ?? '');
      const linked = await prisma.project.findFirst({
        where: { groupId },
        include: {
          _count: { select: { contributions: true, contributors: true } },
          contributors: { include: { readinessSignal: true } },
        },
      });
      projects = linked ? [linked] : [];
    }

    if (projects.length === 0) {
      await ctx.reply(
        `📊 *Status*\n\nNo projects found.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    for (const project of projects) {
      const challenge = project.challengeStatement ?? '_No challenge set_';
      const readyContributors = project.contributors.filter(c => c.readinessSignal?.status === 'ready').length;
      const totalContributors = project._count.contributors;
      const health = await evaluateContextHealth(project.id);

      const lines = [
        `🎯 *${project.name}*`,
        `📝 ${challenge.slice(0, 80)}${challenge.length > 80 ? '...' : ''}`,
        `💬 ${project._count.contributions} contributions · ${totalContributors} contributors`,
        `🟢 ${readyContributors}/${totalContributors} ready`,
        `🧠 Context: ${health.status}`,
        `💡 ${health.suggestion}`,
      ];

      await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
    }
  } catch (err) {
    console.error(`[Status] Error: ${err}`);
    await ctx.reply('⚠️ Failed to load status.');
  }
}
