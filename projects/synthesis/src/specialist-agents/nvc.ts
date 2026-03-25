// NVC Specialist Agent
// Protocol: Nonviolent Communication (NVC)
//
// Based on Marshall Rosenberg's Nonviolent Communication model.
// A structured process for relating to self and others without blame,
// criticism, or demand — replacing judgmental language with the language
// of needs and requests.
//
// NVC's four components:
//   1. Observation  — what I observe (see/hear/remember) that affects my wellbeing
//   2. Feeling      — how I feel (emotion/sensation) in relation to that observation
//   3. Need         — what needs of mine are connected to those feelings
//   4. Request      — the concrete actions I request (in do-able, nowievable terms)
//
// NVC distinguishes:
//   - Feelings (connected to needs): "I feel sad because I need belonging."
//   - feelings-as-words-for-threats: "I feel attacked" → the other person as cause
//
// Session structure:
//   Grounding → Self-Empathy (Needs) → Honest Expression → Receiving → Integration

import type { ContextPackage } from '../router-agent/types.js';
import type { SessionEvent, ValidationResult } from './types.js';
import { SpecialistAgent } from './types.js';

// ----------------------------------------------------------------
// NVC-specific types
// ----------------------------------------------------------------

interface NVCPhase {
  name: string;
  intro: string[];
  guidance: string[];
  prompt?: string;
}

// ----------------------------------------------------------------
// Transcript library — guided prompts per phase
// ----------------------------------------------------------------

