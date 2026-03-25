/**
 * Audio Backend — Phase 2 Integration Tests
 * Tests the running server at localhost:3001
 * Run with: npx vitest run integration.test.ts
 */
import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:3001';

interface Protocol {
  id: string;
  name: string;
  description: string;
  category?: string;
}

interface ChatResponse {
  reply?: string;
  suggestion?: {
    focus: string;
    feeling: string;
    duration: number;
  };
  shouldOfferMeditation?: boolean;
}

interface DirectorResponse {
  focus?: string;
  feeling?: string;
  duration?: number;
  suggestion?: string;
  methodology?: string;
}

describe('Audio Backend Integration — Phase 2', () => {
  // --- Health ---
  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await fetch(`${BASE}/health`);
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.status).toBe('ok');
      // openRouterLinked reflects whether OPENROUTER_API_KEY is set
      expect(typeof body.openRouterLinked).toBe('boolean');
    });

    it('returns valid JSON content-type', async () => {
      const res = await fetch(`${BASE}/health`);
      expect(res.headers.get('content-type')).toMatch(/application\/json/);
    });
  });

  // --- Protocols ---
  describe('GET /api/protocols', () => {
    it('returns 200', async () => {
      const res = await fetch(`${BASE}/api/protocols`);
      expect(res.status).toBe(200);
    });

    it('returns an array of protocols', async () => {
      const res = await fetch(`${BASE}/api/protocols`);
      const body = await res.json() as Protocol[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it('each protocol has id, name, and description', async () => {
      const res = await fetch(`${BASE}/api/protocols`);
      const body = await res.json() as Protocol[];
      for (const p of body) {
        expect(typeof p.id).toBe('string');
        expect(typeof p.name).toBe('string');
        expect(typeof p.description).toBe('string');
      }
    });

    it('includes known protocols', async () => {
      const res = await fetch(`${BASE}/api/protocols`);
      const body = await res.json() as Protocol[];
      const ids = body.map(p => p.id);
      // Confirmed active protocols from PROGRESS.md
      const known = ['NSDR', 'IFS', 'SOMATIC_AGENCY', 'ACT', 'FUTURE_SELF', 'WOOP', 'NVC', 'IDENTITY', 'NARRATIVE'];
      for (const k of known) {
        expect(ids).toContain(k);
      }
    });
  });

  // --- Chat ---
  describe('POST /api/chat', () => {
    it('returns 200 for a simple message', async () => {
      const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'I feel stressed', history: [] }),
      });
      expect(res.status).toBe(200);
    });

    it('returns a reply string', async () => {
      const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'I feel stressed', history: [] }),
      });
      const body = await res.json() as ChatResponse;
      expect(body.reply).toBeDefined();
      if (body.reply) {
        expect(typeof body.reply).toBe('string');
        expect(body.reply.length).toBeGreaterThan(0);
      }
    });

    it('accepts empty history without crashing', async () => {
      const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello', history: [] }),
      });
      expect(res.status).toBe(200);
    });

    it('accepts missing history (uses default)', async () => {
      const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      });
      expect(res.status).toBe(200);
    });

    it('returns shouldOfferMeditation boolean', async () => {
      const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'I feel anxious', history: [] }),
      });
      const body = await res.json() as ChatResponse;
      expect(typeof body.shouldOfferMeditation).toBe('boolean');
    });

    it('uses Demo Mode fallback when no API key', async () => {
      const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'I am overwhelmed', history: [] }),
      });
      const body = await res.json() as ChatResponse;
      // Demo fallback message
      expect(body.reply).toMatch(/hear you|tell me more|I understand/);
    });
  });

  // --- Director ---
  describe('POST /api/director', () => {
    it('returns 200', async () => {
      const res = await fetch(`${BASE}/api/director`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: 'I want to feel calm', sessionState: 'TRIAGE' }),
      });
      expect(res.status).toBe(200);
    });

    it('returns a valid director response object', async () => {
      const res = await fetch(`${BASE}/api/director`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: 'I want to feel calm', sessionState: 'TRIAGE' }),
      });
      const body = await res.json() as DirectorResponse;
      // At minimum, a fallback response should exist
      expect(body).toBeDefined();
    });

    it('accepts optional fields without crashing', async () => {
      const res = await fetch(`${BASE}/api/director`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: 'Help me relax',
          sessionState: 'EXPERIENCE',
          selectedMethodology: 'NSDR',
        }),
      });
      expect(res.status).toBe(200);
    });
  });

  // --- Meditation Generate ---
  describe('POST /api/meditation/generate', () => {
    it('returns 200 even without API key (graceful error)', async () => {
      const res = await fetch(`${BASE}/api/meditation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus: 'stress relief',
          feeling: 'calm',
          duration: 10,
          userInsights: [],
          activePatterns: [],
        }),
      });
      // Server returns 200 with error body, not 500
      expect(res.status).toBe(200);
    });

    it('body is valid JSON even on error', async () => {
      const res = await fetch(`${BASE}/api/meditation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus: 'stress relief',
          feeling: 'calm',
          duration: 10,
          userInsights: [],
          activePatterns: [],
        }),
      });
      const body = await res.json() as Record<string, unknown>;
      // Either success with audio or graceful error
      expect(typeof body).toBe('object');
    });

    it('handles empty body gracefully with 200 and demo batches', async () => {
      // When OpenRouter credits are exhausted, server returns demo content
      // so the client still has playable batches — not empty arrays.
      const res = await fetch(`${BASE}/api/meditation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(typeof body).toBe('object');
      // Error note is present (demo mode), but batches are NOT empty
      expect(body.error).toBeDefined();
      expect((body.batches as unknown[]).length).toBeGreaterThan(0);
      expect(body.title).toBeDefined();
    });

    it('returns protocol-specific demo batches when OpenRouter unavailable', async () => {
      const res = await fetch(`${BASE}/api/meditation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodology: 'NSDR', focus: 'Grounding', targetFeeling: 'Calm' }),
      });
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.error).toBeDefined();
      expect(body.title).toBe('Demo: NSDR');
      expect((body.batches as unknown[]).length).toBeGreaterThan(0);
      // Each batch has text
      for (const batch of body.batches as { text: string }[]) {
        expect(batch.text.length).toBeGreaterThan(10);
      }
    });

    it('returns demo batches for IFS methodology', async () => {
      const res = await fetch(`${BASE}/api/meditation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodology: 'IFS', focus: 'Parts work' }),
      });
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.title).toBe('Demo: IFS');
      expect((body.batches as unknown[]).length).toBeGreaterThan(0);
    });
  });

  // --- Error Handling ---
  describe('Error handling', () => {
    it('GET /nonexistent returns 404', async () => {
      const res = await fetch(`${BASE}/nonexistent`);
      expect(res.status).toBe(404);
    });

    it('POST /api/chat with no body returns 400', async () => {
      const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      });
      expect(res.status).toBe(400);
    });

    it('POST /api/chat with malformed JSON returns 400', async () => {
      const res = await fetch(`${BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid json',
      });
      expect(res.status).toBe(400);
    });
  });
});
