# MEMORY_CONTEXT.md — Session Context 2026-03-28

## Active Projects

### Solar Scout
- **Phase:** Outreach-ready — 15 validated companies (strict MX validation, 33.4 MW)
- **Location:** `/home/drg/.openclaw/workspace/solar-scout/`
- **Status:** 
  - `docs/leads_outreach_validated.csv` — 15 companies, confirmed MX-validated, strict MX validation ✅
  - `docs/email_drafts_validated.md` — 15 bilingual LV+EN email drafts ✅
  - `send_emails.py` — SMTP mail-merge sender (crash-resilient, per-email log) ✅
  - `docs/SEND_GUIDE.md` — Gmail/Mailgun/SendGrid setup guide ✅
  - Pipeline verified end-to-end: `regenerate_validated.py` → `generate_emails.py` → `send_emails.py --dry-run` ✅
  - ⚠️ 2026-03-28 FIX: 21 companies incorrectly in CSV without MX validation → corrected to 15
  - 10 Tier 2 companies have no MX record → cannot email them
- **Data:** 15 validated companies / 33.4 MW (+ 10 Tier 2, ~22 MW — no MX, cannot email)
- **Git:** `82f8e45` (solar-scout nested repo) ✅

### Contribution Graph (CG — Kristaps' Life Work)
- **Phase:** Phase 0 validation materials COMPLETE — ready for user review + execution
- **Location:** `/home/drg/.openclaw/workspace/projects/contribution-graph/`
- **Git:** `6841c08` (workspace)
- **Key files:**
  - `SPEC.md` — Phase 0 results template, Phase 1 build spec, technical arch
  - `TEST_01_INTERVIEW_SCRIPT.md` — 5-screen prototype, 6 Qs, screener, consent script ✅
  - `TEST_02_ATTRIBUTION_FAIRNESS.md` — task brief, claim template, attestation form, negotiation protocol, survey ✅
  - `TEST_03_FESTIVAL_TOP_OF_FUNNEL.md` — Typeform quiz (7 Qs, 4 archetypes), result card template, 7-day bot onboarding ✅
  - `TEST_04_CLIENT_READINESS.md` — 1-pager, conversation guide, outreach email, problem template ✅
  - `PILOT.md` — Phase 0 validation protocol (4 tests, go/no-go gates)
- **Build tests:** 110 pytest ✅
- **Web server:** Running on port 3006 ✅

### Audio Tool (Audio Transformation Tool)
- **Phase:** Operational (production)
- **Ports:** 3001 (backend), 3005 (frontend)
- **Workspace server tests:** 34 vitest tests passing ✅
- **Submodule tests:** 17 vitest tests passing ✅
- **Submodule:** `projects/audio-transformation-tool/code` — at `b9ff70b` (fork/main)
- **9 protocols:** NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE — all demo mode working
- **Known issue:** OpenRouter credits exhausted (402 → demo fallback)

### Credo Collaboration Platform
- **Phase:** Operational
- **Port:** 3000 (API)
- **Status:** 137 vitest tests passing ✅

### JCI Org Manager
- **Phase:** Operational | **Port:** 8080 | **Status:** 41 pytest tests passing ✅

### Youth Empowerment Platform
- **Phase:** Operational | **Port:** 3003 | **Status:** 24 pytest tests passing ✅

### Festival Coordinator
- **Phase:** Operational | **Status:** 140 pytest tests passing ✅

## Test Suite (Verified 2026-03-28 06:59 UTC)

| Project | Tests | Framework |
|---------|-------|-----------|
| Synthesis Platform (projects/synthesis/) | 495 | vitest |
| Workspace server (workspace/server/) | 34 | vitest |
| Festival Coordinator | 140 | pytest (venv) |
| Credo (collaboration-platform) | 137 | vitest |
| Contribution Graph | 110 | pytest |
| JCI Org Manager | 62 | pytest (LLM enhancement: 21 new tests) |
| Youth Empowerment Platform | 24 | pytest |
| Audio Backend (code/server/ — submodule) | 34 | vitest |
| **Total** | **1,036** | ✅ |

> Verified: 495 synthesis + 34 workspace + 140 festival + 137 credo + 110 CG + 62 JCI + 24 youth + 34 audio = 1,036 passing

## Service Status (2026-03-28 16:08 UTC)

