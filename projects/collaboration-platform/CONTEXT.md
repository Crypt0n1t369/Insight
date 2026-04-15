# Credo Collaboration Platform — MVP RUNNING ✅

## What Is This?

Infrastructure for **distributed, pseudo-anonymous collaboration** where contributors earn credibility through value-based contributions. Ideas compete on merit, not reputation. Egoless representation via synthetic characters.

**Core bet:** bot-observed behavioral data produces richer capability profiles than CVs or self-assessments.

## Current Status (2026-03-31)

| Component | Status | Notes |
|-----------|--------|-------|
| API Server | ✅ RUNNING | Port 3000 |
| Frontend | ✅ RUNNING | Port 3002 |
| Anonymous Users | ✅ WORKING | UUID-based, no auth required |
| Branches | ✅ WORKING | Create, list, view, fork, merge |
| Contributions | ✅ WORKING | Create, endorse, reply |
| Endorsement System | ✅ WORKING | Self-endorsement blocked |
| Proposals + Voting | ✅ WORKING | Quadratic voting |
| Integration Tests | ✅ 137/137 passing | End-to-end flows verified |
| Phase 2 E2E Tests | ⏳ PENDING | Not yet implemented |
| Paper Branch Pilot | ⏳ PENDING | Live testing with real users |

## Architecture

```
frontend (Next.js) → REST API (FastAPI) → SQLite DB
```

## API Endpoints (Port 3000)

### Authentication
- `POST /api/users` — Create anonymous user ✅
- `GET /api/users/:id` — Get user profile ✅

### Branches
- `POST /api/branches` — Create branch ✅
- `GET /api/branches/:id` — Get branch ✅

### Contributions
- `POST /api/contributions` — Add contribution ✅
- `DELETE /api/contributions/:id` — Delete (author only) ✅
- `POST /api/contributions/:id/endorse` — Endorse ✅
- `DELETE /api/contributions/:id/endorse` — Remove endorsement ✅

### Governance
- `POST /api/proposals` — Create proposal ✅
- `GET /api/proposals/:id` — Get proposal ✅
- `POST /api/proposals/:id/vote` — Cast vote (quadratic) ✅

## Trust Tiers

| Tier | Score | Description |
|------|-------|-------------|
| newcomer | 0–99 | Fresh user, no track record |
| contributor | 100–499 | Active participant |
| trusted | 500–1999 | Established contributor |
| elder | 2000+ | Highly credible, senior standing |

## Contribution Weights

| Type | Weight | Earned on Endorsement |
|------|--------|----------------------|
| synthesis | 5 | +5 to author |
| idea / resource | 3 | +3 to author |
| question | 2 | +2 to author |
| comment | 1 | +1 to author |

Endorser earns +1 credibility (encourages curation). Self-endorsement prohibited.

## Running Locally

```bash
cd projects/collaboration-platform

# Start API (port 3000)
uvicorn api.main:app --host 0.0.0.0 --port 3000

# Start Frontend (port 3002) — Next.js
cd frontend
npm run dev -- --port 3002
```

## Tests

```bash
cd projects/collaboration-platform
python -m pytest tests/ -v
# 137/137 passing ✅
```

**Last verified:** 2026-03-27

## Key Files

| File | Purpose |
|------|---------|
| `SPEC.md` | Full technical specification (architecture, API, GraphQL schema) |
| `api/main.py` | FastAPI application |
| `api/routes/` | REST endpoint handlers |
| `services/` | Business logic (identity, branch, contribution, governance) |
| `models/` | SQLAlchemy models |
| `tests/` | 137 integration tests |
| `frontend/` | Next.js application |

## Phase 0 Documents (Credo-specific)

| Document | Status | Purpose |
|----------|--------|---------|
| `SPEC.md` | ✅ COMPLETE | Full blueprint |
| `PAPER_BRANCH_PILOT.md` | ✅ COMPLETE | Paper-only contribution mode |
| `CONTEXT.md` | ✅ COMPLETE | This file |

## What's Next

| Priority | Action | Owner |
|----------|--------|-------|
| 🟡 P1 | Phase 2: E2E integration tests | Kristaps |
| 🟡 P1 | Paper Branch pilot (live testing) | Kristaps |
| 🟢 P2 | Supabase migration (from SQLite) | Kristaps |
| 🟢 P2 | Real-time via WebSocket | Kristaps |
| 🟢 P3 | Wallet connection auth | Future |

## References

- Full spec: `SPEC.md` — architecture, API design, GraphQL schema, acceptance criteria
- Contribution Graph (separate project): Related but different focus — behavioral profiling for opportunity matching

*Aton ☀️🦞 | Created: 2026-03-31*
