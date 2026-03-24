// NSDR Specialist Agent
// Protocol: Non-Sleep Deep Rest (Yogi Nidra)
//
// Based on Swami Satyananda Saraswati's Yogi Nidra and
// Dr. Andrew Huberman's NSDR protocol. A guided 20-minute
// session that induces a hypnogogic state for neural integration,
// memory consolidation, and physical recovery.

import type { ContextPackage } from '../router-agent/types.js';
import type { SessionEvent, ValidationResult } from './types.js';
import { SpecialistAgent } from './types.js';

// ----------------------------------------------------------------
// Transcript library — guided prompts per phase
// ----------------------------------------------------------------

const PHASE_TRANSCRIPTS = {
  intro: {
    intro: [
      'Welcome to Non-Sleep Deep Rest — NSDR.',
      'This is a scientifically validated protocol for entering a hypnogogic state: a state between waking and sleep where your brain is highly receptive to suggestion and integration.',
      'NSDR has been shown to improve memory, accelerate learning, reduce cortisol, and promote physical recovery.',
      'You don\'t need to fall asleep. Simply rest your attention on my voice and allow your body to deepen into relaxation.',
      'Lie down somewhere comfortable. Allow your eyes to close when they\'re ready.',
    ],
    guidance: [
      'Take three slow, deep breaths — breathing in through the nose, out through the mouth.',
      'With each exhale, let your body release a little more tension.',
      'Set your intention for this session... it could be: rest, integration, recovery, clarity, or simply being.',
      'There is nothing you need to do except listen and allow.',
    ],
    prompt: 'What is your intention for this NSDR session? Simply hold it in your mind as we begin.',
  },

  bodyScan: {
    intro: [
      'We begin with a body scan — systematically moving awareness through each part of the body.',
      'This activates the insula and interoceptive pathways, building body-mind awareness.',
      'As you move attention through each area, simply notice any sensations without judging them.',
    ],
    guidance: [
      'Bring awareness to the crown of your head... notice any sensations there, or perhaps no sensation at all.',
      'Now move to your forehead... your eyebrows... your eyes... allowing them to soften.',
      'Your cheeks... your jaw... let the muscles around your mouth release.',
      'Your neck and throat... your shoulders... allow them to drop away from your ears.',
      'Now your upper arms... your elbows... forearms... wrists... and down to your fingertips.',
      'Your chest... your ribcage... your belly rising and falling with each breath.',
      'Your lower back... your hips... your glutes... releasing into the floor.',
      'Your thighs... your knees... your shins... your calves.',
      'Ankles... heels... and finally your feet and toes.',
      'Take a moment to feel your whole body as one continuous field of awareness.',
    ],
    prompt: 'Can you feel your entire body at once, as a unified field of sensation?',
  },

  deepRest: {
    intro: [
      'Now we enter the deepest phase — the heart of NSDR.',
      'A state of conscious deep sleep... your brain waves will slow to theta and delta.',
      'I will offer a series of rotations of awareness... simply follow with your inner attention.',
      'There is nothing to do but receive.',
    ],
    guidance: [
      'Rotate your awareness slowly to the right side of your body... the right ear, right shoulder, right arm, right hand, right hip, right leg, right foot.',
      'Now rotate to the left side... left ear, left shoulder, left arm, left hand, left hip, left leg, left foot.',
      'Now bring awareness to the front of your body... face, chest, belly, front of thighs, front of shins, tops of feet.',
      'Now the back of your body... back of head, back of neck, back, spine, back of thighs, calves, heels.',
      'Now move your awareness to the right side of your body... right ear to right foot in one continuous line.',
      'Now the left side... left ear to left foot.',
      'Now the center... from the crown of your head, down through your body, to the center of the earth.',
      'Imagine yourself floating in warm water... weightless... supported completely.',
      'You may notice that time becomes fluid... stay here as long as you need.',
      'Your brain is in a state of highly efficient integration right now.',
    ],
    prompt: 'If any thoughts or images arise, simply let them pass like clouds across the sky. Return your attention to the center.',
  },

  return: {
    intro: [
      'We begin the gentle return to waking consciousness.',
      'There is no rush. We move slowly so your awareness can integrate the benefits of this state.',
    ],
    guidance: [
      'Begin to notice your breath... the sensation of air moving through your nose.',
      'Feel the weight of your body... the floor beneath you... the temperature of the air.',
      'I\'m going to count from 5 to 1, and with each number your awareness will return more fully to your body.',
      '5... beginning to feel your body more clearly.',
      '4... deeper awareness of your physical form.',
      '3... more present... more here.',
      '2... almost fully back... beginning to notice any sounds around you.',
      '1... gently open your eyes when you\'re ready.',
    ],
    prompt: '',
  },

  integration: {
    intro: [
      'Welcome back.',
      'Take a moment to notice how you feel. There\'s no right or wrong way to feel after NSDR.',
    ],
    guidance: [
      'Notice your body... any areas of deep relaxation or lightness.',
      'Notice your mind... perhaps feeling clearer, more spacious, or more focused.',
      'If you set an intention before the session, take a moment to reconnect with it.',
      'Drink some water when you\'re ready — NSDR is dehydrating.',
      'Give yourself at least 10 minutes before any demanding cognitive work.',
      'This state of integration will continue to work for you over the next few hours.',
    ],
    prompt: '',
  },

  completion: {
    intro: [
      'Your NSDR session is complete.',
    ],
    guidance: [
      'You\'ve given your nervous system a gift of deep rest and integration.',
      'NSDR has been shown to improve next-day memory recall and motor skill learning.',
      'Carry this sense of restoration with you.',
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

const PHASES: PhaseConfig[] = [
  { id: 'intro',     displayName: 'Intro',        introMs: 30_000, guidanceMs:  60_000, promptMs: 30_000 },
  { id: 'bodyScan', displayName: 'Body Scan',    introMs: 15_000, guidanceMs: 240_000, promptMs: 30_000 },
  { id: 'deepRest', displayName: 'Deep Rest',    introMs: 15_000, guidanceMs: 600_000, promptMs: 60_000 },
  { id: 'return',   displayName: 'Return',       introMs: 10_000, guidanceMs:  40_000, promptMs:  0 },
  { id: 'integration', displayName: 'Integration', introMs: 10_000, guidanceMs: 90_000, promptMs:  0 },
];

// ----------------------------------------------------------------
// NSDR Agent
// ----------------------------------------------------------------

export const NSDRAgent: SpecialistAgent = {
  protocolId: 'nsdr',
  displayName: 'Non-Sleep Deep Rest',
  description:
    'A guided 20-minute protocol that induces a hypnogogic state for neural integration and recovery. Based on Yogi Nidra and Huberman Lab\'s NSDR research — shown to improve memory consolidation, learning, and stress recovery.',
  defaultDuration: 20,

  validate(input: ContextPackage): ValidationResult {
    // NSDR is versatile but needs minimum time for deep rest phase
    if (input.suggestedDuration > 0 && input.suggestedDuration < 15) {
      return {
        valid: false,
        reason: 'NSDR requires at least 15 minutes to complete the deep rest phase properly.',
        suggestedProtocol: 'breathwork',
      };
    }
    return { valid: true };
  },

  async *run(input: ContextPackage): AsyncGenerator<SessionEvent> {
    const duration = input.userPreferences?.sessionDuration ?? NSDRAgent.defaultDuration;

    // Yield opening completion event
    yield makeEvent('completion', 'Opening', [
      `Starting NSDR session — ${duration} minutes allocated.`,
      'Lie down somewhere comfortable and allow your body to rest.',
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

    // Closing
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