All services healthy (verified via /health endpoints):
| Port | Service | Health |
|------|---------|--------|
| 3000 | Credo API | ✅ `{"status":"ok"}` |
| 3001 | Audio Backend | ✅ `{"status":"ok","openRouterLinked":true}` |
| 3003 | Youth Platform | ✅ `{"status":"ok"}` |
| 3004 | Synthesis API | ✅ (66 sessions, 82 KG nodes, 39 edges) |
| 3005 | Audio Frontend | ✅ (process running) |
| 3006 | CG Web | ✅ (process running) |
| 3007 | Synthesis UI | ✅ (process running) |
| 8080 | JCI Org Manager | ✅ (process running) |

> Note: 3000/3001 `/` returns 404 (no root route); `/health` returns 200 ✅

## Git

- **Workspace:** `44de3d1` — pushed to origin/master ✅
  - Latest: TypeScript bug fix in session-orchestrator.ts (recordToKG property name, duration field)
- **Solar Scout:** Pushed and synced (separate repo)

## Bugs Fixed This Session (2026-03-28)

### Synthesis Platform — 3 TypeScript Errors Fixed
- **File:** `projects/synthesis/src/platform/session-orchestrator.ts`
- **Bug 1 (line 189):** `input.recordToKg` → `input.recordToKG` (property doesn't exist on SessionStartInput)
- **Bug 2 (line 203):** `recordToKg: input.recordToKg !== false` → `recordToKG: input.recordToKG ?? true` (type narrowing issue)
- **Bug 3 (line 215):** `e.durationMs` → `e.duration` (SessionEvent uses `duration` in seconds, not milliseconds)
- **Tests:** 495/495 vitest pass after fix ✅
- **Commit:** `f088b4e`

## Synthesis Platform — Current State

**API Key Auth:** ✅ Added — `SYNTHESIS_API_KEY` env var gates `/api/*` routes; dev-mode bypass when unset.

**Pages (port 3007):** Protocols | Session Runner (blocking + SSE) | KG Query | Stats | History

**Next buildable (P2):** Supabase session persistence (requires user to set up Supabase project)

## What's Left (User Action Required)

| Priority | Item | Blocker |
|----------|------|---------|
| **P0** | **OpenRouter credits (~$5-10)** | openrouter.ai → add credits — key has ~3 token daily limit (free tier); AI features blocked until credits added |
| **P0** | **CG Test 0.1 — Review script + recruit** | Review `projects/contribution-graph/TEST_01_INTERVIEW_SCRIPT.md` + recruit 10–12 participants |
| **P0** | **CG Test 0.3 — Identify event** | Find 1 event in next 4–8 weeks |
| **P0** | **CG Test 0.4 — Identify orgs** | 5 target orgs for Phase 0 |
| **P1** | **Solar Scout SMTP** | Set SMTP env vars → `send_emails.py --dry-run-all` → `--test` → full send (15 companies, 33.4 MW) |
| **P1** | **CG Telegram bot token** | BotFather → new token → `TELEGRAM_BOT_TOKEN` for Phase 2 |
| **P1** | **Audio Tool → Vercel** | vercel.com → import + env vars |

## This Session (21:27 UTC)

- Verified all 8 services healthy ✅
- 462 synthesis tests pass ✅
- Cleaned orphaned synthesis processes (5 PIDs freed) ✅
- Consolidated PROGRESS.md with daily summary ✅
- Git pushed `518590f` ✅

## This Session (15:57 UTC — Wakeup)

- All 8 services verified healthy (3000/3001/3003/3004/3005/3006/3007/8080) ✅
- 1,036 tests verified passing ✅
- Git workspace clean → committed `1e10866` → pushed ✅
- Solar-scout nested git: clean at `0ee07b6`, pushed ✅
- No code issues found (no TODO/FIXME in workspace code) ✅
- Health check MINOR: `google-gemini-cli-auth` stale (OpenClaw system config, non-workspace) ✅
- All P0 items remain user-blocked ✅

## Today's Bugs Fixed (5 total)
1. Stats API shape mismatch (17:35 UTC) ✅
2. Synthesis stats test regression (18:07 UTC) ✅
3. KG query edge consistency (18:40 UTC) ✅
4. topContributors always empty (20:07 UTC) ✅
5. Solar-scout docstring (19:05 UTC) ✅
