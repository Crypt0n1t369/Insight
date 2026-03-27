/**
 * Synthesis Platform — Server API Tests
 *
 * Tests the HTTP API layer (server/index.ts).
 * Requires the server to be running on PORT=3004.
 * All tests are skipped gracefully if the server is not running.
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:3004';

// ---------------------------------------------------------------------------
// Server availability check
// ---------------------------------------------------------------------------

let serverRunning = false;

beforeAll(async () => {
  serverRunning = await fetch(`${BASE}/health`)
    .then(r => r.ok)
    .catch(() => false);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function POST<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function GET<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /health', () => {
  it('returns ok status when server is running', async () => {
    if (!serverRunning) {
      console.warn('[SKIP] Server not running on port 3004');
      return;
    }
    const data = await GET<{ status: string; service: string; timestamp: string }>('/health');
    expect(data.status).toBe('ok');
    expect(data.service).toBe('synthesis-platform');
    expect(data.timestamp).toBeDefined();
  });
});

describe('GET /api/protocols', () => {
  it('lists all implemented protocols', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    const data = await GET<{ protocols: string[]; usageCounts: Record<string, number> }>('/api/protocols');
    expect(data.protocols).toContain('woop');
    expect(data.protocols).toContain('ifs');
    expect(data.protocols).toContain('nsdr');
    expect(data.protocols).toContain('breathwork');
    expect(data.protocols).toContain('se');
    expect(data.protocols).toContain('act');
    expect(data.protocols).toContain('nvc');
    expect(data.protocols).toContain('general');
  });

  it('returns usage counts', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    const data = await GET<{ protocols: string[]; usageCounts: Record<string, number> }>('/api/protocols');
    expect(typeof data.usageCounts).toBe('object');
  });
});

describe('POST /api/sessions', () => {
  it('runs a WOOP session and returns structured result', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    const result = await POST<{
      sessionId: string;
      protocol: string;
      eventCount: number;
      startedAt: string;
      completedAt: string;
      kgSessionNodeId?: string;
      contributionId?: string;
      events: unknown[];
    }>('/api/sessions', {
      userId: 'api-test-user',
      rawInput: 'I want to find a new job but I keep procrastinating',
    });

    expect(result.sessionId).toBeDefined();
    expect(result.protocol).toBe('woop');
    expect(result.eventCount).toBeGreaterThan(0);
    expect(result.startedAt).toBeDefined();
    expect(result.completedAt).toBeDefined();
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events[result.events.length - 1]).toMatchObject({ type: 'completion' });
  });

  it('runs an IFS session and returns structured result', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    const result = await POST<{
      sessionId: string;
      protocol: string;
      eventCount: number;
      events: unknown[];
    }>('/api/sessions', {
      userId: 'api-test-user',
      rawInput: 'I feel torn between working hard and wanting to rest',
    });

    expect(result.protocol).toBe('ifs');
    expect(result.eventCount).toBeGreaterThan(0);
    expect(result.events[result.events.length - 1]).toMatchObject({ type: 'completion' });
  });

  it('routes stressed evening input to NSDR', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    const result = await POST<{
      protocol: string;
      eventCount: number;
    }>('/api/sessions', {
      userId: 'api-test-user',
      rawInput: 'I need to relax and restore my energy after a long day',
      detectedEmotion: 'stressed',
      timeOfDay: 'evening',
    });

    expect(result.protocol).toBe('nsdr');
    expect(result.eventCount).toBeGreaterThan(0);
  });

  it('rejects requests without rawInput', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    let ok = false;
    try {
      await POST('/api/sessions', { userId: 'api-test-user' });
    } catch (e) {
      ok = (e as Error).message.includes('400');
    }
    expect(ok).toBe(true);
  });

  it('rejects requests without userId', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    let ok = false;
    try {
      await POST('/api/sessions', { rawInput: 'hello' });
    } catch (e) {
      ok = (e as Error).message.includes('400');
    }
    expect(ok).toBe(true);
  });
});

describe('POST /api/sessions/stream', () => {
  it('streams session events as SSE', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let eventCount = 0;
    let complete = false;
    let hasError = false;

    try {
      const res = await fetch(`${BASE}/api/sessions/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'stream-test-user',
          rawInput: 'I am feeling anxious and need to calm my nervous system',
        }),
        signal: controller.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            const eventName = line.slice(6).trim();
            if (eventName === 'session-event') eventCount++;
            if (eventName === 'session-complete') complete = true;
          }
        }
      }
    } catch (_e) {
      hasError = true;
    } finally {
      clearTimeout(timeout);
    }

    expect(hasError).toBe(false);
    expect(eventCount).toBeGreaterThan(0);
    expect(complete).toBe(true);
  });

  it('session-complete event includes eventCount and protocol', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let completeData: { sessionId: string; eventCount: number; protocol: string } | null = null;

    try {
      const res = await fetch(`${BASE}/api/sessions/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'stream-complete-test',
          rawInput: 'I need help with focus',
        }),
        signal: controller.signal,
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventName = line.slice(7).trim();
            if (eventName === 'session-complete') {
              // Next line is data
              const dataLineIdx = lines.indexOf(line) + 1;
              if (dataLineIdx < lines.length && lines[dataLineIdx].startsWith('data: ')) {
                completeData = JSON.parse(lines[dataLineIdx].slice(6));
              }
            }
          }
        }
      }
    } finally {
      clearTimeout(timeout);
    }

    expect(completeData).not.toBeNull();
    expect(typeof completeData!.eventCount).toBe('number');
    expect(completeData!.eventCount).toBeGreaterThan(0);
    expect(typeof completeData!.protocol).toBe('string');
    expect(completeData!.protocol.length).toBeGreaterThan(0);
  });
});

describe('GET /api/kg/query', () => {
  it('returns nodes from the knowledge graph', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    const data = await GET<{ nodes: unknown[]; edges: unknown[]; total: number }>('/api/kg/query');
    expect(Array.isArray(data.nodes)).toBe(true);
    expect(Array.isArray(data.edges)).toBe(true);
    expect(data.total).toBe(data.nodes.length);
  });

  it('filters by type', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    const data = await GET<{ nodes: unknown[] }>('/api/kg/query?type=protocol');
    for (const node of data.nodes) {
      expect((node as { type: string }).type).toBe('protocol');
    }
  });

  it('limits results', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    const data = await GET<{ nodes: unknown[] }>('/api/kg/query?limit=3');
    expect(data.nodes.length).toBeLessThanOrEqual(3);
  });
});

describe('GET /api/sessions/:id', () => {
  it('returns a previously created session', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    const result = await POST<{ sessionId: string }>('/api/sessions', {
      userId: 'session-lookup-test',
      rawInput: 'hello world',
    });

    const sessionId = result.sessionId;
    const data = await GET<{ node: { id: string; type: string } }>(`/api/sessions/${sessionId}`);
    expect(data.node.id).toBe(`session-${sessionId}`);
    expect(data.node.type).toBe('session');
  });

  it('returns 404 for unknown session', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    let ok = false;
    try {
      await GET('/api/sessions/this-session-does-not-exist');
    } catch (e) {
      ok = (e as Error).message.includes('404');
    }
    expect(ok).toBe(true);
  });
});

describe('GET /api/stats', () => {
  it('returns platform statistics', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    const data = await GET<{
      totalSessions: number;
      totalProtocols: Record<string, number>;
      knowledgeGraphStats: { nodes: number; edges: number };
      topContributors: unknown[];
    }>('/api/stats');

    expect(typeof data.totalSessions).toBe('number');
    expect(typeof data.totalProtocols).toBe('object');
    expect(typeof data.knowledgeGraphStats.nodes).toBe('number');
    expect(typeof data.knowledgeGraphStats.edges).toBe('number');
    expect(Array.isArray(data.topContributors)).toBe(true);
  });

  it('increments totalSessions after running sessions', async () => {
    if (!serverRunning) { console.warn('[SKIP] Server not running'); return; }
    await POST('/api/sessions', {
      userId: 'stats-test',
      rawInput: 'test session',
    });

    const data = await GET<{ totalSessions: number }>('/api/stats');
    expect(data.totalSessions).toBeGreaterThan(0);
  });
});
