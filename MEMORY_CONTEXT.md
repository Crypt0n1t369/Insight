# MEMORY_CONTEXT.md — Session Context 2026-03-26

## Active Projects

### Contribution Graph (Kristaps' Life Work)
**Phase:** Build phase in progress — bot↔web integration just completed.
**Location:** /home/drg/.openclaw/workspace/projects/contribution-graph/
**Git:** `6173fcb` (just synced)

**Build status:**
- Challenge library: 18 challenges (Impact: 6, Creative: 6, Business: 6) ✅
- Short-code identity system: ✅ (18 tests)
- 5-phase conversation handlers: ✅ (21 tests)
- Web server + SVG map renderer: ✅ (23 tests)
- Telegram polling bot: ✅ Wired + syncing to map store
- Bot→Web map sync: ✅ Just fixed (bot JSON + web SQLite now share data)
- AI synthesis module: Pending (stubbed template; needs OpenRouter credits)
- CG Web persistence: ✅ SQLite (contribution_graph.db)

**Key remaining decisions before Phase 1 build:**
- Q6: Onboarding hook (first 5 minutes, specific challenge type + feedback)
- Q7: Most motivating perk for target demographic
- Q8: Next event for Test 0.2 (festival/acquisition)

### Audio Tool
- **Phase:** Operational (production)
- **Ports:** 3001 (backend), 3005 (frontend via vite preview)
- **Status:** 34 vitest tests passing
- **9 protocols active:** NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE
- **Demo mode:** Working (kicks in when OpenRouter credits exhausted)
- **Known issue:** No OpenRouter credits (402 → demo fallback)

### Credo Collaboration Platform
- **Phase:** Operational
- **Ports:** 3000 (API), 3002 (frontend)
- **Status:** 75 tests passing; all services healthy

### JCI Org Manager
- **Phase:** Operational
- **Port:** 8080
- **Status:** 41 tests passing

### Youth Empowerment Platform
- **Phase:** Operational
- **Port:** 3003
- **Status:** 24 tests passing

### Festival Coordinator
- **Phase:** Operational
- **Status:** 49 tests passing

## Test Suite (Verified 2026-03-26)

| Project | Tests | Framework |
|---------|-------|-----------|
| Audio Backend (server/) | 34 | vitest |
| Synthesis Platform | 424 | vitest |
| Collaboration Platform | 75 | vitest |
| Festival Coordinator | 49 | pytest |
| JCI Org Manager | 41 | pytest |
| Youth Empowerment Platform | 24 | pytest |
| Contribution Graph | 62 (21 + 23 + 18) | pytest |
| **Total** | **709** | |

## Service Status (2026-03-26 15:28 UTC)

All 7 services up: 3000, 3001, 3002, 3003, 3005, 3006, 8080

## Git

- **Current:** `6173fcb` — docs(PROGRESS): add 15:28 UTC session
- **Clean and synced with origin/master**

## What's Left (User Action Required)

| Priority | Item | Blocker |
|----------|------|---------|
| P0 | Deploy Audio Tool to Vercel | Needs vercel.com import + env vars |
| P0 | Add OpenRouter credits (~$5-10) | Unblocks real AI meditation |
| P1 | Review CG CONCEPT.md + PILOT.md | Phase 0 go/no-go |
| P1 | Add CG Telegram bot token | Connect bot to actual Telegram |
| P2 | Add Telegram bot tokens | Youth Platform + Festival Coordinator Phase 2 |
