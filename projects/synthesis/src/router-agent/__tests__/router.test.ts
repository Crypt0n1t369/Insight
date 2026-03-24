// Router Agent — Unit Tests

import { describe, it, expect } from 'vitest';
import { route, normalize, containsAny } from '../router.js';
import type { RouterInput } from '../types.js';

// --- Helpers ---

function makeInput(overrides: Partial<RouterInput> = {}): RouterInput {
  return {
    userId: 'user-1',
    sessionId: 'session-1',
    rawInput: '',
    modality: 'voice',
    ...overrides,
  };
}

// --- normalize & containsAny utils ---

describe('normalize', () => {
  it('lowercases input', () => {
    expect(normalize('HELLO World')).toBe('hello world');
  });

  it('strips punctuation', () => {
    expect(normalize('hello, world!')).toBe('hello world');
  });

  it('trims whitespace', () => {
    expect(normalize('  hello  ')).toBe('hello');
  });
});

describe('containsAny', () => {
  it('returns true when keyword found', () => {
    expect(containsAny('I want to achieve my goals', ['want', 'wish'])).toBe(true);
  });

  it('returns false when no keyword found', () => {
    expect(containsAny('I feel calm today', ['want', 'wish'])).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(containsAny('I WANT to plan', ['want'])).toBe(true);
  });
});

// --- Emotion-based routing ---

describe('Emotion: anxious / stressed / overwhelmed', () => {
  const cases: Array<{ emotion: 'anxious' | 'stressed' | 'overwhelmed'; expected: 'nsdr' | 'breathwork' }> = [
    { emotion: 'anxious', expected: 'nsdr' },
    { emotion: 'stressed', expected: 'nsdr' },
    { emotion: 'overwhelmed', expected: 'nsdr' },
  ];

  cases.forEach(({ emotion, expected }) => {
    it(`${emotion} → ${expected} (no recent NSDR)`, () => {
      const result = route(makeInput({ detectedEmotion: emotion }));
      expect(result.selectedProtocol).toBe(expected);
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });
  });

  it('overwhelmed → BREATHWORK when recent protocol was NSDR', () => {
    const result = route(
      makeInput({ detectedEmotion: 'overwhelmed', recentProtocols: ['nsdr'] }),
    );
    expect(result.selectedProtocol).toBe('breathwork');
    expect(result.confidence).toBe(0.82);
  });

  it('anxious → BREATHWORK when recent protocol was NSDR', () => {
    const result = route(
      makeInput({ detectedEmotion: 'anxious', recentProtocols: ['nsdr'] }),
    );
    expect(result.selectedProtocol).toBe('breathwork');
    expect(result.confidence).toBe(0.82);
  });
});

describe('Emotion: low / depressed / grief / loss', () => {
  const emotions: Array<'low' | 'depressed' | 'grief' | 'loss'> = ['low', 'depressed', 'grief', 'loss'];

  emotions.forEach((emotion) => {
    it(`${emotion} → IFS`, () => {
      const result = route(makeInput({ detectedEmotion: emotion }));
      expect(result.selectedProtocol).toBe('ifs');
      expect(result.confidence).toBe(0.85);
    });
  });
});

describe('Emotion: angry / frustrated', () => {
  it('angry → NVC', () => {
    const result = route(makeInput({ detectedEmotion: 'angry' }));
    expect(result.selectedProtocol).toBe('nvc');
    expect(result.confidence).toBe(0.80);
  });

  it('frustrated → NVC', () => {
    const result = route(makeInput({ detectedEmotion: 'frustrated' }));
    expect(result.selectedProtocol).toBe('nvc');
    expect(result.confidence).toBe(0.80);
  });
});

describe('Emotion: dissociated', () => {
  it('dissociated → NSDR', () => {
    const result = route(makeInput({ detectedEmotion: 'dissociated' }));
    expect(result.selectedProtocol).toBe('nsdr');
    expect(result.confidence).toBe(0.75);
  });
});

