// ACT Specialist Agent
// Protocol: Acceptance and Commitment Therapy (ACT)
//
// Based on Steven C. Hayes's ACT model.
// A behavioral therapy that uses acceptance and mindfulness strategies
// together with commitment and behavior-change strategies to increase
// psychological flexibility.
//
// Key ACT processes:
//   - Defusion:   stepping back from thoughts (not fighting them)
//   - Acceptance: making room for uncomfortable feelings
//   - Present-moment contact: being aware of here-and-now
//   - Self-as-context: pure awareness (the observing self)
//   - Values clarification: knowing what matters
//   - Committed action: values-based behavior
//
// Session structure mirrors the ACT hexaflex:
//   Grounding → Defusion → Acceptance → Values → Commitment → Integration

import type { ContextPackage } from '../router-agent/types.js';
import type { SessionEvent, ValidationResult } from './types.js';
import { SpecialistAgent } from './types.js';

// ----------------------------------------------------------------
// ACT-specific types
// ----------------------------------------------------------------

interface ACTPhase {
  name: string;
  intro: string[];
  guidance: string[];
  prompt?: string;
}

type Metaphor = 'leaves' | 'radio' | 'clouds';

// ----------------------------------------------------------------
// Transcript library — guided prompts per phase
// ----------------------------------------------------------------

