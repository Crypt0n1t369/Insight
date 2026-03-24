// Router Agent — Type Definitions

export type EmotionTag =
  | 'anxious'
  | 'stressed'
  | 'low'
  | 'depressed'
  | 'angry'
  | 'frustrated'
  | 'neutral'
  | 'curious'
  | 'excited'
  | 'motivated'
  | 'grief'
  | 'loss'
  | 'overwhelmed'
  | 'dissociated';

export type ProtocolId =
  | 'nsdr'      // Non-Sleep Deep Rest
  | 'ifs'       // Internal Family Systems
  | 'woop'      // Wish-Outcome-Obstacle-Plan
  | 'act'       // Acceptance & Commitment
  | 'nvc'       // Nonviolent Communication
  | 'se'        // Somatic Experiencing
  | 'breathwork'
  | 'general';  // Fallback / general wellbeing

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type InputModality = 'voice' | 'text';

export interface RouterInput {
  userId: string;
  sessionId: string;
  rawInput: string;
  modality: InputModality;
  detectedEmotion?: EmotionTag;
  recentProtocols?: ProtocolId[];
  timeOfDay?: TimeOfDay;
}

export interface UserPrefs {
  preferredProtocol?: ProtocolId;
  sessionDuration?: number;
  avoidProtocols?: ProtocolId[];
}

export interface ContextPackage {
  protocol: ProtocolId;
  userId: string;
  sessionId: string;
  detectedEmotion?: EmotionTag;
  suggestedDuration: number; // minutes
  preprompts: string[];
  priorSessionSummary?: string;
  userPreferences?: UserPrefs;
}

export interface RouterOutput {
  selectedProtocol: ProtocolId;
  confidence: number; // 0.0–1.0
  contextPackage: ContextPackage;
  fallbackProtocol?: ProtocolId;
  reasoning: string;
}

// Routing decision internals
export interface RoutingSignal {
  protocol: ProtocolId;
  confidence: number;
  reason: string;
  needsClarification: boolean;
}

// Keyword sets used for text-based routing
export const GOAL_KEYWORDS = ['want', 'wish', 'hope', 'plan', 'goal', 'achieve', 'decide'];
export const PARTS_KEYWORDS = ['part', 'inner', 'self', 'conflict', 'torn', 'should', 'want-but'];
export const BODY_KEYWORDS = ['body', 'somatic', 'tension', 'pain', 'physical', 'felt sense'];
export const RELATIONSHIP_KEYWORDS = ['relationship', 'partner', 'communication', 'argument', 'family'];

// Protocol duration defaults (minutes)
export const PROTOCOL_DURATIONS: Record<ProtocolId, number> = {
  nsdr: 22,
  ifs: 45,
  woop: 15,
  act: 30,
  nvc: 35,
  se: 40,
  breathwork: 12,
  general: 20,
};

// Protocol preprompts
export const PROTOCOL_PREPROMPTS: Record<ProtocolId, string[]> = {
  nsdr: [
    'Guide the user into a non-sleep deep rest state.',
    'Use slow, rhythmic voice with long pauses.',
    'Induce theta brainwave relaxation through suggestion.',
  ],
  ifs: [
    'Facilitate Internal Family Systems parts work.',
    'Help user identify and communicate with inner parts.',
    'Promote harmony between manager, firefighter, and exiled parts.',
  ],
  woop: [
    'Facilitate Wish-Outcome-Obstacle-Plan visualization.',
    'Guide through mental contrasting exercise.',
    'Help user identify obstacles between wish and outcome.',
  ],
  act: [
    'Guide Acceptance and Commitment Therapy session.',
    'Focus on psychological flexibility and values-based action.',
    'Use defusion techniques and present-moment awareness.',
  ],
  nvc: [
    'Facilitate Nonviolent Communication practice.',
    'Guide user through observations, feelings, needs, requests.',
    'Help replace judgmental language with needs-based language.',
  ],
  se: [
    'Facilitate Somatic Experiencing body-awareness session.',
    'Track physical sensations as they move through the body.',
    'Support titration and pendulation of arousal.',
  ],
  breathwork: [
    'Guide structured breathing exercises.',
    'Use coherent breathing at ~5 breaths/minute.',
    'Activate parasympathetic nervous system response.',
  ],
  general: [
    'Provide general wellbeing support.',
    'Use evidence-based stress reduction techniques.',
    'Focus on present-moment awareness and self-compassion.',
  ],
};
