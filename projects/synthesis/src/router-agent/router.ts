// Router Agent — Core Routing Logic

import type {
  RouterInput,
  RouterOutput,
  ContextPackage,
  ProtocolId,
  EmotionTag,
  RoutingSignal,
} from './types.js';

import {
  GOAL_KEYWORDS,
  PARTS_KEYWORDS,
  BODY_KEYWORDS,
  RELATIONSHIP_KEYWORDS,
  PROTOCOL_DURATIONS,
  PROTOCOL_PREPROMPTS,
} from './types.js';

/**
 * Normalize input text: lowercase, collapse whitespace, strip punctuation for matching.
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Check if text contains any keyword from the given set.
 * Uses word-boundary matching to avoid substring false positives
 * (e.g., "part" should not match inside "partner").
 */
function containsAny(text: string, keywords: string[]): boolean {
  const normalized = normalize(text);
  return keywords.some((kw) => {
    // Word-boundary match: keyword must appear as a whole word
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(normalized);
  });
}

/**
 * Build a ContextPackage for a given protocol.
 */
function buildContext(
  protocol: ProtocolId,
  input: RouterInput,
  priorSummary?: string,
): ContextPackage {
  return {
    protocol,
    userId: input.userId,
    sessionId: input.sessionId,
    detectedEmotion: input.detectedEmotion,
    suggestedDuration: PROTOCOL_DURATIONS[protocol],
    preprompts: PROTOCOL_PREPROMPTS[protocol],
    priorSessionSummary: priorSummary,
  };
}

/**
 * Emotion → protocol mapping for stress/anxiety cluster.
 */
function emotionToProtocol(
  emotion: EmotionTag,
  recentProtocols: ProtocolId[],
): RoutingSignal | null {
  switch (emotion) {
    case 'overwhelmed':
    case 'anxious':
    case 'stressed':
      if (recentProtocols.includes('nsdr')) {
        return {
          protocol: 'breathwork',
          confidence: 0.82,
          reason: `Detected ${emotion} and recent session was NSDR — switching to breathwork to vary parasympathetic activation`,
          needsClarification: false,
        };
      }
      return {
        protocol: 'nsdr',
        confidence: 0.88,
        reason: `Detected ${emotion} — routing to NSDR for deep parasympathetic relaxation`,
        needsClarification: false,
      };

    case 'low':
    case 'depressed':
    case 'grief':
    case 'loss':
      return {
        protocol: 'ifs',
        confidence: 0.85,
        reason: `Detected ${emotion} — routing to IFS for parts-based processing`,
        needsClarification: false,
      };

    case 'angry':
    case 'frustrated':
      return {
        protocol: 'nvc',
        confidence: 0.80,
        reason: `Detected ${emotion} — routing to NVC for needs-based reframing`,
        needsClarification: false,
      };

    case 'dissociated':
      return {
        protocol: 'nsdr',
        confidence: 0.75,
        reason: `Detected ${emotion} — routing to NSDR to ground in body`,
        needsClarification: false,
      };

    default:
      return null;
  }
}

/**
 * Determine the best protocol based on raw text content.
 */
function textBasedRoute(input: RouterInput): RoutingSignal {
  const text = input.rawInput;
  const recent = input.recentProtocols ?? [];
  const tod = input.timeOfDay;

  if (containsAny(text, GOAL_KEYWORDS)) {
    // Goal-oriented input
    if (tod === 'morning' || tod === 'afternoon') {
      return {
        protocol: 'woop',
        confidence: 0.87,
        reason: 'Goal keywords detected and daytime — routing to WOOP for wish-outcome-obstacle-plan',
        needsClarification: false,
      };
    }
    return {
      protocol: 'woop',
      confidence: 0.78,
      reason: 'Goal keywords detected — routing to WOOP',
      needsClarification: false,
    };
  }

  if (containsAny(text, PARTS_KEYWORDS)) {
    return {
      protocol: 'ifs',
      confidence: 0.86,
      reason: 'Parts/inner-self keywords detected — routing to IFS',
      needsClarification: false,
    };
  }

  if (containsAny(text, BODY_KEYWORDS)) {
    return {
      protocol: 'se',
      confidence: 0.84,
      reason: 'Body/somatic keywords detected — routing to Somatic Experiencing',
      needsClarification: false,
    };
  }

  if (containsAny(text, RELATIONSHIP_KEYWORDS)) {
    return {
      protocol: 'nvc',
      confidence: 0.83,
      reason: 'Relationship keywords detected — routing to Nonviolent Communication',
      needsClarification: false,
    };
  }

  // No keyword match — default to ACT or general
  return {
    protocol: 'general',
    confidence: 0.55,
    reason: 'No clear keyword match — routing to general wellbeing support',
    needsClarification: true,
  };
}

/**
 * Resolve a signal into final output, applying confidence thresholds.
 */
function resolveOutput(
  signal: RoutingSignal,
  input: RouterInput,
): RouterOutput {
  const { confidence } = signal;
  let fallbackProtocol: ProtocolId | undefined;
  let reasoning = signal.reason;

  if (confidence >= 0.85) {
    // High confidence — use directly
    // No fallback needed
  } else if (confidence >= 0.60) {
    // Medium confidence — set fallback
    fallbackProtocol = signal.protocol === 'general' ? 'act' : 'general';
    reasoning += ` (offering "${signal.protocol}"; user can switch to "${fallbackProtocol}")`;
  } else if (confidence >= 0.40) {
    // Low confidence — default to general, log for learning
    reasoning += ` [confidence=${confidence.toFixed(2)} — defaulting to general; logged for learning]`;
  } else {
    // Very low confidence — general + flag for training
    reasoning += ` [confidence=${confidence.toFixed(2)} below threshold — general protocol, logged]`;
  }

  const protocol = (confidence >= 0.40) ? signal.protocol : 'general';

  const contextPackage = buildContext(protocol, input);

  return {
    selectedProtocol: protocol,
    confidence: Math.round(confidence * 100) / 100,
    contextPackage,
    fallbackProtocol,
    reasoning,
  };
}

/**
 * Main router function — routes a user input to the appropriate protocol.
 */
export function route(input: RouterInput): RouterOutput {
  const recent = input.recentProtocols ?? [];

  // 1. Emotion-based routing (highest priority — strong signal)
  if (input.detectedEmotion) {
    const emotionSignal = emotionToProtocol(input.detectedEmotion, recent);
    if (emotionSignal) {
      return resolveOutput(emotionSignal, input);
    }
  }

  // 2. Text-based keyword routing
  const textSignal = textBasedRoute(input);
  return resolveOutput(textSignal, input);
}

// Exported for testing
export { normalize, containsAny, buildContext };