const PHASE_TRANSCRIPTS: Record<string, ACTPhase> = {
  grounding: {
    name: 'Grounding',
    intro: [
      'Welcome to this Acceptance and Commitment Therapy session.',
      'Today we will practice defusion — creating space between you and your thoughts.',
      'Find a comfortable position. Feet on the floor, hands resting wherever they land.',
      'Take a breath in... and let it go. You don\'t need to fix anything right now.',
      'Just be here. Notice what\'s present — sounds, sensations, the weight of your body.',
    ],
    guidance: [
      'Feel your feet on the floor. Feel the support beneath you.',
      'Notice three things you can see. Name them quietly to yourself.',
      'Notice two things you can hear. One distant sound, one close.',
      'Notice one thing you can feel in your body — your breath, your heartbeat, a sensation.',
      'There is no goal here except to be present. Whatever is here is exactly what\'s here.',
    ],
    prompt: 'What is the quality of your attention right now? Restless, calm, scattered — just notice it without trying to change it.',
  },

  hook: {
    name: 'Identifying the Hook',
    intro: [
      'Now we turn to the thought that\'s been looping, the one that pulls you in.',
      'In ACT we call this "the hook" — the thought that catches you and runs the show.',
      'It might be a self-judgment: "I\'m not good enough." It might be a worry: "What if it all goes wrong?"',
      'It might be a memory dressed up as a prediction. It\'s the familiar story.',
    ],
    guidance: [
      'Let the hook be there. You don\'t have to like it. You don\'t have to believe it.',
      'Just notice: what thought has the most energy right now? What\'s the one that shows up most often?',
      'Name it quietly. Not to solve it — just to see it clearly.',
      'Give it a shape if you like. A color. A texture. A size.',
      'You are not the thought. You are the space it appears in.',
    ],
    prompt: 'Can you name the hook in one short phrase? Just notice it. "I\'m not enough." "It\'s all my fault." "What if..." — whatever it is, just see it.',
  },

  defusion_leaves: {
    name: 'Defusion — Leaves on a Stream',
    intro: [
      'We\'re going to practice cognitive defusion — a way of relating to thoughts that loosens their grip.',
      'The leaves-on-a-stream metaphor: imagine a gentle stream. Each thought that arises is a leaf floating by.',
      'Some leaves are large, some small. Some are dark, some are bright. You don\'t choose the leaves. They just appear.',
      'Your job is simply to notice them and let them float by.',
      'When a leaf that\'s your hook appears — the one with the hook on it — you don\'t grab it. You just let it drift past and continue watching.',
    ],
    guidance: [
      'Close your eyes if it feels right. Bring your attention to your breath, or just to the sense of being here.',
      'See the stream. Feel its pace — unhurried, natural. The water doesn\'t try to push the leaves away.',
      'Here comes a leaf. Here comes another. Notice each one without hopping on.',
      'Here comes the hook. The familiar thought. Look — there it is. Let it land on the water and start to move.',
      'Watch it float. Don\'t push it. Don\'t pull it. Just watch it drift downstream.',
      'Another leaf comes. And another. The hook might come back. It will. Let it float.',
      'You are not the leaves. You are the one who watches the leaves go by.',
    ],
    prompt: 'If the hook thought came back right now, could you let it be a leaf? Just notice: "There it is again" — and let it pass.',
  },

  defusion_radio: {
    name: 'Defusion — The Doom Radio',
    intro: [
      'Another defusion practice: imagine there\'s a radio playing in the room with you.',
      'The station never changes. It plays the same song — your hook thought — over and over, slightly different each time.',
      '"I\'m not good enough. I should be different. It\'s all been a mistake."',
      'The radio has been playing for years. You thought it was telling the truth.',
    ],
    guidance: [
      'Notice the radio is still playing. Same station. Same song.',
      'But here\'s what\'s true: the radio is playing IN the room. You are in the room WITH the radio.',
      'You are not the station. You don\'t have to believe the lyrics. You don\'t have to sing along.',
      'The radio can play. You can notice it playing. And you can choose what to do next.',
      'The thoughts can play — even loud — and you can still move toward what matters.',
    ],
    prompt: 'If the radio is playing right now, can you notice: "There\'s that station again" — without believing it, without turning it off, just knowing it\'s there?',
  },

  defusion_clouds: {
    name: 'Defusion — Clouds Passing',
    intro: [
      'A third defusion image: the sky. Thoughts are like clouds drifting across the sky of your mind.',
      'Some clouds are dark and heavy with rain. Some are bright and thin. They all pass.',
      'The sky itself — the space they move through — is always there. It doesn\'t become the clouds.',
      'The hook thought is one cloud. Dark perhaps, or heavy. But it\'s still just a cloud.',
    ],
    guidance: [
      'Rest in the sense of the open sky behind all the clouds.',
      'Here comes a cloud. Here it goes. No effort needed to make it leave.',
      'The heavy cloud — the hook — appears. Look at it from the open sky. It\'s just a cloud.',
      'Watch it drift. Watch it change shape. Watch it eventually pass.',
      'The sky was never hurt by any cloud. And you were never hurt by any thought.',
    ],
    prompt: 'Can you feel the open sky behind whatever thoughts are moving through right now? You can hold the thought and still feel the space it appears in.',
  },

  acceptance: {
    name: 'Acceptance',
    intro: [
      'After defusion comes acceptance — not resignation, not approval, but a willingness to have what\'s here.',
      'The difficult feeling beneath the thought — the one you\'ve been pushing away — is asking for space.',
      'In ACT we make room for it. Not because it\'s pleasant. Because fighting it is more costly.',
    ],
    guidance: [
      'Turn toward the feeling. Not into the story — just into the body.',
      'Where does it live in your body? Tightness, heat, hollowness, heaviness?',
      'Can you let there be space around it? Like making a wider container for the same substance?',
      'You don\'t have to like the feeling. Just let there be room for it.',
      'Resistance is the secondary prison. The feeling is just a feeling. The space is always bigger.',
    ],
    prompt: 'What feeling is underneath the hook thought? Can you let it be there — not forever, just for this moment — without tightening against it?',
  },

  values: {
    name: 'Values Clarification',
    intro: [
      'Defusion and acceptance create space. Now we ask: space for what?',
      'Values are not goals. Goals are points on a map. Values are the direction you want to walk.',
      'Values don\'t disappear when things get hard. They persist. They give life meaning.',
    ],
    guidance: [
      'If fear weren\'t running the show — if the hook thought loosened its grip — what would you want your life to be about?',
      'Think of one person or relationship that matters. What quality do you want to bring to it?',
      'Think of your work or your craft. What do you want it to stand for?',
      'Think of your own inner life — rest, growth, peace, adventure. What calls to you?',
      'Values aren\'t perfect. They\'re directions. "More of this" — whatever this is.',
    ],
    prompt: 'Pick one value that feels most alive right now. One word or short phrase. Let it settle. This is your compass for the next part.',
  },

  commitment: {
    name: 'Committed Action',
    intro: [
      'Values without action are wishful thinking. Action without values is busy-ness.',
      'Here we do both: we choose one small step — not a giant leap — in the direction of your value.',
      'Small is fine. The point is direction. One step creates momentum.',
    ],
    guidance: [
      'Based on the value you named: what is one tiny step you could take in the next 24 hours?',
      'Not a perfect step. Not a guarantee. Just one step toward what matters.',
      'It doesn\'t have to work. It doesn\'t have to change anything. It just has to be pointed in the right direction.',
      'If the hook thought shows up mid-step — and it will — see if you can notice it and keep walking.',
      'You\'ve already done something remarkable today: you made space for what\'s hard, and you turned toward what matters.',
    ],
    prompt: 'What is the one small step? Hold it in your mind. Not as a demand — as an offer. "I could do this. I am choosing to do this."',
  },

  integration: {
    name: 'Integration',
    intro: [
      'We\'re nearing the end of this session.',
      'Take a moment to let what happened here settle. You practiced defusion. You made room for difficulty.',
      'You remembered what you care about. You committed to one small step.',
    ],
    guidance: [
      'The hook thought will come back. It always does. And now you have a practice.',
      'You can let it be a leaf, or a radio station, or a cloud. You can let it be there without letting it drive.',
      'The values you touched today are still there. They don\'t expire.',
      'One small step. That\'s all. And then another.',
      'Thank you for doing this work. It matters.',
    ],
    prompt: '',
  },

  completion: {
    name: 'Session Complete',
    intro: [
      'This ACT session is complete.',
    ],
    guidance: [
      'You showed up. You did the practice. You remembered who you are beyond your thoughts.',
      'Come back to defusion whenever the hook takes hold. The sky is always there behind the clouds.',
    ],
    prompt: '',
  },
};