describe('Emotion: neutral / curious / excited / motivated', () => {
  it('neutral → no emotion routing (falls through to text)', () => {
    const result = route(makeInput({ detectedEmotion: 'neutral' }));
    expect(result.selectedProtocol).not.toBe('nsdr'); // shouldn't match emotion
  });

  it('curious → no emotion routing (falls through to text)', () => {
    const result = route(makeInput({ detectedEmotion: 'curious', rawInput: 'tell me about myself' }));
    expect(result.selectedProtocol).toBeTruthy();
  });
});

// --- Text-based routing ---

describe('GOAL_KEYWORDS → WOOP', () => {
  const keywords = ['want', 'wish', 'hope', 'plan', 'goal', 'achieve', 'decide'];

  keywords.forEach((kw) => {
    it(`"${kw}" → WOOP`, () => {
      const result = route(makeInput({ rawInput: `I ${kw} to get promoted` }));
      expect(result.selectedProtocol).toBe('woop');
      expect(result.confidence).toBeGreaterThanOrEqual(0.78);
    });
  });

  it('WOOP higher confidence in morning/afternoon', () => {
    const morning = route(makeInput({ rawInput: 'I want to run a marathon', timeOfDay: 'morning' }));
    const night = route(makeInput({ rawInput: 'I want to run a marathon', timeOfDay: 'night' }));

    expect(morning.confidence).toBe(0.87);
    expect(night.confidence).toBe(0.78);
    expect(morning.selectedProtocol).toBe('woop');
    expect(night.selectedProtocol).toBe('woop');
  });
});

describe('PARTS_KEYWORDS → IFS', () => {
  const keywords = ['part', 'inner', 'self', 'conflict', 'torn', 'should'];

  keywords.forEach((kw) => {
    it(`"${kw}" → IFS`, () => {
      const result = route(makeInput({ rawInput: `I have an inner ${kw} talking` }));
      expect(result.selectedProtocol).toBe('ifs');
      expect(result.confidence).toBeGreaterThanOrEqual(0.86);
    });
  });

  // Note: "want-but" is excluded from auto-test since "want" triggers WOOP first
  it('"torn between two choices" → IFS', () => {
    const result = route(makeInput({ rawInput: 'I feel torn between staying and leaving' }));
    expect(result.selectedProtocol).toBe('ifs');
  });
});

describe('BODY_KEYWORDS → SE', () => {
  const keywords = ['body', 'somatic', 'tension', 'pain', 'physical', 'felt sense'];

  keywords.forEach((kw) => {
    it(`"${kw}" → SE`, () => {
      const result = route(makeInput({ rawInput: `I feel ${kw} discomfort` }));
      expect(result.selectedProtocol).toBe('se');
      expect(result.confidence).toBe(0.84);
    });
  });
});

describe('RELATIONSHIP_KEYWORDS → NVC', () => {
  const keywords = ['relationship', 'partner', 'communication', 'argument', 'family'];

  keywords.forEach((kw) => {
    it(`"${kw}" → NVC`, () => {
      const result = route(makeInput({ rawInput: `My ${kw} is difficult` }));
      expect(result.selectedProtocol).toBe('nvc');
      expect(result.confidence).toBe(0.83);
    });
  });
});

describe('No keyword match → GENERAL', () => {
  it('generic text → general with needsClarification', () => {
    const result = route(makeInput({ rawInput: 'hello, how are you today' }));
    expect(result.selectedProtocol).toBe('general');
    expect(result.confidence).toBeLessThan(0.60);
  });
});

// --- Context Package ---

