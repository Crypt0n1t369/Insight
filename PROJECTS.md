# PROJECTS.md - Project Index

## Active Projects

### 1. Synthesis Platform
- **Status:** Research Complete
- **Summary:** Unified platform combining Audio Tool + Credo + Synthetic Characters
- **Documents:** PLATFORM.md, ARCHITECTURE.md, RESEARCH_REPORT.md
- **Research:** 13 new domains created in memory/research/
- **Vision:** Interface for distributed collaboration and egoless representation with synthetic characters

### 2. Audio Transformation Tool
- **Status:** Running + Test Coverage (27 tests)
- **Summary:** Audio-based transformation platform (wellness → military → enterprise → individual development)
- **Path:** `projects/audio-transformation-tool/code/` (Vite + React)
- **Runtime:** Port 3001
- **Tests:** 94/94 passing ✅ (verified Mar 11, 11:42)
- **Git:** ✅ Committed (54fd561)
- **Recent Improvements (Mar 11):**
  - Added vitest test framework
  - Added protocols.test.ts (13 tests)
  - Added userHistory.test.ts (14 tests)
- **Demo Protocols:** 12 (NSDR, IFS, ACT, WOOP, NVC, SOMATIC_AGENCY, FUTURE_SELF, IDENTITY, NARRATIVE, GENERAL, TRAUMA_SAFE, BREATHWORK)
- **Next:** Phase 2 - Service integration tests

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
- **Tests:** 56/56 passing ✅ (verified Mar 19, 01:34)
- **Git:** ✅ Committed (a20d2bf committed Mar 11)
- **Recent Improvements (Mar 11):**
  - Added identity.test.ts (11 tests)
  - Added branch.test.ts (10 tests)
  - Added contribution.test.ts (12 tests)
  - Added reset functions for testing
- **Next:** 
  1. Phase 2: Integration tests (end-to-end flows)
  2. Test endorsement/voting system
  3. Paper Branch pilot (live testing)

### 4. JCI Org Manager
- **Status:** Enhanced + Test Coverage (33 tests)
- **Summary:** AI-powered organization manager for Telegram groups. Manages projects, collaboration, member engagement, and fluid roles.
- **Path:** `projects/jci-org-manager/`
- **Implementation:**
  - 4 AI Agents: Collaboration, Projects, Engagement, Roles
  - Database models: Member, Project, Task, Meeting, Opportunity, EngagementLog
  - Google Drive integration for organization folders
  - Telegram bot with command handlers + inline keyboards + callback queries
- **Tests:** 33/33 passing ✅ (verified Mar 11, 07:07)
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
- **Last Checked:** 2026-03-20 06:17 (Africa/Cairo) - No pending P0-P1 items ✅
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
- **Tests:** 11/11 passing ✅ (verified Mar 16, 10:30)
- **Git:** ✅ Committed (aa843cb)
- **Next:** Phase 2 - Bot commands integration

### 7. Youth Empowerment Platform
- **Status:** MVP RUNNING
- **Summary:** User-owned AI agents with encrypted vaults, matching to opportunities, NPC-guided hero's journey
- **Path:** `projects/youth-empowerment-platform/`
- **Runtime:** Port 3003 ✅
- **API Features:**
  - Vault creation/login/logout with session tokens
  - Encrypted vault storage via VaultManager
  - Character system with personality profiles
  - Journey engine for progression tracking
  - Opportunity matching
- **Recent Improvements (Mar 14):**
  - Added `/health` endpoint with detailed status
- **Next:** Add tests, Telegram bot integration

---

## Adding New Projects

1. Create folder under `projects/`
2. Add README.md with overview
3. Add CONTEXT.md with current status
4. Add DECISIONS.md to track choices
5. Update this file
