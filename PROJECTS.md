# PROJECTS.md - Project Index

## Active Projects

### 1. Synthesis Platform
- **Status:** Research Complete
- **Summary:** Unified platform combining Audio Tool + Credo + Synthetic Characters
- **Documents:** PLATFORM.md, ARCHITECTURE.md, RESEARCH_REPORT.md
- **Research:** 13 new domains created in memory/research/
- **Vision:** Interface for distributed collaboration and egoless representation with synthetic characters

### 2. Audio Transformation Tool
- **Status:** Running (Demo Mode works without API key)
- **Summary:** Audio-based transformation platform (wellness → military → enterprise → individual development)
- **Path:** `projects/audio-transformation-tool/code/` (Vite + React)
- **Runtime:** Port 3001 (HTTP 200 verified Mar 8, 02:56)
- **Last Verified:** 2026-03-08 16:26 (HTTP 200, Git synced)
- **Git:** ✅ Clean (9d2c1ee), Synced to origin
- **PWA:** v1.2.0 (11 precache entries, 922.25 KiB)
- **Demo Protocols:** 11 (NSDR, IFS, ACT, WOOP, NVC, SOMATIC_AGENCY, DEFAULT, FUTURE_SELF, IDENTITY, NARRATIVE, GENERAL)
- **Next:** Vercel deploy (user action: go to vercel.com → import Crypt0n1t369/Insight → Deploy)

### 2. Credo Collaboration Platform
- **Status:** MVP RUNNING (API Live on Port 3000)
- **Summary:** Infrastructure for distributed, pseudo-anonymous collaboration with egoless representation
- **Path:** `projects/collaboration-platform/`
- **Runtime:** Port 3000 (HTTP 200 verified Mar 10, 11:26)
- **API Endpoints Working:**
  - POST /api/users - Create anonymous user ✅
  - GET /api/users/:id - Get user ✅
  - POST /api/branches - Create branch ✅
  - POST /api/contributions - Add contribution ✅
- **Pilot:** Paper Branch created (Mar 10)
- **Documents:**
  - STRATEGY.md (24KB - strategic overview)
  - SPEC.md (24KB - technical specification)
  - SCHEMA.md (21KB - database schema)
  - PILOT.md (8KB - Paper Branch pilot plan)
  - INTEGRATION.md (18KB - synthetic characters & knowledge)
  - BACKLOG.md (8KB - prioritized feature backlog)
- **Next:** 
  1. Test endorsement/voting system
  2. Paper Branch pilot (live testing)

### 3. JCI Org Manager
- **Status:** Enhanced (Inline Keyboards + Smart Responses)
- **Summary:** AI-powered organization manager for Telegram groups. Manages projects, collaboration, member engagement, and fluid roles.
- **Path:** `projects/jci-org-manager/`
- **Implementation:**
  - 4 AI Agents: Collaboration, Projects, Engagement, Roles
  - Database models: Member, Project, Task, Meeting, Opportunity, EngagementLog
  - Google Drive integration for organization folders
  - Telegram bot with command handlers + inline keyboards + callback queries
- **Tests:** 8/8 passing ✅ (verified Mar 8, 10:58)
- **Runtime:** Portal running on port 8080 (HTTP 200 verified Mar 8, 16:26)
- **Git:** ✅ Committed and synced (ecb68d3)
- **Features Added:**
  - Callback query handlers for inline keyboard interactions
  - /menu, /leaderboard, /network commands
  - /onboard as standalone command
  - Better group chat bot mention handling
  - Member level management (/setlevel command for admins)
  - Improved task workflow help text
  - **NEW: /msg and /m commands** - Direct messaging between members
  - **NEW: Conversational responses** - Greetings, thanks, help triggers
  - **NEW: Improved tab UX** - Better active state management, loading placeholders
  - **NEW: Telegram command suggestions** - Bot commands registered with Telegram
- **Next:** Configure .env with Telegram bot token for production

### 4. Solar Scout (Lead Generator)
- **Status:** Completed / Archived (Feb 2026) - No pending tasks
- **Summary:** Latvia manufacturing company lead generator with solar detection
- **Results:** 70 total leads (51 qualified companies WITHOUT solar)
- **Last Checked:** 2026-03-10 21:04 (Africa/Cairo) - No pending P0-P1 items ✅
- **Location:** `solar-scout/` (root directory - NOT under projects/)
- **Git:** ✅ Clean (30a4c69 committed Mar 9)

---

## Adding New Projects

1. Create folder under `projects/`
2. Add README.md with overview
3. Add CONTEXT.md with current status
4. Add DECISIONS.md to track choices
5. Update this file
