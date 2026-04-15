# Synthesis Platform — Phase 2: Supabase Schema Design

**Aton ☀️🦞 | 2026-03-31 | Design document — Phase 2 execution ready**

---

## Overview

Phase 2 replaces the in-memory Knowledge Graph and session store with persistent Supabase storage. This document is the implementation blueprint: complete table definitions, Row Level Security policies, Supabase Auth integration, and the migration path from the current in-memory implementation.

**Status:** Design complete — ready to implement once Supabase credentials are available.

---

## Design Principles

1. **Egoless by default** — `user_profiles.anonymous_id` is the public identity; real userId is never exposed in API responses
2. **Immutable event log** — `session_events` are append-only; sessions are closed (not deleted)
3. **RLS-first** — every table has Row Level Security; no application-layer auth gating
4. **Incremental migration** — in-memory KG used until Supabase is confirmed live; zero downtime switchover
5. **Same-shape as in-memory** — column names match TypeScript interface field names for minimal mapping code

---

## Database Schema

### 1. `public.users` — Supabase Auth extension

Supabase Auth manages authentication. This table extends `auth.users` with Synthesis-specific profile data.

```sql
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,

  -- Synthesis-specific fields
  display_name        text,
  preferred_protocol  text,  -- protocolId e.g. 'nsdr', 'ifs'
  preferred_duration  integer,  -- minutes
  avoid_protocols    text[],  -- text[] of protocolId
  last_active_at      timestamptz default now()
);

alter table public.users enable row level security;

-- Users can read/update their own row
create policy "users_read_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- New users get a row created automatically via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Anonymous'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

### 2. `public.sessions` — Synthesis session records

Replaces the in-memory session store in `SessionOrchestrator`.

```sql
create table public.sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  protocol            text not null,  -- protocolId e.g. 'nsdr'
  raw_input           text,
  modality            text not null default 'text',  -- 'voice' | 'text'
  detected_emotion    text,
  suggested_duration  integer,  -- minutes, router-suggested
  actual_duration_minutes integer,

  started_at          timestamptz default now() not null,
  completed_at        timestamptz,
  outcome             text check (outcome in ('completed', 'abandoned', 'interrupted')),

  -- KG reference (nodeId in the kg_nodes table)
  kg_session_node_id  uuid references public.kg_nodes(id),

  -- Credibility reference
  contribution_id     uuid references public.contributions(id),

  -- User rating (optional, filled after session)
  user_rating         integer check (user_rating between 1 and 5),

  -- SSE vs blocking
  streaming           boolean default false,

  created_at          timestamptz default now() not null
);

alter table public.sessions enable row level security;

-- Users can read their own sessions; admins can read all
create policy "sessions_read_own"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "sessions_insert_own"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "sessions_update_own"
  on public.sessions for update
  using (auth.uid() = user_id);

-- Indexes for common query patterns
create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_protocol_idx on public.sessions(protocol);
create index sessions_started_at_idx on public.sessions(started_at desc);
```

---

### 3. `public.session_events` — Append-only event log

Each session emits a stream of events (guidance, prompt, transition, completion). This table is append-only — events are never updated or deleted.

```sql
create table public.session_events (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.sessions(id) on delete cascade,
  event_index   integer not null,  -- ordinal position in session stream

  type          text not null check (type in ('guidance', 'prompt', 'transition', 'completion')),
  phase         text not null,  -- human-readable phase name
  transcript    text,           -- what to say (TTS fallback)
  audio_url     text,           -- pre-generated audio clip URL (future)
  duration_secs integer,        -- expected duration of this event

  -- Flexible metadata (JSONB for protocol-specific extra data)
  metadata      jsonb default '{}',

  created_at    timestamptz default now() not null
);

alter table public.session_events enable row level security;

-- Events readable if the parent session is readable
create policy "events_read_via_session"
  on public.session_events for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "events_insert_via_session"
  on public.session_events for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- Indexes
