=== ATON CONTEXT ===
Generated: 2026-03-26 05:05

## Active Projects
- audio-transformation-tool: ✅ RUNNING (Demo Mode) — Backend: 3001, Frontend: 3005, 34 vitest tests passing
- contribution-graph: ⏸ BLOCKED — needs user review of CONCEPT.md + PILOT.md for Phase 0 go/no-go
- collaboration-platform (Credo): ⏸ BLOCKED — needs user review of PILOT.md for MVP decision
- festival-coordinator: ⏸ BLOCKED — needs TELEGRAM_BOT_TOKEN for Phase 2
- jci-org-manager: ✅ RUNNING — Port 8080, 41 pytest tests
- youth-empowerment-platform: ✅ RUNNING — Port 3003, 24 pytest tests

## Key Decisions
### Memory System Architecture
- **Decision:** Use hybrid approach (TF-IDF now, vector embeddings later)
### Context Management Approach
- **Decision:** File-based context with auto-generation, not Mem0 cloud
### Audio Tool Demo Mode
- **Decision:** Web Speech API fallback when OpenRouter credits exhausted (402)
- **Decision:** Demo mode returns pre-scripted protocol batches, no LLM needed

## Recent Sessions
- 2026-03-26 05:05 UTC: Fixed audio tool test duplication (68→34), health check port fix pushed, 6/6 services up
- 2026-03-26 04:35 UTC: Committed accumulated wakeup changes, health check fixed (5173→3005)

## Quick Status
- Memory: Fresh (today)
- Health: 18/18 checks passing (last run: 6/6 services, all system checks OK)
- Context: Updated
- Git: Clean, at eb4f141, synced with origin/master
