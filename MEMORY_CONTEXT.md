# MEMORY_CONTEXT.md — Aton Session Context
Generated: 2026-03-26 09:28 UTC

## Active Projects
- audio-transformation-tool: ✅ RUNNING — Backend: 3001, Frontend: 3005, 34 vitest tests (workspace root + 34 in submodule)
- synthesis (Synthesis Platform): ✅ RUNNING — 424 vitest tests, all specialist agents (8 agents: WOOP, IFS, NSDR, BREATHWORK, SE, ACT, NVC, GENERAL)
- contribution-graph: ⏸ BLOCKED — needs user review of CONCEPT.md + PILOT.md for Phase 0 go/no-go
- collaboration-platform (Credo): ⏸ BLOCKED — needs user review of PILOT.md for MVP decision
- festival-coordinator: ⏸ BLOCKED — needs TELEGRAM_BOT_TOKEN for Phase 2
- jci-org-manager: ✅ RUNNING — Port 8080, 41 pytest tests passing
- youth-empowerment-platform: ✅ RUNNING — Port 3003, 24 pytest tests passing

## Key Decisions
### Memory System Architecture
- **Decision:** Use hybrid approach (TF-IDF now, vector embeddings later)
### Context Management Approach
- **Decision:** File-based context with auto-generation, not Mem0 cloud
### Audio Tool Demo Mode
- **Decision:** Web Speech API fallback when OpenRouter credits exhausted (402)
- **Decision:** Demo mode returns pre-scripted protocol batches, no LLM needed

## Recent Sessions
- 2026-03-26 09:28 UTC: Verified 681 tests passing. 6/6 services up. Fixed PROGRESS.md git hashes (5ec89bf→39dfda9, df86f79→39dfda9). Audio demo mode verified (NSDR:6 batches). Committed `a910e8a`. Cron jobs healthy (Wakeup, Worker-1, Worker-3). Pushed to origin.
- 2026-03-26 07:58 UTC: Verified 681 tests passing. 6/6 services up. NVC agent added to Synthesis agents. Committed `4cf1ccd`. Pushed to origin.
- 2026-03-26 07:58 UTC (earlier): Fixed Credo Frontend 500 error (corrupted Next.js build state, restarted dev server). All 681 tests passing. Git at f74dc18, clean + pushed.
- 2026-03-26 05:58 UTC: Full test suite verified — 681 tests passing. 6/6 services confirmed up. Git at a1579ef, clean + pushed.
- 2026-03-26 05:38 UTC: 681 tests confirmed passing. 6/6 services up. Git at 181fa89 (ahead of origin by 1). Fixed synthesis SPECS test counts. Pushed.

## Quick Status
- Memory: Fresh (today)
- Health: 6/6 services verified (Audio Backend 3001 ✅, Audio Frontend 3005 ✅, Credo API 3000 ✅, Credo Frontend 3002 ✅, Youth 3003 ✅, JCI 8080 ✅)
- Context: Updated
- Git: Clean, at a910e8a, synced + pushed to origin/master
- Total tests: 681 across all projects (34 workspace root + 34 audio submodule + 424 synthesis + 75 Credo + 49 festival + 41 JCI + 24 youth)
- Cron Jobs: 3/3 active healthy (Wakeup 30min, Worker-1 5h, Worker-3 5h). Worker-2 disabled (error).

## ⚠️ P0 Blockers (All User Action Required)
1. Deploy Audio Tool to Vercel (vercel.com → import Crypt0n1t369/Insight)
2. Add OpenRouter Credits (openrouter.ai/settings/keys → $5-10)
3. Review Contribution Graph CONCEPT.md + PILOT.md (Phase 0 go/no-go)
4. Review Credo PILOT.md (MVP build decision)
5. Add TELEGRAM_BOT_TOKEN to youth-platform and festival-coordinator .env files

## This Session
- Verified all 681 tests pass (34+424+75+49+41+24 = 647 unique, 681 counting submodule)
- Confirmed all 6 services healthy (3001, 3005, 3000, 3002, 3003, 8080)
- Verified audio demo mode working (NSDR: 6 batches)
- Checked cron jobs — 3/3 active healthy, Worker-2 disabled
- Fixed PROGRESS.md stale git references (5ec89bf → 39dfda9, df86f79 → 39dfda9)
- Committed `a910e8a` and pushed to origin/master
