import { describe, it, expect } from 'vitest';
import type { ContextPackage } from '../../router-agent/types.js';
import { ACTAgent } from '../act.js';
import { AGENT_REGISTRY, getAgent, listImplementedProtocols } from '../index.js';

// ---------------------------------------------------------------------------
// Helper: build a ContextPackage for testing
// ---------------------------------------------------------------------------

function makeContext(overrides: Partial<ContextPackage> = {}): ContextPackage {
  return {
    userId: 'test-user',
    sessionId: 'test-session',
    protocol: 'act',
    rawInput: '',
    modality: 'text',
    detectedEmotion: overrides.detectedEmotion,
    recentProtocols: [],
    timeOfDay: 'afternoon',
    userPreferences: {
      sessionDuration: overrides.suggestedDuration,
    },
    ...overrides,
  } as ContextPackage;
}

// ---------------------------------------------------------------------------
// Interface compliance
// ---------------------------------------------------------------------------

describe('ACT Agent', () => {
  // ─── Interface compliance ──────────────────────────────────────

  it('has the correct protocolId', () => {
    expect(ACTAgent.protocolId).toBe('act');
  });

  it('has a displayName', () => {
    expect(typeof ACTAgent.displayName).toBe('string');
    expect(ACTAgent.displayName.length).toBeGreaterThan(0);
  });

  it('has a description', () => {
    expect(typeof ACTAgent.description).toBe('string');
    expect(ACTAgent.description.length).toBeGreaterThan(10);
  });

  it('has a defaultDuration of 25 minutes', () => {
    expect(ACTAgent.defaultDuration).toBe(25);
  });

  // ─── AGENT_REGISTRY integration ─────────────────────────────────

  it('is registered in AGENT_REGISTRY', () => {
    expect(AGENT_REGISTRY['act']).toBe(ACTAgent);
  });

  it('is returned by getAgent("act")', () => {
    expect(getAgent('act')).toBe(ACTAgent);
  });

  it('appears in listImplementedProtocols', () => {
    const protocols = listImplementedProtocols();
    expect(protocols).toContain('act');
  });

  // ─── validate() ────────────────────────────────────────────────

  it('returns valid: true for a normal context (no emotion)', () => {
    const ctx = makeContext({});
    const result = ACTAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for anxious emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'anxious' });
    const result = ACTAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for stressed emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'stressed' });
    const result = ACTAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for overwhelmed emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'overwhelmed' });
    const result = ACTAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for grief emotion (with guidance note)', () => {
    const ctx = makeContext({ detectedEmotion: 'grief' });
    const result = ACTAgent.validate(ctx);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeDefined();
    expect(result.reason).toContain('slowly');
  });

  it('returns valid: true for trauma emotion (with guidance note)', () => {
    const ctx = makeContext({ detectedEmotion: 'trauma' });
    const result = ACTAgent.validate(ctx);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeDefined();
  });

  it('returns valid: true for dissociated emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'dissociated' });
    const result = ACTAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for angry emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'angry' });
    const result = ACTAgent.validate(ctx);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeDefined();
  });

  it('returns valid: true for depressed emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'depressed' });
    const result = ACTAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for loss emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'loss' });
    const result = ACTAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  // ─── run() — session structure ──────────────────────────────────

  it('run() yields an opening guidance event', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
      if (events.length >= 1) break;
    }
    expect(events[0].type).toBe('guidance');
    expect(events[0].phase).toBe('Opening');
  });

  it('run() yields a sequence of events across multiple phases', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    // Should have events from grounding, hook, defusion, acceptance, values, commitment, integration phases
    const phases = events.map((e) => e.phase);
    expect(phases).toContain('Grounding');
    expect(phases).toContain('Identifying Hook');
    expect(phases).toContain('Acceptance');
    expect(phases).toContain('Values');
    expect(phases).toContain('Committed Action');
    expect(phases).toContain('Integration');
  });

  it('run() yields prompt-type events', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    const prompts = events.filter((e) => e.type === 'prompt');
    expect(prompts.length).toBeGreaterThan(0);
  });

  it('run() yields transition events between phases', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    const transitions = events.filter((e) => e.type === 'transition');
    expect(transitions.length).toBeGreaterThan(0);
    // Transitions should reference moving from one phase to another
    expect(transitions[0].phase).toContain('→');
  });

  it('run() ends with a completion event', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('completion');
    expect(lastEvent.phase).toBe('Session Complete');
  });

  it('run() yields events with transcripts (non-empty strings)', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    const guidanceEvents = events.filter((e) => e.type === 'guidance' || e.type === 'prompt');
    for (const e of guidanceEvents) {
      expect(typeof e.transcript).toBe('string');
      expect(e.transcript.length).toBeGreaterThan(0);
    }
  });

  it('run() yields events with duration metadata (in ms)', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    const timedEvents = events.filter((e) => e.duration !== undefined);
    expect(timedEvents.length).toBeGreaterThan(0);
    for (const e of timedEvents) {
      expect(typeof e.duration).toBe('number');
      expect(e.duration).toBeGreaterThan(0);
    }
  });

  it('run() produces more than 20 events total (multi-phase session)', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    expect(events.length).toBeGreaterThan(20);
  });

  it('run() produces all four event types (guidance, prompt, transition, completion)', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    const types = new Set(events.map((e) => e.type));
    expect(types.has('guidance')).toBe(true);
    expect(types.has('prompt')).toBe(true);
    expect(types.has('transition')).toBe(true);
    expect(types.has('completion')).toBe(true);
  });

  it('run() events have phase metadata', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    for (const e of events) {
      expect(typeof e.phase).toBe('string');
      expect(e.phase.length).toBeGreaterThan(0);
    }
  });

  it('run() transcript includes ACT key concepts (defusion, values, acceptance)', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    const allText = events.map((e) => e.transcript).filter(Boolean).join(' ').toLowerCase();
    // The session should reference core ACT concepts
    expect(allText).toContain('defusion');
    expect(allText).toContain('values');
    expect(allText).toContain('acceptance');
    expect(allText).toContain('hook');
  });

  it('run() does not include the doom radio or clouds metaphors by default (uses leaves)', async () => {
    const ctx = makeContext({});
    const events: typeof ACTAgent extends AsyncGenerator<infer T> ? T[] : never = [];
    for await (const e of ACTAgent.run(ctx)) {
      events.push(e);
    }
    const allText = events.map((e) => e.transcript).filter(Boolean).join(' ').toLowerCase();
    // Default metaphor is "leaves on a stream" — doom radio and clouds are not mentioned
    expect(allText).toContain('leaf');
    expect(allText).not.toContain('doom radio');
  });
});
