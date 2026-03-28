/**
 * Synthesis Platform — API Server
 *
 * HTTP API layer for the Synthesis Platform.
 * Wires Express to the SessionOrchestrator for session management,
 * knowledge graph queries, and platform stats.
 *
 * Auth: If SYNTHESIS_API_KEY env var is set, all /api/* routes require
 * a valid X-API-Key header. Health endpoint is always public.
 *
 * Endpoints:
 *   GET  /health              — health check (public)
 *   GET  /api/protocols       — list implemented protocols
 *   POST /api/sessions        — run a synthesis session (returns final result)
 *   POST /api/sessions/stream — run a synthesis session (SSE streaming)
 *   GET  /api/kg/query        — query the knowledge graph
 *   POST /api/kg/force-save   — force-persist KG to disk (bypass debounce)
 *   GET  /api/sessions/:id    — get session from KG
 *   GET  /api/stats           — platform statistics
 */

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';

import { getOrchestrator, runSynthesisSession } from '../src/platform/index.js';
import type { SessionStartInput, KGQuery } from '../src/platform/types.js';
import { forceSave as kgForceSave, getSnapshot as kgGetSnapshot } from '../src/knowledge-graph/index.js';
import { listImplementedProtocols } from '../src/specialist-agents/index.js';
import { requireApiKey } from './middleware/auth.js';

// ─── App setup ────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT ?? 3004;
const API_KEY = process.env.SYNTHESIS_API_KEY;

// CORS: restrict to known origins in production, allow all in dev (no key)
const corsOptions: cors.CorsOptions = API_KEY
  ? {
      origin: [
        `http://localhost:3007`, // dev UI
        `http://localhost:3005`, // audio frontend
      ],
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-API-Key', 'x-api-key'],
      exposedHeaders: ['X-Demo-Mode'],
    }
  : {};

// Note: cors applied per-route below for flexibility

// ─── Global middleware ───────────────────────────────────────────────────────
// NOTE: express.json must be registered BEFORE the /api prefix chain
// so it fires first (Express evaluates app.use in registration order for
// each request, not in depth-first prefix order).

app.use(express.json());

// CORS preflight handler — must precede requireApiKey so OPTIONS requests
// don't get rejected for missing API key (browsers don't send auth headers on preflight)
function corsPreflightHandler(req: Request, res: Response, next: NextFunction) {
  cors(corsOptions)(req, res, () => next());
}

// CORS: applied per-route so we can pair with auth middleware
app.use('/health', cors());
app.use('/api', corsPreflightHandler, requireApiKey());

// ─── Helpers ─────────────────────────────────────────────────────────────────

function asyncHandler(
  fn: (req: Request, res: Response) => Promise<void>,
) {
  return (req: Request, res: Response) => {
    fn(req, res).catch((err: unknown) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err instanceof Error ? err.message : String(err),
      });
    });
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/** GET /health */
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'synthesis-platform', timestamp: new Date().toISOString() });
});

/** GET /api/protocols — list all implemented protocols */
app.get('/api/protocols', (_req: Request, res: Response) => {
  const protocols = listImplementedProtocols();
  const orchestrator = getOrchestrator();
  const protocolStats = orchestrator.getProtocolStats();

  res.json({
    protocols,
    usageCounts: protocolStats,
  });
});

/**
 * POST /api/sessions — run a synthesis session (blocking, returns final result)
 *
 * Body: SessionStartInput (rawInput required, everything else optional)
 */
app.post(
  '/api/sessions',
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as Partial<SessionStartInput>;

    if (!body.rawInput || typeof body.rawInput !== 'string') {
      res.status(400).json({ error: 'rawInput (string) is required' });
      return;
    }

    if (!body.userId || typeof body.userId !== 'string') {
      res.status(400).json({ error: 'userId (string) is required' });
      return;
    }

    const input: SessionStartInput = {
      rawInput: body.rawInput,
      userId: body.userId,
      sessionId: body.sessionId ?? randomUUID(),
      modality: body.modality ?? 'text',
      detectedEmotion: body.detectedEmotion,
      recentProtocols: body.recentProtocols,
      timeOfDay: body.timeOfDay,
      recordToKG: body.recordToKG ?? true,
      recordContribution: body.recordContribution ?? true,
      priorSessionSummary: body.priorSessionSummary,
    };

    const result = await runSynthesisSession(input);

    res.json({
      sessionId: result.sessionId,
      protocol: result.protocol,
      eventCount: result.eventCount,
      startedAt: result.startedAt,
      completedAt: result.completedAt,
      kgSessionNodeId: result.kgSessionNodeId,
      contributionId: result.contributionId,
      events: result.events,
    });
  }),
);

