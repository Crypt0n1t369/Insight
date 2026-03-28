=== ATON CONTEXT ===
Generated: 2026-03-29 00:27 UTC (wakeup cron session)

## Active Projects

### audio-transformation-tool
- **Status:** Active (verified 2026-03-29)
- **Backend:** Running on port 3001, 10 protocols (NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE, GENERAL)
- **Demo mode:** Working — clinically-grounded scripts for all 10 protocols
- **OpenRouter:** Linked (demo mode, no credits spent)
- **Frontend:** Running on port 3005 (Vite preview)
- **Tests:** 34 vitest passing (workspace/server/)
- **Deployment:** DEPLOYMENT.md written — Vercel + Supabase ready

### synthesis (Knowledge Graph Platform)
- **Status:** Active (verified 2026-03-29)
- **API:** Running on port 3004
- **KG persistence:** Fixed — autosave (60s interval) + forceSave endpoint working
- **KGDatabaseAdapter:** Wired to orchestrator, Supabase stub ready
- **Supabase schema:** Drafted at docs/SUPABASE_SCHEMA.md
- **Tests:** 495 vitest passing
- **KG live:** 102 nodes, 48 edges, 86 sessions (verified 2026-03-29)

### Solar Scout (Latvia Commercial Solar Outreach)
- **Status:** Active — outreach pipeline ready to fire
- **Validated:** 15 companies / 33.4 MW (MX-validated, SMTP-ready)
- **Tier 2:** 10 companies / ~22 MW (no MX, needs Lursoft lookup)
- **SMTP flag:** `--smtp-check` added — pre-flight validation
- **Git:** Nested repo at solar-scout/, workspace synced

### Credo Collaboration Platform
- **Status:** Active
- **API:** Running on port 3000
- **Tests:** 137 vitest passing
- **Auth:** RLS deferred, middleware wired

### Contribution Graph (CG)
- **Status:** Active
- **Web:** Running on port 3006
- **Tests:** 110 pytest passing (47 API + 24 Web + 39 Bot/DB)
- **Phase 0:** TEST_01 script written — awaiting user recruitment approval
- **Telegram bot:** Token needed (BotFather)

### JCI Org Manager
- **Status:** Active
- **Portal:** Running on port 8080
- **LLM Enhancement:** OpenRouter-powered engagement agent (21 new tests)
- **Tests:** 62 pytest passing

### Festival Coordinator
- **Status:** Active
- **Tests:** 140 pytest passing

### Youth Empowerment Platform
- **Status:** Active
- **Platform:** Running on port 3003
- **Tests:** 24 pytest passing

## Key Recent Decisions (2026-03-28/29)

| Date | Decision | Impact |
|------|----------|--------|
| 2026-03-28 | KGStorage autosave (60s) + forceSave endpoint | Sessions persist correctly |
| 2026-03-28 | forceSave() sets dirty=true before saveSync | Force-save now works post-restart |
| 2026-03-28 | Solar Scout --smtp-check flag | SMTP pre-flight validation |
| 2026-03-28 | Solar Scout 15→36 companies | Validated list expanded |
| 2026-03-28 | KGDatabaseAdapter wired to orchestrator | Supabase Phase 2 ready |
| 2026-03-28 | run_all_tests.sh created | No more pytest cache collisions |
| 2026-03-28 | Health check: 6→8 services, 3002 removed | Accurate service count |
| 2026-03-27 | Credo RLS deferred, auth middleware wired | Simpler Phase 1 |
| 2026-03-27 | JCI LLM Enhancement (OpenRouter) | Engagement agent active |
| 2026-03-27 | CG Conditional GO | Phase 0 approval gating |

## Quick Status
- **Memory:** Fresh (2026-03-29)
- **Health:** 17 checks passing (H11 WARN non-actionable)
- **Tests:** 1,002 passing (9 suites: 495 Synthesis + 137 Credo + 110 CG + 140 Festival + 62 JCI + 34 Audio + 24 Youth)
- **Services:** 8/8 healthy (ports 3000/3001/3003/3004/3005/3006/3007/8080)
- **Git:** Workspace clean except local MEMORY_CONTEXT.md change (this session)
- **Cron:** Wakeup + Worker-1 + Worker-3 all healthy (0 consecutive errors)

## P0 Blockers (All User Action Required)
| # | Item | Action Needed | Impact |
|---|------|---------------|--------|
| 1 | Solar Scout SMTP | Configure SMTP env vars | Fires 15 emails (33.4 MW) |
| 2 | OpenRouter credits | openrouter.ai → add $5–10 | Unblocks AI meditation |
| 3 | CG Test 0.1 | Review TEST_01_INTERVIEW_SCRIPT.md + recruit | Phase 0 go/no-go |
| 4 | CG Test 0.3 | Identify 1 event (4–8 wks out) | Phase 0 acquisition |
| 5 | CG Test 0.4 | Identify 5 target orgs | Phase 0 go/no-go |
| 6 | CG Telegram bot token | BotFather → new token | Phase 2 bot |
| 7 | Solar Scout Tier 2 | Lursoft.lv or +371 calls | ~22 MW more |
| 8 | Audio Tool → Vercel | vercel.com → import + env vars | Public URL + Telegram |
| 9 | Supabase persistence | supabase.com → create project | Phase 2 KG persistence |

## MEMORY_CONTEXT.md Recurring Degradation Issue
- **Problem:** System auto-regenerates MEMORY_CONTEXT.md with degraded content (~18 lines vs 93 lines). Happens every ~30 min.
- **Last fixed:** 2026-03-28 21:56 UTC (session `48d21e4`)
- **Root cause:** System's auto-generation on session start overwrites file with minimal content
- **Status:** This session restored again (4th degradation cycle — 2026-03-29 00:27 UTC)

## JCI RuntimeWarning — Cannot Fix (Submodule)
- `test_llm.py:232` RuntimeWarning: coroutine was never awaited
- 21 tests pass (62 total in JCI suite) — cosmetic only
- `projects/jci-org-manager/` is a git submodule — requires non-isolated session to fix

## Git Submodules
- `Perplexica/` — v1.12.1-5
- `projects/audio-transformation-tool/code` — heads/main
- `projects/jci-org-manager` — heads/festival-bot
- `solar-scout/` — nested git repo (workspace synced)
