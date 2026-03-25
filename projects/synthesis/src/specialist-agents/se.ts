// SE Specialist Agent
// Protocol: Somatic Experiencing
//
// Based on Peter Levine's Somatic Experiencing (SE) model.
// A body-based approach to trauma resolution that works with
// the body's biological response to threat — facilitating the
// completion of frozen survival responses and restoring regulation.
//
// Key concepts:
//   - Felt sense: the physical feeling in the body as a whole
//   - Pendulation: alternating attention between contraction and resource
//   - Titubation: small involuntary movements that discharge frozen energy
//   - Completion: allowing the biological response cycle to finish

import type { ContextPackage } from '../router-agent/types.js';
import type { SessionEvent, ValidationResult } from './types.js';
import { SpecialistAgent } from './types.js';

// ----------------------------------------------------------------
// SE-specific types
// ----------------------------------------------------------------

interface SEPhase {
  name: string;
  intro: string[];
  guidance: string[];
  prompt?: string;
}

// ----------------------------------------------------------------
// Transcript library — guided prompts per phase
// ----------------------------------------------------------------

const PHASE_TRANSCRIPTS: Record<string, SEPhase> = {
  resource: {
    name: 'Resource Establishment',
    intro: [
      'Welcome to Somatic Experiencing.',
      'This is a body-based approach to restoring balance and completing survival responses that may have been interrupted.',
      'SE works with the wisdom of your body — helping you notice, track, and complete natural biological processes.',
      'Find a comfortable position, seated or lying down. Allow your eyes to close when ready.',
      'There is nothing to fix or change. Simply notice what is already present in your body.',
    ],
    guidance: [
      'Begin by taking a few natural breaths, letting your body settle.',
      'Notice the ground beneath you — its solidity and support.',
      'Bring your attention to the present moment. You are here, now, in this body, in this space.',
      'Scan for any sense of resource or stability — a place in your body that feels reasonably okay, or a sense of groundedness.',
      'Even a small sense of "okay-ness" is enough. You don\'t need to feel perfect — just notice what is available.',
      'As you rest in this resource, allow your nervous system to register that you are safe enough in this moment.',
    ],
    prompt: 'What do you notice in your body right now — even the smallest sensation?',
  },

  tracking: {
    name: 'Tracking Felt Sense',
    intro: [
      'Now we move into the heart of somatic experiencing — tracking the felt sense.',
      'The felt sense is the physical feeling in your body as a whole — not a specific pain or sensation, but the overall quality of being in your body right now.',
      'We will move slowly and pendulate: bringing gentle attention toward areas of contraction, then back to resource, then toward contraction again.',
      'This alternating movement is how the body releases and completes frozen responses.',
    ],
    guidance: [
      'Slowly bring your attention to your body. Begin at the top of your head and gently scan downward.',
      'Notice any sensations — warmth, coolness, tingling, tightness, movement, or nothing at all. All of these are valid.',
      'If you notice an area of tightness or tension, don\'t push into it. Simply acknowledge it: "I notice this area is tight."',
      'Now shift your attention back to your resource — your groundedness, your breath, the support beneath you.',
      'Stay there for a moment. Let your system know it has somewhere safe to return.',
      'Now, gently, turn attention back toward the area of sensation. Not to change it — just to be with it.',
      'Notice: has the quality of the sensation changed? Shifted? Grown? Changed in any way?',
      'This is pendulation — the natural rhythm of the body. Contraction... resource... contraction... resource.',
      'Stay with this rhythm. The body knows how to complete its responses when it feels safe enough to do so.',
      'If you notice any small involuntary movements — a twitch, a tremor, a subtle shake — allow them. This is titubation: the body\'s way of discharging frozen survival energy.',
      'These movements are not dangerous. They are healthy and natural. The body uses them to complete what was interrupted.',
    ],
    prompt: 'Can you feel the quality of sensation in your body right now — its shape, intensity, movement?',
  },

  completion: {
    name: 'Completing the Biological Response',
    intro: [
      'In SE, we support the body in completing survival responses that were interrupted.',
      'When threat passes, the body naturally completes its defensive responses — trembling, shaking, orienting, sighing. If these were blocked, the energy stays trapped.',
      'We create conditions for the body to finish what it started.',
    ],
    guidance: [
      'If there is any area in your body that holds a sense of incomplete action — an urge to move, run, push, pull, cry — notice it without forcing it.',
      'Allow your body to complete whatever it needs to complete in its own way and its own time.',
      'The shaking or trembling you may feel is called titubation — the body\'s natural mechanism for releasing frozen survival energy.',
      'It is completely safe. It is your body\'s intelligence expressing itself.',
      'If the movement wants to intensify, let it. If it wants to settle, let it. Follow your body\'s lead.',
      'There is no right or wrong way to do this. Your body knows.',
    ],
    prompt: 'Is there any urge or impulse in your body right now — to move, to breathe deeply, to sigh, to shake?',
  },

  integration: {
    name: 'Integration',
    intro: [
      'We come now to integration — bringing together what arose in this session.',
      'Take a moment to notice how you feel in your body compared to when we began.',
      'Any shifts, however small, are significant. The nervous system is always learning and adapting.',
    ],
    guidance: [
      'Gently bring awareness back to your whole body as one field of sensation.',
      'Notice the overall quality of your felt sense now. Has it changed? Softened? Shifted?',
      'Your body has been engaged in its own intelligence throughout this session. Trust that.',
      'There is no rush to get up. Take as long as you need to arrive back in the room.',
      'When you are ready, take a deep breath, wiggle your fingers and toes, and open your eyes.',
      'Carry this awareness with you. SE is not something you do — it is a way of being with your body that you can return to anytime.',
    ],
    prompt: 'What is one thing you are taking away from this session?',
  },
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function estimateDuration(phase: string): number {
  switch (phase) {
    case 'resource':      return 5; // minutes
    case 'tracking':      return 10;
    case 'completion':    return 7;
    case 'integration':   return 3;
    default:              return 5;
  }
}

function buildEvents(phase: string, phaseData: SEPhase, modality: string): SessionEvent[] {
  const events: SessionEvent[] = [];

  events.push({
    type: 'transition',
    phase: phaseData.name,
    transcript: `Beginning ${phaseData.name}...`,
    duration: 3,
  });

  for (const intro of phaseData.intro) {
    events.push({
      type: 'guidance',
      phase: phaseData.name,
      transcript: intro,
      duration: 6,
    });
  }

  if (phaseData.prompt) {
    events.push({
      type: 'prompt',
      phase: phaseData.name,
      transcript: phaseData.prompt,
      duration: 10,
    });
  }

  for (const guidance of phaseData.guidance) {
    events.push({
      type: 'guidance',
      phase: phaseData.name,
      transcript: guidance,
      duration: 8,
    });
  }

  return events;
}

// ----------------------------------------------------------------
// SE Agent
// ----------------------------------------------------------------

export const SEAgent: SpecialistAgent = {
  protocolId: 'se',
  displayName: 'Somatic Experiencing',
  description:
    'A body-based trauma resolution protocol that works with the nervous system to complete frozen survival responses and restore regulation.',
  defaultDuration: 20,

  async *run(input: ContextPackage): AsyncGenerator<SessionEvent> {
    const sessionMinutes = input.userPreferences?.sessionDuration ?? SEAgent.defaultDuration;
    // Scale time across phases proportionally
    const totalMinutes = estimateDuration('resource') + estimateDuration('tracking') +
                         estimateDuration('completion') + estimateDuration('integration');
    const scale = sessionMinutes / totalMinutes;

    const phases = ['resource', 'tracking', 'completion', 'integration'];

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const phaseData = PHASE_TRANSCRIPTS[phase];

      // First phase: duration-mentioning guidance FIRST, then transition
      if (i === 0) {
        yield {
          type: 'guidance',
          phase: phaseData.name,
          transcript: `Starting Somatic Experiencing session — ${sessionMinutes} minutes allocated. This is a body-based approach to restoring balance and completing survival responses that may have been interrupted.`,
          duration: Math.round(6 * scale),
        };
        yield {
          type: 'transition',
          phase: phaseData.name,
          transcript: `Beginning ${phaseData.name}...`,
          duration: 3,
        };
      } else {
        yield {
          type: 'transition',
          phase: 'Transition',
          transcript: `Moving from ${PHASE_TRANSCRIPTS[phases[i - 1]]?.name} into ${phaseData.name}...`,
          duration: 4,
        };
        yield {
          type: 'transition',
          phase: phaseData.name,
          transcript: `Beginning ${phaseData.name}...`,
          duration: 3,
        };
      }

      // Phase intro
      for (const intro of phaseData.intro) {
        yield {
          type: 'guidance',
          phase: phaseData.name,
          transcript: intro,
          duration: Math.round(6 * scale),
        };
      }

      // Prompt
      if (phaseData.prompt) {
        yield {
          type: 'prompt',
          phase: phaseData.name,
          transcript: phaseData.prompt,
          duration: Math.round(10 * scale),
        };
      }

      // Phase guidance
      for (const guidance of phaseData.guidance) {
        yield {
          type: 'guidance',
          phase: phaseData.name,
          transcript: guidance,
          duration: Math.round(8 * scale),
        };
      }

      // Integration phase leads into completion: yield integration guidance,
      // then prompt, then completion as the true session-end marker (last event).
      // This ensures no guidance follows the completion event.
      if (phase === 'integration') {
        // Transition into the closing
        yield {
          type: 'transition',
          phase: 'Session Complete',
          transcript: 'We come now to the close of your Somatic Experiencing session...',
          duration: 4,
        };
        // Completion guidance as a prompt to allow a moment of stillness
        yield {
          type: 'prompt',
          phase: 'Session Complete',
          transcript: 'Take a moment to arrive back in the room before continuing.',
          duration: Math.round(5 * scale),
        };
        yield {
          type: 'completion',
          phase: 'Session Complete',
          transcript: 'Your Somatic Experiencing session is complete. Take your time before returning to activity.',
          duration: Math.round(5 * scale),
        };
        break; // stop here — completion is the last event
      }
    }
  },

  validate(_input: ContextPackage): ValidationResult {
    // SE is appropriate when the user describes physical sensations,
    // bodily tension, stress held in the body, or unresolved physical responses.
    // Note: keyword-based pre-screening removed — SE is gentle enough to serve as
    // general body-awareness, and the router handles gross misroutes.
    return { valid: true };
  },
};
