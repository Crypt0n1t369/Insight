// Knowledge Graph — Seed Data

import type { KGNode, KGEdge } from './types.js';

// --- Protocol nodes ---

const NSDr_NODE: KGNode = {
  id: 'protocol/nsdr',
  type: 'protocol',
  name: 'Non-Sleep Deep Rest',
  description:
    'A guided 20–30 minute protocol that induces a hypnogogic state for neural integration and recovery. Uses body scan, theta brainwave induction, and time-distortion suggestions.',
  tags: ['rest', 'neurobiology', 'recovery', 'parasympathetic', 'anxiety', 'sleep'],
  status: 'mature',
  metadata: { defaultDuration: 22, fullName: 'Non-Sleep Deep Rest' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const IFS_NODE: KGNode = {
  id: 'protocol/ifs',
  type: 'protocol',
  name: 'Internal Family Systems',
  description:
    'Parts-based therapy model for exploring and harmonizing inner psychological subpersonalities. Uses dialogue between Self and parts to reduce internal conflict.',
  tags: ['parts', 'internal-family-systems', 'trauma', 'inner-child', 'self-leadership'],
  status: 'mature',
  metadata: { defaultDuration: 45, fullName: 'Internal Family Systems (IFS)' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const WOOP_NODE: KGNode = {
  id: 'protocol/woop',
  type: 'protocol',
  name: 'Mental Contrasting with Implementation Intentions',
  description:
    'Goal-setting through vivid imagination of success (outcome) followed by obstacle mapping (obstacle) and concrete action planning (if-then). Increases goal attainment by 2–3x.',
  tags: ['goals', 'motivation', 'implementation-intentions', 'wish-outcome-obstacle-plan'],
  status: 'mature',
  metadata: { defaultDuration: 15, fullName: 'Mental Contrasting + WOOP' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const BREATHWORK_NODE: KGNode = {
  id: 'protocol/breathwork',
  type: 'protocol',
  name: 'Conscious Connected Breathwork',
  description:
    'Continuous breath without pause between inhale and exhale, inducing altered states, emotional release, and parasympathetic activation. Typically 10–15 minutes.',
  tags: ['breath', 'altered-states', 'emotional-release', 'sympathetic', 'nervous-system'],
  status: 'mature',
  metadata: { defaultDuration: 12, fullName: 'Conscious Connected Breathwork' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const ACT_NODE: KGNode = {
  id: 'protocol/act',
  type: 'protocol',
  name: 'Acceptance and Commitment Therapy',
  description:
    'Psychological flexibility model combining acceptance of internal experiences with commitment to values-based action. Uses defusion, expansion, and present-moment awareness.',
  tags: ['acceptance', 'values', 'psychological-flexibility', 'defusion', 'mindfulness'],
  status: 'mature',
  metadata: { defaultDuration: 30, fullName: 'Acceptance and Commitment Therapy' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const SE_NODE: KGNode = {
  id: 'protocol/se',
  type: 'protocol',
  name: 'Somatic Experiencing',
  description:
    'Body-awareness therapy for resolving trauma and stress. Tracks physical sensations as they move through the body using titration and pendulation to prevent overwhelm.',
  tags: ['somatic', 'trauma', 'body', 'polyvagal', 'tension', 'pendulation'],
  status: 'mature',
  metadata: { defaultDuration: 40, fullName: 'Somatic Experiencing (SE)' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const NVC_NODE: KGNode = {
  id: 'protocol/nvc',
  type: 'protocol',
  name: 'Nonviolent Communication',
  description:
    'Needs-based communication framework replacing judgmental language with observations, feelings, needs, and requests. Used for relationship repair and self-empathy.',
  tags: ['communication', 'relationships', 'empathy', 'needs', 'feelings', 'conflict'],
  status: 'mature',
  metadata: { defaultDuration: 35, fullName: 'Nonviolent Communication (NVC)' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const GENERAL_NODE: KGNode = {
  id: 'protocol/general',
  type: 'protocol',
  name: 'General Wellbeing Support',
  description:
    'Fallback protocol providing general stress reduction, present-moment awareness, and self-compassion guidance. Used when no specific protocol is indicated.',
  tags: ['general', 'wellbeing', 'stress-reduction', 'mindfulness', 'self-compassion'],
  status: 'mature',
  metadata: { defaultDuration: 20, fullName: 'General Wellbeing Support' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// --- Technique nodes ---

const BODY_SCAN_NODE: KGNode = {
  id: 'technique/body-scan',
  type: 'technique',
  name: 'Body Scan',
  description:
    'Progressive attention through body regions from feet to head, noticing sensations without trying to change them. Foundation of NSDR and MBSR protocols.',
  tags: ['body-scan', 'somatic', 'mindfulness', 'relaxation', 'interoception'],
  status: 'mature',
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const BREATH_AWARENESS_NODE: KGNode = {
  id: 'technique/breath-awareness',
  type: 'technique',
  name: 'Breath Awareness',
  description:
    'Simple observation of natural breath without control. Activates parasympathetic response through interoceptive attention. Foundation of most meditation protocols.',
  tags: ['breath', 'parasympathetic', 'mindfulness', 'grounding', 'interoception'],
  status: 'mature',
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// --- Concept nodes ---

const POLYVAGAL_NODE: KGNode = {
  id: 'concept/polyvagal',
  type: 'concept',
  name: 'Polyvagal Theory',
  description:
    "Stephen Porges' model of autonomic nervous system regulation through the vagus nerve. Explains fight/flight/freeze responses and the 'social engagement' system.",
  tags: ['polyvagal', 'vagus', 'autonomic', 'parasympathetic', 'trauma', 'neurobiology'],
  status: 'mature',
  metadata: { author: 'Stephen Porges', year: 1994 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const THETA_WAVES_NODE: KGNode = {
  id: 'concept/theta-waves',
  type: 'concept',
  name: 'Theta Brainwave State',
  description:
    'EEG state at 4–8 Hz associated with hypnagogia, memory consolidation, creative insight, and deep relaxation. NSDR specifically targets theta induction.',
  tags: ['theta', 'brainwaves', 'eeg', 'memory', 'hypnagogia', 'creativity'],
  status: 'mature',
  metadata: { frequencyHz: '4–8', associatedStates: ['dreaming', 'meditation', 'NSDR'] },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const PARTS_WORK_NODE: KGNode = {
  id: 'concept/parts-work',
  type: 'concept',
  name: 'Parts Work',
  description:
    'Psychological framework viewing the self as composed of subpersonalities ("parts") with different needs, fears, and roles. IFS is the primary evidence-based model.',
  tags: ['parts', 'subpersonalities', 'ifs', 'internal-family-systems', 'inner-child'],
  status: 'mature',
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const IMPLEMENTATION_INTENTIONS_NODE: KGNode = {
  id: 'concept/implementation-intentions',
  type: 'concept',
  name: 'Implementation Intentions',
  description:
    'Gollwitzer\'s research on "if-then" planning: specifying a concrete response to a anticipated obstacle. Increases goal achievement by 2–3x vs simple goal-setting.',
  tags: ['implementation-intentions', 'goals', 'motivation', 'planning', 'obstacle'],
  status: 'mature',
  metadata: { author: 'Peter Gollwitzer', year: 1999 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const TITRATION_NODE: KGNode = {
  id: 'concept/titration',
  type: 'concept',
  name: 'Titration',
  description:
    'Somatic Experiencing concept: processing traumatic material in small doses ("drips") rather than full exposure. Prevents overwhelm and frozen states.',
  tags: ['titration', 'trauma', 'somatic', 'overwhelm', 'pendulation'],
  status: 'mature',
  metadata: { author: 'Peter Levine' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const PSYCHOLOGICAL_FLEXIBILITY_NODE: KGNode = {
  id: 'concept/psychological-flexibility',
  type: 'concept',
  name: 'Psychological Flexibility',
  description:
    "ACT's core model: the ability to be present, open to experience, and engaged in values-based action — even in the presence of difficult thoughts and feelings.",
  tags: ['psychological-flexibility', 'act', 'acceptance', 'values', 'defusion'],
  status: 'mature',
  metadata: { author: 'Steven Hayes', year: 1989 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// --- All nodes ---

export const SEED_NODES: KGNode[] = [
  // Protocols
  NSDr_NODE, IFS_NODE, WOOP_NODE, BREATHWORK_NODE, ACT_NODE, SE_NODE, NVC_NODE, GENERAL_NODE,
  // Techniques
  BODY_SCAN_NODE, BREATH_AWARENESS_NODE,
  // Concepts
  POLYVAGAL_NODE, THETA_WAVES_NODE, PARTS_WORK_NODE, IMPLEMENTATION_INTENTIONS_NODE,
  TITRATION_NODE, PSYCHOLOGICAL_FLEXIBILITY_NODE,
];

// --- Edges ---

export const SEED_EDGES: KGEdge[] = [
  // NSDR uses body-scan
  { id: 'e-nsdr-body-scan', from: 'protocol/nsdr', to: 'technique/body-scan', type: 'uses_technique', weight: 1.0 },
  // NSDR based on polyvagal + theta
  { id: 'e-nsdr-polyvagal', from: 'protocol/nsdr', to: 'concept/polyvagal', type: 'based_on_concept', weight: 0.9 },
  { id: 'e-nsdr-theta', from: 'protocol/nsdr', to: 'concept/theta-waves', type: 'based_on_concept', weight: 0.95 },
  // IFS based on parts-work
  { id: 'e-ifs-parts', from: 'protocol/ifs', to: 'concept/parts-work', type: 'based_on_concept', weight: 1.0 },
  // IFS uses breath awareness for grounding
  { id: 'e-ifs-breath', from: 'protocol/ifs', to: 'technique/breath-awareness', type: 'uses_technique', weight: 0.7 },
  // WOOP implements implementation intentions
  { id: 'e-woop-impl', from: 'protocol/woop', to: 'concept/implementation-intentions', type: 'based_on_concept', weight: 1.0 },
  // Breathwork uses breath awareness
  { id: 'e-breathwork-breath', from: 'protocol/breathwork', to: 'technique/breath-awareness', type: 'uses_technique', weight: 1.0 },
  // SE uses titration
  { id: 'e-se-titration', from: 'protocol/se', to: 'concept/titration', type: 'based_on_concept', weight: 1.0 },
  // SE based on polyvagal
  { id: 'e-se-polyvagal', from: 'protocol/se', to: 'concept/polyvagal', type: 'based_on_concept', weight: 0.9 },
  // ACT based on psychological flexibility
  { id: 'e-act-flex', from: 'protocol/act', to: 'concept/psychological-flexibility', type: 'based_on_concept', weight: 1.0 },
  // NVC uses breath awareness for self-empathy
  { id: 'e-nvc-breath', from: 'protocol/nvc', to: 'technique/breath-awareness', type: 'uses_technique', weight: 0.6 },
  // Related concepts
  { id: 'e-polyvagal-theta', from: 'concept/polyvagal', to: 'concept/theta-waves', type: 'related_to', weight: 0.7 },
  { id: 'e-parts-titration', from: 'concept/parts-work', to: 'concept/titration', type: 'related_to', weight: 0.6 },
];