const PHASE_TRANSCRIPTS: Record<string, NVCPhase> = {
  grounding: {
    name: 'Grounding',
    intro: [
      'Welcome to this Nonviolent Communication practice.',
      'NVC is a way of speaking and listening that helps us move from habitual judgment toward what\'s actually alive in us — and in others.',
      'Today we\'ll practice the four-part NVC process: observation, feeling, need, and request.',
      'There\'s no right way to do this. We\'re just practicing a different quality of attention.',
      'Find a comfortable position. Feet on the floor. Hands wherever they rest. Take a breath.',
    ],
    guidance: [
      'Feel the weight of your body. The floor holding you up.',
      'Notice you\'re here. Not performing. Not solving anything. Just present.',
      'In NVC we start by noticing what\'s present without judgment — not "he always ignores me" but "I\'ve been wanting to be heard."',
      'There\'s already something alive in that shift.',
    ],
    prompt: 'What situation or relationship is calling for your attention right now? Just notice it without needing to do anything about it yet.',
  },

  self_empathy_needs: {
    name: 'Self-Empathy — Identifying Needs',
    intro: [
      'In NVC, every feeling is a signal about a need.',
      'We don\'t say "I feel sad because you left." We say "I feel sad because my need for stability was not met."',
      'This is not about the other person being wrong. It\'s about tracing the feeling back to its source — our own unmet need.',
      'The need itself is not wrong. Needs are universal. Every human being has them.',
    ],
    guidance: [
      'Bring to mind the situation you noticed. Or simply: what\'s been present for you lately?',
      'Name one feeling that\'s been alive. Maybe tension. Maybe heaviness. Maybe a pull toward something.',
      'Now ask yourself: what need of mine might not be met right now?',
      'Needs are not wants or strategies. They\'re the deeper thing underneath.',
      'For example: the need for understanding, for rest, for honesty, for belonging, for autonomy, for care, for meaning.',
      'See if you can find the need that\'s most alive right now. Not a thought about it. The actual felt sense.',
    ],
    prompt: 'Can you name one need that feels most pressing right now? Put it in one or two words: "I need... safety." "I need... to be seen." "I need... honesty."',
  },

  honest_expression: {
    name: 'Honest Expression — Observation + Feeling + Need',
    intro: [
      'Now we practice expressing ourselves in NVC\'s form: observation, feeling, need.',
      'The observation is what we see or hear — without evaluation. No "you always" or "you never." Just what happened.',
      'The feeling is what we experience in our body — linked to the unmet need.',
      'The need is the deeper value that\'s calling for attention.',
    ],
    guidance: [
      'Form a sentence in your mind: "When I see/hear [observation]... I feel [feeling]... because I need [need]."',
      'For example: "When I notice the meeting ran late without explanation... I feel frustrated... because I need clarity and to be trusted with my time."',
      'Or: "When I hear silence after I shared something vulnerable... I feel uneasy... because I need to know I\'m not alone in this."',
      'The form isn\'t the point. The point is: can you trace the chain from observation to feeling to need — without blaming anyone?',
      'Blaming is the habit. NVC is a practice of returning to what\'s alive in us.',
    ],
    prompt: 'Try forming one complete NVC sentence — observation, feeling, need. Not to send to anyone. Just to practice the muscle of tracing the chain.',
  },

  making_requests: {
    name: 'Making Requests',
    intro: [
      'The fourth part of NVC is the request — a specific, do-able, here-and-now action.',
      'A request is different from a demand. In NVC, we stay open to the other person\'s response, even if they say no.',
      'A good request is concrete: a behavior, an action, something observable. Not "respect me" — but "could you let me know you received what I said?"',
      'Requests help us move from abstract longing to the possibility of connection.',
    ],
    guidance: [
      'With the need you named in mind: what would meeting that need look like in a concrete action?',
      'If you need to be heard — what would being heard actually look like? A specific time? Full attention for five minutes?',
      'If you need clarity — what question could you ask that would give you the information you need?',
      'If you need space — what boundary could you name that protects that space?',
      'Frame it as a request, not a demand. "Would you be willing to..." "Could we try..." "I\'d like to ask you..."',
      'A request respects the other person\'s autonomy to say no. That\'s what makes it nonviolent.',
    ],
    prompt: 'What is one specific request you could make — stated clearly, in one sentence, with the outcome left open? Something do-able. Something here-and-now.',
  },

  receiving: {
    name: 'Receiving with Empathy',
    intro: [
      'NVC isn\'t only about expressing ourselves. It\'s also about receiving others.',
      'When someone shares something difficult — criticism, anger, pain — we can practice receiving it as a gift.',
      'Behind every message is an unmet need. Even the most blaming statement is trying to communicate a need.',
      'Our job is not to fix or agree. It\'s to listen for the need underneath the words.',
    ],
    guidance: [
      'Think of a recent conversation where someone said something that landed hard for you.',
      'Can you listen for what they might have been needing, rather than what they were demanding?',
      'They might not have said it well. That\'s okay. NVC gives us a lens to look for the need.',
      '"You never listen to me" might really be: "I need to be heard. I need to know I matter to you."',
      '"You\'re so selfish" might be: "I need some care right now and I don\'t know how to ask."',
      'When we receive with empathy — not agreeing, not fixing, just hearing the need — something shifts.',
      'The other person often softens. But even if they don\'t, we remain whole.',
    ],
    prompt: 'Can you bring to mind someone who left you feeling defended or hurt? Can you hear — or guess — what need of theirs was not being met? Can you hold that need without taking it as an accusation?',
  },

  integration: {
    name: 'Integration',
    intro: [
      'We\'re nearing the end of this NVC practice.',
      'Take a moment to let what happened here settle.',
      'You practiced tracing feelings back to needs. You practiced honest expression without blame. You practiced receiving others with empathy.',
    ],
    guidance: [
      'NVC is a life practice. It takes repetition. That\'s why we practice.',
      'The next time you notice judgment rising — in yourself or toward another — pause.',
      'Ask: what\'s the observation? What\'s the feeling? What\'s the need?',
      'Then ask: what\'s a concrete request that could move toward meeting that need?',
      'Even one breath of NVC awareness changes the quality of a moment.',
      'Thank you for practicing with care.',
    ],
    prompt: '',
  },

  completion: {
    name: 'Session Complete',
    intro: [
      'This NVC session is complete.',
    ],
    guidance: [
      'You showed up. You traced the chain from observation to feeling to need.',
      'You practiced expressing without blame. You practiced receiving with empathy.',
      'NVC is a gift you give yourself — and everyone you encounter.',
      'Return here anytime you want to practice.',
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
  { id: 'grounding',           displayName: 'Grounding',                 introMs: 20_000, guidanceMs:  45_000, promptMs: 30_000 },
  { id: 'self_empathy_needs', displayName: 'Self-Empathy — Needs',        introMs: 20_000, guidanceMs:  90_000, promptMs: 45_000 },
  { id: 'honest_expression',  displayName: 'Honest Expression',           introMs: 20_000, guidanceMs:  75_000, promptMs: 30_000 },
  { id: 'making_requests',    displayName: 'Making Requests',            introMs: 15_000, guidanceMs:  75_000, promptMs: 30_000 },
  { id: 'receiving',           displayName: 'Receiving with Empathy',     introMs: 15_000, guidanceMs:  90_000, promptMs: 30_000 },
  { id: 'integration',         displayName: 'Integration',                introMs: 10_000, guidanceMs:  45_000, promptMs:  0     },
];

// ----------------------------------------------------------------
// NVC Agent
// ----------------------------------------------------------------

export const NVCAgent: SpecialistAgent = {
  protocolId: 'nvc',
  displayName: 'Nonviolent Communication',
  description:
    'A structured practice for expressing honestly and receiving with empathy, using Marshall Rosenberg\'s four-part NVC model: observation, feeling, need, and request. Replaces blame and judgment with the language of universal human needs.',
  defaultDuration: 35,

  validate(input: ContextPackage): ValidationResult {
    // NVC is appropriate when:
    // - Relationship tension, conflict, or disconnection
    // - Difficulty expressing difficult emotions without blame
    // - Receiving criticism or judgment from others
    // - Self-criticism, shame, or inner judgment
    // - Wanting to set a boundary or make a request
    // - Loss, grief, or transition involving others

    const emotion = input.detectedEmotion;

    if (!emotion) {
      // No emotion detected — NVC is broadly applicable
      return { valid: true };
    }

    // NVC shines in relational and emotional contexts
    const nvcEmotions = [
      'angry',
      'frustrated',
      'anxious',
      'overwhelmed',
      'grief',
      'loss',
      'stressed',
      'low',
    ];

    if (nvcEmotions.includes(emotion)) {
      return { valid: true };
    }

    // NVC handles neutral or curious states well (great for skill-building)
    if (emotion === 'neutral' || emotion === 'curious') {
      return { valid: true };
    }

    // Default to valid — NVC is gentle enough
    return { valid: true };
  },

  async *run(input: ContextPackage): AsyncGenerator<SessionEvent> {
    // Yield opening
    yield makeEvent('guidance', 'Opening', [
      `Starting Nonviolent Communication — NVC.`,
      `This practice helps you express honestly and receive with empathy, using the four-part model: observation, feeling, need, and request.`,
      `Default duration: ${NVCAgent.defaultDuration} minutes. There\'s no perfect way to do this. Just follow along and notice what arises.`,
    ], 10_000);

    for (const phase of PHASES) {
      const transcripts = PHASE_TRANSCRIPTS[phase.id];
      if (!transcripts) continue;

      // Phase intro
      yield* yieldTranscripts(transcripts.intro, phase.id, phase.displayName, phase.introMs);

      // Prompt if the phase has one
      if (transcripts.prompt && phase.promptMs > 0) {
        yield makePrompt(phase.id, phase.displayName, transcripts.prompt, phase.promptMs);
      }

      // Guidance
      yield* yieldTranscripts(transcripts.guidance, phase.id, phase.displayName, phase.guidanceMs);

      // Transition to next phase
      const phaseIndex = PHASES.findIndex((p) => p.id === phase.id);
      const nextPhase = PHASES[phaseIndex + 1];
      if (nextPhase) {
        yield makeTransition(phase.id, nextPhase.id, `Moving into ${nextPhase.displayName}...`);
      }
    }

    // Closing — yield final guidance, then a true completion event
    yield* yieldTranscripts(
      PHASE_TRANSCRIPTS.completion.guidance,
      'completion',
      'Session Complete',
      20_000,
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
