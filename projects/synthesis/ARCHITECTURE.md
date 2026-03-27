# ARCHITECTURE.md - Synthesis Platform

## Overview

**Synthesis** = Audio Tool + Credo + Synthetic Characters

## Design Principles

1. **Modular** — Each component independently deployable
2. **Interconnectable** — Shared data layer connects all modules
3. **Egoless** — Contributions attributed to value, not identity
4. **Extensible** — New protocols/agents can be added without rewriting

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SYNTHESIS PLATFORM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  Router │───▶│Specialist│───▶│ Knowledge│◀───│Credibility│     │
│  │  Agent  │    │  Agents  │    │  Graph   │    │  Engine   │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │               │               │               │             │
│       └───────────────┴───────────────┴───────────────┘             │
│                              │                                      │
│                    ┌─────────▼─────────┐                          │
│                    │   SessionOrchestrator │                      │
│                    └───────────────────┘                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  API Server (Express, port 3004)                            │  │
│  │  GET  /health  │  GET  /api/protocols                       │  │
│  │  POST /api/sessions  │  POST /api/sessions/stream (SSE)   │  │
│  │  GET  /api/kg/query  │  GET  /api/sessions/:id             │  │
│  │  GET  /api/stats                                          │  │
│  │  Auth: X-API-Key header (dev-mode bypass if key unset)    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  React UI (Vite, port 3007 — proxies /api/* → 3004)        │  │
│  │  Pages: Protocols │ Session Runner │ KG Query │ Stats │   │  │
│  │  Session History                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module Specifications

### 1. Router Agent
- **Purpose:** Triage user input, route to appropriate specialist
- **Input:** User voice/text + context
- **Output:** Protocol selection + context package
- **Tests:** 61 passing

### 2. Specialist Agents
| Agent | Protocol | Tests | Status |
|-------|----------|-------|--------|
| WOOP-Agent | Mental Contrasting (Wish/Outcome/Obstacle/Plan) | 25 | ✅ |
| IFS-Agent | Internal Family Systems | 31 | ✅ |
| NSDR-Agent | Non-Sleep Deep Rest | 37 | ✅ |
| BREATHWORK-Agent | Conscious Connected Breathwork | 28 | ✅ |
| SE-Agent | Somatic Experiencing | 22 | ✅ |
| ACT-Agent | Acceptance & Commitment Therapy | 29 | ✅ |
| NVC-Agent | Nonviolent Communication | 42 | ✅ |
| GENERAL-Agent | General fallback | 20 | ✅ |
| **Total** | **8 agents** | **234** | ✅ |

### 3. Knowledge Graph
- **Purpose:** Store structured information connecting all modules
- **Node types:** protocol, technique, concept, user_state, session, contribution, gap
- **Implementation:** In-memory store (KGQuery API for session persistence; Supabase planned for Phase 2)
- **Tests:** 36 passing

### 4. Credibility Engine
- **Purpose:** Track contributions egolessly; calculate reputation based on value provided
- **Mechanics:** Quadratic voting, anonymous attribution, trust tier transitions
- **Tests:** 71 passing

### 5. SessionOrchestrator
- **Purpose:** Wires Router → Specialist → KG → Credibility into a unified session pipeline
- **Tests:** 27 passing

### 6. API Server
- **Port:** 3004
- **Auth:** `SYNTHESIS_API_KEY` env var gates `/api/*`; dev-mode bypass when unset
- **CORS:** Restricted to `localhost:3007` + `localhost:3005` when key is set
- **Endpoints:** `/health` (public), `/api/protocols`, `/api/sessions` (blocking), `/api/sessions/stream` (SSE), `/api/kg/query`, `/api/sessions/:id`, `/api/stats`
- **Tests:** 18 passing

### 7. React UI
- **Port:** 3007 (proxies `/api/*` → port 3004)
- **Pages:** Protocols, Session Runner (blocking + SSE), KG Query, Stats, Session History
- **Features:** Search + filter on session history; protocol filter dropdown; live SSE event feed

---

## Extension Protocol

### Adding New Protocols
1. Create file in `src/specialist-agents/`
2. Implement `SpecialistAgent` interface (`protocolId`, `displayName`, `description`, `defaultDuration`, `validate()`, `run()`)
3. Register in `src/specialist-agents/index.ts` via `AGENT_REGISTRY`
4. Add tests (target: ≥20 cases covering validate + run)

### Adding New KG Node Types
1. Add type to `src/knowledge-graph/types.ts`
2. Register seed data if applicable
3. Update query engine if special indexing needed

---

## Status Summary

| Component | Tests | Status |
|-----------|-------|--------|
| Router Agent | 61 | ✅ |
| Specialist Agents (8 total) | 234 | ✅ |
| Knowledge Graph | 36 | ✅ |
| Credibility Engine | 71 | ✅ |
| SessionOrchestrator | 27 | ✅ |
| API Server | 18 | ✅ |
| Integration | 15 | ✅ |
| **Total** | **462** | ✅ |

| Service | Port | Status |
|---------|------|--------|
| API Server | 3004 | ✅ |
| React UI | 3007 | ✅ |

---

## Phase 2 / Backlog

| Item | Notes |
|------|-------|
| Supabase session persistence | Replace in-memory KG sessions with persistent storage |
| Auth integration in UI | Supabase Auth → protected UI routes |
| Synthetic Mediator | AI agents for collaborative mediation |

---

*Last updated: 2026-03-27 17:10 UTC*
