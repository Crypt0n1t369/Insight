/**
 * Chat Service — LLM-powered conversational responses for the bot.
 * Uses MiniMax Chat API (or any OpenAI-compatible API) via direct fetch.
 *
 * Environment variables needed:
 *   MINIMAX_API_KEY     — your MiniMax API key
 *   MINIMAX_GROUP_ID    — your MiniMax Group ID
 *   MINIMAX_BASE_URL    — defaults to https://api.minimax.chat/v1
 *
 * If not configured, graceful fallback returns null (bot uses rule-based reply).
 */

import { MINIMAX_API_KEY, MINIMAX_GROUP_ID, MINIMAX_BASE_URL } from '../config.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Send a conversation to the LLM and get a response.
 * Returns null if LLM is not configured or call fails.
 */
export async function chat(messages: ChatMessage[]): Promise<ChatResponse | null> {
  if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
    console.log('[Chat] MiniMax not configured — MINIMAX_API_KEY or MINIMAX_GROUP_ID missing');
    return null;
  }

  const url = `${MINIMAX_BASE_URL}/text/chatcompletion_pro?GroupId=${MINIMAX_GROUP_ID}`;

  const body = {
    model: 'MiniMax-Text-01',
    messages,
    role_count: 1,
    tokens_to_generate: 512,
    temperature: 0.7,
    top_p: 0.95,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`[Chat] MiniMax API error ${res.status}: ${text}`);
      return null;
    }

    const data = await res.json() as {
      choices?: Array<{ messages?: Array<{ text?: string }> }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      model?: string;
    };

    const choice = data.choices?.[0];
    const msg = choice?.messages?.[0];
    const content = msg?.text?.trim() ?? '';

    if (!content) {
      console.error('[Chat] Empty response from MiniMax');
      return null;
    }

    return {
      content,
      model: data.model ?? 'MiniMax-Text-01',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens ?? 0,
        completionTokens: data.usage.completion_tokens ?? 0,
        totalTokens: data.usage.total_tokens ?? 0,
      } : undefined,
    };
  } catch (err) {
    console.error(`[Chat] Fetch error: ${err}`);
    return null;
  }
}

/**
 * Build a system prompt for the bot persona.
 */
export interface ChatOptions {
  isDm: boolean;
  projectId?: string;
  projectName?: string;
  challenge?: string;
  contributors?: number;
  userContext?: {
    userId: string;
    username?: string;
    firstName?: string;
    role: string;
    insightsCount: number;
    readinessStatus: string;
    recentContributions: Array<{ content: string; createdAt: Date; confirmed: boolean }>;
  };
  projectSummary?: string;
}

export function buildSystemPrompt(ctx: ChatOptions): string {
  const persona = `You are Orakle, a collaborative intelligence assistant on Telegram. You help groups share insights, synthesize ideas, and take action together. Be direct, helpful, and slightly witty. Keep responses concise (under 300 chars for casual chat, longer for detailed explanations). You know who you're talking to and can reference their contributions.`;

  const parts: string[] = [persona];

  if (ctx.projectId && ctx.projectName) {
    parts.push(`\nCurrent project: ${ctx.projectName}`);
    if (ctx.challenge) parts.push(`Challenge: ${ctx.challenge}`);
    if (ctx.contributors) parts.push(`Contributors: ${ctx.contributors}`);
  }

  if (ctx.userContext) {
    const u = ctx.userContext;
    const name = u.username ? `@${u.username}` : u.firstName;
    parts.push(`\nYou're talking to ${name} (${u.role}).`);
    parts.push(`They've shared ${u.insightsCount} insights. Readiness: ${u.readinessStatus}.`);
    if (u.recentContributions.length > 0) {
      parts.push(`Recent contributions:`);
      u.recentContributions.slice(0, 3).forEach((c, i) => {
        const preview = c.content.length > 80 ? c.content.slice(0, 80) + '…' : c.content;
        parts.push(`  ${i + 1}. ${preview}`);
      });
    }
  }

  if (ctx.projectSummary) {
    parts.push(`\n--- Project Context ---\n${ctx.projectSummary}`);
    // Extract entities/relationships from projectSummary if present
    // (getProjectSummaryForLLM already includes graph data)
  }

  // Entity/relationship awareness
  if (ctx.userContext) {
    const u = ctx.userContext;
    parts.push(`\nYou have access to a growing knowledge graph of entities and relationships from all contributions.`);
  }

  return parts.join('');
}
