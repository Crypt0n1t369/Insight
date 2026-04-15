import type { BotContext } from '../index.js';
import prisma from '../../db/index.js';

/**
 * Handle /vote <1-3> — vote on a proposed next step after synthesis.
 * Only works in group chats where a synthesis has been generated.
 */
export async function handleVote(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);

  if (!ctx.from) {
    await ctx.reply('⚠️ Could not identify your account.');
    return;
  }

  const text = ctx.message?.text ?? '';
  const args = text.replace('/vote', '').trim();

  if (!args) {
    await ctx.reply(
      `🗳️ *Vote on Next Steps*\n\n` +
      `After a synthesis, you can vote on the proposed next steps.\n\n` +
      `Usage: /vote <1-3>\n\n` +
      `Example: /vote 2\n\n` +
      `Run /generate first to produce a synthesis with next steps.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const stepIndex = parseInt(args, 10);
  if (isNaN(stepIndex) || stepIndex < 1 || stepIndex > 3) {
    await ctx.reply('⚠️ Please vote with a number between 1 and 3. Example: /vote 2');
    return;
  }

  // Find latest synthesis for this project
  let projectId = ctx.session.projectId;
  if (!projectId && (ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup')) {
    const groupId = String(ctx.chat.id);
    const linkedProject = await prisma.project.findFirst({ where: { groupId } });
    projectId = linkedProject?.id ?? null;
  }

  if (!projectId) {
    await ctx.reply('⚠️ No active project. Run /generate first to create a synthesis.');
    return;
  }

  const latestSynthesis = await prisma.synthesisOutput.findFirst({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });

  if (!latestSynthesis) {
    await ctx.reply(
      `⚠️ No synthesis available yet.\n` +
      `Run /generate in the group to produce one first.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  try {
    // Upsert vote (one vote per user per synthesis)
    const vote = await prisma.vote.upsert({
      where: {
        synthesisOutputId_userId: {
          synthesisOutputId: latestSynthesis.id,
          userId,
        },
      },
      update: { stepIndex },
      create: {
        synthesisOutputId: latestSynthesis.id,
        userId,
        stepIndex,
      },
    });

    // Count votes for each step
    const voteCounts = await prisma.vote.groupBy({
      by: ['stepIndex'],
      where: { synthesisOutputId: latestSynthesis.id },
      _count: { stepIndex: true },
    });

    const tally: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    for (const v of voteCounts) {
      tally[v.stepIndex] = v._count.stepIndex;
    }

    await ctx.reply(
      `✅ *Vote recorded!* Step ${stepIndex}\n\n` +
      `Current tally:\n` +
      `1️⃣ ${tally[1]}  2️⃣ ${tally[2]}  3️⃣ ${tally[3]}`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error(`[Vote] Error: ${err}`);
    await ctx.reply('⚠️ Failed to record vote. Please try again.');
  }
}
