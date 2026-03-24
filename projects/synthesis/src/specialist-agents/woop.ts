// WOOP Specialist Agent
// Protocol: Wish-Outcome-Obstacle-Plan (Mental Contrasting)
//
// Based on Gabriele Oettingen's research on mental contrasting
// as a self-regulation strategy. Helps users move from fantasy
// to actionable planning by identifying obstacles.

import type { ContextPackage } from '../router-agent/types.js';
import type { SessionEvent, ValidationResult } from './types.js';
import { SpecialistAgent } from './types.js';

// ----------------------------------------------------------------
// Transcript library — guided prompts per phase
// ----------------------------------------------------------------

const PHASE_TRANSCRIPTS = {
  wish: {
    intro: [
      'Welcome to your WOOP session — Wish, Outcome, Obstacle, Plan.',
      'This protocol, developed by psychologist Gabriele Oettingen, uses mental contrasting to turn your wishes into actionable steps.',
      'Take a comfortable breath... and allow your eyes to close if they naturally want to close.',
      'We\'ll move through four stages: first, identifying your heartfelt wish.',
    ],
    guidance: [
      'Bring to mind something you truly wish for right now.',
      'It could be related to your work, a relationship, your health, or a personal dream.',
      'Allow a wish to surface — one that feels important, not trivial, one that has some pull on you.',
      'Once you feel it, gently hold it in your mind... notice any sensations in your body as you hold this wish.',
      'We\'ll keep this wish present throughout our session.',
    ],
    prompt: 'What is your heartfelt wish right now? Take a moment to let it form clearly in your mind.',
  },

  outcome: {
    intro: [
      'Now, with your wish clearly in mind, we move to the second stage: the Outcome.',
    ],
    guidance: [
      'Imagine the best possible outcome — what it would look like, feel like, sound like if your wish came true.',
      'Make this as vivid as possible. See the details. Feel the emotions.',
      'Notice how your body responds to this imagined success. Let yourself experience it fully.',
      'This is your compass — a clear vision of where you want to go.',
    ],
    prompt: 'What does the best possible outcome look like, felt most deeply?',
  },

  obstacle: {
    intro: [
      'Now, with both your wish and your outcome vivid in your mind... we enter the third stage: the Obstacle.',
    ],
    guidance: [
      'The research is clear: simply imagining success is not enough. We need to identify what stands between you and your wish.',
      'The obstacle we\'re looking for is an inner obstacle — a thought, a feeling, a habit, a fear.',
      'Not an external circumstance, but something within you that might hold you back.',
      'Often it is something like: procrastination, self-doubt, perfectionism, fear of failure, or feeling undeserving.',
      'As you scan inward, what comes up as the single most important inner obstacle?',
    ],
    prompt: 'What is the #1 inner obstacle between you and your wish? What thought or feeling might hold you back?',
  },

  plan: {
    intro: [
      'You\'ve done the mental contrasting work. Now comes the payoff: the Plan.',
    ],
    guidance: [
      'The WOOP plan is simple and powerful: an "if-then" statement.',
      'When the obstacle appears — and it will — then you will take a specific action.',
      'This creates a mental pre-decision, a kind of implementation intention.',
      'For example: "If I feel the urge to procrastinate, then I will take one small action for just five minutes."',
      'Make your plan specific, observable, and doable.',
    ],
    prompt: 'If [your obstacle] arises, then you will... ? Complete the sentence.',
  },

  completion: {
    intro: [
      'You\'ve completed your WOOP cycle.',
    ],
    guidance: [
      'You now have: a clear Wish, a vivid Outcome, an honest Obstacle, and a concrete If-then Plan.',
      'This combination — mental contrasting with implementation intentions — is one of the most evidence-backed self-regulation tools in psychology.',
      'Carry your WOOP with you. When you notice the obstacle arising, return to your plan.',
      'You\'ve done the inner work. Now the outer work can begin.',
    ],
  },
};

// ----------------------------------------------------------------
// Phase sequencing
// ----------------------------------------------------------------

interface PhaseConfig {
  id: string;
  displayName: string;
  introMs: number;      // milliseconds for phase intro
  guidanceMs: number;  // milliseconds for guidance block
  promptMs: number;    // milliseconds for user prompt
}

