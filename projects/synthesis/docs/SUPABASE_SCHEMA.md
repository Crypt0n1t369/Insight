# Supabase Session Persistence — Schema Design

**Status:** Draft — ready to implement once Supabase project is configured  
**Supersedes:** `src/knowledge-graph/storage.ts` (in-memory + JSON file) → Supabase PostgreSQL  
**Backward compatible:** `KGStorage` interface unchanged; only implementation swapped

---

## Why Supabase

| Before (JSON file) | After (Supabase) |
|---|---|
| Single-instance, file-locked | Multi-instance, concurrent reads |
| No querying, full-file load | Relational queries, pagination |
| No real-time subscriptions | Real-time session monitoring |
| No auth/gatekeeping | Row-level security per profile |

---

## Database Schema

```sql
-- ============================================================
-- Anonymous profiles (credibility engine)
-- ============================================================
CREATE TABLE public.profiles (
  id          TEXT PRIMARY KEY,  -- anon UUID, e.g. "anon_abc123"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata    JSONB DEFAULT '{}'
);

-- ============================================================
-- Synthesis sessions
-- ============================================================
CREATE TABLE public.sessions (
  id                  TEXT PRIMARY KEY,        -- UUID from orchestrator
  profile_id          TEXT REFERENCES public.profiles(id),
  protocol            TEXT NOT NULL,            -- 'woop', 'ifs', 'nsdr', etc.
  started_at          TIMESTAMPTZ NOT NULL,
  completed_at        TIMESTAMPTZ NOT NULL,
  event_count         INTEGER NOT NULL,
  confidence          REAL,                     -- router confidence 0–1
  routing_reasoning  TEXT,
  detected_emotion    TEXT,
  emotion_reasoning   TEXT,
  record_to_kg        BOOLEAN DEFAULT true,
  record_contribution BOOLEAN DEFAULT true,
  contribution_id     TEXT,                     -- FK to contributions.id
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_profile_id  ON public.sessions(profile_id);
CREATE INDEX idx_sessions_protocol    ON public.sessions(protocol);
CREATE INDEX idx_sessions_started_at  ON public.sessions(started_at DESC);

-- ============================================================
-- Session events (one row per event, replaces in-memory array)
-- ============================================================
CREATE TABLE public.session_events (
  id          SERIAL PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,         -- 'guidance' | 'prompt' | 'transition' | 'completion'
  phase       TEXT NOT NULL,
  audio_url   TEXT,
  transcript  TEXT,
  duration    REAL,                  -- seconds
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_events_session_id ON public.session_events(session_id);

-- ============================================================
-- Knowledge graph nodes (replaces in-memory Map)
-- ============================================================
CREATE TABLE public.kg_nodes (
  id          TEXT PRIMARY KEY,       -- e.g. "session-uuid", "protocol-woop"
  type        TEXT NOT NULL,          -- 'protocol' | 'technique' | 'concept' | 'session' | 'contribution' | 'gap' | 'resource' | 'user'
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'sketch',  -- 'sketch' | 'developing' | 'mature'
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kg_nodes_type     ON public.kg_nodes(type);
CREATE INDEX idx_kg_nodes_tags      ON public.kg_nodes USING gin(tags);
CREATE INDEX idx_kg_nodes_status   ON public.kg_nodes(status);

-- ============================================================
-- Knowledge graph edges
-- ============================================================
CREATE TABLE public.kg_edges (
  id          TEXT PRIMARY KEY,      -- e.g. "woop_uses_technique_visualization"
  from_node   TEXT NOT NULL REFERENCES public.kg_nodes(id) ON DELETE CASCADE,
  to_node     TEXT NOT NULL REFERENCES public.kg_nodes(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,          -- 'uses_technique' | 'based_on_concept' | 'related_to' | etc.
  weight      REAL NOT NULL DEFAULT 1.0,  -- 0.0–1.0
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kg_edges_from ON public.kg_edges(from_node);
CREATE INDEX idx_kg_edges_to   ON public.kg_edges(to_node);
CREATE UNIQUE INDEX idx_kg_edges_unique ON public.kg_edges(from_node, to_node, type);

-- ============================================================
-- Contributions (credibility engine)
-- ============================================================
CREATE TABLE public.contributions (
  id              TEXT PRIMARY KEY,
  profile_id      TEXT NOT NULL REFERENCES public.profiles(id),
  session_id      TEXT REFERENCES public.sessions(id),
  contribution_type TEXT NOT NULL,  -- 'session' | 'kg_edit' | 'vote' | etc.
  protocol        TEXT,
  event_count     INTEGER,
  confidence      REAL,
  points          INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contributions_profile_id ON public.contributions(profile_id);

-- ============================================================
-- Credibility scores (materialized for fast ranking)
-- ============================================================
CREATE TABLE public.credibility_scores (
  profile_id       TEXT PRIMARY KEY REFERENCES public.profiles(id),
  credibility_score REAL NOT NULL DEFAULT 0,
  tier             TEXT NOT NULL DEFAULT 'newcomer',  -- 'newcomer' | 'contributor' | 'expert' | 'elder'
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## TypeScript Interfaces (to replace in-memory types)

```typescript
// src/platform/database/types.ts  (new file)

export interface DBSession {
  id: string;
  profileId: string;
  protocol: string;
  startedAt: string;
  completedAt: string;
  eventCount: number;
  confidence: number;
  routingReasoning: string;
  detectedEmotion?: string;
  emotionReasoning?: string;
  recordToKg: boolean;
  recordContribution: boolean;
  contributionId?: string;
  createdAt: string;
}

