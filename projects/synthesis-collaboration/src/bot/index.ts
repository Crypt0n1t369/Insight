import 'dotenv/config';
import { Context, session, SessionFlavor } from 'grammy';
import { Bot } from 'grammy';
import { mkdir, writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { BOT_TOKEN } from '../config.js';
import {
  handleStart,
  handleNewProject,
  handleDefineChallenge,
  handleLink,
  handleHelp,
} from './handlers/project.js';
import { handleInsight } from './handlers/insight.js';
import {
  handleGenerate,
  handleGenerateResult,
} from './handlers/generate.js';
import {
  handlePersonalInsights,
  handleConfirm,
  handleReady,
  handleStatusWithReadiness,
} from './handlers/personal.js';
import { handleVote } from './handlers/vote.js';
import { initializeDatabase } from '../db/index.js';
import {
  parseNaturalLanguage,
  getMenuForContext,
  getSuggestedNextAction,
} from './naturalLanguage.js';
import { chat, buildSystemPrompt } from '../services/chat.js';
import { getUserContext, getProjectSummaryForLLM } from '../services/userContext.js';
import prisma from '../db/index.js';

console.log('[Bot] Starting up...');
console.log('[Bot] BOT_TOKEN:', BOT_TOKEN ? `${BOT_TOKEN.slice(0, 10)}...` : 'MISSING');

interface BotSession {
  userId?: string;
  projectId?: string;
  state?: 'awaiting_challenge' | 'awaiting_contribution' | 'awaiting_confirm';
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>;
  lastLLMError?: number; // timestamp of last error to avoid spam
}

export type BotContext = Context & SessionFlavor<BotSession>;

export async function buildBot() {
  const bot = new Bot<BotContext>(BOT_TOKEN);

  bot.use(session({ initial: () => ({ messages: [] }) }));

  // Global error handler
  bot.catch((err) => {
    const ctx = err.ctx;
    const msg = err.message ?? 'Unknown error';
    console.error(`[Bot Error] ${new Date().toISOString()} — ${msg}`);
    ctx.reply(`⚠️ Error: ${msg}`).catch(() => {});
  });

  // ─── COMMAND HANDLERS ────────────────────────────────────────────

  bot.command('start', async (ctx) => {
    console.log('[Bot] /start received from', ctx.from?.id);
    await handleStart(ctx as BotContext);
  });

  bot.command('menu', async (ctx) => {
    const isDm = ctx.chat?.type === 'private';
    const userId = String(ctx.from?.id);
    const projectId = ctx.session.projectId;

    // Determine linked project
    let linkedProjectId = projectId;
    if (!linkedProjectId) {
      const latestProject = await prisma.project.findFirst({
        where: { createdById: userId },
        orderBy: { createdAt: 'desc' },
      });
      linkedProjectId = latestProject?.id ?? null;
    }

    let hasChallenge = false;
    let hasContributions = false;
    let readyCount = 0;
    let totalContributors = 0;

    if (linkedProjectId) {
      const project = await prisma.project.findUnique({
        where: { id: linkedProjectId },
        include: {
          _count: { select: { contributions: true, contributors: true } },
          contributors: { include: { readinessSignal: true } },
        },
      });
      hasChallenge = !!project?.challengeStatement;
      hasContributions = (project?._count.contributions ?? 0) > 0;
      readyCount = project?.contributors.filter(c => c.readinessSignal?.status === 'ready').length ?? 0;
      totalContributors = project?._count.contributors ?? 0;
    }

    const menu = getMenuForContext(isDm, !!linkedProjectId);
    const suggestion = getSuggestedNextAction({
      hasProject: !!linkedProjectId,
      hasChallenge,
      hasContributions,
      isDm,
      readyCount,
      totalContributors,
    });

    const lines = [menu];
    if (suggestion) {
      lines.push(`\n${suggestion}`);
    }

    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
  });

  bot.command('newproject', async (ctx) => {
    const isDm = ctx.chat?.type === 'private';
    if (!isDm) {
      await ctx.reply('⚠️ /newproject is only available in DMs. DM me to create a project.');
      return;
    }
    await handleNewProject(ctx as BotContext);
  });

  bot.command('definechallenge', async (ctx) => {
    const isDm = ctx.chat?.type === 'private';
    if (!isDm) {
      await ctx.reply('⚠️ /definechallenge is only available in DMs.');
      return;
    }
    await handleDefineChallenge(ctx as BotContext);
  });

  bot.command('link', async (ctx) => {
    const isDm = ctx.chat?.type === 'private';
    if (!isDm) {
      await ctx.reply('⚠️ /link is only available in DMs.');
      return;
    }
    await handleLink(ctx as BotContext);
  });

  bot.command('insight', async (ctx) => {
    const isDm = ctx.chat?.type === 'private';
    if (isDm) {
      await ctx.reply('💡 /insight works in group chats. Share it there!');
      return;
    }
    await handleInsight(ctx as BotContext);
  });

  bot.command('generate', async (ctx) => {
    const isDm = ctx.chat?.type === 'private';
    if (isDm) {
      await ctx.reply('🧠 /generate is used in group chats to trigger synthesis.');
      return;
    }
    await handleGenerate(ctx as BotContext);
  });

  bot.command('generate-result', async (ctx) => {
    await handleGenerateResult(ctx as BotContext);
  });

  bot.command('myinsights', async (ctx) => {
    const isDm = ctx.chat?.type === 'private';
    if (!isDm) {
      await ctx.reply('👤 /myinsights is only available in DMs.');
      return;
    }
    await handlePersonalInsights(ctx as BotContext);
  });

  bot.command('confirm', async (ctx) => {
    const isDm = ctx.chat?.type === 'private';
    if (!isDm) {
      await ctx.reply('✅ /confirm is only available in DMs.');
      return;
    }
    await handleConfirm(ctx as BotContext);
  });

  bot.command('ready', async (ctx) => {
    const isDm = ctx.chat?.type === 'private';
    if (!isDm) {
      await ctx.reply('👍 /ready works in DMs — signal you are done contributing.');
      return;
    }
    await handleReady(ctx as BotContext);
  });

  bot.command('status', async (ctx) => {
    await handleStatusWithReadiness(ctx as BotContext);
  });

  bot.command('stats', async (ctx) => {
    const userId = String(ctx.from?.id);
    const projectId = ctx.session.projectId;

    if (!projectId) {
      await ctx.reply('⚠️ No active project. Use /newproject first or /link to connect to one.');
      return;
    }

    const userContext = await getUserContext({ userId, projectId });
    if (!userContext) {
      await ctx.reply('⚠️ You are not a contributor in this project.');
      return;
    }

    const lines = [
      `📊 *Your Stats — ${userContext.projectName}*`,
      ``,
      `*Role:* ${userContext.role}`,
      `*Readiness:* ${userContext.readinessStatus}`,
      `*Insights shared:* ${userContext.insightsCount}`,
      `*Contributions confirmed:* ${userContext.recentContributions.filter(c => c.confirmed).length}`,
      `*Last active:* ${userContext.lastActivity ? new Date(userContext.lastActivity).toLocaleDateString() : 'Never'}`,
    ];

    if (userContext.recentContributions.length > 0) {
      lines.push(``, `*Recent contributions:*`);
      userContext.recentContributions.forEach((c, i) => {
        const preview = c.content.length > 80 ? c.content.slice(0, 80) + '…' : c.content;
        lines.push(`  ${i + 1}. [${c.confirmed ? '✓' : '○'}] ${preview}`);
      });
    }

    await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' });
  });

  bot.command('help', async (ctx) => {
    await handleHelp(ctx as BotContext);
  });

  bot.command('vote', async (ctx) => {
    await handleVote(ctx as BotContext);
  });

  // ─── NATURAL LANGUAGE FALLBACK ──────────────────────────────────
  // Catches any text message that isn't a command prefix.
  // The more specific handlers above short-circuit for actual commands.

  bot.use(async (ctx) => {
    const text = ctx.message?.text ?? '';
    if (!text.trim()) return;

    // Skip commands (they were handled above)
    if (text.startsWith('/')) return;

    // Ensure user in DB (defensive: ctx.from can exist but be half-populated)
    if (ctx.from?.id) {
      const userId = String(ctx.from.id);
      const firstName = ctx.from.first_name ?? 'Unknown';
      await prisma.user.upsert({
        where: { id: userId },
        update: { username: ctx.from.username ?? undefined, firstName },
        create: { id: userId, username: ctx.from.username ?? null, firstName, languageCode: ctx.from.language_code ?? null },
      }).catch(() => {});
    }

    const intent = parseNaturalLanguage(text);

    // High-confidence auto-reply greetings
    if (intent.handler === 'help' && intent.reply) {
      await ctx.reply(intent.reply, { parse_mode: 'Markdown' });
      return;
    }

    switch (intent.handler) {
      case 'newproject':
        await handleNewProject(ctx as BotContext);
        break;
      case 'definechallenge':
        await handleDefineChallenge(ctx as BotContext);
        break;
      case 'insight':
        await handleInsight(ctx as BotContext);
        break;
      case 'generate':
        await handleGenerate(ctx as BotContext);
        break;
      case 'status':
        await handleStatusWithReadiness(ctx as BotContext);
        break;
      case 'myinsights':
        await handlePersonalInsights(ctx as BotContext);
        break;
      case 'confirm':
        await handleConfirm(ctx as BotContext);
        break;
      case 'ready':
        await handleReady(ctx as BotContext);
        break;
      case 'menu':
        await ctx.matchCommand('menu');
        break;
      case 'link':
        await handleLink(ctx as BotContext);
        break;
      case 'help':
        if (intent.reply) {
          await ctx.reply(intent.reply, { parse_mode: 'Markdown' });
        } else {
          await handleHelp(ctx as BotContext);
        }
        break;
      default: {
        // Try LLM for conversational messages
        const userId = String(ctx.from?.id ?? '');
        const isDm = ctx.chat?.type === 'private';
        const now = Date.now();

        // Rate-limit LLM errors to 1 per minute
        if (ctx.session.lastLLMError && now - ctx.session.lastLLMError < 60_000) {
          await ctx.reply(
            `🤔 I'm thinking... try again in a moment, or use /menu for commands.`,
            { parse_mode: 'Markdown' }
          );
          break;
        }

        // Build project + user context for system prompt
        let projectId = ctx.session.projectId;
        if (!projectId) {
          const latest = await prisma.project.findFirst({
            where: {
              OR: [
                { createdById: userId },
                { contributors: { some: { userId } } },
              ],
            },
            orderBy: { createdAt: 'desc' },
          });
          projectId = latest?.id;
        }

        // Build user context + project summary in parallel
        const [userContext, projectSummary] = await Promise.all([
          projectId ? getUserContext({ userId, projectId }) : Promise.resolve(null),
          projectId ? getProjectSummaryForLLM(projectId) : Promise.resolve(''),
        ]);

        const systemPrompt = buildSystemPrompt({
          isDm,
          projectId,
          projectName: userContext?.projectName,
          challenge: userContext?.challenge,
          contributors: userContext
            ? 1
            : undefined,
          userContext: userContext
            ? {
                userId,
                username: userContext.username,
                firstName: userContext.firstName,
                role: userContext.role,
                insightsCount: userContext.insightsCount,
                readinessStatus: userContext.readinessStatus,
                recentContributions: userContext.recentContributions,
              }
            : undefined,
          projectSummary: projectSummary || undefined,
        });

        // Build message history (keep last 10 exchanges = 20 messages)
        const history = (ctx.session.messages ?? []).slice(-20);
        const messages = [
          { role: 'system' as const, content: systemPrompt },
          ...history,
          { role: 'user' as const, content: text },
        ];

        const reply = await chat(messages);

        if (reply) {
          // Store exchange in history
          ctx.session.messages.push({ role: 'user', content: text, timestamp: now });
          ctx.session.messages.push({ role: 'assistant', content: reply.content, timestamp: now });
          // Trim to last 20 messages
          if (ctx.session.messages.length > 20) {
            ctx.session.messages = ctx.session.messages.slice(-20);
          }
          await ctx.reply(reply.content, { parse_mode: 'Markdown' });
        } else {
          ctx.session.lastLLMError = now;
          const fallbackLines = [
            `🤔 I didn't catch that.`,
            `Try: /menu to see all commands`,
            `Or just type naturally — I understand most things!`,
          ];
          await ctx.reply(fallbackLines.join('\n'), { parse_mode: 'Markdown' });
        }
        break;
      }
    }
  });

  return bot;
}

const BOT_PID_FILE = join(process.cwd(), '.bot.pid');

async function isAnotherBotRunning(): Promise<boolean> {
  try {
    const pid = parseInt(await readFile(BOT_PID_FILE, 'utf-8').catch(() => '0'), 10);
    if (!pid || pid === process.pid) return false;
    // Check if process is still alive
    process.kill(pid, 0);
    return true;
  } catch {
    return false; // file missing or process dead
  }
}

async function writePidFile() {
  await mkdir(process.cwd(), { recursive: true }).catch(() => {});
  await writeFile(BOT_PID_FILE, String(process.pid)).catch(() => {});
}

async function removePidFile() {
  try {
    const pid = parseInt(await readFile(BOT_PID_FILE, 'utf-8'), 10);
    if (pid === process.pid) await unlink(BOT_PID_FILE).catch(() => {});
  } catch { /* ignore */ }
}

export async function startBot() {
  // Prevent multiple instances
  if (await isAnotherBotRunning()) {
    console.error('[Bot] Another instance is already running. Kill it first:');
    console.error('[Bot]   kill $(cat .bot.pid)');
    process.exit(1);
  }
  await writePidFile();

  try {
    console.log('[Bot] Initializing database...');
    await initializeDatabase();
    console.log('[Bot] Database connected');
    console.log('[Bot] Building bot...');
    const bot = await buildBot();
    console.log('[Bot] Bot built OK');

    const shutdown = async (signal: string) => {
      console.log(`\n[Bot] Received ${signal} — shutting down...`);
      await bot.stop();
      await removePidFile();
      process.exit(0);
    };

    process.on('SIGINT', () => { shutdown('SIGINT'); });
    process.on('SIGTERM', () => { shutdown('SIGTERM'); });

    console.log('[Bot] Starting grammY long polling...');
    await bot.start();
    console.log('[Bot] Running');
  } catch (err) {
    console.error(`[Bot] Fatal startup error: ${err}`);
    process.exit(1);
  }
}

startBot();