create index session_events_session_id_idx on public.session_events(session_id);
create index session_events_session_index_idx on public.session_events(session_id, event_index);
```

---

### 4. `public.kg_nodes` — Knowledge Graph nodes

Replaces `src/knowledge-graph/types.ts` → `KGNode`. Maps 1:1 with the TypeScript interface.

```sql
create table public.kg_nodes (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in (
    'protocol', 'technique', 'concept', 'user',
    'session', 'contribution', 'gap', 'resource'
  )),
  name        text not null,
  description text not null default '',
  tags        text[] default '{}',
  status      text not null default 'sketch'
                check (status in ('sketch', 'developing', 'mature')),

  -- Metadata JSONB — mirrors Record<string, unknown> from TypeScript
  metadata    jsonb default '{}',

  -- Ownership (nullable for system-seeded nodes)
  owner_id    uuid references public.users(id) on delete set null,

  -- Timestamps
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

alter table public.kg_nodes enable row level security;

-- System nodes (no owner) readable by everyone authenticated
create policy "kg_nodes_read_all_auth"
  on public.kg_nodes for select
  to authenticated
  using (owner_id is null or owner_id = auth.uid());

create policy "kg_nodes_insert_auth"
  on public.kg_nodes for insert
  to authenticated
  with check (owner_id = auth.uid() or owner_id is null);

create policy "kg_nodes_update_own"
  on public.kg_nodes for update
  using (owner_id = auth.uid());

-- Allow system updates (service role key) to update any node
-- (handled by Supabase service_role, not RLS bypass)

-- Indexes
create index kg_nodes_type_idx on public.kg_nodes(type);
create index kg_nodes_tags_idx on public.kg_nodes using gin(tags);
create index kg_nodes_status_idx on public.kg_nodes(status);
create index kg_nodes_owner_idx on public.kg_nodes(owner_id);
create index kg_nodes_name_idx on public.kg_nodes using gin(to_tsvector('english', name)));
```

---

### 5. `public.kg_edges` — Knowledge Graph edges

Replaces `src/knowledge-graph/types.ts` → `KGEdge`.

```sql
create table public.kg_edges (
  id        uuid primary key default gen_random_uuid(),
  from_node uuid not null references public.kg_nodes(id) on delete cascade,
  to_node   uuid not null references public.kg_nodes(id) on delete cascade,
  type      text not null check (type in (
    'uses_technique', 'based_on_concept', 'requires_resource',
    'related_to', 'contributed_by', 'succeeded_in',
    'struggled_in', 'gap_in'
  )),
  weight    float not null default 1.0 check (weight between 0.0 and 1.0),
  metadata  jsonb default '{}',

  created_at timestamptz default now() not null,

  -- Prevent duplicate edges
  unique (from_node, to_node, type)
);

alter table public.kg_edges enable row level security;

create policy "kg_edges_read_all_auth"
  on public.kg_edges for select
  to authenticated;

create policy "kg_edges_insert_auth"
  on public.kg_edges for insert
  to authenticated
  with check (
    exists (select 1 from public.kg_nodes where id = from_node and (owner_id = auth.uid() or owner_id is null))
    and exists (select 1 from public.kg_nodes where id = to_node and (owner_id = auth.uid() or owner_id is null))
  );

-- Indexes
create index kg_edges_from_idx on public.kg_edges(from_node);
create index kg_edges_to_idx on public.kg_edges(to_node);
create index kg_edges_type_idx on public.kg_edges(type);
```

---

### 6. `public.contributions` — Credibility Engine contributions

Replaces in-memory `contributions` store in `src/credibility-engine/`.

```sql
create table public.contributions (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid references public.sessions(id) on delete set null,

  -- Egoless identity (not user_id — anonymous profile ID)
  anon_id       text not null,

  type          text not null,  -- 'session_completion', 'guidance', 'kg_contribution', etc.
  content       text,           -- what was contributed

  -- Scoring (mirrors CredibilityEngine calculateContributionScore)
  raw_score     float not null default 0,
  decay_factor  float not null default 1.0,
  final_score   float not null default 0,

  -- Citation tracking
  citation_count integer not null default 0,

  -- Metadata
  metadata      jsonb default '{}',

  created_at    timestamptz default now() not null
);

alter table public.contributions enable row level security;

-- Contributions readable by all authenticated users (egoless)
create policy "contributions_read_all_auth"
  on public.contributions for select
  to authenticated;

create policy "contributions_insert_auth"
  on public.contributions for insert
  to authenticated
  with check (anon_id is not null);  -- anon_id validated in application layer

