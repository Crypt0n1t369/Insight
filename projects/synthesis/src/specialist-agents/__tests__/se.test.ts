import { describe, it, expect } from 'vitest';
import type { ContextPackage } from '../../router-agent/types.js';
import { SEAgent } from '../se.js';
import { AGENT_REGISTRY, getAgent, listImplementedProtocols } from '../index.js';

// ---------------------------------------------------------------------------
// Helper: build a ContextPackage for testing
// ---------------------------------------------------------------------------

function makeContext(overrides: Partial<ContextPackage> = {}): ContextPackage {
  return {
    userId: 'test-user',
    sessionId: 'test-session',
    rawInput: '',
    modality: 'text',
    detectedEmotion: undefined,
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

describe('SE Agent', () => {
  it('has the correct protocolId', () => {
    expect(SEAgent.protocolId).toBe('se');
  });

  it('has a displayName', () => {
    expect(typeof SEAgent.displayName).toBe('string');
    expect(SEAgent.displayName.length).toBeGreaterThan(0);
    expect(SEAgent.displayName).toContain('Somatic');
  });

  it('has a description', () => {
    expect(typeof SEAgent.description).toBe('string');
    expect(SEAgent.description.length).toBeGreaterThan(10);
    expect(SEAgent.description).toContain('body');
  });

  it('has a defaultDuration of 20 minutes', () => {
    expect(SEAgent.defaultDuration).toBe(20);
  });

  // -------------------------------------------------------------------------
  // validate()
  // -------------------------------------------------------------------------

  it('returns valid: true for a normal context', () => {
    const ctx = makeContext({});
    const result = SEAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true when body keywords are present', () => {
    const ctx = makeContext({ rawInput: 'I have tension in my body' });
    const result = SEAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for somatic input', () => {
    const ctx = makeContext({ rawInput: 'I feel a tightness in my chest' });
    const result = SEAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true when pain is mentioned', () => {
    const ctx = makeContext({ rawInput: 'My back hurts' });
    const result = SEAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for trauma input', () => {
    const ctx = makeContext({ rawInput: 'I feel frozen and triggered' });
    const result = SEAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('does not suggest alternative protocols', () => {
    const ctx = makeContext({ rawInput: 'I need to set a goal' });
    const result = SEAgent.validate(ctx);
    expect(result.valid).toBe(true);
    expect(result.suggestedProtocol).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // run() — event stream
  // -------------------------------------------------------------------------

  it('run() is an async generator', async () => {
    const ctx = makeContext({});
    const gen = SEAgent.run(ctx);
    expect(typeof gen.next).toBe('function');
    const { value, done } = await gen.next();
    expect(value).toBeDefined();
  });

  it('yields at least one event before completion', async () => {
    const ctx = makeContext({});
    const gen = SEAgent.run(ctx);
    const events: any[] = [];
    for await (const event of gen) {
      events.push(event);
    }
    expect(events.length).toBeGreaterThan(0);
  });

  it('session ends with a completion event', async () => {
    const ctx = makeContext({});
    const gen = SEAgent.run(ctx);
    const events: any[] = [];
    for await (const event of gen) {
      events.push(event);
    }
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('completion');
    expect(lastEvent.phase).toBe('Session Complete');
  });

  it('all events have required fields (type, phase, transcript, duration)', async () => {
    const ctx = makeContext({});
    const gen = SEAgent.run(ctx);
    for await (const event of gen) {
      expect(['guidance', 'prompt', 'transition', 'completion']).toContain(event.type);
      expect(typeof event.phase).toBe('string');
      expect(typeof event.transcript).toBe('string');
      expect(typeof event.duration).toBe('number');
      expect(event.duration).toBeGreaterThan(0);
    }
  });

  it('includes prompts in appropriate phases', async () => {
    const ctx = makeContext({});
    const gen = SEAgent.run(ctx);
    const events: any[] = [];
    for await (const event of gen) {
      events.push(event);
    }
    const prompts = events.filter((e) => e.type === 'prompt');
    expect(prompts.length).toBeGreaterThan(0);
    expect(prompts[0].transcript.length).toBeGreaterThan(10);
  });

  it('yields transitions between phases', async () => {
    const ctx = makeContext({});
    const gen = SEAgent.run(ctx);
    const events: any[] = [];
    for await (const event of gen) {
      events.push(event);
    }
    const transitions = events.filter((e) => e.type === 'transition');
    expect(transitions.length).toBeGreaterThanOrEqual(3); // between 4 phases
  });

  it('last event is completion (no guidance after completion)', async () => {
    const ctx = makeContext({});
    const gen = SEAgent.run(ctx);
    const events: any[] = [];
    for await (const event of gen) {
      events.push(event);
    }
    const lastEvent = events[events.length - 1];
    const almostLastEvent = events[events.length - 2];
    expect(lastEvent.type).toBe('completion');
    expect(almostLastEvent.type).not.toBe('guidance');
  });

  // -------------------------------------------------------------------------
  // Duration mention in opening
  // -------------------------------------------------------------------------

  it('mentions session duration (default 20) in opening transcript', async () => {
    const ctx = makeContext({});
    const gen = SEAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.transcript).toContain('20 minutes');
  });

  it('mentions specified duration when user sets a preference', async () => {
    const ctx = makeContext({ userPreferences: { sessionDuration: 30 } });
    const gen = SEAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.transcript).toContain('30 minutes');
  });

  // -------------------------------------------------------------------------
  // Registry wiring
  // -------------------------------------------------------------------------

  it('is registered in AGENT_REGISTRY', () => {
    expect(AGENT_REGISTRY.se).toBeDefined();
    expect(AGENT_REGISTRY.se).toBe(SEAgent);
  });

  it('is returned by getAgent()', () => {
    const agent = getAgent('se');
    expect(agent).toBeDefined();
    expect(agent).toBe(SEAgent);
  });

  it('is included in listImplementedProtocols()', () => {
    const protocols = listImplementedProtocols();
    expect(protocols).toContain('se');
  });
});