const PHASES: PhaseConfig[] = [
  { id: 'wish',     displayName: 'Wish',     introMs: 30_000, guidanceMs: 120_000, promptMs: 60_000 },
  { id: 'outcome',  displayName: 'Outcome',  introMs: 15_000, guidanceMs:  90_000, promptMs: 60_000 },
  { id: 'obstacle', displayName: 'Obstacle', introMs: 20_000, guidanceMs: 150_000, promptMs: 90_000 },
  { id: 'plan',     displayName: 'Plan',      introMs: 15_000, guidanceMs:  90_000, promptMs: 60_000 },
];

// ----------------------------------------------------------------
// WOOP Agent
// ----------------------------------------------------------------

export const WOOPAgent: SpecialistAgent = {
  protocolId: 'woop',
  displayName: 'Mental Contrasting',
  description:
    'Goal-setting through vivid imagination of success and obstacle mapping. Based on Gabriele Oettingen\'s WOOP protocol — one of the most evidence-backed self-regulation techniques in psychology.',
  defaultDuration: 15,

  validate(input: ContextPackage): ValidationResult {
    if (input.detectedEmotion === 'depressed' || input.detectedEmotion === 'grief') {
      return {
        valid: true,
        reason: 'WOOP can be adapted for low-mood users; offer gentle pacing.',
      };
    }
    if (input.suggestedDuration > 0 && input.suggestedDuration < 10) {
      return {
        valid: false,
        reason: 'WOOP requires at least 10 minutes to complete properly.',
        suggestedProtocol: 'breathwork',
      };
    }
    return { valid: true };
  },

  async *run(input: ContextPackage): AsyncGenerator<SessionEvent> {
    const duration = input.userPreferences?.sessionDuration ?? WOOPAgent.defaultDuration;

    // Yield opening completion event
    yield makeEvent('completion', 'Opening', [
      `Starting WOOP session — ${duration} minutes allocated.`,
      'Bring your full attention to each phase.',
    ], 5_000);

    for (const phase of PHASES) {
      const transcripts = PHASE_TRANSCRIPTS[phase.id as keyof typeof PHASE_TRANSCRIPTS];
      if (!transcripts) continue;

      // Phase intro
      yield* yieldTranscripts(transcripts.intro, phase.id, phase.displayName, phase.introMs);
      yield makePrompt(phase.id, phase.displayName, transcripts.prompt, phase.promptMs);

      // Next phase transition (except after the last phase)
      const nextPhase = PHASES.find((p) => p.id !== phase.id);
      if (nextPhase) {
        yield makeTransition(phase.id, nextPhase.id, `Moving to ${nextPhase.displayName}...`);
      }
    }

    // Closing
    yield* yieldTranscripts(
      PHASE_TRANSCRIPTS.completion.guidance,
      'completion',
      'Session Complete',
      60_000,
    );
    yield makeEvent('completion', 'Session Complete', PHASE_TRANSCRIPTS.completion.intro, 5_000);
  },
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function makeEvent(
  type: SessionEvent['type'],
  phase: string,
  transcript: string[],
  duration?: number,
): SessionEvent {
  return {
    type,
    phase,
    transcript: transcript.join(' '),
    duration,
  };
}

function makePrompt(phaseId: string, phaseName: string, transcript: string, duration: number): SessionEvent {
  return {
    type: 'prompt',
    phase: phaseName,
    transcript,
    duration,
    metadata: { phaseId },
  };
}

function makeTransition(fromPhase: string, toPhase: string, transcript: string): SessionEvent {
  return {
    type: 'transition',
    phase: `Transition: ${fromPhase} → ${toPhase}`,
    transcript,
    duration: 3_000,
    metadata: { from: fromPhase, to: toPhase },
  };
}

function* yieldTranscripts(
  lines: string[],
  phaseId: string,
  phaseName: string,
  totalDurationMs: number,
): AsyncGenerator<SessionEvent> {
  const perLineMs = Math.floor(totalDurationMs / Math.max(lines.length, 1));
  for (const line of lines) {
    yield {
      type: 'guidance',
      phase: phaseName,
      transcript: line,
      duration: perLineMs,
      metadata: { phaseId },
    };
  }
}