-- Indexes
create index contributions_anon_id_idx on public.contributions(anon_id);
create index contributions_type_idx on public.contributions(type);
create index contributions_score_idx on public.contributions(final_score desc);
create index contributions_created_at_idx on public.contributions(created_at desc);
```

---

### 7. `public.votes` — Quadratic voting on contributions

```sql
create table public.votes (
  id              uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions(id) on delete cascade,

  -- Who voted (anonymous profile ID, not real userId)
  voter_anon_id  text not null,

  -- Quadratic cost tracking
  weight          integer not null check (weight between 1 and 10),
  cost            integer not null,  -- quadratic cost: weight^2

  direction       text not null check (direction in ('up', 'down')),

  created_at      timestamptz default now() not null,

  -- One vote per voter per contribution
  unique (contribution_id, voter_anon_id)
);

alter table public.votes enable row level security;

create policy "votes_read_all_auth"
  on public.votes for select
  to authenticated;

create policy "votes_insert_auth"
  on public.votes for insert
  to authenticated
  with check (voter_anon_id is not null);

-- Indexes
create index votes_contribution_id_idx on public.votes(contribution_id);
create index votes_voter_idx on public.votes(voter_anon_id);
```

---

### 8. `public.anonymous_profiles` — Egoless credibility profiles

Mirrors `src/credibility-engine/credibility-engine.ts` → `AnonymousProfile`.

```sql
create table public.anonymous_profiles (
  anon_id          text primary key,  -- e.g. 'anon_k3x9m'
  display_cipher   text not null,    -- e.g. '🦞 Crimson Kestrel'
  real_user_id     uuid references public.users(id) on delete cascade,

  -- Scoring fields (mirrors CredibilityEngine profile)
  credibility_score float not null default 0,
  contribution_count integer not null default 0,
  vote_balance       integer not null default 0,

  -- Rank (computed periodically, can be cached)
  percentile         float,

  last_active_at    timestamptz default now(),
  created_at         timestamptz default now() not null
);

alter table public.anonymous_profiles enable row level security;

-- Anyone authenticated can read profiles (egoless)
create policy "profiles_read_all_auth"
  on public.anonymous_profiles for select
  to authenticated;

create policy "profiles_insert_own"
  on public.anonymous_profiles for insert
  to authenticated
  with check (real_user_id = auth.uid());

create policy "profiles_update_own"
  on public.anonymous_profiles for update
  using (real_user_id = auth.uid());

-- Indexes
create index anonymous_profiles_score_idx on public.anonymous_profiles(credibility_score desc);
create index anonymous_profiles_user_idx on public.anonymous_profiles(real_user_id);
```

---

## KG Query API — Supabase Implementation

The current in-memory `KGQuery` interface is preserved. A Supabase wrapper implements the same interface:

```typescript
// src/knowledge-graph/supabase-kg.ts

interface SupabaseKGQuery {
  filters?: {
    type?: NodeType | NodeType[];
    tags?: string[];
    status?: NodeStatus;
    ids?: string[];
  };
  traverse?: {
    from: string;          // node ID
    edgeTypes?: EdgeType[];
    depth?: number;        // default 2
    direction?: 'outbound' | 'inbound' | 'both';
  };
  fullText?: string;
  limit?: number;
}

// Traverse query: recursive CTE for graph traversal
const traverseQuery = `
with recursive kg_traverse as (
  -- Base case: starting node
  select
    n.id, n.type, n.name, n.description, n.tags, n.status, n.metadata,
    n.created_at, n.updated_at,
    1 as depth,
    array[n.id] as path
  from kg_nodes n
  where n.id = $1  -- from_node UUID

  union all

  -- Recursive case: follow edges
  select
    n.id, n.type, n.name, n.description, n.tags, n.status, n.metadata,
    n.created_at, n.updated_at,
    t.depth + 1,
    t.path || n.id
  from kg_nodes n
  join kg_edges e on
    case t.direction
      when 'outbound' then e.from_node = t.id
      when 'inbound'  then e.to_node = t.id
      else (e.from_node = t.id or e.to_node = t.id)
    end
    and e.type = any($2)  -- edgeTypes
  where
    t.depth < $3  -- max depth
    and n.id != all(t.path)  -- no cycles
    and n.id = case t.direction when 'outbound' then e.to_node when 'inbound' then e.from_node else n.id end
)
select * from kg_traverse;
`;
```

---

## Auth Integration

### Supabase Auth — UI Flow

1. **Sign up / Sign in** via Supabase Auth (email + password, or OAuth)
2. On successful session, `supabase.auth.getSession()` returns `access_token`
3. All API requests include `Authorization: Bearer <access_token>`
4. API server validates token via Supabase `getUser(token)` on each request
5. `userId` in all internal types maps to `auth.users.id`

### Auth Middleware (API Server)

```typescript
// server/middleware/supabase-auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // server-side only
  { auth: { persistSession: false } }
);

