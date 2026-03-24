// Specialist Agents — Shared Types

import type { ContextPackage, EmotionTag } from '../router-agent/types.js';

// ----------------------------------------------------------------
// Core types
// ----------------------------------------------------------------

export type SessionEventType = 'guidance' | 'prompt' | 'transition' | 'completion';

export interface SessionEvent {
  type: SessionEventType;
  phase: string;          // human-readable phase name for debugging / UI
  audioUrl?: string;      // pre-generated audio clip (future)
  transcript?: string;    // what to say (TTS fallback)
  duration?: number;      // seconds for this event
  metadata?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  suggestedProtocol?: string;
}

// ----------------------------------------------------------------
// Base Specialist Agent interface
// ----------------------------------------------------------------

export interface SpecialistAgent {
  readonly protocolId: string;
  readonly displayName: string;
  readonly description: string;
  readonly defaultDuration: number; // minutes

  run(input: ContextPackage): AsyncGenerator<SessionEvent>;

  validate(input: ContextPackage): ValidationResult;
}

// ----------------------------------------------------------------
// WOOP-specific output
// ----------------------------------------------------------------

export interface WOOPResult {
  wish: string;
  outcome: string;
  obstacle: string;
  plan: string; // "If [obstacle], then I will [response]"
}