describe('ContextPackage', () => {
  it('contains correct protocol and user info', () => {
    const result = route(
      makeInput({ userId: 'user-42', sessionId: 'session-99', detectedEmotion: 'anxious' }),
    );
    expect(result.contextPackage.userId).toBe('user-42');
    expect(result.contextPackage.sessionId).toBe('session-99');
    expect(result.contextPackage.protocol).toBe('nsdr');
    expect(result.contextPackage.detectedEmotion).toBe('anxious');
  });

  it('suggestedDuration matches protocol', () => {
    const cases: Array<[Partial<RouterInput>, 'nsdr' | 'ifs' | 'woop' | 'breathwork']> = [
      [{ rawInput: 'anxious state', detectedEmotion: 'anxious' }, 'nsdr'],
      [{ rawInput: 'feeling low', detectedEmotion: 'low' }, 'ifs'],
      [{ rawInput: 'I want to achieve my goals', detectedEmotion: 'neutral' }, 'woop'],
      [{ rawInput: 'overwhelmed today', detectedEmotion: 'overwhelmed', recentProtocols: ['nsdr'] }, 'breathwork'],
    ];

    cases.forEach(([input, expectedProtocol]) => {
      const result = route(makeInput(input));
      expect(result.contextPackage.protocol).toBe(expectedProtocol);
      expect(result.contextPackage.suggestedDuration).toBeGreaterThan(0);
    });
  });

  it('preprompts are included', () => {
    const result = route(makeInput({ detectedEmotion: 'anxious' }));
    expect(result.contextPackage.preprompts).toBeDefined();
    expect(result.contextPackage.preprompts.length).toBeGreaterThan(0);
    expect(typeof result.contextPackage.preprompts[0]).toBe('string');
  });
});

// --- Confidence thresholds ---

describe('Confidence thresholds', () => {
  it('≥0.85 — no fallback', () => {
    const result = route(makeInput({ detectedEmotion: 'anxious' }));
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    expect(result.fallbackProtocol).toBeUndefined();
  });

  it('0.60–0.84 — has fallback', () => {
    // stressed without recent NSDR = 0.88 → no fallback
    // evening goal = 0.78 → has fallback
    const result = route(makeInput({ rawInput: 'I want to start a business', timeOfDay: 'evening' }));
    expect(result.confidence).toBe(0.78);
    expect(result.fallbackProtocol).toBeDefined();
  });

  it('<0.40 — defaults to general', () => {
    // This shouldn't happen from emotion path (min is 0.75), 
    // but from text path with very low signal it can
    // Use neutral emotion + generic text
    const result = route(makeInput({ rawInput: 'hello', detectedEmotion: 'neutral' }));
    expect(result.selectedProtocol).toBe('general');
  });
});

// --- Reasoning trace ---

describe('Reasoning', () => {
  it('includes emotion name when emotion-routed', () => {
    const result = route(makeInput({ detectedEmotion: 'stressed' }));
    expect(result.reasoning).toContain('stressed');
  });

  it('includes keyword when text-routed', () => {
    const result = route(makeInput({ rawInput: 'I want to travel the world' }));
    expect(result.reasoning).toContain('Goal');
  });

  it('mentions recent protocol switch', () => {
    const result = route(
      makeInput({ detectedEmotion: 'anxious', recentProtocols: ['nsdr'] }),
    );
    expect(result.reasoning).toContain('recent');
  });
});

// --- Edge cases ---

describe('Edge cases', () => {
  it('empty rawInput falls through to emotion routing', () => {
    const result = route(makeInput({ rawInput: '', detectedEmotion: 'low' }));
    expect(result.selectedProtocol).toBe('ifs');
  });

  it('empty recentProtocols defaults to empty array', () => {
    const result = route(makeInput({ recentProtocols: undefined, detectedEmotion: 'anxious' }));
    expect(result.selectedProtocol).toBe('nsdr'); // no recent NSDR → NSDR
  });

  it('multiple emotions in recentProtocols — only check for nsdr', () => {
    const result = route(
      makeInput({ detectedEmotion: 'overwhelmed', recentProtocols: ['act', 'ifs', 'nsdr'] }),
    );
    expect(result.selectedProtocol).toBe('breathwork'); // contains nsdr → BREATHWORK
  });

  it('timeOfDay undefined still routes correctly for WOOP', () => {
    const result = route(makeInput({ rawInput: 'I want to achieve my goal', timeOfDay: undefined }));
    expect(result.selectedProtocol).toBe('woop');
    expect(result.confidence).toBe(0.78); // without morning/afternoon
  });

  it('both emotion and text present — emotion takes priority', () => {
    // Even though rawInput has goal keywords, detected emotion should take priority
    const result = route(
      makeInput({ rawInput: 'I want to achieve my goals', detectedEmotion: 'low' }),
    );
    expect(result.selectedProtocol).toBe('ifs'); // emotion 'low' → IFS wins
  });
});