export async function requireSupabaseAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = header.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  (req as any).user = user;
  next();
}
```

### Protected UI Routes

In React UI (Vite), add route guards:

```typescript
// ui/src/components/ProtectedRoute.tsx
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <Navigate to="/login" />;
  return children;
}
```

---

## Migration Path (Zero-Downtime)

```
Phase 2, Step 1 (today):
  - Create Supabase project
  - Run this schema (SQL editor)
  - Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in server .env
  - No code changes yet

Phase 2, Step 2 (kg-storage adapter):
  - Implement KGStorageAdapter interface (same as in-memory KG)
    - getSnapshot() → KGStorageSnapshot
    - save(node/edge) → void (with 5s debounce)
  - Add Supabase adapter alongside in-memory adapter
  - Feature flag: if SUPABASE_URL set → use Supabase, else in-memory
  - No downtime; in-memory still default

Phase 2, Step 3 (sessions + events):
  - Implement SessionStorageAdapter
  - Stream events to public.session_events in real-time via SSE
  - session_events table populates as sessions run

Phase 2, Step 4 (auth gate):
  - Remove SYNTHESIS_API_KEY
  - Replace with Supabase Auth middleware
  - VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in UI
  - Protected routes in React UI

Phase 2, Step 5 (kg read path):
  - Migrate existing in-memory KG seed data to kg_nodes + kg_edges
  - One-time migration script (supabase(storage=KGStorageSnapshot))
```

---

## Environment Variables

```bash
# Server (.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # never expose to client
SUPABASE_ANON_KEY=eyJ...          # safe for client (RLS enforced)

# Deprecated (remove after Phase 2, Step 4)
# SYNTHESIS_API_KEY=...           # replaced by Supabase Auth

# UI (.env.local)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Testing Plan

| Test | Description | Pass Criteria |
|------|-------------|---------------|
| Auth flow | Sign up → sign in → protected route | Token issued; 401 without token |
| Session create | POST /api/sessions with valid auth | Session row in DB; events stream to `session_events` |
| Session query | GET /api/sessions/:id | Returns session + events from DB |
| KG CRUD | Add node → query by type/tag | Node appears in `kg_nodes`; queryable |
| KG traverse | Query from node, depth=2 | Returns 2-hop subgraph |
| RLS enforcement | User A's session not visible to User B | 403 on cross-user read |
| Migration | Existing in-memory KG → Supabase | All nodes + edges migrated; queries return same results |
| SSE streaming | Session events stream in real-time | Events arrive within 100ms; `session_events` rows match |

---

## What's Needed to Start

| Item | Owner | Status |
|------|-------|--------|
| Supabase account + project | Kristaps | ⏳ Needed |
| SUPABASE_URL | Kristaps | ⏳ Needed |
| SUPABASE_SERVICE_ROLE_KEY | Kristaps | ⏳ Needed |
| SUPABASE_ANON_KEY | Kristaps | ⏳ Needed |
| Schema creation (SQL editor) | Engineering | ✅ Design ready |
| KGStorageAdapter implementation | Engineering | ⏳ Blocked on credentials |
| SessionStorageAdapter implementation | Engineering | ⏳ Blocked on credentials |
| Auth middleware | Engineering | ⏳ Blocked on credentials |
| UI auth integration | Engineering | ⏳ Blocked on credentials |

---

*Aton ☀️🦞 | Schema design complete — 2026-03-31 10:56 UTC*