// ----------------------------------------------------------------
// Phase sequencing — ordered list
// ----------------------------------------------------------------

interface PhaseConfig {
  id: string;
  displayName: string;
  introMs: number;
  guidanceMs: number;
  promptMs: number;
}

const PHASES: PhaseConfig[] = [
  { id: 'grounding',   displayName: 'Grounding',         introMs: 20_000, guidanceMs:  60_000, promptMs: 45_000 },
  { id: 'hook',        displayName: 'Identifying Hook',  introMs: 20_000, guidanceMs:  60_000, promptMs: 30_000 },
  { id: 'defusion_leaves', displayName: 'Defusion — Leaves', introMs: 20_000, guidanceMs: 90_000, promptMs: 30_000 },
  { id: 'acceptance',  displayName: 'Acceptance',        introMs: 20_000, guidanceMs:  60_000, promptMs: 30_000 },
  { id: 'values',      displayName: 'Values',            introMs: 20_000, guidanceMs:  60_000, promptMs: 45_000 },
  { id: 'commitment',  displayName: 'Committed Action',   introMs: 20_000, guidanceMs:  60_000, promptMs: 30_000 },
  { id: 'integration', displayName: 'Integration',       introMs: 10_000, guidanceMs:  45_000, promptMs:  0     },
];

// ----------------------------------------------------------------
// ACT Agent
// ----------------------------------------------------------------

