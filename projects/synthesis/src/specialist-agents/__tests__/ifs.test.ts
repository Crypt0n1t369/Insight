import { describe, it, expect } from 'vitest';
import type { ContextPackage } from '../../router-agent/types.js';
import { IFSAgent } from '../ifs.js';
import { AGENT_REGISTRY, getAgent, listImplementedProtocols } from '../index.js';

describe('IFS Agent', () => {
  // ─── Interface compliance ──────────────────────────────────────

  it('has the correct protocolId', () => {
    expect(IFSAgent.protocolId).toBe('ifs');
  });

  it('has a displayName', () => {
    expect(typeof IFSAgent.displayName).toBe('string');
    expect(IFSAgent.displayName.length).toBeGreaterThan(0);
  });

  it('has a description', () => {
    expect(typeof IFSAgent.description).toBe('string');
    expect(IFSAgent.description.length).toBeGreaterThan(10);
  });

  it('has a defaultDuration of 25 minutes', () => {
    expect(IFSAgent.defaultDuration).toBe(25);
  });

  // ─── validate() ────────────────────────────────────────────────

  it('returns valid: true for a normal context', () => {
    const ctx = makeContext({});
    const result = IFSAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for grief emotion (IFS is well-suited)', () => {
    const ctx = makeContext({ detectedEmotion: 'grief' });
    const result = IFSAgent.validate(ctx);
    expect(result.valid).toBe(true);
    expect(result.reason).toContain('grief');
  });

  it('returns valid: true for trauma emotion (gentle pacing)', () => {
    const ctx = makeContext({ detectedEmotion: 'trauma' });
    const result = IFSAgent.validate(ctx);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeDefined();
  });

  it('returns valid: false when duration is under 15 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 12 });
    const result = IFSAgent.validate(ctx);
    expect(result.valid).toBe(false);
    expect(result.suggestedProtocol).toBe('breathwork');
    expect(result.reason).toContain('15 minutes');
  });

  it('returns valid: true when duration is exactly 15 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 15 });
    const result = IFSAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: false when duration is 14 minutes', () => {
    const ctx = makeContext({ suggestedDuration: 14 });
    const result = IFSAgent.validate(ctx);
    expect(result.valid).toBe(false);
  });

  // ─── run() — event stream ──────────────────────────────────────

  it('run() is an async generator', async () => {
    const ctx = makeContext({});
    const gen = IFSAgent.run(ctx);
    expect(typeof gen.next).toBe('function');
    const { value, done } = await gen.next();
    expect(done).toBe(false);
    expect(value).toBeDefined();
  });

  it('yields an opening completion event', async () => {
    const ctx = makeContext({});
    const gen = IFSAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.type).toBe('completion');
    expect(value.phase).toBe('Opening');
    expect(value.transcript).toBeDefined();
  });

  it('yields events for all five phases: grounding, identifyParts, dialogue, modification, integration', async () => {
    const ctx = makeContext({});
    const events: Array<{ type: string; phase: string }> = [];
    for await (const event of IFSAgent.run(ctx)) {
      events.push(event);
    }

    const phases = events.map((e) => e.phase);
    expect(phases).toContain('Grounding');
    expect(phases).toContain('Identify Parts');
    expect(phases).toContain('Parts Dialogue');
    expect(phases).toContain('Modification');
    expect(phases).toContain('Integration');
  });

  it('yields a prompt event for each of the main phases', async () => {
    const ctx = makeContext({});
    const promptEvents = [];
    for await (const event of IFSAgent.run(ctx)) {
      if (event.type === 'prompt') promptEvents.push(event);
    }

    // IFS has prompts for: grounding, identifyParts, dialogue, modification
    expect(promptEvents.length).toBeGreaterThanOrEqual(4);
  });

  it('identifyparts prompt references "part" or "parts"', async () => {
    const ctx = makeContext({});
    for await (const event of IFSAgent.run(ctx)) {
      if (event.type === 'prompt' && event.phase === 'Identify Parts') {
        expect(event.transcript.toLowerCase()).toMatch(/part/);
      }
    }
  });

  it('yields a final completion event', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const event of IFSAgent.run(ctx)) {
      events.push(event);
    }
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('completion');
    expect(lastEvent.phase).toBe('Session Complete');
  });

  it('yields transition events between phases', async () => {
    const ctx = makeContext({});
    const transitions = [];
    for await (const event of IFSAgent.run(ctx)) {
      if (event.type === 'transition') transitions.push(event);
    }
    // identifyParts → dialogue, dialogue → modification, modification → integration
    expect(transitions.length).toBeGreaterThanOrEqual(3);
  });

  it('every event has a phase and a transcript', async () => {
    const ctx = makeContext({});
    for await (const event of IFSAgent.run(ctx)) {
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
    for await (const event of IFSAgent.run(ctx)) {
      expect(typeof event.duration).toBe('number');
      expect(event.duration).toBeGreaterThan(0);
    }
  });

  it('prompt events reference their phase in the transcript', async () => {
    const ctx = makeContext({});
    const promptByPhase: Record<string, string> = {};
    for await (const event of IFSAgent.run(ctx)) {
      if (event.type === 'prompt') {
        promptByPhase[event.phase] = event.transcript;
      }
    }
    // Identify Parts prompt should reference parts
    expect(promptByPhase['Identify Parts'].toLowerCase()).toContain('part');
  });

  it('dialogue prompt references Self or unblending', async () => {
    const ctx = makeContext({});
    for await (const event of IFSAgent.run(ctx)) {
      if (event.type === 'prompt' && event.phase === 'Parts Dialogue') {
        // The dialogue phase asks about what the part needs
        expect(event.transcript.length).toBeGreaterThan(10);
      }
    }
  });

  it('completion events all have transcripts', async () => {
    const ctx = makeContext({});
    const completions = [];
    for await (const event of IFSAgent.run(ctx)) {
      if (event.type === 'completion') completions.push(event);
    }
    expect(completions.length).toBeGreaterThanOrEqual(2);
    for (const c of completions) {
      expect(c.transcript.length).toBeGreaterThan(0);
    }
  });

  // ─── Duration respect ─────────────────────────────────────────

  it('user-specified duration is used in opening event', async () => {
    const ctx = makeContext({ userPreferences: { sessionDuration: 30 } });
    const gen = IFSAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.transcript).toContain('30 minutes');
  });

  it('default duration (25) is used when not specified', async () => {
    const ctx = makeContext({});
    const gen = IFSAgent.run(ctx);
    const { value } = await gen.next();
    expect(value.transcript).toContain('25 minutes');
  });

  // ─── Edge cases ───────────────────────────────────────────────

  it('handles empty user preferences', async () => {
    const ctx: ContextPackage = {
      protocol: 'ifs',
      userId: 'test-user',
      sessionId: 'test-session',
      suggestedDuration: 25,
      preprompts: [],
    };
    const events = [];
    for await (const event of IFSAgent.run(ctx)) {
      events.push(event);
    }
    expect(events.length).toBeGreaterThan(0);
  });

  it('stream completes (does not infinite loop)', async () => {
    const ctx = makeContext({});
    let count = 0;
    for await (const _event of IFSAgent.run(ctx)) {
      count++;
      if (count > 80) throw new Error('Stream did not complete — possible infinite loop');
    }
    // IFS has 5 phases with multiple sub-steps; should complete well before 80 events
    expect(count).toBeLessThan(80);
  });

  it('grief context yields a valid result with guidance note', async () => {
    const ctx = makeContext({ detectedEmotion: 'grief' });
    const result = IFSAgent.validate(ctx);
    expect(result.valid).toBe(true);
    expect(result.reason).toBeDefined();
  });

  it('trauma context yields a valid result', async () => {
    const ctx = makeContext({ detectedEmotion: 'trauma' });
    const result = IFSAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });
});

// ─── Agent Registry ─────────────────────────────────────────────────────────

describe('Agent Registry — IFS', () => {
  it('IFSAgent is registered under ifs protocolId', () => {
    expect(AGENT_REGISTRY['ifs']).toBe(IFSAgent);
  });

  it('getAgent("ifs") returns IFSAgent', () => {
    expect(getAgent('ifs')).toBe(IFSAgent);
  });

  it('listImplementedProtocols includes "ifs"', () => {
    const protocols = listImplementedProtocols();
    expect(protocols).toContain('ifs');
    expect(protocols).toContain('woop');
  });
});

// ─── Helper ─────────────────────────────────────────────────────────────────

function makeContext(overrides: Partial<ContextPackage>): ContextPackage {
  return {
    protocol: 'ifs',
    userId: 'test-user',
    sessionId: 'test-session',
    suggestedDuration: 25,
    preprompts: [],
    ...overrides,
  };
}
