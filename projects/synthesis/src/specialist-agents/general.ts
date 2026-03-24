// GENERAL Specialist Agent
// Protocol: General Wellness
//
// A fallback agent for inputs that don't clearly map to any specific
// protocol (WOOP, IFS, NSDR, Breathwork). Provides general wellness
// guidance and helps the user identify what kind of support they need.

import type { ContextPackage } from '../router-agent/types.js';
import type { SessionEvent, ValidationResult } from './types.js';
import { SpecialistAgent } from './types.js';

// ----------------------------------------------------------------
// Transcript library
// ----------------------------------------------------------------

const PHASE_TRANSCRIPTS = {
  opening: {
    intro: [
      'Welcome. I\'m here to support you.',
      'Let\'s take a moment to check in with yourself.',
    ],
    guidance: [
      'Take a slow, deep breath in... and let it go.',
      'Notice how you\'re feeling right now — in your body, in your heart, in your mind.',
      'There\'s no right or wrong way to feel. Whatever is present is valid.',
      'You might be feeling overwhelmed, or curious, or something else entirely — all of it is welcome here.',
    ],
  },

  exploration: {
    intro: [
      'Often when we come to a practice like this, there\'s something underneath — a need for rest, clarity, release, or direction.',
    ],
    guidance: [
      'If you could have anything right now, what would it be?',
      'Sometimes just naming what we feel helps to loosen its grip.',
      'Notice where you feel any tension or ease in your body.',
      'You don\'t need to fix anything right now. Just be present with yourself.',
    ],
  },

  closing: {
    intro: [
      'Thank you for taking this moment for yourself.',
    ],
    guidance: [
      'Whatever brought you here today is valid.',
      'If you\'d like more targeted support, you might explore: WOOP for goal clarity, IFS for inner conflict, NSDR for deep rest, or Breathwork for nervous system reset.',
      'You can return here anytime you need a moment of pause.',
    ],
  },
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function makeEvent(
  type: SessionEvent['type'],
  phase: string,
  transcript: string,
  durationMs: number,
): SessionEvent {
  return { type, phase, transcript, duration: durationMs };
}

function* yieldLines(
  lines: string[],
  phaseName: string,
  totalMs: number,
): Generator<SessionEvent> {
  const perLineMs = Math.floor(totalMs / Math.max(lines.length, 1));
  for (const line of lines) {
    yield { type: 'guidance', phase: phaseName, transcript: line, duration: perLineMs };
  }
}

// ----------------------------------------------------------------
// General Agent
// ----------------------------------------------------------------

export const GENERALAgent: SpecialistAgent = {
  protocolId: 'general',
  displayName: 'General Wellness',
  description:
    'A fallback agent for general wellness support. Provides general guidance when no specific protocol matches the user input. Helps users identify what kind of support they need.',
  defaultDuration: 10,

  validate(_input: ContextPackage): ValidationResult {
    return { valid: true };
  },

  async *run(_input: ContextPackage): AsyncGenerator<SessionEvent> {
    const totalMs = GENERALAgent.defaultDuration * 60 * 1000;

    yield makeEvent('completion', 'Opening', 'Welcome. I\'m here to support you. Let\'s take a slow moment together.', 5_000);

    const openingMs = Math.floor(totalMs * 0.3);
    for (const t of PHASE_TRANSCRIPTS.opening.intro) {
      yield { type: 'guidance', phase: 'Opening: Introduction', transcript: t, duration: Math.floor(openingMs * 0.2 / PHASE_TRANSCRIPTS.opening.intro.length) };
    }
    for (const t of PHASE_TRANSCRIPTS.opening.guidance) {
      yield { type: 'guidance', phase: 'Opening: Guidance', transcript: t, duration: Math.floor(openingMs * 0.8 / PHASE_TRANSCRIPTS.opening.guidance.length) };
    }

    const exploreMs = Math.floor(totalMs * 0.4);
    for (const t of PHASE_TRANSCRIPTS.exploration.intro) {
      yield { type: 'guidance', phase: 'Exploration: Introduction', transcript: t, duration: Math.floor(exploreMs * 0.2 / PHASE_TRANSCRIPTS.exploration.intro.length) };
    }
    for (const t of PHASE_TRANSCRIPTS.exploration.guidance) {
      yield { type: 'guidance', phase: 'Exploration: Guidance', transcript: t, duration: Math.floor(exploreMs * 0.8 / PHASE_TRANSCRIPTS.exploration.guidance.length) };
    }

    yield makeEvent('transition', 'Closing', 'Let\'s close this session gently.', 3_000);

    const closingMs = Math.floor(totalMs * 0.3);
    for (const t of PHASE_TRANSCRIPTS.closing.intro) {
      yield { type: 'guidance', phase: 'Closing: Introduction', transcript: t, duration: Math.floor(closingMs * 0.2) };
    }
    for (const t of PHASE_TRANSCRIPTS.closing.guidance) {
      yield { type: 'guidance', phase: 'Closing: Guidance', transcript: t, duration: Math.floor(closingMs * 0.8 / PHASE_TRANSCRIPTS.closing.guidance.length) };
    }

    yield makeEvent(
      'completion',
      'Session Complete',
      'Your session is complete. You can return here or explore a more targeted protocol anytime.',
      5_000,
    );
  },
};
