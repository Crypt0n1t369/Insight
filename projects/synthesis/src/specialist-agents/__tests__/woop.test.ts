import { describe, it, expect } from 'vitest';
import type { ContextPackage } from '../../router-agent/types.js';
import { WOOPAgent } from '../woop.js';
import { AGENT_REGISTRY, getAgent, listImplementedProtocols } from '../index.js';

describe('WOOP Agent', () => {
  // ─── Interface compliance ──────────────────────────────────────

  it('has the correct protocolId', () => {
    expect(WOOPAgent.protocolId).toBe('woop');
  });

  it('has a displayName', () => {
    expect(typeof WOOPAgent.displayName).toBe('string');
    expect(WOOPAgent.displayName.length).toBeGreaterThan(0);
  });

  it('has a description', () => {
    expect(typeof WOOPAgent.description).toBe('string');
    expect(WOOPAgent.description.length).toBeGreaterThan(10);
  });

  it('has a defaultDuration of 15 minutes', () => {
    expect(WOOPAgent.defaultDuration).toBe(15);
  });

  // ─── validate() ────────────────────────────────────────────────

  it('returns valid: true for a normal context', () => {
    const ctx = makeContext({});
    const result = WOOPAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for depressed emotion (with guidance note)', () => {
    const ctx = makeContext({ detectedEmotion: 'depressed' });
    const result = WOOPAgent.validate(ctx);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeDefined();
  });

  it('returns valid: true for grief emotion (adaptable)', () => {
    const ctx = makeContext({ detectedEmotion: 'grief' });
    const result = WOOPAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: false when duration is under 10 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 8 });
    const result = WOOPAgent.validate(ctx);
    expect(result.valid).toBe(false);
    expect(result.suggestedProtocol).toBe('breathwork');
    expect(result.reason).toContain('10 minutes');
  });

  it('returns valid: true when duration is exactly 10 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 10 });
    const result = WOOPAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  // ─── run() — event stream ──────────────────────────────────────

  it('run() is an async generator', async () => {
    const ctx = makeContext({});
    const gen = WOOPAgent.run(ctx);
    expect(typeof gen.next).toBe('function');
    const { value, done } = await gen.next();
    expect(done).toBe(false);
    expect(value).toBeDefined();
  });

  it('yields an opening completion event', async () => {
    const ctx = makeContext({});
    const gen = WOOPAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.type).toBe('completion');
    expect(value.phase).toBe('Opening');
    expect(value.transcript).toBeDefined();
  });

  it('yields events for all four phases: wish, outcome, obstacle, plan', async () => {
    const ctx = makeContext({});
    const events: Array<{ type: string; phase: string }> = [];
    for await (const event of WOOPAgent.run(ctx)) {
      events.push(event);
    }

    const phases = events.map((e) => e.phase);
    expect(phases).toContain('Wish');
    expect(phases).toContain('Outcome');
    expect(phases).toContain('Obstacle');
    expect(phases).toContain('Plan');
  });

  it('yields a prompt event for each phase', async () => {
    const ctx = makeContext({});
    const promptEvents = [];
    for await (const event of WOOPAgent.run(ctx)) {
      if (event.type === 'prompt') promptEvents.push(event);
    }

    expect(promptEvents.length).toBeGreaterThanOrEqual(4);
    // First prompt should reference "wish"
    expect(promptEvents[0].transcript.toLowerCase()).toContain('wish');
  });

  it('yields a final completion event', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const event of WOOPAgent.run(ctx)) {
      events.push(event);
    }
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('completion');
    expect(lastEvent.phase).toBe('Session Complete');
  });

  it('yields transition events between phases', async () => {
    const ctx = makeContext({});
    const transitions = [];
    for await (const event of WOOPAgent.run(ctx)) {
      if (event.type === 'transition') transitions.push(event);
    }
    expect(transitions.length).toBeGreaterThanOrEqual(3);
  });

  it('every event has a phase and a transcript', async () => {
    const ctx = makeContext({});
    for await (const event of WOOPAgent.run(ctx)) {
      expect(event.phase).toBeDefined();
      expect(typeof event.phase).toBe('string');
      expect(event.phase.length).toBeGreaterThan(0);
      expect(event.transcript).toBeDefined();
      expect(typeof event.transcript).toBe('string');
      expect(event.transcript.length).toBeGreaterThan(0);
    }
  });

  it('every event has a duration in milliseconds', async () => {
    const ctx = makeContext({});
    for await (const event of WOOPAgent.run(ctx)) {
      expect(typeof event.duration).toBe('number');
      expect(event.duration).toBeGreaterThan(0);
    }
  });

  it('prompt events reference their phase in the transcript', async () => {
    const ctx = makeContext({});
    const promptByPhase: Record<string, string> = {};
    for await (const event of WOOPAgent.run(ctx)) {
      if (event.type === 'prompt') {
        promptByPhase[event.phase] = event.transcript;
      }
    }
    // Each prompt should relate to its phase topic
    expect(promptByPhase['Wish'].toLowerCase()).toContain('wish');
    expect(promptByPhase['Obstacle'].toLowerCase()).toContain('obstacle');
    // Plan prompt uses "if-then" framing
    expect(promptByPhase['Plan'].toLowerCase()).toMatch(/if.*then|complete the sentence/i);
  });

  it('obstacle prompt references inner obstacle', async () => {
    const ctx = makeContext({});
    const obstaclePrompts = [];
    for await (const event of WOOPAgent.run(ctx)) {
      if (event.type === 'prompt' && event.phase === 'Obstacle') {
        obstaclePrompts.push(event.transcript);
      }
    }
    expect(obstaclePrompts.length).toBe(1);
    expect(obstaclePrompts[0].toLowerCase()).toContain('obstacle');
  });

  it('plan prompt contains if-then framing', async () => {
    const ctx = makeContext({});
    for await (const event of WOOPAgent.run(ctx)) {
      if (event.type === 'prompt' && event.phase === 'Plan') {
        expect(event.transcript.toLowerCase()).toMatch(/if.*then|complete the sentence/i);
      }
    }
  });

  it('completion event metadata contains session summary fields', async () => {
    const ctx = makeContext({});
    const completions = [];
    for await (const event of WOOPAgent.run(ctx)) {
      if (event.type === 'completion') completions.push(event);
    }
    // Opening + closing = at least 2 completion events
    expect(completions.length).toBeGreaterThanOrEqual(2);
    // All completions should have transcripts
    for (const c of completions) {
      expect(c.transcript.length).toBeGreaterThan(0);
    }
  });

  // ─── Duration respect ─────────────────────────────────────────

  it('user-specified duration is used in opening event', async () => {
    const ctx = makeContext({ userPreferences: { sessionDuration: 20 } });
    const gen = WOOPAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.transcript).toContain('20 minutes');
  });

  it('default duration (15) is used when not specified', async () => {
    const ctx = makeContext({});
    const gen = WOOPAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.transcript).toContain('15 minutes');
  });

  // ─── Edge cases ────────────────────────────────────────────────

  it('handles empty user preferences', async () => {
    const ctx: ContextPackage = {
      protocol: 'woop',
      userId: 'test-user',
      sessionId: 'test-session',
      suggestedDuration: 15,
      preprompts: [],
    };
    const events = [];
    for await (const event of WOOPAgent.run(ctx)) {
      events.push(event);
    }
    expect(events.length).toBeGreaterThan(0);
  });

  it('stream completes (does not infinite loop)', async () => {
    const ctx = makeContext({});
    let count = 0;
    for await (const _event of WOOPAgent.run(ctx)) {
      count++;
      if (count > 50) throw new Error('Stream did not complete — possible infinite loop');
    }
    // Should complete well before 50 events
    expect(count).toBeLessThan(50);
  });
});

// ─── Helper ─────────────────────────────────────────────────────────────────

function makeContext(overrides: Partial<ContextPackage>): ContextPackage {
  return {
    protocol: 'woop',
    userId: 'test-user',
    sessionId: 'test-session',
    suggestedDuration: 15,
    preprompts: [],
    ...overrides,
  };
}
