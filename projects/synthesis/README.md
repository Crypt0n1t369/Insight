# Synthesis Platform — Wellness Protocol Orchestration

## What Is This?

Unified wellness platform that routes users to specialized AI agents (therapists, coaches) based on their stated needs — then runs structured sessions backed by a knowledge graph and credibility tracking.

**Core architecture:** Router Agent → Specialist Agent → Knowledge Graph → Credibility Engine

## Current Status (2026-03-31)

| Component | Status | Tests | Notes |
|-----------|--------|-------|-------|
| API Server | ✅ RUNNING | 18 | Port 3004 |
| React UI | ✅ RUNNING | — | Port 3007 |
| 8 Specialist Agents | ✅ COMPLETE | 234 | WOOP, IFS, NSDR, BREATHWORK, SE, ACT, NVC, GENERAL |
| Knowledge Graph | ✅ COMPLETE | 36 | In-memory + KGQuery API |
| Credibility Engine | ✅ COMPLETE | 71 | Quadratic voting, trust tiers |
| SessionOrchestrator | ✅ COMPLETE | 27 | SSE streaming, session persistence |
| Integration Tests | ✅ COMPLETE | 15 | Full pipeline |
| **Total** | | **460** | ✅ |

## Specialist Agents

| Agent | Protocol | Tests |
|-------|----------|-------|
| WOOP-Agent | Mental Contrasting (Wish/Outcome/Obstacle/Plan) | 25 |
| IFS-Agent | Internal Family Systems | 31 |
| NSDR-Agent | Non-Sleep Deep Rest | 37 |
| BREATHWORK-Agent | Conscious Connected Breathwork | 28 |
| SE-Agent | Somatic Experiencing | 22 |
| ACT-Agent | Acceptance & Commitment Therapy | 29 |
| NVC-Agent | Nonviolent Communication | 42 |
| GENERAL-Agent | General fallback | 20 |

## Running

```bash
cd projects/synthesis

# API Server (port 3004)
node dist/server.js
# or: ts-node src/server.ts (dev)

# React UI (port 3007 — proxies /api/* → 3004)
cd ui && npm run dev
```

## API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /health` | No | Health check |
| `GET /api/protocols` | No | List all 8 protocols |
| `POST /api/sessions` | API Key | Create blocking session |
| `POST /api/sessions/stream` | API Key | SSE streaming session |
| `GET /api/kg/query` | API Key | Query knowledge graph |
| `GET /api/sessions/:id` | API Key | Get session by ID |
| `GET /api/stats` | API Key | Platform statistics |

Auth: `X-API-Key` header. Dev mode bypasses auth when key is unset.
CORS: Restricted to localhost:3007 + localhost:3005.

## React UI Pages (Port 3007)

1. **Protocols** — Browse and select from 8 specialist agents
2. **Session Runner** — Run a session (blocking or SSE streaming)
3. **KG Query** — Query the knowledge graph directly
4. **Stats** — Platform usage statistics
5. **Session History** — Past sessions with search + filter

## Architecture

```
User → React UI (3007) → API Server (3004) → Router Agent
                                              ↓
                                       Specialist Agent (1 of 8)
                                              ↓
                              ┌───────────────┼───────────────┐
                              ↓               ↓               ↓
                        Knowledge       Session          Credibility
                          Graph        Orchestrator       Engine
```

Full architecture diagram: `ARCHITECTURE.md`

## Phase 2 Backlog

| Item | Notes |
|------|-------|
| Supabase session persistence | Replace in-memory KG with persistent storage |
| Auth integration in UI | Supabase Auth → protected routes |
| Synthetic Mediator | AI for collaborative mediation |

## Reference

- Full architecture: `ARCHITECTURE.md`
- Shared with: Audio Transformation Tool (overlapping wellness protocols)

*Aton ☀️🦞 | Created: 2026-03-31*