/**
 * POST /api/sessions/stream — run a synthesis session with SSE streaming
 *
 * Body: SessionStartInput (same as /api/sessions)
 * Response: text/event-stream
 *
 * Each event is sent as:
 *   event: session-event
 *   data: {JSON}
 *
 * Completion event:
 *   event: session-complete
 *   data: {JSON of final SessionResult}
 */
app.post(
  '/api/sessions/stream',
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as Partial<SessionStartInput>;

    if (!body.rawInput || typeof body.rawInput !== 'string') {
      res.status(400).json({ error: 'rawInput (string) is required' });
      return;
    }

    if (!body.userId || typeof body.userId !== 'string') {
      res.status(400).json({ error: 'userId (string) is required' });
      return;
    }

    const input: SessionStartInput = {
      rawInput: body.rawInput,
      userId: body.userId,
      sessionId: body.sessionId ?? randomUUID(),
      modality: body.modality ?? 'text',
      detectedEmotion: body.detectedEmotion,
      recentProtocols: body.recentProtocols,
      timeOfDay: body.timeOfDay,
      recordToKG: body.recordToKG ?? true,
      recordContribution: body.recordContribution ?? true,
      priorSessionSummary: body.priorSessionSummary,
    };

    const orchestrator = getOrchestrator();

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering if behind proxy
    res.flushHeaders();

    const sessionId = input.sessionId!;
    let streamedEventCount = 0;
    let streamedProtocol = 'general';

    try {
      // Stream events as they are produced
      for await (const event of orchestrator.streamSession(input)) {
        streamedEventCount++;
        streamedProtocol = event.protocol ?? streamedProtocol;
        res.write(`event: session-event\ndata: ${JSON.stringify(event)}\n\n`);
      }

      // Send completion with final stats
      const sessionNodeId = orchestrator.getSession(sessionId)?.id;
      res.write(
        `event: session-complete\ndata: ${JSON.stringify({ sessionId, kgSessionNodeId: sessionNodeId, eventCount: streamedEventCount, protocol: streamedProtocol })}\n\n`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
    } finally {
      res.end();
    }
  }),
);

/**
 * GET /api/kg/query — query the knowledge graph
 *
 * Query params:
 *   type       — node type filter (optional)
 *   tags       — comma-separated tag filter (optional)
 *   limit      — max results (default 20)
 */
app.get('/api/kg/query', (req: Request, res: Response) => {
  const { type, tags, limit } = req.query;

  const query: KGQuery = {
    filters: {
      type: type as KGQuery['filters']['type'],
      tags: tags ? (tags as string).split(',') : undefined,
    },
    limit: limit ? parseInt(String(limit), 10) : 20,
  };

  const orchestrator = getOrchestrator();
  const result = orchestrator.queryKG(query);

  res.json({
    nodes: result.nodes,
    edges: result.edges,
    total: result.nodes.length,
  });
});

/**
 * GET /api/sessions/:sessionId — get a session from the KG
 */
app.get('/api/sessions/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const orchestrator = getOrchestrator();
  const sessionNode = orchestrator.getSession(sessionId);

  if (!sessionNode) {
    res.status(404).json({ error: `Session "${sessionId}" not found in KG` });
    return;
  }

  res.json({ node: sessionNode });
});

/**
 * GET /api/stats — platform-wide statistics
 */
app.get('/api/stats', (_req: Request, res: Response) => {
  const orchestrator = getOrchestrator();
  const stats = orchestrator.getStats();

  res.json(stats);
});

/**
 * POST /api/kg/force-save — force-persist the in-memory KG to disk (bypasses debounce).
 * Useful for diagnostics and for ensuring session data survives server restarts.
 */
app.post('/api/kg/force-save', (_req: Request, res: Response) => {
  kgForceSave();
  const snap = kgGetSnapshot();
  res.json({
    saved: true,
    nodeCount: snap.nodes.length,
    edgeCount: snap.edges.length,
    savedAt: snap.savedAt,
    byType: snap.nodes.reduce<Record<string, number>>((acc, n) => {
      acc[n.type] = (acc[n.type] ?? 0) + 1;
      return acc;
    }, {}),
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`☀️  Synthesis Platform API`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Protocols: http://localhost:${PORT}/api/protocols`);
  console.log(`   Sessions: http://localhost:${PORT}/api/sessions`);
  console.log(`   Streaming: http://localhost:${PORT}/api/sessions/stream`);
  console.log(`   KG Query: http://localhost:${PORT}/api/kg/query`);
  console.log(`   Stats: http://localhost:${PORT}/api/stats`);
});
