=== ATON CONTEXT ===
Generated: 2026-03-26 03:34 Cairo (01:34 UTC)

## Active Projects

### Audio Transformation Tool ✅ RUNNING (Demo Mode)
- **Location**: `projects/audio-transformation-tool/code/` (submodule at d348cd0)
- **Backend**: port 3001 (node tsx server/index.ts) — PID 3614527
- **Frontend**: port 5173 (npx serve dist/ - PRE-BUILT only) — PID 3251821
- **Tests**: 68/68 passing (vitest, 4 test files)
- **Demo Mode**: Fully operational, 9 protocols, Web Speech API fallback
- **Blocked**: User needs Vercel deploy + OpenRouter credits

### Credo Collaboration Platform ✅ RUNNING
- **Location**: `projects/collaboration-platform/`
- **API**: port 3000 — PID 3349828 (node dist/index.js)
- **Frontend**: port 3002 — PID 3251689 (next-server)
- **Tests**: 75/75 passing (vitest, 6 test files)

### Youth Empowerment Platform ✅ RUNNING
- **Location**: `projects/youth-empowerment-platform/`
- **Port**: 3003 — PID 3251734 (uvicorn)
- **Tests**: 24/24 passing (pytest)

### Synthesis Platform ✅ RUNNING
- **Location**: `projects/synthesis/` (same repo as workspace)
- **Tests**: 424/424 passing (vitest, 12 test files)
- **Specialist agents**: NSDR (37), IFS (31), BREATHWORK (28), WOOP (25), SE (22), ACT (29), GENERAL (fallback)

### JCI Org Manager ✅ RUNNING
- **Location**: `projects/jci-org-manager/` (submodule at 97aa1d0)
- **Port**: 8080 — PID 3251757 (python webapp/server.py)
- **Tests**: 41/41 passing (pytest)

### Festival Coordinator ✅ RUNNING
- **Location**: `projects/festival-coordinator/`
- **Tests**: 49/49 passing (pytest)
- **Phase 2**: Telegram bot ready; needs TELEGRAM_BOT_TOKEN

## Test Summary (Total: 715 Passing)
- Workspace root (server): 34 vitest
- Synthesis platform: 424 vitest
- Audio tool: 68 vitest
- Credo platform: 75 vitest
- Festival coordinator: 49 pytest
- JCI org manager: 41 pytest
- Youth platform: 24 pytest

## Key Decisions
- Memory System: Hybrid TF-IDF + file-based context (no Mem0 cloud)
- Audio Tool: Demo mode with Web Speech API fallback
- Frontend: Pre-built dist committed (source not in repo)
- Telegram: groupPolicy=allowlist (empty allowlist — user needs to configure real groups)

## Git Status
- Workspace: clean, at `18293b0`
- Audio submodule: `d348cd0` (includes 402 credits fix)
- JCI submodule: `97aa1d0`

## P0 Blockers (User Action Required)
1. Deploy Audio Tool to Vercel (needs OPENAI_API_KEY, JWT_SECRET)
2. Add OpenRouter Credits (402 error on real AI meditation)
3. Review Contribution Graph docs (CONCEPT.md + PILOT.md) — Phase 0 go/no-go
4. Review Credo Docs — MVP build decision
5. Add TELEGRAM_BOT_TOKEN to Youth Platform
6. Add TELEGRAM_BOT_TOKEN to Festival Coordinator
7. Configure telegram_groups.json with real group IDs (groupPolicy=allowlist)

## Current Focus
- Wakeup cron: Service health monitoring + progress doc updates
- All P0 blocked on user — no unblocked build work

## Quick Status
- Memory: Fresh (regenerated 2026-03-26 01:34 UTC)
- Health: 6/6 services running, health check script 17/18 OK (JCI portal no /health endpoint)
- Git: Clean
- Context: Updated
