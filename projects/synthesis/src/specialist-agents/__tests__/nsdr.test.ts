import { describe, it, expect, beforeEach } from 'vitest';
import type { ContextPackage } from '../../router-agent/types.js';
import { NSDRAgent } from '../nsdr.js';
import { AGENT_REGISTRY, getAgent, listImplementedProtocols } from '../index.js';

describe('NSDR Agent', () => {
  // ─── Interface compliance ──────────────────────────────────────

  it('has the correct protocolId', () => {
    expect(NSDRAgent.protocolId).toBe('nsdr');
  });

  it('has a displayName', () => {
    expect(typeof NSDRAgent.displayName).toBe('string');
    expect(NSDRAgent.displayName.length).toBeGreaterThan(0);
  });

  it('has a description', () => {
    expect(typeof NSDRAgent.description).toBe('string');
    expect(NSDRAgent.description.length).toBeGreaterThan(10);
  });

  it('has a defaultDuration of 20 minutes', () => {
    expect(NSDRAgent.defaultDuration).toBe(20);
  });

  // ─── validate() ───────────────────────────────────────────────

  it('returns valid: true for a normal context', () => {
    const ctx = makeContext({});
    const result = NSDRAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for anxiety emotion (NSDR helps anxiety)', () => {
    const ctx = makeContext({ detectedEmotion: 'anxiety' });
    const result = NSDRAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for stress emotion (NSDR reduces cortisol)', () => {
    const ctx = makeContext({ detectedEmotion: 'stress' });
    const result = NSDRAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: false when duration is under 15 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 12 });
    const result = NSDRAgent.validate(ctx);
    expect(result.valid).toBe(false);
    expect(result.suggestedProtocol).toBe('breathwork');
    expect(result.reason).toContain('15 minutes');
  });

  it('returns valid: false when duration is 14 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 14 });
    const result = NSDRAgent.validate(ctx);
    expect(result.valid).toBe(false);
  });

  it('returns valid: true when duration is exactly 15 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 15 });
    const result = NSDRAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true when duration is 20 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 20 });
    const result = NSDRAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for a context with no suggested duration', () => {
    const ctx = makeContext({});
    const result = NSDRAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  // ─── run() — event stream ──────────────────────────────────────

  it('run() is an async generator', async () => {
    const ctx = makeContext({});
    const gen = NSDRAgent.run(ctx);
    expect(typeof gen.next).toBe('function');
    const { value, done } = await gen.next();
    expect(done).toBe(false);
    expect(value).toBeDefined();
  });

  it('yields an opening completion event', async () => {
    const ctx = makeContext({});
    const gen = NSDRAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.type).toBe('completion');
    expect(value.phase).toBe('Opening');
    expect(value.transcript).toBeDefined();
  });

  it('yields events for all five phases: intro, bodyScan, deepRest, return, integration', async () => {
    const ctx = makeContext({});
    const events: Array<{ type: string; phase: string }> = [];
    for await (const event of NSDRAgent.run(ctx)) {
      events.push(event);
    }

    const phases = events.map((e) => e.phase);
    expect(phases).toContain('Intro');
    expect(phases).toContain('Body Scan');
    expect(phases).toContain('Deep Rest');
    expect(phases).toContain('Return');
    expect(phases).toContain('Integration');
  });

  it('yields a prompt event for the intro phase', async () => {
    const ctx = makeContext({});
    for await (const event of NSDRAgent.run(ctx)) {
      if (event.type === 'prompt' && event.phase === 'Intro') {
        expect(event.transcript.toLowerCase()).toMatch(/intention/);
        return;
      }
    }
    throw new Error('No intro prompt found');
  });

  it('yields a prompt event for the bodyScan phase', async () => {
    const ctx = makeContext({});
    for await (const event of NSDRAgent.run(ctx)) {
      if (event.type === 'prompt' && event.phase === 'Body Scan') {
        expect(event.transcript.toLowerCase()).toMatch(/body|sensation/);
        return;
      }
    }
    throw new Error('No body scan prompt found');
  });

  it('yields a prompt event for the deepRest phase', async () => {
    const ctx = makeContext({});
    for await (const event of NSDRAgent.run(ctx)) {
      if (event.type === 'prompt' && event.phase === 'Deep Rest') {
        expect(event.transcript.toLowerCase()).toMatch(/thought|cloud|attention/);
        return;
      }
    }
    throw new Error('No deep rest prompt found');
  });

  it('does not yield a prompt event for the return phase (silent return)', async () => {
    const ctx = makeContext({});
    for await (const event of NSDRAgent.run(ctx)) {
      if (event.type === 'prompt' && event.phase === 'Return') {
        throw new Error('Return phase should not have a prompt');
      }
    }
    // Expected — Return has no prompt
  });

  it('does not yield a prompt event for the integration phase', async () => {
    const ctx = makeContext({});
    for await (const event of NSDRAgent.run(ctx)) {
      if (event.type === 'prompt' && event.phase === 'Integration') {
        throw new Error('Integration phase should not have a prompt');
      }
    }
    // Expected — Integration has no prompt
  });

  it('yields a final completion event', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const event of NSDRAgent.run(ctx)) {
      events.push(event);
    }
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('completion');
    expect(lastEvent.phase).toBe('Session Complete');
  });

  it('yields transition events between phases', async () => {
    const ctx = makeContext({});
    const transitions = [];
    for await (const event of NSDRAgent.run(ctx)) {
      if (event.type === 'transition') transitions.push(event);
    }
    // intro → bodyScan, bodyScan → deepRest, deepRest → return, return → integration
    expect(transitions.length).toBeGreaterThanOrEqual(4);
  });

  it('yields guidance events in the deepRest phase that reference rotations', async () => {
    const ctx = makeContext({});
    for await (const event of NSDRAgent.run(ctx)) {
      if (event.type === 'guidance' && event.phase === 'Deep Rest') {
        // The deep rest guidance includes awareness rotations
        if (event.transcript.toLowerCase().includes('rotate') || event.transcript.toLowerCase().includes('awareness')) {
          return; // Found — test passes
        }
      }
    }
    // At least one deep rest guidance line should reference rotations
    throw new Error('No deep rest guidance found referencing rotations');
  });

  it('yields guidance events in the return phase that include a countdown', async () => {
    const ctx = makeContext({});
    for await (const event of NSDRAgent.run(ctx)) {
      if (event.type === 'guidance' && event.phase === 'Return') {
        if (/\d/.test(event.transcript)) return; // Found a number (countdown)
      }
    }
    throw new Error('No countdown found in Return phase guidance');
  });

  it('every event has a phase and a transcript', async () => {
    const ctx = makeContext({});
    for await (const event of NSDRAgent.run(ctx)) {
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
    for await (const event of NSDRAgent.run(ctx)) {
      expect(typeof event.duration).toBe('number');
      expect(event.duration).toBeGreaterThan(0);
    }
  });

  it('stream completes (does not infinite loop)', async () => {
    const ctx = makeContext({});
    const events: unknown[] = [];
    for await (const event of NSDRAgent.run(ctx)) {
      events.push(event);
      if (events.length > 200) throw new Error('NSDR stream appears to be infinite');
    }
    expect(events.length).toBeLessThanOrEqual(200);
  });

  it('user-specified duration is used in opening event', async () => {
    const ctx = makeContext({ userPreferences: { sessionDuration: 30 } });
    const gen = NSDRAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.transcript).toContain('30 minutes');
  });

  it('default duration (20) is used when not specified', async () => {
    const ctx = makeContext({});
    const gen = NSDRAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.transcript).toContain('20 minutes');
  });

  it('handles empty user preferences', async () => {
    const ctx: ContextPackage = {
      detectedEmotion: 'neutral',
      suggestedProtocol: 'nsdr',
      suggestedDuration: 20,
      recentProtocolHistory: [],
      sessionGoals: [],
      userPreferences: undefined,
    };
    const gen = NSDRAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.type).toBe('completion');
    expect(value.phase).toBe('Opening');
  });

  // ─── Registry ──────────────────────────────────────────────────

  it('is registered in AGENT_REGISTRY', () => {
    expect(AGENT_REGISTRY['nsdr']).toBe(NSDRAgent);
  });

  it('is returned by getAgent("nsdr")', () => {
    expect(getAgent('nsdr')).toBe(NSDRAgent);
  });

  it('appears in listImplementedProtocols()', () => {
    const protocols = listImplementedProtocols();
    expect(protocols).toContain('nsdr');
  });

  // ─── Emotion compatibility ─────────────────────────────────────

  it('is valid for stressed emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'stress' });
    expect(NSDRAgent.validate(ctx).valid).toBe(true);
  });

  it('is valid for fatigued emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'fatigue' });
    expect(NSDRAgent.validate(ctx).valid).toBe(true);
  });

  it('is valid for overwhelmed emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'overwhelmed' });
    expect(NSDRAgent.validate(ctx).valid).toBe(true);
  });

  it('is valid for depressed emotion (gentle rest)', () => {
    const ctx = makeContext({ detectedEmotion: 'depressed' });
    const result = NSDRAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });
});

// ----------------------------------------------------------------
// Test helpers
// ----------------------------------------------------------------

function makeContext(overrides: Partial<ContextPackage>): ContextPackage {
  return {
    detectedEmotion: 'neutral',
    suggestedProtocol: 'nsdr',
    suggestedDuration: 20,
    recentProtocolHistory: [],
    sessionGoals: [],
    ...overrides,
  };
}
