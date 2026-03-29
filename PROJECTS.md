# PROJECTS.md - Project Index

## Active Projects

### 1. Synthesis Platform
- **Status:** RUNNING — Backend + UI
- **Summary:** Unified wellness protocol orchestration platform with 8 specialist agents (WOOP, IFS, NSDR, BREATHWORK, SE, ACT, GENERAL, NVC)
- **Path:** `projects/synthesis/`
- **Tests:** 460/460 backend vitest + 6/6 UI API client tests ✅ (verified 2026-03-27)
- **Runtime:**
  - API Server: Port 3004 (Express — health, protocols, sessions, KG, stats)
  - UI: Port 3007 (Vite + React — 4 pages: Protocols, Session Runner, KG Query, Stats)
- **Agents:** WOOP, IFS, NSDR, BREATHWORK, SE (Somatic Experiencing), ACT, NVC (Nonviolent Communication), GENERAL — all 8 registered in AGENT_REGISTRY
- **Recent (15:43 UTC):** Added React UI frontend (port 3007). Build succeeds (209KB gzipped). API streaming verified end-to-end.
- **Git:** ✅ Committed `d38d30e`

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
- **Status:** MVP RUNNING (API + Frontend Connected)
- **Summary:** Infrastructure for distributed, pseudo-anonymous collaboration with egoless representation
- **Path:** `projects/collaboration-platform/`
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
- **Status:** Enhanced + Test Coverage (33 tests)
- **Summary:** AI-powered organization manager for Telegram groups. Manages projects, collaboration, member engagement, and fluid roles.
- **Path:** `projects/jci-org-manager/`
- **Implementation:**
  - 4 AI Agents: Collaboration, Projects, Engagement, Roles
  - Database models: Member, Project, Task, Meeting, Opportunity, EngagementLog
  - Google Drive integration for organization folders
  - Telegram bot with command handlers + inline keyboards + callback queries
- **Tests:** 41/41 passing ✅ (verified 2026-03-26)
- **Runtime:** Portal running on port 8080
- **Git:** ✅ Committed and synced (27831a1)
- **Recent Improvements (Mar 11):**
  - Fixed `_get_or_create_member` with DB persistence
  - Fixed `_update_profile_field` (interest/skill/goal/availability)
  - Connected webapp `/api/profile` to real DB
  - Added test_bot.py (6 tests)
  - Added test_integration.py (9 tests)
  - Added test_webapp.py (11 tests)
- **Next:** Configure .env with Telegram bot token for production

### 5. Solar Scout (Lead Generator)
- **Status:** Completed / Archived (Feb 2026) - No pending tasks
- **Summary:** Latvia manufacturing company lead generator with solar detection
- **Results:** 70 total leads (51 qualified companies WITHOUT solar)
  - **Last Checked:** 2026-03-25 01:56 (Africa/Cairo) - No pending P0-P1 items ✅
- **Location:** `solar-scout/` (root directory - NOT under projects/)
- **Git:** ✅ Committed (7d1b21e committed Mar 18)

### 6. Festival Coordinator
- **Status:** Phase 1 Complete (Database + Tests)
- **Summary:** Telegram bot for festival volunteer coordination with task assignment, reputation/points system, and rewards redemption
- **Path:** `projects/festival-coordinator/`
- **Research:** RESEARCH.md (comprehensive analysis)
- **Plan:** IMPLEMENTATION_PLAN.md (3-week phased build)
- **Implementation (Phase 1 Complete):**
  - Database models: Festival, TaskCategory, FestivalTask, TaskClaim, Reward, ReputationLedger, Redemption
  - 11 tests passing covering all models and integration flows
- **Architecture:** Extend JCI Org Manager (leverages existing bot infrastructure)
- **Core Features:**
  - Task board (technical, marketing, operations, creative, logistics)
  - Claim → Complete → Verify → Earn points flow
  - Reputation system (Credo-inspired trust tiers)
  - Rewards catalog (VIP, merch, experiences)
  - Leaderboard gamification
- **Failure Prevention:**
  - Skin in the game (reputation at stake)
  - Peer verification for completions
  - Trust tiers limiting task claims
  - Timeout auto-release for abandoned tasks
- **Tests:** 49/49 passing ✅ (verified 2026-03-26)
- **Git:** ✅ Committed (aa843cb)
- **Next:** Phase 2 - Bot commands integration

### 7. Youth Empowerment Platform
- **Status:** MVP RUNNING
- **Summary:** User-owned AI agents with encrypted vaults, matching to opportunities, NPC-guided hero's journey
- **Path:** `projects/youth-empowerment-platform/`
- **Runtime:** Port 3003 ✅
- **Tests:** 24/24 passing ✅ (verified 2026-03-26)
- **API Features:**
  - Vault creation/login/logout with session tokens
  - Encrypted vault storage via VaultManager
  - Character system with personality profiles
  - Journey engine for progression tracking
  - Opportunity matching
- **Recent Improvements (Mar 14):**
  - Added `/health` endpoint with detailed status
- **Next:** Telegram bot integration (needs TELEGRAM_BOT_TOKEN)

### 8. Contribution Graph
- **Status:** Phase 0 — Validation (No Code)
- **Summary:** Behavioral profiling system that discovers comparative advantage through micro-challenge participation, then matches to real work. Core bet: bot-observed behavioral data produces richer capability profiles than CVs or self-assessments.
- **Path:** `projects/contribution-graph/`
- **Documents:**
  - `CONCEPT.md` — Full product blueprint: Core Bet, 3-Layer Architecture (Discovery Engine → Marketplace → Coordination), filetree, test plan (pre-engineering gates), roadmap (Phase 0–3)
  - `PILOT.md` — Phase 0 validation protocol: 4 tests (self-discovery desire, attribution fairness, festival top-of-funnel, client problem readiness)
- **Phase 0 Gates (No Engineering Required):**
  - Test 0.1: ≥7/10 target users say they'd use the bot
  - Test 0.2: ≥4/5 say structured attribution feels fair
  - Test 0.3: ≥40% QR scan → quiz completion; ≥20% D7 return
  - Test 0.4: ≥3/5 orgs willing to pay at some price
- **Key Design:** Cybernetic self-discovery loop (sensor → comparator → effector → user agent). Three-layer decoupled architecture (Discovery → Marketplace → Coordination) built sequentially, not in parallel.
- **Git:** ✅ Untracked (pending first commit)
- **Next:** Boss reviews CONCEPT.md + PILOT.md → go/no-go on Phase 0 validation execution

---

## Adding New Projects

1. Create folder under `projects/`
2. Add README.md with overview
3. Add CONTEXT.md with current status
4. Add DECISIONS.md to track choices
5. Update this file
