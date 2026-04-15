/**
 * Centralized configuration for Synthesis Collaboration Platform.
 * All environment variables are loaded here with defaults.
 * Import from this module instead of reading process.env directly.
 */

import 'dotenv/config';
import type { User, Project, Contribution, SynthesisOutput, WikiPage } from '@prisma/client';

// Telegram
export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? (() => {
  throw new Error('TELEGRAM_BOT_TOKEN is not set. Copy .env.example to .env and add your bot token.');
})();

// Database
export const DATABASE_URL = process.env.DATABASE_URL ?? 'file:./data/synthesis.db';

// OpenClaw
export const OPENCLAW_WORKSPACE = process.env.OPENCLAW_WORKSPACE ?? '/home/drg/.openclaw/workspace';
export const OPENCLAW_URL = process.env.OPENCLAW_URL ?? 'http://localhost:18789';

// MiniMax LLM (for conversational chat)
export const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY ?? '';
export const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID ?? '';
export const MINIMAX_BASE_URL = process.env.MINIMAX_BASE_URL ?? 'https://api.minimax.chat/v1';

// Engine tuning
export const INSIGHT_CHECK_THRESHOLD = parseInt(process.env.INSIGHT_CHECK_THRESHOLD ?? '5', 10);
export const CONSENSUS_THRESHOLD = parseFloat(process.env.CONSENSUS_THRESHOLD ?? '1.0');

// Server
export const PORT = parseInt(process.env.PORT ?? '3008', 10);

// Re-export Prisma types
export type { User, Project, Contribution, SynthesisOutput, WikiPage };

export interface BotContext {
  userId: string;
  projectId: string | null;
  isDm: boolean;
  chatId: number;
}

export interface SynthesisParams {
  projectId: string;
  challenge: string;
  contributions: Contribution[];
  wikiPages: WikiPage[];
}

export interface SynthesisResult {
  commonalities: string;
  divergences: string;
  crossLinksSummary: string;
  structuredOutline: string;
  nextSteps: { step: string; votes: number }[];
}

export interface OpenClawTask {
  id: string;
  taskType: 'ingest' | 'synthesize' | 'lint';
  projectId?: string;
  payload: {
    challenge?: string;
    contributions?: Contribution[];
    wikiPages?: WikiPage[];
  };
}

export interface ProjectWithStats extends Project {
  _count: {
    contributions: number;
    contributors: number;
  };
  challengeStatement?: string;
}
