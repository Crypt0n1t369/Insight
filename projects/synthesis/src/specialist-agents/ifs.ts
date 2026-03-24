// IFS Specialist Agent
// Protocol: Internal Family Systems
//
// Based on Richard Schwartz's Internal Family Systems model.
// Helps users explore and harmonize their inner "parts" — subpersonalities
// that carry emotions, beliefs, and behaviors. The session guides users
// through grounding, parts discovery, unblending, and integration.

import type { ContextPackage } from '../router-agent/types.js';
import type { SessionEvent, ValidationResult } from './types.js';
import { SpecialistAgent } from './types.js';

// ----------------------------------------------------------------
// Transcript library — guided prompts per phase
// ----------------------------------------------------------------

const PHASE_TRANSCRIPTS = {
  grounding: {
    intro: [
      'Welcome to your IFS session — Internal Family Systems.',
      'This protocol, developed by Richard Schwartz, helps you understand and harmonize the different parts of yourself.',
      'Before we begin, let\'s establish a safe internal space.',
      'Take a breath in slowly... and let it out with a sigh.',
      'Find a comfortable posture. You don\'t need to fix anything right now — just arrive.',
    ],
    breath: [
      'Let\'s begin with a simple breathing rhythm.',
      'Breathe in for a count of four... one, two, three, four.',
      'Hold for a moment...',
      'And release slowly... one, two, three, four, five, six.',
      'Again. In... two, three, four. Hold... and out... two, three, four, five, six.',
      'With each exhale, let your body settle a little deeper.',
    ],
    safePlace: [
      'Now, bring to mind a place where you feel completely safe.',
      'It might be real or imagined — a forest, a beach, a room, a memory.',
      'See the details. What do you see around you? What colors, what light?',
      'Notice the temperature. The quality of the air.',
      'If you feel safe, allow that feeling to deepen.',
      'You can return here at any point during our session.',
    ],
    prompt: 'Take a moment to settle into this grounded state. When you\'re ready, let\'s move forward.',
  },

  identifyParts: {
    intro: [
      'IFS works with the idea that each of us has many different "parts" — subpersonalities that carry emotions, opinions, and habits.',
      'These parts developed over time, often in response to life experiences.',
      'Most of us have an inner Critic, a inner Protector, a part that wants to achieve, a part that needs rest, and many more.',
      'Today, we\'re going to listen to whatever part is most active for you right now.',
      'There are no wrong parts. Every part has a positive intention, even if its methods aren\'t always helpful.',
    ],
    guidance: [
      'Close your eyes if that feels comfortable, and turn your attention inward.',
      'Notice what\'s occupying your mind right now. What thoughts are present?',
      'What emotions are active? Is there a feeling tone — anxiety, heaviness, urgency, frustration?',
      'As you scan inward, see if a part stands out. It might feel like a presence, a voice, a sensation.',
      'It\'s okay if you don\'t see anything clearly yet. Just notice what\'s loudest.',
    ],
    prompt: 'What part of you is most active right now? Give it a simple name, even if it\'s just a word — like "the critic," "the worrier," "the inner child."',
  },

  dialogue: {
    intro: [
      'Now that you\'ve noticed this part, we\'re going to approach it with curiosity rather than change it.',
      'The central move in IFS is what we call "unblending" — stepping back so you\'re not fully merged with the part\'s viewpoint.',
      'From this slightly separated vantage point, you can listen to what the part has to say.',
      'We\'re not trying to suppress it, fix it, or get rid of it. Just listen.',
    ],
    guidance: [
      'Bring your awareness to this part. See if you can sense its shape, color, temperature, or energy.',
      'Now, step slightly back — imagine you\'re not the part, but an observer, with the part nearby.',
      'From this vantage point, ask the part: What are you trying to protect me from?',
      'Give the part space to answer. It might come as words, images, sensations, or just knowing.',
      'Don\'t analyze or judge. Just let it communicate.',
      'If the part could speak freely, without you trying to change it, what would it say?',
      'What does this part need? What is it afraid would happen if it weren\'t doing its job?',
    ],
    prompt: 'What is this part trying to protect you from? If it could speak freely, what would it say it needs?',
  },

  modification: {
    intro: [
      'This is the heart of IFS work: updating your relationship with the part.',
      'Most parts are carrying a burden — an extreme role, a painful memory, a limiting belief.',
      'Through this session, we begin to relieve that burden and restore the part to its natural, calm state.',
    ],
    guidance: [
      'First, acknowledge this part. Thank it for its effort, even if its methods have been difficult.',
      'You might say something like: "I see you. I understand why you\'re doing this."',
      'Now, bring to mind your clearest, calmest sense of yourself — your centered, grounded self.',
      'This is what IFS calls "Self" — curious, calm, compassionate, clear.',
      'From this Self, see if you can offer the part something it needs.',
      'Perhaps it needs to hear that the danger has passed. That it\'s safe now.',
      'Perhaps it needs permission to rest. Or to stop carrying its burden alone.',
      'Notice what happens in your body when you offer this to the part.',
    ],
    prompt: 'From your calmest, centered Self, what would you offer this part? What does it most need to hear right now?',
  },

  integration: {
    intro: [
      'We\'re approaching the close of your IFS session.',
      'Take a moment to notice the shift — if any — in your relationship with this part.',
    ],
    guidance: [
      'You don\'t need to achieve a complete transformation today. IFS is a practice.',
      'What matters is the new quality of attention you\'ve brought to this part.',
      'Remember: you are not this part. You are the aware, curious Self that can witness it.',
      'This is called "unblending" — and with practice, it becomes a resource you can return to.',
      'When you\'re ready, bring your attention back to the room. Notice your feet on the floor.',
      'Take a breath. And when you\'re ready, open your eyes.',
    ],
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
  {
    id: 'grounding',
    displayName: 'Grounding',
    introMs: 30_000,
    guidanceMs: 120_000,
    promptMs: 30_000,
  },
  {
    id: 'identifyParts',
    displayName: 'Identify Parts',
    introMs: 30_000,
    guidanceMs: 120_000,
    promptMs: 90_000,
  },
  {
    id: 'dialogue',
    displayName: 'Parts Dialogue',
    introMs: 20_000,
    guidanceMs: 300_000,
    promptMs: 120_000,
  },
  {
    id: 'modification',
    displayName: 'Modification',
    introMs: 15_000,
    guidanceMs: 180_000,
    promptMs: 90_000,
  },
  {
    id: 'integration',
    displayName: 'Integration',
    introMs: 15_000,
    guidanceMs: 90_000,
    promptMs: 15_000,
  },
];

// ----------------------------------------------------------------
// IFS Agent
// ----------------------------------------------------------------

export const IFSAgent: SpecialistAgent = {
  protocolId: 'ifs',
  displayName: 'Internal Family Systems',
  description:
    'A parts-based therapy session for exploring, unblending, and harmonizing inner subpersonalities. Based on Richard Schwartz\'s IFS model — effective for self-criticism, anxiety, trauma, and relationship patterns.',
  defaultDuration: 25,

  validate(input: ContextPackage): ValidationResult {
    if (input.detectedEmotion === 'grief' || input.detectedEmotion === 'trauma') {
      return {
        valid: true,
        reason: 'IFS is particularly well-suited for grief and trauma. Proceed gently.',
      };
    }
    if (input.suggestedDuration > 0 && input.suggestedDuration < 15) {
      return {
        valid: false,
        reason: 'IFS requires at least 15 minutes to safely complete the grounding and parts work.',
        suggestedProtocol: 'breathwork',
      };
    }
    return { valid: true };
  },

  async *run(input: ContextPackage): AsyncGenerator<SessionEvent> {
    const duration = input.userPreferences?.sessionDuration ?? IFSAgent.defaultDuration;

    yield makeEvent('completion', 'Opening', [
      `Starting IFS session — ${duration} minutes allocated.`,
      'Welcome. Let\'s begin.',
    ], 5_000);

    const transcripts = PHASE_TRANSCRIPTS;

    // Grounding phase: intro + breath + safe place + prompt
    yield* yieldTranscripts(transcripts.grounding.intro, 'grounding', 'Grounding', 30_000);
    yield* yieldTranscripts(transcripts.grounding.breath, 'grounding', 'Breathing', 90_000);
    yield* yieldTranscripts(transcripts.grounding.safePlace, 'grounding', 'Safe Place', 90_000);
    yield makePrompt('grounding', 'Grounding', transcripts.grounding.prompt, 30_000);

    // Identify Parts phase
    yield makeTransition('grounding', 'identifyParts', 'Moving into parts discovery...');
    yield* yieldTranscripts(transcripts.identifyParts.intro, 'identifyParts', 'Identify Parts', 30_000);
    yield* yieldTranscripts(transcripts.identifyParts.guidance, 'identifyParts', 'Identify Parts', 120_000);
    yield makePrompt('identifyParts', 'Identify Parts', transcripts.identifyParts.prompt, 90_000);

    // Dialogue phase
    yield makeTransition('identifyParts', 'dialogue', 'Turning toward the part...');
    yield* yieldTranscripts(transcripts.dialogue.intro, 'dialogue', 'Parts Dialogue', 20_000);
    yield* yieldTranscripts(transcripts.dialogue.guidance, 'dialogue', 'Parts Dialogue', 300_000);
    yield makePrompt('dialogue', 'Parts Dialogue', transcripts.dialogue.prompt, 120_000);

    // Modification phase
    yield makeTransition('dialogue', 'modification', 'Updating your relationship with the part...');
    yield* yieldTranscripts(transcripts.modification.intro, 'modification', 'Modification', 15_000);
    yield* yieldTranscripts(transcripts.modification.guidance, 'modification', 'Modification', 180_000);
    yield makePrompt('modification', 'Modification', transcripts.modification.prompt, 90_000);

    // Integration phase
    yield makeTransition('modification', 'integration', 'Gently returning...');
    yield* yieldTranscripts(transcripts.integration.intro, 'integration', 'Integration', 15_000);
    yield* yieldTranscripts(transcripts.integration.guidance, 'integration', 'Integration', 90_000);
    yield makeEvent('completion', 'Session Complete', [
      'Your IFS session is complete.',
      'You can return to these parts anytime through this practice.',
    ], 5_000);
  },
};

// ----------------------------------------------------------------
// Helpers (mirrors woop.ts helpers)
// ----------------------------------------------------------------

function makeEvent(
  type: SessionEvent['type'],
  phase: string,
  transcript: string[],
  duration?: number,
): SessionEvent {
  return { type, phase, transcript: transcript.join(' '), duration };
}

function makePrompt(phaseId: string, phaseName: string, transcript: string, duration: number): SessionEvent {
  return { type: 'prompt', phase: phaseName, transcript, duration, metadata: { phaseId } };
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
    yield { type: 'guidance', phase: phaseName, transcript: line, duration: perLineMs, metadata: { phaseId } };
  }
}
