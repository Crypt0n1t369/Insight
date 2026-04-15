import type { BotContext } from '../index.js';
import prisma from '../../db/index.js';
import { formatProjectSummary } from '../../services/synthesis.js';

/**
 * Handle /status — shows project status, contributions, and synthesis state.
 */
export async function handleStatus(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);

  if (!ctx.from) {
    await ctx.reply('⚠️ Could not identify your account.');
    return;
  }

  try {
    let projects;

    if (ctx.chat?.type === 'private') {
      // In DM: show user's projects
      projects = await prisma.project.findMany({
        where: { createdById: userId },
        include: {
          _count: { select: { contributions: true, contributors: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });
    } else {
      // In group: find project linked to this group
      const groupId = String(ctx.chat?.id ?? '');
      const linked = await prisma.project.findFirst({
        where: { groupId },
        include: {
          _count: { select: { contributions: true, contributors: true } },
        },
      });
      projects = linked ? [linked] : [];
    }

    if (projects.length === 0) {
      await ctx.reply(
        `📊 *Status*\n\n` +
          `No projects found.\n\n` +
          `In DMs: your created projects\n` +
          `In groups: the linked project`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    for (const project of projects) {
      const challenge = project.challengeStatement ?? '_No challenge set_';
      const latestSynthesis = await prisma.synthesisOutput.findFirst({
        where: { projectId: project.id },
        orderBy: { createdAt: 'desc' },
      });

      const summary = formatProjectSummary({
        name: project.name,
        challenge,
        contributions: project._count.contributions,
        contributors: project._count.contributors,
        latestSynthesis,
      });

      await ctx.reply(summary, { parse_mode: 'MarkdownV2' });

      // Show recent contributions if in group
      if (ctx.chat?.type !== 'private') {
        const recent = await prisma.contribution.findMany({
          where: { projectId: project.id },
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { user: { select: { firstName: true } } },
        });

        if (recent.length > 0) {
          const lines = ['\n📝 *Recent Contributions:*'];
          for (const c of recent) {
            const preview = c.content.slice(0, 50) + (c.content.length > 50 ? '...' : '');
            lines.push(`• ${c.user.firstName}: ${preview}`);
          }
          await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
        }
      }
    }
  } catch (err) {
    console.error(`[Status] Error: ${err}`);
    await ctx.reply('⚠️ Failed to load status.');
  }
}