export interface DBSessionEvent {
  id: number;
  sessionId: string;
  type: 'guidance' | 'prompt' | 'transition' | 'completion';
  phase: string;
  audioUrl?: string;
  transcript?: string;
  duration?: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface DBKGNode {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  tags: string[];
  status: NodeStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DBKGEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  weight: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface DBProfile {
  id: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface DBContribution {
  id: string;
  profileId: string;
  sessionId?: string;
  contributionType: string;
  protocol?: string;
  eventCount?: number;
  confidence?: number;
  points: number;
  createdAt: string;
}
```

---

## Storage Adapter Interface

```typescript
// src/knowledge-graph/database-storage.ts  (new file)

import type { KGNode, KGEdge, KGQuery, KGResult } from './types.js';
import type {
  DBSession, DBSessionEvent, DBKGNode, DBKGEdge,
  DBProfile, DBContribution
} from './database/types.js';

export interface KGDatabaseAdapter {
  // Node CRUD
  getNode(id: string): Promise<KGNode | undefined>;
  addNode(node: KGNode): Promise<void>;
  updateNode(id: string, patch: Partial<KGNode>): Promise<KGNode | undefined>;
  deleteNode(id: string): Promise<boolean>;
  getAllNodes(): Promise<KGNode[]>;
  queryNodes(q: KGQuery): Promise<KGResult>;

  // Edge CRUD
  getEdge(id: string): Promise<KGEdge | undefined>;
  addEdge(edge: KGEdge): Promise<void>;
  deleteEdge(id: string): Promise<boolean>;
  getAllEdges(): Promise<KGEdge[]>;

  // Session persistence
  saveSession(session: DBSession, events: DBSessionEvent[]): Promise<void>;
  getSession(id: string): Promise<(DBSession & { events: DBSessionEvent[] }) | undefined>;
  listSessions(profileId?: string, limit?: number): Promise<DBSession[]>;

  // Profiles
  getProfile(id: string): Promise<DBProfile | undefined>;
  upsertProfile(profile: DBProfile): Promise<void>;

  // Contributions
  saveContribution(c: DBContribution): Promise<void>;
  getContributionsByProfile(profileId: string): Promise<DBContribution[]>;

  // Credibility scores
  getCredibilityScore(profileId: string): Promise<{ score: number; tier: string } | undefined>;
  updateCredibilityScore(profileId: string, score: number, tier: string): Promise<void>;

  // Batch
  seed(nodes: KGNode[], edges: KGEdge[]): Promise<void>;
  stats(): Promise<{ nodes: number; edges: number; byType: Record<string, number> }>;
}
```

---

## Migration Plan

### Phase 1: Dual-write (backward compatible)
1. Add `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` env vars
2. `KGDatabaseAdapter` wraps existing `KGStorage` + writes to Supabase
3. JSON file remains source of truth; Supabase becomes read target
4. Existing tests pass unchanged

### Phase 2: Read from Supabase
1. Add `DATABASE_ADAPTER=supabase` env var
2. On startup, migrate JSON → Supabase (one-time `migrate-json-to-supabase.ts` script)
3. Swap `getStorage()` to return `SupabaseKGStorage` instance
4. Read path now goes through Supabase; write path dual-writes

### Phase 3: Full Supabase
1. Remove JSON file persistence
2. Enable Supabase Realtime for live session monitoring
3. Add Row-Level Security (profiles can only see their own sessions)

---

## Env Vars Required

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key  # server-side only
# Optional (for Phase 3 RLŠ):
# SUPABASE_ANON_KEY=your-anon-key            # client-side
```

---

## Status

- [x] Schema designed (this document)
- [ ] Supabase project created by user
- [ ] Schema applied (`supabase/schema.sql`)
- [x] Phase 1 adapter interface implemented (`src/knowledge-graph/database-storage.ts`)
- [x] Phase 1 tests written (33 tests — `__tests__/database-storage.test.ts`)
- [x] Orchestrator wired: `runSession()` calls `db.saveSession()` when Supabase is primary
- [ ] JSON → Supabase migration run (`scripts/migrate-json-to-supabase.ts`)
- [ ] Phase 1 deployed to production (requires user to create Supabase project)
- [ ] Phase 2/3 (future)

## Implementation Notes

**Phase 1 (KGDatabaseAdapter — shipped ✅):**
- `src/platform/database/types.ts` — DB-level TypeScript types
- `src/knowledge-graph/database-storage.ts` — `KGDatabaseAdapter` interface + `KGStoragePassthroughAdapter` (default) + `SupabaseKGStorage` (Phase 2)
- `getKGDatabase()` factory: activates Supabase only when `DATABASE_ADAPTER=supabase` env var is set
- When Supabase not configured: passthrough to existing JSON-file KGStorage (transparent, no behavior change)
- Orchestrator wired: `runSession()` calls `db.saveSession(dbSession, dbEvents)` after KG recording — only fires when Supabase is primary (safe no-op in JSON mode)
- Migration script: `scripts/migrate-json-to-supabase.ts` — bulk-upserts existing KG nodes/edges/sessions to Supabase (idempotent, one-time)

**To activate Supabase (Phase 2):**
1. User creates Supabase project at supabase.com
2. Apply schema: `supabase/schema.sql`
3. Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `DATABASE_ADAPTER=supabase`
4. Run migration: `SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx npx tsx scripts/migrate-json-to-supabase.ts` (one-time)

---

*Draft by Aton ☀️🦞 — 2026-03-28*
