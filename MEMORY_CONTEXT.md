# MEMORY_CONTEXT.md — Session Context 2026-03-26

## Active Projects

### Contribution Graph (Kristaps' Life Work)
**Phase:** Build phase in progress — mirror summary enhanced, adaptive challenge selection fully tested.
**Location:** /home/drg/.openclaw/workspace/projects/contribution-graph/
**Git:** `162af57` — enhanced mirror summary (sectioned format, 10 signature patterns, growth edges)

**Build status:**
- Challenge library: 18 challenges (Impact: 6, Creative: 6, Business: 6) ✅
- Short-code identity system: ✅ (18 tests)
- 5-phase conversation handlers: ✅ (25 tests — all 6 signal types now covered)
- Web server + SVG map renderer: ✅ (23 tests)
- Telegram polling bot: ✅ Wired + syncing to map store
- Bot→Web map sync: ✅ (bot JSON + web SQLite share data)
- **AI synthesis module: Enhanced** ✅ NEW — sectioned mirror summary (What you move toward / How you operate / Where you're growing / Bottom line), 10 signature patterns, growth-edge nudges; needs OpenRouter for real LLM
- CG Web persistence: ✅ SQLite (contribution_graph.db)
- **Total CG tests: 66** (18 identity + 25 handlers + 23 web)

**Key remaining decisions before Phase 1 build:**
- Q6: Onboarding hook (first 5 minutes, specific challenge type + feedback)
- Q7: Most motivating perk for target demographic
- Q8: Next event for Test 0.2 (festival/acquisition)

### Audio Tool
- **Phase:** Operational (production)
- **Ports:** 3001 (backend), 3005 (frontend via vite preview)
- **Status:** 34 vitest tests passing
- **9 protocols active:** NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE
- **Demo mode:** Working (all 9 protocols verified via direct API — NSDR: 6 batches, others: 5 each)
- **Frontend source:** Missing (can't rebuild); dist/ pre-built and serving correctly
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

## Test Suite (Verified 2026-03-26 22:00 UTC)

| Project | Tests | Framework |
|---------|-------|-----------|
| Audio Backend (server/) | 34 | vitest |
| Synthesis Platform | 424 | vitest |
| Collaboration Platform | 75 | vitest |
| Festival Coordinator | 49 | pytest |
| JCI Org Manager | 41 | pytest |
| Youth Empowerment Platform | 24 | pytest |
| Contribution Graph | 66 (18+25+23) | pytest |
| **Total** | **713** | |

## Service Status (2026-03-26 22:00 UTC)

All 7 services up: 3000, 3001, 3002, 3003, 3005, 3006, 8080

## Git

- **Current:** `162af57` — feat(contribution-graph): enhance mirror summary with sectioned format, 10 signature patterns, and growth-edge analysis
- **Synced with origin/master**

## What's Left (User Action Required)

| Priority | Item | Blocker |
|----------|------|---------|
| P0 | Add OpenRouter credits (~$5-10) | Unblocks real AI meditation |
| P0 | Deploy Audio Tool to Vercel | Needs vercel.com import + env vars |
| P0 | Deploy CG Web to Vercel | Needs vercel.com import + env vars |
| P1 | Add CG Telegram bot token | Connect bot to actual Telegram |
| P1 | Review CG CONCEPT.md + PILOT.md | Phase 0 go/no-go |
| P2 | Add Telegram bot tokens | Youth Platform + Festival Coordinator Phase 2 |
