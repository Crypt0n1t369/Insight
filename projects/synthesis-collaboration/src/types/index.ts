import type { User, Project, Contribution, SynthesisOutput, WikiPage } from '@prisma/client';

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
