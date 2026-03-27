import { describe, it, expect } from 'vitest';
import type { ContextPackage } from '../../router-agent/types.js';
import { GENERALAgent } from '../general.js';
import { AGENT_REGISTRY, getAgent, listImplementedProtocols } from '../index.js';

// ---------------------------------------------------------------------------
// Helper: build a minimal ContextPackage
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
    userPreferences: {},
    ...overrides,
  } as ContextPackage;
}

// ---------------------------------------------------------------------------
// Interface compliance
// ---------------------------------------------------------------------------

describe('GENERAL Agent', () => {
  // ─── Interface compliance ──────────────────────────────────────────────

  it('has protocolId "general"', () => {
    expect(GENERALAgent.protocolId).toBe('general');
  });

  it('has a non-empty displayName', () => {
    expect(typeof GENERALAgent.displayName).toBe('string');
    expect(GENERALAgent.displayName.length).toBeGreaterThan(0);
  });

  it('has a description', () => {
    expect(typeof GENERALAgent.description).toBe('string');
    expect(GENERALAgent.description.length).toBeGreaterThan(10);
  });

  it('has a defaultDuration of 10 minutes', () => {
    expect(GENERALAgent.defaultDuration).toBe(10);
  });

  // ─── validate() ────────────────────────────────────────────────────────

  it('returns valid: true for any context (fallback agent)', () => {
    const ctx = makeContext({});
    const result = GENERALAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true when emotion is undefined', () => {
    const ctx = makeContext({ detectedEmotion: undefined });
    const result = GENERALAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for any emotion', () => {
    const emotions = ['anxious', 'depressed', 'grief', 'overwhelmed', 'curious', 'calm'];
    for (const emotion of emotions) {
      const ctx = makeContext({ detectedEmotion: emotion });
      const result = GENERALAgent.validate(ctx);
      expect(result.valid, `emotion=${emotion}`).toBe(true);
    }
  });

  it('returns valid: true regardless of suggestedDuration', () => {
    for (const dur of [1, 5, 10, 30, 60]) {
      const ctx = makeContext({ suggestedDuration: dur });
      const result = GENERALAgent.validate(ctx);
      expect(result.valid, `duration=${dur}`).toBe(true);
    }
  });

  // ─── run() — structure ──────────────────────────────────────────────────

  it('run() is a function', () => {
    expect(typeof GENERALAgent.run).toBe('function');
  });

  it('run() is an AsyncGenerator', async () => {
    const ctx = makeContext({});
    const gen = GENERALAgent.run(ctx);
    expect(gen[Symbol.asyncIterator]).toBeDefined();
  });

  it('yields a completion event as first event', async () => {
    const ctx = makeContext({});
    const gen = GENERALAgent.run(ctx);
    const first = (await gen.next()).value;
    expect(first.type).toBe('completion');
    expect(first.phase).toBe('Opening');
  });

  it('yields guidance events during opening phase', async () => {
    const ctx = makeContext({});
    const gen = GENERALAgent.run(ctx);
    const events: string[] = [];
    for await (const event of gen) {
      events.push(event.type);
      if (event.type === 'completion' && event.phase === 'Session Complete') break;
    }
    // Should have at least: completion (first), multiple guidance, transition, closing completion
    expect(events).toContain('completion');
    expect(events.filter(t => t === 'guidance').length).toBeGreaterThan(0);
  });

  it('yields a completion event as last event', async () => {
    const ctx = makeContext({});
    const gen = GENERALAgent.run(ctx);
    let lastEvent: { type: string; phase: string } = { type: '', phase: '' };
    for await (const event of gen) {
      lastEvent = event;
    }
    expect(lastEvent.type).toBe('completion');
    expect(lastEvent.phase).toBe('Session Complete');
  });

  it('all yielded events have required fields', async () => {
    const ctx = makeContext({});
    const gen = GENERALAgent.run(ctx);
    for await (const event of gen) {
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('phase');
      expect(typeof event.type).toBe('string');
      expect(typeof event.phase).toBe('string');
    }
  });

  it('all event types are valid SessionEventType values', async () => {
    const ctx = makeContext({});
    const gen = GENERALAgent.run(ctx);
    const validTypes = new Set(['guidance', 'prompt', 'transition', 'completion']);
    for await (const event of gen) {
      expect(validTypes.has(event.type), `invalid type: ${event.type}`).toBe(true);
    }
  });

  // ─── run() — transcript content ──────────────────────────────────────

  it('mentions WOOP, IFS, NSDR, Breathwork as referral targets in closing guidance', async () => {
    const ctx = makeContext({});
    const gen = GENERALAgent.run(ctx);
    const closingTranscripts: string[] = [];
    let inClosing = false;
    for await (const event of gen) {
      if (event.phase.startsWith('Closing')) inClosing = true;
      if (event.type === 'completion' && event.phase === 'Session Complete') break;
      if (inClosing && event.transcript) closingTranscripts.push(event.transcript);
    }
    const combined = closingTranscripts.join(' ');
    expect(combined).toMatch(/WOOP|IFS|NSDR|Breathwork/);
  });

  it('first event is a welcome completion with non-empty transcript', async () => {
    const ctx = makeContext({});
    const gen = GENERALAgent.run(ctx);
    const first = (await gen.next()).value;
    expect(first.type).toBe('completion');
    expect(first.transcript).toBeTruthy();
    expect(first.transcript!.length).toBeGreaterThan(0);
  });

  // ─── AGENT_REGISTRY integration ────────────────────────────────────────

  it('is registered in AGENT_REGISTRY under "general"', () => {
    const found = getAgent('general');
    expect(found).toBe(GENERALAgent);
  });

  it('appears in listImplementedProtocols', () => {
    const protocols = listImplementedProtocols();
    expect(protocols).toContain('general');
  });

  it('is one of the fallback agents in AGENT_REGISTRY', () => {
    expect(AGENT_REGISTRY['general']).toBe(GENERALAgent);
  });
});
