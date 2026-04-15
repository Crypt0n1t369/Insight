import type { BotContext } from '../index.js';
import prisma from '../../db/index.js';
import { updateProjectIndex, appendActivityLog } from '../../services/wiki.js';
import { getSuggestedNextAction } from '../naturalLanguage.js';

export async function handleStart(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);

  await ensureUser(ctx);

  const isDm = ctx.chat?.type === 'private';

  // Find latest project for this user
  let projectId = ctx.session.projectId;
  if (!projectId) {
    const latestProject = await prisma.project.findFirst({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });
    projectId = latestProject?.id ?? null;
  }

  // Build personalized welcome based on context
  if (isDm && !projectId) {
    // No project yet — full onboarding
    await ctx.reply(
      `👋 Welcome to *Synthesis*!\n\n` +
      `I help groups share insights, synthesize ideas, and turn collective thinking into action.\n\n` +
      `*Let's get started:*\n` +
      `📋 /newproject <name> — Create your first project\n` +
      `🎯 /definechallenge <question> — Set the challenge you want to explore\n\n` +
      `*Or just type naturally* — I understand plain words like "let's start a project" or "here's my thought".`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (isDm && projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { _count: { select: { contributions: true, contributors: true } } },
    });
    const hasChallenge = !!project?.challengeStatement;
    const hasContributions = (project?._count.contributions ?? 0) > 0;

    await ctx.reply(
      `👋 *Welcome back, ${ctx.from?.first_name ?? 'there'}!*\n\n` +
      `*Current project:* ${project?.name ?? 'Unknown'}\n` +
      (hasChallenge ? `*Challenge:* ${project!.challengeStatement!.slice(0, 60)}\n` : `*Challenge:* Not set yet — /definechallenge\n`) +
      (hasContributions ? `*Contributions:* ${project!._count.contributions}\n` : `*Contributions:* 0 yet\n`) +
      `\n${getSuggestedNextAction({ hasProject: true, hasChallenge: !!project?.challengeStatement, hasContributions, isDm: true, readyCount: 0, totalContributors: 0 })}`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // In group
  const groupId = String(ctx.chat?.id ?? '');
  const linkedProject = await prisma.project.findFirst({ where: { groupId } });

  if (linkedProject) {
    const project = await prisma.project.findUnique({
      where: { id: linkedProject.id },
      include: { _count: { select: { contributions: true, contributors: true } } },
    });
    await ctx.reply(
      `🔗 *Project Linked*\n\n` +
      `*${linkedProject.name}*\n` +
      `${linkedProject.challengeStatement ? `*Challenge:* ${linkedProject.challengeStatement.slice(0, 80)}` : '_No challenge set yet_'}\n\n` +
      `*${project?._count.contributions ?? 0}* contributions · *${project?._count.contributors ?? 0}* contributors\n\n` +
      `💡 Share an insight: /insight <your thought>`,
      { parse_mode: 'Markdown' }
    );
  } else {
    await ctx.reply(
      `🤝 *Synthesis Group*\n\n` +
      `No project is linked to this group yet.\n` +
      `Ask the project creator to use /link to connect it.`,
      { parse_mode: 'Markdown' }
    );
  }
}

export async function handleHelp(ctx: BotContext): Promise<void> {
  const isDm = ctx.chat?.type === 'private';
  const userId = String(ctx.from?.id);

  let hasProject = false;
  let hasChallenge = false;

  if (ctx.session.projectId) {
    hasProject = true;
    const project = await prisma.project.findUnique({ where: { id: ctx.session.projectId } });
    hasChallenge = !!project?.challengeStatement;
  } else {
    const latest = await prisma.project.findFirst({ where: { createdById: userId } });
    hasProject = !!latest;
    hasChallenge = !!latest?.challengeStatement;
  }

  if (isDm) {
    await ctx.reply(
      `🤖 *Orakle — What I can do*\n\n` +
      `I help groups share insights and turn collective thinking into action.\n\n` +
      `*Start here:*\n` +
      `/newproject <name> — Create a new project\n` +
      `/definechallenge <question> — Set your challenge\n` +
      `/menu — See all commands\n\n` +
      `*In groups:*\n` +
      `/insight <thought> — Share ideas\n` +
      `/generate — Synthesize when ready\n\n` +
      `*Or just talk naturally* — I understand plain words!`,
      { parse_mode: 'Markdown' }
    );
  } else {
    await ctx.reply(
      `🤖 *Orakle — In this group*\n\n` +
      `Share insights with each other, then synthesize when ready.\n\n` +
      `*Contribute:*\n` +
      `/insight <your thought>\n\n` +
      `*When ready:*\n` +
      `/generate — Trigger synthesis\n` +
      `/status — Check progress\n\n` +
      `Or just type naturally — "i think..." or "let's wrap this up"`,
      { parse_mode: 'Markdown' }
    );
  }
}

export async function handleNewProject(ctx: BotContext): Promise<void> {
  const text = ctx.message?.text ?? '';
  const args = text.replace('/newproject', '').trim();

  await ensureUser(ctx);

  if (!args) {
    await ctx.reply(
      `📋 *New Project*\n\n` +
      `Usage: /newproject <project name>\n\n` +
      `Example: /newproject AI Ethics Research`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const userId = String(ctx.from?.id);
  const projectName = args;

  try {
    const project = await prisma.project.create({
      data: {
        name: projectName,
        createdById: userId,
        groupId: ctx.chat?.type !== 'private' ? String(ctx.chat?.id) : undefined,
      },
    });

    await prisma.contributor.create({
      data: { projectId: project.id, userId, role: 'lead' },
    });

    await updateProjectIndex(project.id);
    await appendActivityLog({ projectId: project.id, event: 'project_created', userId, detail: `Project "${projectName}" created` });

    ctx.session.projectId = project.id;

    await ctx.reply(
      `🎉 *Project Created!*\n\n` +
      `*Name:* ${projectName}\n` +
      `*ID:* \`${project.id.slice(0, 8)}…\`\n\n` +
      `Now use /definechallenge to set the challenge statement.`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error(`[Project] Create error: ${err}`);
    await ctx.reply('⚠️ Failed to create project. Please try again.');
  }
}

export async function handleDefineChallenge(ctx: BotContext): Promise<void> {
  const text = ctx.message?.text ?? '';
  const args = text.replace('/definechallenge', '').trim();

  await ensureUser(ctx);

  let projectId = ctx.session.projectId;

  if (!projectId) {
    const userId = String(ctx.from?.id);
    const latestProject = await prisma.project.findFirst({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });
    projectId = latestProject?.id ?? null;
  }

  if (!projectId) {
    await ctx.reply(
      `📋 No project found. Use /newproject <name> to create one first.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  if (!args) {
    await ctx.reply(
      `🎯 *Define Challenge*\n\n` +
      `Usage: /definechallenge <your challenge statement>\n\n` +
      `Example: /definechallenge How can we improve AI alignment research?`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  const userId = String(ctx.from?.id);

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { challengeStatement: args },
    });

    await appendActivityLog({ projectId, event: 'challenge_defined', userId, detail: args.slice(0, 100) });

    await ctx.reply(
      `✅ *Challenge Set!*\n\n` +
      `*Challenge:* ${args}\n\n` +
      `Share insights in your group using /insight <text>`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error(`[Project] Challenge update error: ${err}`);
    await ctx.reply('⚠️ Failed to update challenge. Please try again.');
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

/**
 * Handle /link — links the current group to the user's active project.
 * Usage: /link (in the group) or /link <group-id> (in DM)
 */
export async function handleLink(ctx: BotContext): Promise<void> {
  const userId = String(ctx.from?.id);
  const text = ctx.message?.text ?? '';
  const args = text.replace('/link', '').trim();
  const isDm = ctx.chat?.type === 'private';

  await ensureUser(ctx);

  // Find user's latest project
  let projectId = ctx.session.projectId;
  if (!projectId) {
    const latestProject = await prisma.project.findFirst({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });
    projectId = latestProject?.id ?? null;
  }

  if (!projectId) {
    await ctx.reply(
      `⚠️ No project found. Use /newproject <name> to create one first.`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  try {
    if (isDm) {
      if (!args) {
        await ctx.reply(
          `🔗 *Link a Group*\n\n` +
          `Usage: /link <group-id>\n\n` +
          `To get the group ID:\n` +
          `1. Add the bot to your group\n` +
          `2. Send /link in the group\n` +
          `3. Copy the group ID from the bot's response`,
          { parse_mode: 'Markdown' }
        );
        return;
      }

      const groupId = args.replace(/[^-\d]/g, '');
      await prisma.project.update({
        where: { id: projectId },
        data: { groupId },
      });

      await ctx.reply(
        `✅ *Group Linked!*\n\n` +
        `Project *${projectId.slice(0, 8)}…* is now connected to group \`${groupId}\`.\n\n` +
        `Group members can now use /insight and /generate.`,
        { parse_mode: 'Markdown' }
      );
    } else {
      // In group — link it directly
      const groupId = String(ctx.chat?.id);
      await prisma.project.update({
        where: { id: projectId },
        data: { groupId },
      });

      const project = await prisma.project.findUnique({ where: { id: projectId } });
      await ctx.reply(
        `✅ *Group Linked!*\n\n` +
        `This group is now connected to project *${project?.name}*.\n\n` +
        `Members can now share /insight <thoughts> and trigger /generate.`,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (err) {
    console.error(`[Link] Error: ${err}`);
    await ctx.reply('⚠️ Failed to link group.');
  }
}
