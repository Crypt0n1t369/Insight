=== ATON CONTEXT ===
Generated: 2026-03-28 19:56 UTC

## Active Projects
- synthesis (port 3004 API, port 3007 UI) — KG persistence + autosave, 495 vitest ✅
- audio-transformation-tool (ports 3001 backend / 3005 frontend) — 10 protocols, demo mode, OpenRouter linked ✅
- collaboration-platform / Credo (port 3000) — credibility engine, app-level auth, 137 vitest ✅
- jci-org-manager (port 8080) — LLM engagement agent, 62 pytest ✅
- festival-coordinator — Phase 2 pending Telegram bot token
- youth-empowerment-platform (port 3003) — SEED methodology, 24 pytest ✅
- contribution-graph (port 3006 web) — Phase 0 materials ready, 110 pytest ✅
- solar-scout (outreach pipeline) — 15 validated companies (33.4 MW), SMTP ready, awaiting GO from user

## Key Decisions
### Memory System Architecture
- **Decision:** Use hybrid approach (TF-IDF now, vector embeddings later)
### Context Management Approach
- **Decision:** File-based context with auto-generation, not Mem0 cloud
### KG Persistence
- **Decision:** JSON file primary (saves every 60s autosave + on dirty), Supabase adapter stub ready to activate

## Recent Sessions
- 2026-03-28 19:56 UTC (Wakeup): All 1,002 tests pass, 8/8 services healthy, git clean, H17 label fixed
- 2026-03-28 19:27 UTC (Wakeup): 2 fixes (H17 label, memory/index stale entries), committed and pushed
- 2026-03-28 18:58 UTC (Wakeup): 8/8 services, health_check.sh fixed (added 3004/3006/3007, removed stale 3002)
- 2026-03-28 16:26 UTC (Wakeup): KG forceSave dirty-flag bug fixed (synthesis), pushed
- 2026-03-28 15:45 UTC (Wakeup): KG persistence autosave added, KG sessions now persisting correctly

## Quick Status
- Memory: Fresh (today)
- Health: 17 checks — H11 WARN (context low, expected in isolated session), all others OK
- Context: Updated 2026-03-28 19:56 UTC
- Budget: $10/day cap — Tier 3/4 routing for routine tasks
- All 9 P0 items blocked on user action
