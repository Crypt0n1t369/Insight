import { describe, it, expect } from 'vitest';
import type { ContextPackage } from '../../router-agent/types.js';
import { BREATHWORKAgent } from '../breathwork.js';
import { AGENT_REGISTRY, getAgent, listImplementedProtocols } from '../index.js';

describe('BREATHWORK Agent', () => {
  // ─── Interface compliance ──────────────────────────────────────

  it('has the correct protocolId', () => {
    expect(BREATHWORKAgent.protocolId).toBe('breathwork');
  });

  it('has a displayName', () => {
    expect(typeof BREATHWORKAgent.displayName).toBe('string');
    expect(BREATHWORKAgent.displayName.length).toBeGreaterThan(0);
  });

  it('has a description', () => {
    expect(typeof BREATHWORKAgent.description).toBe('string');
    expect(BREATHWORKAgent.description.length).toBeGreaterThan(10);
  });

  it('has a defaultDuration of 15 minutes', () => {
    expect(BREATHWORKAgent.defaultDuration).toBe(15);
  });

  // ─── validate() ───────────────────────────────────────────────

  it('returns valid: true for a normal context', () => {
    const ctx = makeContext({});
    const result = BREATHWORKAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for anxiety emotion (can help release)', () => {
    const ctx = makeContext({ detectedEmotion: 'anxiety' });
    const result = BREATHWORKAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for depressed emotion (potential lift)', () => {
    const ctx = makeContext({ detectedEmotion: 'depressed' });
    const result = BREATHWORKAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for stress emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'stress' });
    const result = BREATHWORKAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: false and suggests woop when duration is under 8 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 6 });
    const result = BREATHWORKAgent.validate(ctx);
    expect(result.valid).toBe(false);
    expect(result.suggestedProtocol).toBe('woop');
    expect(result.reason).toContain('8 minutes');
  });

  it('returns valid: true when duration is exactly 8 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 8 });
    const result = BREATHWORKAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for trauma emotion but adds a note', () => {
    const ctx = makeContext({ detectedEmotion: 'trauma' });
    const result = BREATHWORKAgent.validate(ctx);
    expect(result.valid).toBe(true);
    expect(result.reason).toContain('gentle');
  });

  // ─── run() — event stream ──────────────────────────────────────

  it('run() is an async generator', async () => {
    const ctx = makeContext({});
    const gen = BREATHWORKAgent.run(ctx);
    expect(typeof gen.next).toBe('function');
    const { value, done } = await gen.next();
    expect(done).toBe(false);
    expect(value).toBeDefined();
  });

  it('yields an opening completion event', async () => {
    const ctx = makeContext({});
    const gen = BREATHWORKAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.type).toBe('completion');
    expect(value.phase).toBe('Opening');
    expect(value.transcript).toBeDefined();
    expect(value.transcript).toContain('15 minutes');
  });

  it('yields events for all three phases: prep, breathing, integration', async () => {
    const ctx = makeContext({});
    const phases: string[] = [];
    for await (const event of BREATHWORKAgent.run(ctx)) {
      if (event.type !== 'transition') {
        phases.push(event.phase);
      }
    }
    expect(phases).toContain('Preparation');
    expect(phases).toContain('Breathing');
    expect(phases).toContain('Integration');
  });

  it('yields a prompt event only for the prep phase (intention setting)', async () => {
    const ctx = makeContext({});
    const promptEvents: { phase: string }[] = [];
    for await (const event of BREATHWORKAgent.run(ctx)) {
      if (event.type === 'prompt') {
        promptEvents.push({ phase: event.phase });
      }
    }
    expect(promptEvents.length).toBe(1);
    expect(promptEvents[0].phase).toBe('Preparation');
  });

  it('prep prompt asks for intention', async () => {
    const ctx = makeContext({});
    for await (const event of BREATHWORKAgent.run(ctx)) {
      if (event.type === 'prompt' && event.phase === 'Preparation') {
        expect(event.transcript.toLowerCase()).toMatch(/intention/);
        return;
      }
    }
    throw new Error('No prep prompt found');
  });

  it('yields a final completion event', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const event of BREATHWORKAgent.run(ctx)) {
      events.push(event);
    }
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('completion');
    expect(lastEvent.phase).toBe('Session Complete');
  });

  it('yields transition events between phases', async () => {
    const ctx = makeContext({});
    const transitions = [];
    for await (const event of BREATHWORKAgent.run(ctx)) {
      if (event.type === 'transition') transitions.push(event);
    }
    // prep → breathing, breathing → integration
    expect(transitions.length).toBeGreaterThanOrEqual(2);
  });

  it('every event has a phase and a transcript', async () => {
    const ctx = makeContext({});
    for await (const event of BREATHWORKAgent.run(ctx)) {
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
    for await (const event of BREATHWORKAgent.run(ctx)) {
      expect(typeof event.duration).toBe('number');
      expect(event.duration).toBeGreaterThan(0);
    }
  });

  it('stream completes (does not infinite loop)', async () => {
    const ctx = makeContext({});
    const events: unknown[] = [];
    for await (const event of BREATHWORKAgent.run(ctx)) {
      events.push(event);
      if (events.length > 100) throw new Error('Breathwork stream appears to be infinite');
    }
    expect(events.length).toBeLessThanOrEqual(100);
  });

  it('user-specified duration is used in opening event', async () => {
    const ctx = makeContext({ userPreferences: { sessionDuration: 25 } });
    const gen = BREATHWORKAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.transcript).toContain('25 minutes');
  });

  it('default duration (15) is used when not specified', async () => {
    const ctx = makeContext({});
    const gen = BREATHWORKAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.transcript).toContain('15 minutes');
  });

  // ─── Content checks ───────────────────────────────────────────

  it('breathing phase guidance mentions continuous circular breathing', async () => {
    const ctx = makeContext({});
    for await (const event of BREATHWORKAgent.run(ctx)) {
      if (event.type === 'guidance' && event.phase === 'Breathing') {
        if (event.transcript.toLowerCase().includes('continuous') || event.transcript.toLowerCase().includes('circular')) {
          return;
        }
      }
    }
    throw new Error('Breathing guidance does not mention continuous/circular pattern');
  });

  it('integration phase has no prompt (silent), just guidance', async () => {
    const ctx = makeContext({});
    for await (const event of BREATHWORKAgent.run(ctx)) {
      if (event.phase === 'Integration') {
        if (event.type === 'prompt') {
          throw new Error('Integration phase should not have a prompt');
        }
      }
    }
    // Expected — no prompt, only intro + guidance
  });

  // ─── Registry ──────────────────────────────────────────────────

  it('is registered in AGENT_REGISTRY', () => {
    expect(AGENT_REGISTRY['breathwork']).toBe(BREATHWORKAgent);
  });

  it('is returned by getAgent("breathwork")', () => {
    expect(getAgent('breathwork')).toBe(BREATHWORKAgent);
  });

  it('appears in listImplementedProtocols()', () => {
    const protocols = listImplementedProtocols();
    expect(protocols).toContain('breathwork');
  });
});

// ─── Test helpers ───────────────────────────────────────────────

function makeContext(overrides: Partial<ContextPackage>): ContextPackage {
  return {
    detectedEmotion: 'neutral',
    suggestedProtocol: 'breathwork',
    suggestedDuration: 15,
    recentProtocolHistory: [],
    sessionGoals: [],
    ...overrides,
  };
}
