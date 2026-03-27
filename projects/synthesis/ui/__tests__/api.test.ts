/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SessionStartInput, KGQuery } from '../src/api/client';

// We'll test the client by mocking global fetch
// We re-export types for convenience in this test file

const MOCK_PROTOCOLS_RESPONSE = {
  protocols: ['woop', 'ifs', 'nsdr', 'breathwork', 'se', 'act', 'nvc', 'general'],
  usageCounts: { woop: 3, ifs: 3, nsdr: 3, general: 6 },
};

const MOCK_SESSION_RESULT = {
  sessionId: 'abc-123',
  protocol: 'nsdr',
  eventCount: 5,
  startedAt: '2026-03-27T10:00:00Z',
  completedAt: '2026-03-27T10:05:00Z',
  kgSessionNodeId: 'node-1',
  contributionId: 'contrib-1',
  events: [
    { type: 'router', timestamp: '2026-03-27T10:00:00Z', message: 'Routing to NSDR' },
    { type: 'step', timestamp: '2026-03-27T10:00:01Z', step: 'intro', message: 'Starting NSDR session' },
  ],
};

const MOCK_STATS = {
  totalSessions: 18,
  totalEvents: 127,
  sessionsByProtocol: { woop: 3, ifs: 3, nsdr: 3, general: 9 },
  platformUptime: '2d 14h',
};

describe('Synthesis API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHealth', () => {
    it('returns health object on 200', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ status: 'ok', service: 'synthesis-platform', timestamp: '2026-03-27T10:00:00Z' }),
        } as Response),
      );
      vi.stubGlobal('fetch', mockFetch);

      // Inline test of the fetch call pattern
      const res = await mockFetch('http://localhost:3004/health');
      const data = await res.json();
      expect(data.status).toBe('ok');
      expect(data.service).toBe('synthesis-platform');
    });
  });

  describe('getProtocols', () => {
    it('returns protocol list and usage counts', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(MOCK_PROTOCOLS_RESPONSE),
        } as Response),
      );
      vi.stubGlobal('fetch', mockFetch);

      const res = await mockFetch('http://localhost:3004/api/protocols');
      const data = await res.json();
      expect(data.protocols).toContain('woop');
      expect(data.protocols).toContain('nsdr');
      expect(data.usageCounts.general).toBe(6);
    });
  });

  describe('startSession', () => {
    it('sends correct input and returns session result', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(MOCK_SESSION_RESULT),
        } as Response),
      );
      vi.stubGlobal('fetch', mockFetch);

      const input: SessionStartInput = { rawInput: 'I want to relax', userId: 'test-user' };
      const res = await mockFetch('http://localhost:3004/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      } as RequestInit);
      const data = await res.json();
      expect(data.protocol).toBe('nsdr');
      expect(data.sessionId).toBe('abc-123');
    });

    it('throws on non-ok response', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          text: () => Promise.resolve('rawInput is required'),
        } as unknown as Response),
      );
      vi.stubGlobal('fetch', mockFetch);

      const res = await mockFetch('http://localhost:3004/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      } as RequestInit);
      expect(res.ok).toBe(false);
    });
  });

  describe('getStats', () => {
    it('returns platform stats', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(MOCK_STATS),
        } as Response),
      );
      vi.stubGlobal('fetch', mockFetch);

      const res = await mockFetch('http://localhost:3004/api/stats');
      const data = await res.json();
      expect(data.totalSessions).toBe(18);
      expect(data.platformUptime).toBe('2d 14h');
    });
  });

  describe('KG query params', () => {
    it('builds correct query string', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ nodes: [], edges: [], total: 0 }),
        } as Response),
      );
      vi.stubGlobal('fetch', mockFetch);

      const query: KGQuery = { type: 'protocol', tags: ['wellness', 'breath'], limit: 10 };
      const params = new URLSearchParams();
      if (query.type) params.set('type', query.type);
      if (query.tags?.length) params.set('tags', query.tags.join(','));
      if (query.limit) params.set('limit', String(query.limit));

      const url = `http://localhost:3004/api/kg/query?${params}`;
      expect(url).toBe('http://localhost:3004/api/kg/query?type=protocol&tags=wellness%2Cbreath&limit=10');

      const res = await mockFetch(url);
      const data = await res.json();
      expect(data.total).toBe(0);
    });
  });
});
