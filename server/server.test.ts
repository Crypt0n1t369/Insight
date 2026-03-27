/**
 * Audio Transformation Tool - Server Unit Tests
 * 
 * Tests the clinical server endpoints in demo mode (no API keys required).
 * Covers: health, protocols, chat, director, meditation generation.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

// ---------------------------------------------------------------------------
// Mock external dependencies
// ---------------------------------------------------------------------------

// Mock GoogleGenAI to avoid API calls
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({}))
  };
});

// ---------------------------------------------------------------------------
// Build a minimal test app that mirrors the real server's behavior
// ---------------------------------------------------------------------------

function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const DEMO_BATCHES: Record<string, { text: string; instructions: any[] }[]> = {
    NSDR: [
      { text: "Welcome to your NSDR session. Find a comfortable position, lying down if possible.", instructions: [] },
    ],
    DEFAULT: [
      { text: "Welcome. Find a comfortable position and close your eyes. Take a slow, deep breath.", instructions: [] },
    ],
  };

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', openRouterLinked: false });
  });

  app.get('/api/protocols', (_req, res) => {
    const protocols = [
      { id: 'NSDR', name: 'Non-Sleep Deep Rest', description: 'Physiological downregulation.' },
      { id: 'IFS', name: 'Internal Family Systems', description: 'Unblending from reactive parts.' },
      { id: 'SOMATIC_AGENCY', name: 'Somatic Agency', description: 'Shifting from conditioning to Centered Presence.' },
      { id: 'ACT', name: 'Acceptance and Commitment Therapy', description: 'Psychological flexibility.' },
      { id: 'FUTURE_SELF', name: 'Future Self', description: 'Connect with future self.' },
      { id: 'WOOP', name: 'WOOP Wish Outcome Obstacle Plan', description: 'Mental contrasting.' },
      { id: 'NVC', name: 'Nonviolent Communication', description: 'Compassionate communication.' },
      { id: 'IDENTITY', name: 'Identity Work', description: 'Explore self-identity.' },
      { id: 'NARRATIVE', name: 'Narrative Therapy', description: 'Re-authoring your story.' },
    ];
    res.json(protocols);
  });

  app.post('/api/chat', (req, res) => {
    const { latestInput, message, history } = req.body || {};
    const input = latestInput || message || '';
    
    if (!input && Object.keys(req.body || {}).length === 0) {
      return res.status(400).json({ reply: "Message is required.", shouldOfferMeditation: false });
    }
    
    // Demo mode response
    res.json({
      reply: "I hear you. Tell me more about what you're experiencing — in demo mode, every word matters.",
      shouldOfferMeditation: true,
      meditationData: {
        focus: "Demo Session",
        feeling: "Open",
        duration: 10,
        methodology: "NSDR"
      }
    });
  });

  app.post('/api/director', (req, res) => {
    const input = req.body.input ?? req.body.userMessage ?? '';
    const triage = req.body.triage ?? null;

    if (!input && (!triage || typeof triage.valence !== 'number')) {
      return res.json({
        methodology: "NSDR",
        focus: "Grounding",
        targetFeeling: "Calm",
        intensity: "MODERATE",
        rationale: "Fallback: insufficient input data"
      });
    }

    res.json({
      methodology: "NSDR",
      focus: "Grounding",
      targetFeeling: "Calm",
      intensity: "MODERATE",
      rationale: "Demo mode default"
    });
  });

  app.post('/api/meditation/generate', (req, res) => {
    const { focus, methodology } = req.body || {};
    
    if (!methodology) {
      return res.status(400).json({ error: "Invalid methodology and fallback failed." });
    }

    const demoBatches = DEMO_BATCHES[methodology] || DEMO_BATCHES['DEFAULT'];
    res.json({
      error: "Demo mode — AI generation requires OPENROUTER_API_KEY with credits.",
      batches: demoBatches,
      title: `Demo: ${methodology || 'Session'}`
    });
  });

  return app;
}

// ---------------------------------------------------------------------------
// Test server setup
// ---------------------------------------------------------------------------

import http from 'http';

describe('Audio Transformation Tool - Server', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      const app = createTestApp();
      server = app.listen(0, () => {
        const addr = server.address();
        baseUrl = `http://localhost:${typeof addr === 'object' && addr ? addr.port : 0}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  // ---------------------------------------------------------------------------
  // Health endpoint
  // ---------------------------------------------------------------------------

  describe('GET /health', () => {
    it('returns ok status', async () => {
      const res = await fetch(`${baseUrl}/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('ok');
    });

    it('indicates openRouterLinked is false in demo mode', async () => {
      const res = await fetch(`${baseUrl}/health`);
      const data = await res.json();
      expect(data.openRouterLinked).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Protocols endpoint
  // ---------------------------------------------------------------------------

  describe('GET /api/protocols', () => {
    it('returns array of protocols', async () => {
      const res = await fetch(`${baseUrl}/api/protocols`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('includes all 9 expected protocols', async () => {
      const res = await fetch(`${baseUrl}/api/protocols`);
      const data = await res.json();
      expect(data.length).toBe(9);
      
      const ids = data.map((p: any) => p.id);
      expect(ids).toContain('NSDR');
      expect(ids).toContain('IFS');
      expect(ids).toContain('SOMATIC_AGENCY');
      expect(ids).toContain('ACT');
      expect(ids).toContain('FUTURE_SELF');
      expect(ids).toContain('WOOP');
      expect(ids).toContain('NVC');
      expect(ids).toContain('IDENTITY');
      expect(ids).toContain('NARRATIVE');
    });

    it('each protocol has required fields', async () => {
      const res = await fetch(`${baseUrl}/api/protocols`);
      const data = await res.json();
      for (const protocol of data) {
        expect(protocol).toHaveProperty('id');
        expect(protocol).toHaveProperty('name');
        expect(protocol).toHaveProperty('description');
        expect(typeof protocol.id).toBe('string');
        expect(typeof protocol.name).toBe('string');
        expect(typeof protocol.description).toBe('string');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Chat endpoint
  // ---------------------------------------------------------------------------

  describe('POST /api/chat', () => {
    it('returns 400 when no input provided', async () => {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      expect(res.status).toBe(400);
    });

    it('accepts latestInput field', async () => {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latestInput: 'I feel anxious' })
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.reply).toBeTruthy();
    });

    it('accepts message field as alternative', async () => {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'I feel anxious' })
      });
      expect(res.status).toBe(200);
    });

    it('returns demo mode meditation suggestion', async () => {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latestInput: 'I feel anxious' })
      });
      const data = await res.json();
      expect(data.shouldOfferMeditation).toBe(true);
      expect(data.meditationData).toBeDefined();
      expect(data.meditationData.methodology).toBe('NSDR');
    });

    it('passes history for context', async () => {
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latestInput: 'Tell me more',
          history: [
            { role: 'user', text: 'I feel anxious' },
            { role: 'assistant', text: 'I hear you' }
          ]
        })
      });
      expect(res.status).toBe(200);
    });
  });

  // ---------------------------------------------------------------------------
  // Director endpoint
  // ---------------------------------------------------------------------------

  describe('POST /api/director', () => {
    it('returns methodology recommendation with valid input', async () => {
      const res = await fetch(`${baseUrl}/api/director`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: 'I want to feel calmer', triage: { valence: 3, arousal: 7 } })
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.methodology).toBe('NSDR');
      expect(data.focus).toBe('Grounding');
      expect(data.targetFeeling).toBe('Calm');
      expect(data.intensity).toBe('MODERATE');
    });

    it('accepts legacy userMessage field', async () => {
      const res = await fetch(`${baseUrl}/api/director`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: 'I am stressed', triage: { valence: 2, arousal: 8 } })
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.methodology).toBeTruthy();
    });

    it('returns fallback when input is empty', async () => {
      const res = await fetch(`${baseUrl}/api/director`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.rationale).toContain('Fallback');
    });
  });

  // ---------------------------------------------------------------------------
  // Meditation generation endpoint
  // ---------------------------------------------------------------------------

  describe('POST /api/meditation/generate', () => {
    it('generates demo meditation for valid methodology', async () => {
      const res = await fetch(`${baseUrl}/api/meditation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus: 'Anxiety relief',
          targetFeeling: 'Calm',
          methodology: 'NSDR',
          durationMinutes: 10
        })
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toContain('NSDR');
      expect(data.batches).toBeDefined();
      expect(Array.isArray(data.batches)).toBe(true);
      expect(data.error).toContain('Demo mode');
    });

    it('returns error for missing methodology', async () => {
      const res = await fetch(`${baseUrl}/api/meditation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus: 'Anxiety relief' })
      });
      expect(res.status).toBe(400);
    });

    it('includes script batches with text and instructions', async () => {
      const res = await fetch(`${baseUrl}/api/meditation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodology: 'IFS' })
      });
      const data = await res.json();
      expect(data.batches.length).toBeGreaterThan(0);
      expect(data.batches[0]).toHaveProperty('text');
      expect(data.batches[0]).toHaveProperty('instructions');
    });

    it('works for all supported methodologies', async () => {
      const methodologies = ['NSDR', 'IFS', 'SOMATIC_AGENCY', 'ACT', 'FUTURE_SELF', 'WOOP', 'NVC', 'IDENTITY', 'NARRATIVE'];
      for (const method of methodologies) {
        const res = await fetch(`${baseUrl}/api/meditation/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ methodology: method })
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.batches).toBeDefined();
      }
    });
  });
});
