# PROJECTS.md - Project Index

## Active Projects

### 1. Synthesis Platform
- **Status:** ✅ Phase 1 COMPLETE — Phase 2 Ready to Start
- **Summary:** Unified wellness protocol orchestration platform with 8 specialist agents (WOOP, IFS, NSDR, BREATHWORK, SE, ACT, GENERAL, NVC)
- **Path:** `projects/synthesis/`
- **Documentation:**
  - `README.md` ✅ — architecture, 8 agents, API endpoints, UI pages
  - `ARCHITECTURE.md` ✅ — full system design, module specs, extension protocol
  - `PROGRESS.md` ✅ — Phase 2 backlog with priorities (2026-03-31)
  - `SUPABASE_SCHEMA.md` ✅ — Phase 2 implementation blueprint: 8 tables, RLS policies, migration path (2026-03-31)
- **Tests:** 460/460 backend vitest + 6/6 UI API client tests ✅ (verified 2026-03-27)
- **Runtime:**
  - API Server: Port 3004 (Express — health, protocols, sessions, KG, stats)
  - UI: Port 3007 (Vite + React — 5 pages: Protocols, Session Runner, KG Query, Stats, Session History)
- **Agents:** WOOP, IFS, NSDR, BREATHWORK, SE (Somatic Experiencing), ACT, NVC (Nonviolent Communication), GENERAL — all 8 registered in AGENT_REGISTRY
- **Git:** ✅ Committed `d38d30e`
- **Phase 2 Backlog (P1):**
  1. Supabase session persistence (no blocker — can start design)
  2. Auth integration in UI (needs VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
  3. Synthetic Mediator (no blocker — well-defined)
- **Credential needs:** Supabase credentials, Resemble AI (voice/TTS), OpenRouter credits

### 2. Audio Transformation Tool
- **Status:** Running + Full Test Coverage ✅ (42 tests)
- **Summary:** Audio-based transformation platform (wellness → military → enterprise → individual development)
- **Path:** `projects/audio-transformation-tool/code/` (Vite + React)
- **Runtime:** 
  - Backend: Port 3001 (demo mode - OpenRouter credits exhausted)
  - Frontend: Port 3005 (vite preview)
- **Tests:** 42/42 passing ✅ (verified 2026-03-29)
  - 17 server unit tests (health, protocols, chat, director, meditation generation)
  - 9 client protocol structure tests
  - 16 API integration tests (full user journey, all 10 methodologies)
- **Git:** ✅ Committed (ca1ae15)
- **Test Files:**
  - `server/server.test.ts` — 17 server unit tests
  - `services/protocols.test.ts` — 9 protocol structure tests
  - `services/api.integration.test.ts` — 16 integration tests (live backend)
- **Protocols:** 10 active (NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE, GENERAL)
- **Demo Scripts:** Protocol-specific fallback scripts for all 10 methodologies (5-6 batches each)
- **Next:** 
  1. Add OPENROUTER_API_KEY with credits → enable live AI generation
  2. Supabase auth integration (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY needed)
  3. Voice/TTS integration (VITE_RESEMBLE_API_KEY + VITE_RESEMBLE_VOICE_UUID)
  4. Frontend E2E tests (Playwright)

### 3. Credo Collaboration Platform
- **Status:** MVP RUNNING + CONTEXT.md Added
- **Summary:** Infrastructure for distributed, pseudo-anonymous collaboration with egoless representation
- **Path:** `projects/collaboration-platform/`
- **CONTEXT.md:** ✅ Created 2026-03-31 — architecture, API endpoints, trust tiers, next actions
- **Runtime:** 
  - API: Port 3000 ✅
  - Frontend: Port 3002 ✅
- **API Endpoints Working:**
  - POST /api/users - Create anonymous user ✅
  - GET /api/users/:id - Get user ✅
  - POST /api/branches - Create branch ✅
  - POST /api/contributions - Add contribution ✅
  - DELETE /api/contributions/:id - Delete contribution (author only) ✅
- **Tests:** 137/137 passing ✅ (verified 2026-03-27) — fixed endorsement test (different voter needed)
- **Git:** ✅ Committed (8be658d)
- **Recent Fix (Mar 27):**
  - Fixed http-api.test.ts: endorsement test now uses separate voter (self-endorsement blocked)
- **Next:** 
  1. Phase 2: Integration tests (end-to-end flows)
  2. Paper Branch pilot (live testing)

### 4. JCI Org Manager
- **Status:** Enhanced + Test Coverage (41 tests) + CONTEXT.md Added
- **Summary:** AI-powered organization manager for Telegram groups. Manages projects, collaboration, member engagement, and fluid roles.
- **Path:** `projects/jci-org-manager/`
- **CONTEXT.md:** ✅ Created 2026-03-31 — full architecture, API endpoints, next actions
- **Tests:** 41/41 passing ✅ (verified 2026-03-26)
- **Runtime:** Portal on port 8080 ✅ (web fetch verified)

### 5. Solar Scout (Lead Generator)
- **Status:** Completed / Archived (Feb 2026) - No pending tasks
- **Summary:** Latvia manufacturing company lead generator with solar detection
- **Results:** 70 total leads (51 qualified companies WITHOUT solar)
  - **Last Checked:** 2026-03-25 01:56 (Africa/Cairo) - No pending P0-P1 items ✅
- **Location:** `solar-scout/` (root directory - NOT under projects/)
- **Git:** ✅ Committed (7d1b21e committed Mar 18)

## Festival Coordinator
- **Status:** Phase 1 Complete + README Added
- **Summary:** Telegram bot for festival volunteer coordination with task assignment, reputation/points system, and rewards redemption
- **Path:** `projects/festival-coordinator/`
- **README:** ✅ Created 2026-03-31 — full architecture, Phase 2 commands, trust tiers, next steps
- **Tests:** 49/49 passing ✅ (verified 2026-03-26)
- **Runtime:** Extends JCI Org Manager (port 8080 when JCI portal running)
- **Git:** ✅ Committed and synced
- **Phase 1 Complete:** Database models (Festival, TaskCategory, FestivalTask, TaskClaim, Reward, PointRedemption)
- **Next:** Phase 2 — Bot commands (`/festival`, `/tasks`, `/claim`, `/complete`, `/verify`, `/points`, `/rewards`, `/redeem`)
- **Blocker:** Needs TELEGRAM_BOT_TOKEN configured in JCI Org Manager `.env`

### 7. Youth Empowerment Platform
- **Status:** MVP RUNNING + CONTEXT.md Added
- **Summary:** User-owned AI agents with encrypted vaults, character-guided journeys, and opportunity matching.
- **Path:** `projects/youth-empowerment-platform/`
- **CONTEXT.md:** ✅ Created 2026-03-31 — vault system, character/NPC, journey engine, Telegram blocker
- **Runtime:** Port 3003 ✅
- **Tests:** 24/24 passing ✅ (verified 2026-03-26)
- **API Features:**
  - Vault creation/login/logout with session tokens
  - Encrypted vault storage via VaultManager
  - Character system with personality profiles
  - Journey engine for progression tracking
  - Opportunity matching
- **Next:** Add TELEGRAM_BOT_TOKEN for bot activation

### 8. Contribution Graph
- **Status:** Phase 0 COMPLETE ✅ — All 9 documents done, 4 outreach drafts ready
- **Summary:** Behavioral profiling system that discovers comparative advantage through micro-challenge participation, then matches to real work. Core bet: bot-observed behavioral data produces richer capability profiles than CVs or self-assessments.
- **Path:** `projects/contribution-graph/`
- **Document Completion: 9/9 + 2 support files ✅:**
  - `CONCEPT.md` — Full blueprint: Core Bet, 3-Layer Architecture, filetree, test plan, roadmap
  - `PILOT.md` — 4-test Phase 0 validation protocol with go/no-go gates
  - `TEST_01_INTERVIEW_SCRIPT.md` — 5-screen prototype + full script + screener + go/no-go template
  - `DISCOVERY-FLOW.md` — 5-phase conversational profiling system + behavioral signal inventory
  - `DISCOVERY-FLOW-APPENDIX.md` — 25-nudge library + 9 challenge designs + 4 behavioral tests
  - `IDENTITY-ARCHITECTURE.md` — Session continuity, short-code, map delivery, DB schema
  - `LATVIA-OPPORTUNITIES.md` — 6 verified Latvian orgs + event calendar through July 2026
  - `OPEN_QUESTIONS.md` — Q6/Q7/Q8 answered (onboarding hook, 16-25 perk, event strategy)
  - `OUTREACH_DRAFT.md` — 4 ready-to-send partnership emails (JA Europe, JA Latvia, Million Candles, JCI Latvia)
  - `TEST_01_PARTICIPANT_RECRUITMENT.md` — Ready-to-use recruitment kit (copy-paste messages + screener + scheduling)
  - `QUICKSTART.md` — 3 most urgent actions for Kristaps today
- **Status Docs:** `PROGRESS.md` ✅ — Full progress report with blockers, next actions, and decision gates
- **⚠️ April 7 Deadline:** MISSED (8 days ago) — outreach NOT sent — but gen-e.eu/gen-e-2026 STILL 404, window may still be open
- **Gen-E Virtual Opening:** April 23 (**9 days away**) ✅ — still confirmed live on jaeurope.org
- **Phase 0:** COMPLETE ✅ — 9/9 documents committed, in execute mode
- **Next:** Kristaps sends JA Europe LinkedIn outreach NOW (OUTREACH_DRAFT.md Draft 1) → recruits Test 0.1 participants → runs interviews

### 9. Synthesis Collaboration Platform
- **Status:** 🚨 BLOCKED — exec BLOCKED in cron; npm install never run; bot never started; 16 tests never run; dead handleStatus import in index.ts (harmless — should be removed)
- **Summary:** Telegram-native collaborative intelligence engine aggregating insights, synthesizing commonalities/divergences, generating next-step proposals. Inspired by Karpathy LLM-wiki pattern
- **Path:** `projects/synthesis-collaboration/`
- **Key Docs:** `SPEC.md` ✅; `LOG.md` ✅; `PLAN.md` ✅; `CHANGELOG.md` ✅ (updated 2026-04-15 01:27 Cairo); `PROGRESS.md` ✅ (updated 2026-04-15 01:27 Cairo); `OUTLINE.md` ✅ (updated 2026-04-15 01:27 Cairo)
- **Source Code:** ✅ 22 source files ALL VERIFIED CLEAN (full audit 2026-04-15 01:27 Cairo — complete walkthrough of all handlers, services, schema, tests)
- **Tests:** 16 tests written ✅ — NEVER RUN (exec BLOCKED in cron session — needs non-cron session)
  - `tests/unit/synthesis.test.ts`: 9 tests (parseOpenClawResponse ×4, formatSynthesisForTelegram ×3, formatContributionForOpenClaw ×2)
  - `tests/unit/db.test.ts`: 7 tests (user, project, contribution, synthesis, contributor ops)
- **TASKS Monitor:** ✅ Running every 60s (isolated cron c24d7d68). Last confirmed OK at 23:57 UTC. Pipeline idle, no pending tasks.
- **All 4 Cron Jobs:** ✅ HEALTHY (verified 23:27 UTC) — Wakeup currently running, TASKS Monitor ran 6s ago, Worker-1/Worker-3 last OK ✅, 0 consecutive errors
- **Pipeline:** ✅ TASKS Monitor verified working end-to-end on test task (2026-04-13 09:34 UTC)
- **Knowledge Graph:** ✅ Entity extraction (MiniMax LLM + keyword fallback), typed relationships, confidence scoring, supersession pattern
- **Chat Service:** ✅ MiniMax Chat API with graceful null fallback
- **NL Fallback:** ✅ 12-intent keyword parser, 60+ regex patterns
- **Bot token:** ✅ `8700911729:AAEio69n8NAn83hQGsyUQvIgSpLHgDAvCN0` — getMe confirmed live
- **exec BLOCKER:** npm install never run — bot has NEVER been started (exec denied in cron session)
- **gen-e Status:** gen-e.eu LIVE ✅ | gen-e.eu/gen-e-2026 404 ❌ | **9 days** to Virtual Opening (April 23) | JA Europe outreach NOT SENT (April 7 deadline missed by 8 days)
- **Dead Code:** `handleStatus` in `src/bot/handlers/status.ts` — imported in `index.ts` line 23 but never registered. `handleStatusWithReadiness` (personal.ts) handles `/status` and is strictly more feature-rich. Safe to remove in non-cron session.
- **Next (Kristaps):** Non-cron session → `openclaw config set exec.security full` → `cd projects/synthesis-collaboration && npm install` → `npx prisma generate && npx prisma db push` → `npm test` → `npm run bot` → BotFather commands → JA Europe LinkedIn outreach (9 days to April 23)

---

## Adding New Projects

1. Create folder under `projects/`
2. Add README.md with overview
3. Add CONTEXT.md with current status
4. Add DECISIONS.md to track choices
5. Update this file
