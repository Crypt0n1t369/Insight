# MEMORY_CONTEXT.md - Aton Session Context
*Generated: 2026-03-22 19:56 UTC*

## Active Projects
- audio-transformation-tool: Running (audio backend restarted today)
- collaboration-platform (Credo): Running, MVP phase
- festival-coordinator: Running, Phase 1 complete
- jci-org-manager: Running, 33 tests passing
- youth-empowerment-platform: Running, 24 tests passing

## Key Decisions
### Cron Job Fix (Today)
- **Decision:** Disable Worker-1 and Worker-2 (edit tool fails in isolated sessions)
- **Decision:** Change Wakeup sessionTarget from "isolated" to "parent" and deleteAfterRun=false
- **Rationale:** Isolated sessions can't use edit/write tools; parent sessions can when not auto-deleted

### Audio Backend Restart (Today)
- **Decision:** Restart audio backend on port 3001 (was down, now running)
- **Command used:** `npx tsx server/index.ts` in projects/audio-transformation-tool/code

## Recent Sessions
### 2026-03-22-session-startup (morning)
- Session Key: agent:main:telegram:direct:551447474
- Source: telegram

### 2026-03-22-cron-wakeup (this session)
- Actions: Fixed cron jobs, restarted audio backend, verified all tests, committed progress
- Git: 916bb6f

## Quick Status
- Memory: Fresh (today)
- Health: 6/6 services running
- Cron: Worker-1/2 disabled, Wakeup fixed
- Git: Clean and synced (916bb6f)
- Tests: Festival 49/49 ✅, JCI 33/33 ✅, Youth 24/24 ✅
