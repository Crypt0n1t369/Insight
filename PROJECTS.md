# PROJECTS.md - Project Index

## Active Projects

### 1. Synthesis Platform
- **Status:** RUNNING — Fully Implemented
- **Summary:** Unified wellness protocol orchestration platform with 8 specialist agents (WOOP, IFS, NSDR, BREATHWORK, SE, ACT, GENERAL, NVC)
- **Path:** `projects/synthesis/`
- **Tests:** 444/444 vitest passing ✅ (verified 2026-03-27)
- **Agents:** WOOP, IFS, NSDR, BREATHWORK, SE (Somatic Experiencing), ACT, NVC (Nonviolent Communication), GENERAL — all 8 registered in AGENT_REGISTRY
- **Recent:** Fixed endorsement test (self-endorsement blocked), all 13 test files green

### 2. Audio Transformation Tool
- **Status:** Running + Server Unit Tests (17 tests)
- **Summary:** Audio-based transformation platform (wellness → military → enterprise → individual development)
- **Path:** `projects/audio-transformation-tool/code/` (Vite + React)
- **Runtime:** 
  - Backend: Port 3001 (demo mode - OpenRouter credits exhausted)
  - Frontend: Port 3005 (vite preview)
- **Tests:** 17/17 server unit tests passing ✅ (verified 2026-03-27)
- **Git:** ✅ Committed (e175d03)
- **Test Files:** server.test.ts (17 tests covering health, protocols, chat, director, meditation generation)
- **Demo Protocols:** 9 active (NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE) — served via demo mode when OpenRouter credits exhausted
- **Next:** Frontend integration tests, API key configuration for production AI

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
