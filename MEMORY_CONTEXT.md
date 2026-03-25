=== ATON CONTEXT ===
Generated: 2026-03-25 14:28 UTC (wakeup session)

## Active Projects

### Synthesis Platform (projects/synthesis/)
- **Status:** ✅ COMPLETE — All modules implemented, 382 tests passing
- **Modules:** Router Agent (61 tests), Knowledge Graph (36 tests), Credibility Engine (71 tests), Session Orchestrator (42 tests), Specialist Agents (172 tests: WOOP+IFS+NSDR+BREATHWORK+SE+ACT)
- **7 Specialist Agents:** WOOP, IFS, NSDR, BREATHWORK, SE (Somatic Experiencing), ACT (Acceptance & Commitment Therapy), GENERAL
- **Latest commit:** `6da0310` — "synthesis: update specs to reflect SE and ACT implementation"
- **Note:** Workspace root IS the synthesis/Insight repo (Crypt0n1t369/Insight.git)

### Audio Transformation Tool (projects/audio-transformation-tool/code/)
- **Status:** ⚠️ Deployed locally, needs Vercel deploy + OpenRouter credits
- **Server:** Running on port 3001, 68 tests passing
- **Issue:** OpenRouter credits exhausted (402), demo mode works
- **P0 blocker:** User must deploy to Vercel

### Credo Collaboration Platform (projects/collaboration-platform/)
- **Status:** ⚠️ Phase 0 — SPEC.md/SCHEMA.md/PILOT.md complete, needs user MVP decision
- **75 tests passing**
- **P0 blocker:** Boss review for build decision

### Contribution Graph (projects/contribution-graph/)
- **Status:** ⚠️ Phase 0 — CONCEPT.md + PILOT.md complete, needs user review
- **Q6, Q7, Q8** require boss judgment (onboarding specifics, most motivating perk, first festival partner)

### Festival Coordinator (projects/festival-coordinator/)
- **Status:** Phase 1 complete, Phase 2 bot ready
- **49 tests passing**
- **P1 blocker:** Add TELEGRAM_BOT_TOKEN to .env

### JCI Org Manager (projects/jci-org-manager/)
- **Status:** Fully functional with Telegram bot active
- **41 tests passing**
- **P2:** MINIMAX_API_KEY for LLM enhancement (optional)

### Youth Empowerment Platform (projects/youth-empowerment-platform/)
- **Status:** Phase 1 complete, Phase 2 bot ready
- **24 tests passing**
- **P1 blocker:** Add TELEGRAM_BOT_TOKEN to .env

### Solar Scout (solar-scout/)
- **Status:** ✅ COMPLETED/ARCHIVED — 70 leads delivered (51 qualified without solar)

## Key Decisions
- Memory system: hybrid TF-IDF now, vector embeddings later
- Context management: file-based with auto-generation
- Audio tool demo mode: works without OpenRouter credits

## Quick Status
- Memory: Fresh (this session)
- Health: 6/6 services up (all HTTP 200)
- Tests: 639 total passing (382 synthesis + 75 Credo + 68 Audio + 41 JCI + 49 Festival + 24 Youth)
- Git: Clean, synced to origin
- Cron: Wakeup ✅, Worker-1 ✅, Worker-3 ✅, Worker-2 DISABLED