export const ACTAgent: SpecialistAgent = {
  protocolId: 'act',
  displayName: 'Acceptance and Commitment Therapy',
  description:
    'A mindfulness-based session that creates distance from sticky thoughts (defusion), makes room for difficult feelings (acceptance), clarifies what matters (values), and commits to one small values-aligned step (commitment). Based on Steven Hayes\'s ACT model.',
  defaultDuration: 25,

  validate(input: ContextPackage): ValidationResult {
    // ACT is appropriate when the user reports:
    // - Rumination, worry, anxious thoughts
    // - Self-criticism, shame, negative self-judgment
    // - Difficulty making decisions due to fear of failure
    // - Stuck patterns, avoidance behavior
    // - Grief, loss, trauma (with appropriate pacing guidance)
    // - Anger (defusion on the story behind the anger)

    const emotion = input.detectedEmotion;
    if (!emotion) {
      // No emotion detected — ACT is broadly applicable; default to valid
      return { valid: true };
    }

    // Priority 1: trauma and grief — return early with pacing guidance
    if (emotion === 'trauma' || emotion === 'grief') {
      return {
        valid: true,
        reason: 'ACT is appropriate for trauma and grief, but go slowly with acceptance. Consider SE or IFS for deeper parts work.',
      };
    }

    // Priority 2: emotions ACT is well-suited for
    const actEmotions = [
      'anxious',
      'stressed',
      'overwhelmed',
      'loss',
      'dissociated',
    ];

    if (actEmotions.includes(emotion)) {
      return { valid: true };
    }

    // Priority 3: anger — defusion approach works well
    if (emotion === 'angry') {
      return {
        valid: true,
        reason: 'ACT can work with anger — use defusion on the story behind the anger. Offer pacing.',
      };
    }

    // Default: ACT is gentle enough for most states
    return { valid: true };
  },

  async *run(input: ContextPackage): AsyncGenerator<SessionEvent> {
    // Yield opening guidance
    yield makeEvent('guidance', 'Opening', [
      `Starting ACT — Acceptance and Commitment Therapy.`,
      `This session practices defusion: stepping back from sticky thoughts, clarifying what matters, and committing to one small step.`,
      `Default duration: ${ACTAgent.defaultDuration} minutes. You don\'t need to do anything perfectly. Just follow along.`,
    ], 10_000);

    // Default to leaves on a stream — most intuitive and widely applicable
    const defusionPhase = 'defusion_leaves';

    // Build the ordered phase list with the selected defusion variant
    const orderedPhases = buildOrderedPhases(defusionPhase);

    for (const phase of orderedPhases) {
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

      // Transition to next phase (except after the last phase)
      const phaseIndex = orderedPhases.findIndex((p) => p.id === phase.id);
      const nextPhase = orderedPhases[phaseIndex + 1];
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

function buildOrderedPhases(defusionPhase: string): PhaseConfig[] {
  return [
    { id: 'grounding',    displayName: 'Grounding',         introMs: 20_000, guidanceMs:  60_000, promptMs: 45_000 },
    { id: 'hook',         displayName: 'Identifying Hook',  introMs: 20_000, guidanceMs:  60_000, promptMs: 30_000 },
    ...(defusionPhase !== 'defusion_leaves'
      ? [{ id: 'defusion_leaves', displayName: 'Defusion — Leaves', introMs: 0, guidanceMs: 0, promptMs: 0 } as PhaseConfig]
      : []),
    { id: defusionPhase,  displayName: PHASE_TRANSCRIPTS[defusionPhase]?.name ?? 'Defusion', introMs: 20_000, guidanceMs: 90_000, promptMs: 30_000 },
    { id: 'acceptance',  displayName: 'Acceptance',        introMs: 20_000, guidanceMs:  60_000, promptMs: 30_000 },
    { id: 'values',       displayName: 'Values',            introMs: 20_000, guidanceMs:  60_000, promptMs: 45_000 },
    { id: 'commitment',   displayName: 'Committed Action',  introMs: 20_000, guidanceMs:  60_000, promptMs: 30_000 },
    { id: 'integration',  displayName: 'Integration',        introMs: 10_000, guidanceMs:  45_000, promptMs:  0     },
  ];
}

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
