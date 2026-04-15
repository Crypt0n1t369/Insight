import type { BotContext } from '../index.js';
import prisma from '../../db/index.js';
import { getProjectWikiPages, appendActivityLog } from '../../services/wiki.js';
import { ingestContribution } from '../../services/openclaw.js';
import { ingestContributionToGraph } from '../../services/knowledgeGraph.js';
import { evaluateContextHealth, resetReadinessOnNewInsight } from '../../services/engine.js';

const INSIGHT_CHECK_THRESHOLD = parseInt(process.env.INSIGHT_CHECK_THRESHOLD ?? '5', 10);

export async function handleInsight(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);
  const text = ctx.message?.text ?? '';
  const args = text.replace('/insight', '').trim();

  if (!ctx.from) {
    await ctx.reply('⚠️ Could not identify your account.');
    return;
  }

  if (!args) {
    await ctx.reply(
      `💡 *Share an Insight*\n\n` +
      `Usage: /insight <your contribution>\n\n` +
      `Example: /insight Interpretability research is key to alignment because...`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Determine project
  let projectId = ctx.session.projectId;

  if (!projectId && (ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup')) {
    const groupId = String(ctx.chat.id);
    const linkedProject = await prisma.project.findFirst({ where: { groupId } });
    projectId = linkedProject?.id ?? null;
  }

  if (!projectId) {
    await ctx.reply(
      `⚠️ No active project found.\nDM me to create or select a project first.`
    );
    return;
  }

  // Ensure user exists
  await ensureUser(ctx);

  // Ensure user is a contributor
  const isContributor = await prisma.contributor.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!isContributor) {
    await prisma.contributor.create({
      data: { projectId, userId, role: 'contributor' },
    });
  }

  // Reset readiness if contributor was previously "ready" (new insight = back to contributing)
  await resetReadinessOnNewInsight(projectId, userId).catch(() => {});

  try {
    // Store contribution
    const contribution = await prisma.contribution.create({
      data: {
        projectId,
        userId,
        content: args,
        source: 'group_command',
        confirmed: false,
      },
    });

    // Get wiki context for OpenClaw
    const wikiPages = await getProjectWikiPages(projectId);

    // Fire-and-forget OpenClaw ingestion
    ingestContribution({ projectId, contribution, wikiPages }).catch((err) => {
      console.error(`[OpenClaw] Ingest error: ${err}`);
    });

    // Fire-and-forget knowledge graph ingestion (entity extraction + relationships)
    ingestContributionToGraph(contribution, projectId).catch((err) => {
      console.error(`[KnowledgeGraph] Ingest error: ${err}`);
    });

    // Log activity
    await appendActivityLog({
      projectId,
      event: 'contribution_added',
      userId,
      detail: args.slice(0, 100),
    });

    // Check context health every N insights
    const insightCount = await prisma.contribution.count({ where: { projectId } });
    let healthReport = null;

    if (insightCount % INSIGHT_CHECK_THRESHOLD === 0 || insightCount <= 3) {
      healthReport = await evaluateContextHealth(projectId).catch(() => null);
    }

    const lines: string[] = [
      `✅ *Insight Received!*`,
      `Contribution #${insightCount} recorded.`,
    ];

    if (healthReport) {
      lines.push(`\n${healthReport.suggestion}`);
    } else {
      lines.push(`\nUse /generate when ready for synthesis.`);
    }

    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(`[Insight] Store error: ${err}`);
    await ctx.reply('⚠️ Failed to store contribution. Please try again.');
  }
}

async function ensureUser(ctx: BotContext): Promise<void> {
  if (!ctx.from) return;
  const userId = String(ctx.from.id);

  try {
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        username: ctx.from.username ?? undefined,
        firstName: ctx.from.first_name,
        languageCode: ctx.from.language_code ?? undefined,
      },
      create: {
        id: userId,
        username: ctx.from.username ?? null,
        firstName: ctx.from.first_name,
        languageCode: ctx.from.language_code ?? null,
      },
    });
  } catch (err) {
    console.error(`[DB] User upsert error: ${err}`);
  }
}
