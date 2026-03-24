# SPEC: Knowledge Graph

## Overview

The **Knowledge Graph** is the structured memory layer of the Synthesis platform. It stores protocols, user state, session history, and research knowledge — all queryable and linkable.

## Data Model

### Node Types

```typescript
type NodeType =
  | 'protocol'      // Therapeutic protocol (NSDR, IFS, etc.)
  | 'technique'     // Individual technique within a protocol
  | 'concept'       // Abstract concept (polyvagal, parts, etc.)
  | 'user'          // Anonymous user profile
  | 'session'       // A completed session
  | 'contribution'  // A user's contribution to knowledge base
  | 'gap'           // Identified knowledge gap
  | 'resource';    // External resource (paper, video, tool)
```

### Edge Types

```typescript
type EdgeType =
  | 'uses_technique'    // Protocol → Technique
  | 'based_on_concept'  // Protocol → Concept
  | 'requires_resource' // Protocol → Resource
  | 'related_to'        // Concept ↔ Concept
  | 'contributed_by'    // Node → User
  | 'succeeded_in'      // Session → Protocol (success indicator)
  | 'struggled_in'      // Session → Protocol (difficulty indicator)
  | 'gap_in';          // Gap → Protocol/Concept
```

### Core Schema

```typescript
interface KGNode {
  id: string;                    // e.g. 'protocol/nsdr'
  type: NodeType;
  name: string;
  description: string;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;             // ISO timestamp
  updatedAt: string;
}

interface KGEdge {
  id: string;
  from: string;                  // Node ID
  to: string;                   // Node ID
  type: EdgeType;
  weight?: number;              // 0.0–1.0, for weighted relationships
  metadata?: Record<string, unknown>;
}
```

## Knowledge Base Structure

```
knowledge/
├── protocols/
│   ├── nsdr.md
│   ├── ifs.md
│   ├── woop.md
│   ├── breathwork.md
│   ├── act.md
│   ├── nvc.md
│   └── se.md
├── neurobiology/
│   ├── polyvagal.md
│   ├── icover.md
│   ├── predictive-processing.md
│   └── scn-system.md
├── identity/
│   ├── first-order-change.md
│   ├── identity-flip.md
│   └── cybernetic-model.md
├── collaboration/
│   ├── credibility.md
│   ├── branching.md
│   ├── voting.md
│   └── zk-proofs.md
└── gaps/
    ├── dream-analysis.md
    ├── psychedelic-integration.md
    └── trauma-encoding.md
```

## Document Format

Every document follows this structure:

```markdown
---
id: protocol/nsdr
title: Non-Sleep Deep Rest
status: mature         # sketch | developing | mature
connections:
  - technique/body-scan
  - concept/polyvagal
  - resource/inserm-nder
tags:
  - rest
  - neurobiology
  - recovery
contributors:
  - synthesis-001
next-actions:
  - Add audio clips
  - Clinical trial data
---
```

## Query Interface

```typescript
interface KGQuery {
  filters?: {
    type?: NodeType | NodeType[];
    tags?: string[];
    status?: 'sketch' | 'developing' | 'mature';
  };
  traverse?: {
    from: string;
    edgeTypes: EdgeType[];
    depth?: number;           // default 2
  };
  fullText?: string;
}

interface KGResult {
  nodes: KGNode[];
  edges: KGEdge[];
  scores?: number[];           // relevance scores if fullText search
}
```

## Storage Backend

| Environment | Storage |
|-------------|---------|
| Local/Dev | SQLite via `better-sqlite3` |
| Production | Supabase PostgreSQL + pgvector |

### Supabase Schema (Production)

```sql
-- Nodes table
CREATE TABLE kg_nodes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'sketch',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Edges table
CREATE TABLE kg_edges (
  id TEXT PRIMARY KEY,
  "from" TEXT NOT NULL REFERENCES kg_nodes(id),
  "to" TEXT NOT NULL REFERENCES kg_nodes(id),
  type TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  UNIQUE("from", "to", type)
);

-- Full-text search
CREATE INDEX idx_nodes_fts ON kg_nodes USING GIN (to_tsvector('english', name || ' ' || description));

-- Vector embedding for semantic search (future)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE kg_embeddings (
  node_id TEXT PRIMARY KEY REFERENCES kg_nodes(id),
  embedding vector(1536)
);
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/kg/nodes | List/query nodes |
| GET | /api/kg/nodes/:id | Get node by ID |
| POST | /api/kg/nodes | Create node |
| PATCH | /api/kg/nodes/:id | Update node |
| GET | /api/kg/edges | List/query edges |
| POST | /api/kg/edges | Create edge |
| GET | /api/kg/search | Full-text + semantic search |
| GET | /api/kg/traverse | Graph traversal from node |

## Use Cases

1. **Session initialization** — Query protocol + related concepts before session
2. **Contributing users** — Add nodes/edges for new knowledge
3. **Recommendations** — "Users who did NSDR also explored IFS"
4. **Gap identification** — Which protocols lack clear mechanisms?

## Status

- [ ] SQLite implementation (dev)
- [ ] Supabase schema + API (prod)
- [ ] Protocol documents loaded
- [ ] Semantic search (pgvector) integration
- [ ] Frontend knowledge browser
