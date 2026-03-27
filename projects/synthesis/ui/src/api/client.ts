/**
 * Synthesis Platform — API Client
 * Connects to the Synthesis API server on port 3004.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3004';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Protocol {
  id: string;
  name: string;
  description: string;
  techniques: string[];
  recommendedFor: string[];
  variables: Record<string, unknown>;
  tags: string[];
}

export interface ProtocolListResponse {
  protocols: string[]; // IDs
  usageCounts: Record<string, number>;
}

export interface SessionStartInput {
  rawInput: string;
  userId: string;
  sessionId?: string;
  modality?: 'text' | 'voice';
  detectedEmotion?: string;
  recentProtocols?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  recordToKG?: boolean;
  recordContribution?: boolean;
  priorSessionSummary?: string;
}

export interface SessionEvent {
  type: string;
  protocol?: string;
  step?: string;
  message?: string;
  data?: unknown;
  timestamp: string;
}

export interface SessionResult {
  sessionId: string;
  protocol: string;
  eventCount: number;
  startedAt: string;
  completedAt: string;
  kgSessionNodeId?: string;
  contributionId?: string;
  events: SessionEvent[];
}

export interface KGQuery {
  type?: string;
  tags?: string[];
  limit?: number;
}

export interface KGQueryResponse {
  nodes: KGNode[];
  edges: KGEdge[];
  total: number;
}

export interface KGNode {
  id: string;
  type: string;
  name: string;
  tags: string[];
  properties: Record<string, unknown>;
}

export interface KGEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface StatsResponse {
  totalSessions: number;
  totalEvents: number;
  sessionsByProtocol: Record<string, number>;
  platformUptime: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  } as RequestInit);

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── API Functions ───────────────────────────────────────────────────────────

/** GET /health */
export async function getHealth(): Promise<{ status: string; service: string; timestamp: string }> {
  return apiFetch('/health');
}

/** GET /api/protocols */
export async function getProtocols(): Promise<ProtocolListResponse> {
  return apiFetch('/api/protocols');
}

/** POST /api/sessions — blocking session */
export async function startSession(input: SessionStartInput): Promise<SessionResult> {
  return apiFetch('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * POST /api/sessions/stream — streaming session via SSE.
 * onComplete receives: { sessionId, kgSessionNodeId, eventCount, protocol }
 */
export async function streamSession(
  input: SessionStartInput,
  onEvent: (event: SessionEvent) => void,
  onComplete: (result: { sessionId: string; kgSessionNodeId?: string; eventCount: number; protocol: string }) => void,
  onError: (err: Error) => void,
): { cancel: () => void } {
  const controller = new AbortController();

  fetch(`${BASE_URL}/api/sessions/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`${res.status} ${res.statusText}: ${body}`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let pos = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep unprocessed partial line in buffer for next chunk
        buffer = lines[lines.length - 1] ?? '';
        // Only process complete lines (up to but not including the last line which may be partial)
        const completeLines = lines.slice(0, -1);

        for (const line of completeLines) {
          if (line.startsWith('event: ')) {
            pos = 1; // Next line is data
          } else if (pos === 1 && line.startsWith('data: ')) {
            pos = 0;
            const data = JSON.parse(line.slice(6));
            if (data.error != null) {
              onError(new Error(data.error));
            } else if (data.sessionId != null && data.eventCount != null) {
              // session-complete event
              onComplete(data as { sessionId: string; kgSessionNodeId?: string; eventCount: number; protocol: string });
            } else {
              // session-event
              onEvent(data as SessionEvent);
            }
          }
        }
      }
    })
    .catch((err: unknown) => {
      if (err instanceof Error && err.name !== 'AbortError') {
        onError(err);
      }
    });

  return {
    cancel: () => controller.abort(),
  };
}

/** GET /api/kg/query */
export async function queryKG(query: KGQuery): Promise<KGQueryResponse> {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  if (query.tags?.length) params.set('tags', query.tags.join(','));
  if (query.limit) params.set('limit', String(query.limit));
  return apiFetch(`/api/kg/query?${params}`);
}

/** GET /api/sessions/:sessionId */
export async function getSession(sessionId: string): Promise<{ node: KGNode }> {
  return apiFetch(`/api/sessions/${sessionId}`);
}

/** GET /api/stats */
export async function getStats(): Promise<StatsResponse> {
  return apiFetch('/api/stats');
}
