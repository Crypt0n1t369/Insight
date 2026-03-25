import { describe, it, expect } from 'vitest';
import type { ContextPackage } from '../../router-agent/types.js';
import { NVCAgent } from '../nvc.js';
import { AGENT_REGISTRY, getAgent, listImplementedProtocols } from '../index.js';

// ---------------------------------------------------------------------------
// Helper: build a ContextPackage for testing
// ---------------------------------------------------------------------------

function makeContext(overrides: Partial<ContextPackage> = {}): ContextPackage {
  return {
    userId: 'test-user',
    sessionId: 'test-session',
    protocol: 'nvc',
    rawInput: '',
    modality: 'text',
    detectedEmotion: overrides.detectedEmotion,
    recentProtocols: [],
    timeOfDay: 'afternoon',
    userPreferences: {
      sessionDuration: overrides.suggestedDuration as number | undefined,
    },
    ...overrides,
  } as ContextPackage;
}

// ---------------------------------------------------------------------------
// Interface compliance
// ---------------------------------------------------------------------------

describe('NVC Agent', () => {
  // ─── Interface compliance ──────────────────────────────────────

  it('has the correct protocolId', () => {
    expect(NVCAgent.protocolId).toBe('nvc');
  });

  it('has a displayName', () => {
    expect(typeof NVCAgent.displayName).toBe('string');
    expect(NVCAgent.displayName.length).toBeGreaterThan(0);
  });

  it('has a description', () => {
    expect(typeof NVCAgent.description).toBe('string');
    expect(NVCAgent.description.length).toBeGreaterThan(10);
  });

  it('has a defaultDuration of 35 minutes', () => {
    expect(NVCAgent.defaultDuration).toBe(35);
  });

  // ─── AGENT_REGISTRY integration ─────────────────────────────────

  it('is registered in AGENT_REGISTRY', () => {
    expect(AGENT_REGISTRY['nvc']).toBe(NVCAgent);
  });

  it('is returned by getAgent("nvc")', () => {
    expect(getAgent('nvc')).toBe(NVCAgent);
  });

  it('appears in listImplementedProtocols', () => {
    const protocols = listImplementedProtocols();
    expect(protocols).toContain('nvc');
  });

  // ─── validate() ────────────────────────────────────────────────

  it('returns valid: true for a normal context (no emotion)', () => {
    const ctx = makeContext({});
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for angry emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'angry' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for frustrated emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'frustrated' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for anxious emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'anxious' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for overwhelmed emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'overwhelmed' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for grief emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'grief' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for loss emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'loss' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for stressed emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'stressed' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for low emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'low' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for neutral emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'neutral' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for curious emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'curious' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for dissociated emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'dissociated' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for excited emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'excited' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for motivated emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'motivated' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for depressed emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'depressed' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  it('returns valid: true for trauma emotion', () => {
    const ctx = makeContext({ detectedEmotion: 'trauma' });
    const result = NVCAgent.validate(ctx);
    expect(result.valid).toBe(true);
  });

  // ─── run() — session structure ──────────────────────────────────

  it('run() yields an opening guidance event', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
      if (events.length >= 1) break;
    }
    expect(events[0].type).toBe('guidance');
    expect(events[0].phase).toBe('Opening');
  });

  it('run() yields a sequence of events across multiple phases', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const phases = events.map((e) => e.phase);
    expect(phases).toContain('Grounding');
    expect(phases).toContain('Self-Empathy — Needs');
    expect(phases).toContain('Honest Expression');
    expect(phases).toContain('Making Requests');
    expect(phases).toContain('Receiving with Empathy');
    expect(phases).toContain('Integration');
  });

  it('run() yields prompt-type events', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const prompts = events.filter((e) => e.type === 'prompt');
    expect(prompts.length).toBeGreaterThan(0);
  });

  it('run() yields transition events between phases', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const transitions = events.filter((e) => e.type === 'transition');
    expect(transitions.length).toBeGreaterThan(0);
    expect(transitions[0].phase).toContain('→');
  });

  it('run() ends with a completion event', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe('completion');
    expect(lastEvent.phase).toBe('Session Complete');
  });

  it('run() yields events with transcripts (non-empty strings)', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const textEvents = events.filter((e) => e.type === 'guidance' || e.type === 'prompt');
    for (const e of textEvents) {
      expect(typeof e.transcript).toBe('string');
      expect(e.transcript.length).toBeGreaterThan(0);
    }
  });

  it('run() yields events with duration metadata (in ms)', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
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
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    expect(events.length).toBeGreaterThan(20);
  });

  it('run() produces all four event types (guidance, prompt, transition, completion)', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
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
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    for (const e of events) {
      expect(typeof e.phase).toBe('string');
      expect(e.phase.length).toBeGreaterThan(0);
    }
  });

  it('run() transcript includes NVC key concepts (observation, feeling, need, request)', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const allText = events
      .map((e) => e.transcript)
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    // Core NVC concepts must appear
    expect(allText).toContain('observation');
    expect(allText).toContain('feeling');
    expect(allText).toContain('need');
    expect(allText).toContain('request');
  });

  it('run() includes empathy-related content', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const allText = events
      .map((e) => e.transcript)
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    // Receiving with empathy is a core NVC component
    expect(allText).toContain('empathy');
    expect(allText).toContain('blame');
  });

  it('run() includes needs-related content (universal needs)', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const allText = events
      .map((e) => e.transcript)
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    // Needs are central to NVC
    expect(allText).toContain('need');
  });

  it('run() includes honest expression phase content', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const phases = events.map((e) => e.phase);
    expect(phases).toContain('Honest Expression');
  });

  it('run() includes making requests phase', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const phases = events.map((e) => e.phase);
    expect(phases).toContain('Making Requests');
  });

  it('run() includes receiving with empathy phase', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const phases = events.map((e) => e.phase);
    expect(phases).toContain('Receiving with Empathy');
  });

  it('run() does not include any phase named after other therapies', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const phases = events.map((e) => e.phase);
    const allPhases = phases.join(' ').toLowerCase();
    // Should not contain IFS, NSDR, ACT, SE terms
    expect(allPhases).not.toContain('internal family');
    expect(allPhases).not.toContain('non-sleep');
    expect(allPhases).not.toContain('somatic');
    expect(allPhases).not.toContain('defusion');
  });

  it('run() all guidance events have valid phase names', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const validPhases = new Set([
      'Opening',
      'Grounding',
      'Self-Empathy — Needs',
      'Honest Expression',
      'Making Requests',
      'Receiving with Empathy',
      'Integration',
      'Session Complete',
      'Transition: grounding → self_empathy_needs',
      'Transition: self_empathy_needs → honest_expression',
      'Transition: honest_expression → making_requests',
      'Transition: making_requests → receiving',
      'Transition: receiving → integration',
    ]);
    for (const e of events) {
      if (e.type === 'transition') {
        expect(e.phase).toMatch(/→/);
      } else {
        // Phase should be one of the named phases
        const phaseStr = e.phase.toLowerCase();
        const isValid =
          phaseStr.includes('grounding') ||
          phaseStr.includes('self-empathy') ||
          phaseStr.includes('honest') ||
          phaseStr.includes('request') ||
          phaseStr.includes('receiving') ||
          phaseStr.includes('integration') ||
          phaseStr.includes('opening') ||
          phaseStr.includes('complete') ||
          phaseStr.includes('transition');
        expect(isValid).toBe(true);
      }
    }
  });

  it('run() completion event transcript is non-empty', async () => {
    const ctx = makeContext({});
    const events = [];
    for await (const e of NVCAgent.run(ctx)) {
      events.push(e);
    }
    const completions = events.filter((e) => e.type === 'completion' && e.phase === 'Session Complete');
    expect(completions.length).toBeGreaterThan(0);
    expect(typeof completions[0].transcript).toBe('string');
    expect(completions[0].transcript.length).toBeGreaterThan(0);
  });
});
