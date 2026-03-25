// BREATHWORK Specialist Agent
// Protocol: Conscious Connected Breathwork
//
// Based on Holotropic Breathwork and the Wim Hof method.
// Continuous circular breathing without pauses between inhale
// and exhale, inducing altered states and emotional release.

import type { ContextPackage } from '../router-agent/types.js';
import type { SessionEvent, ValidationResult } from './types.js';
import { SpecialistAgent } from './types.js';

// ----------------------------------------------------------------
// Transcript library — guided prompts per phase
// ----------------------------------------------------------------

const PHASE_TRANSCRIPTS = {
  prep: {
    intro: [
      'Welcome to Conscious Connected Breathwork.',
      'This is a powerful practice of continuous circular breathing that can induce altered states, release trapped emotions, and create profound shifts in consciousness.',
      'In this session, you will breathe continuously without pausing between the inhale and exhale — like a wheel turning.',
      'Find a comfortable seated or lying position. Make sure you won\'t be disturbed.',
      'This practice can bring up intense emotions or physical sensations — trust the process and know that you are safe.',
    ],
    guidance: [
      'Set your intention for this breathwork session... what are you seeking? Release? Clarity? Connection? Healing?',
      'Allow your belly to soften. We\'ll breathe deeply and fully, connecting the inhale and exhale.',
      'Whenever you\'re ready, begin breathing deeply into your belly, then filling your chest, and exhaling without forcing.',
      'Keep the breath continuous — no pauses. Inhale... exhale... inhale... exhale... always moving.',
    ],
    prompt: 'Take a moment to set your clear intention. What are you calling in or releasing in this session?',
  },

  breathing: {
    intro: [
      'Now begin the connected breath. Keep it continuous — round and round, like a circle.',
      'Breathe fully into your belly first, then expand into your chest. Exhale naturally, maybe even a little stronger than the inhale.',
      'There is no right or wrong here — just keep the breath moving, always connected.',
    ],
    guidance: [
      'Feel the breath energizing your body...',
      'Notice any sensations that arise — tingling, tightness, warmth, vibrations. Acknowledge them and keep breathing.',
      'If you feel lightheaded, know it\'s normal — just keep breathing. The body knows how to regulate itself.',
      'Emotions may surface — joy, grief, anger, sadness. Let them move through you. The breath will carry them.',
      'Stay with it. The breath is your anchor and your vehicle.',
      'Continue breathing, deepening into the experience.',
      'Sink into the rhythm. Inhale... exhale... in... out...',
    ],
    prompt: '',
  },

  integration: {
    intro: [
      'The breathing phase is complete. Now let the breath return to its natural rhythm.',
      'Rest now. Allow your body to integrate the experience. Notice any changes in your body, your mind, your emotional state.',
    ],
    guidance: [
      'Take your time. Don\'t rush back into your day.',
      'What came up during the breathwork? What was released? What insights appeared?',
      'You may want to journal or simply rest in stillness for a while.',
      'Drink water. Ground yourself. This integration continues over the next few hours and days.',
    ],
    prompt: '',
  },

  completion: {
    intro: [
      'Your breathwork session is complete.',
    ],
    guidance: [
      'You\'ve given your nervous system a profound reset.',
      'Connected breathwork can accelerate emotional processing, increase oxygenation, and create states of expanded awareness.',
      'Carry the insights and releases from this session with you.',
      'Return to this practice whenever you need a reset or a deep cleansing on the cellular level.',
    ],
    prompt: '',
  },
};

// ----------------------------------------------------------------
// Phase sequencing
// ----------------------------------------------------------------

interface PhaseConfig {
  id: string;
  displayName: string;
  introMs: number;
  guidanceMs: number;
  promptMs: number;
}

// Respiratory alkalosis and strong experiences typically need at least 8-10 minutes of actual breathing.
// We cap the breathing phase to around 10 minutes for safety, allowing shortening if needed.
const PHASES: PhaseConfig[] = [
  { id: 'prep',       displayName: 'Preparation',  introMs: 30_000, guidanceMs:  60_000, promptMs: 60_000 },
  { id: 'breathing',  displayName: 'Breathing',    introMs: 15_000, guidanceMs: 420_000, promptMs:  0 },
  { id: 'integration',displayName: 'Integration',  introMs: 10_000, guidanceMs:  90_000, promptMs:  0 },
];

// ----------------------------------------------------------------
// BREATHWORK Agent
// ----------------------------------------------------------------

export const BREATHWORKAgent: SpecialistAgent = {
  protocolId: 'breathwork',
  displayName: 'Conscious Connected Breathwork',
  description:
    'Continuous circular breathing without pause, inducing altered states and emotional release. Based on Holotropic Breathwork and the Wim Hof method. Suitable for emotional clearing and expanded awareness.',
  defaultDuration: 15,

  validate(input: ContextPackage): ValidationResult {
    // Breathwork is powerful but needs minimum time for breathing phase
    if (input.suggestedDuration > 0 && input.suggestedDuration < 8) {
      return {
        valid: false,
        reason: 'Breathwork requires at least 8 minutes (5 for prep + breathing).',
        suggestedProtocol: 'woop',
      };
    }
    // For users with severe trauma, offer gentle pacing warnings
    if (input.detectedEmotion === 'trauma') {
      return {
        valid: true,
        reason: 'Breathwork can be intense; offer gentle pacing warnings.',
      };
    }
    return { valid: true };
  },

  async *run(input: ContextPackage): AsyncGenerator<SessionEvent> {
    const duration = input.userPreferences?.sessionDuration ?? BREATHWORKAgent.defaultDuration;

    // Yield opening completion event
    yield makeEvent('completion', 'Opening', [
      `Starting Connected Breathwork — ${duration} minutes allocated.`,
      'This is a powerful practice. Trust your body. Breathe continuously without pause.',
    ], 5_000);

    for (const phase of PHASES) {
      const transcripts = PHASE_TRANSCRIPTS[phase.id as keyof typeof PHASE_TRANSCRIPTS];
      if (!transcripts) continue;

      // Phase intro
      yield* yieldTranscripts(transcripts.intro, phase.id, phase.displayName, phase.introMs);

      // Prompt if the phase has one
      if (transcripts.prompt && phase.promptMs > 0) {
        yield makePrompt(phase.id, phase.displayName, transcripts.prompt, phase.promptMs);
      }

      // Guidance
      yield* yieldTranscripts(transcripts.guidance, phase.id, phase.displayName, phase.guidanceMs);

      // Transition to next phase (except after the last phase)
      const phaseIndex = PHASES.findIndex((p) => p.id === phase.id);
      const nextPhase = PHASES[phaseIndex + 1];
      if (nextPhase) {
        yield makeTransition(phase.id, nextPhase.id, `Moving into ${nextPhase.displayName}...`);
      }
    }

    // Closing — yield guidance first, then completion as the true session-end marker
    yield* yieldTranscripts(
      PHASE_TRANSCRIPTS.completion.guidance,
      'completion',
      'Session Complete',
      30_000,
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
): Generator<SessionEvent> {
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
