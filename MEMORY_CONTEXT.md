# MEMORY_CONTEXT.md — Session Context 2026-03-27

## Active Projects

### Solar Scout
- **Phase:** Data cleaned — 452 leads deduplicated and enriched
- **Location:** /home/drg/.openclaw/workspace/solar-scout/
- **Status:** Dashboard regenerated (558KB), CSV updated, 2 Python utility scripts added
- **Data:** 452 unique leads, 12 with known industry, 132 with satellite images, 629 MW total solar potential
- **⚠️ Minor issue:** `melrains@parks.lv` appears twice in leads_dashboard.csv (1 duplicate email)
- **Git (solar-scout repo):** `a6840c2` — docs: update PROGRESS - document new dashboard.html and generate_dashboard.py

### Contribution Graph (Kristaps' Life Work)
- **Phase:** Build phase complete — all components built, tested, documented
- **Location:** /home/drg/.openclaw/workspace/projects/contribution-graph/
- **Git:** `d3877fa` + `8b62141` — CG 88 tests passing, 22 challenges, enhanced mirror summary
- **Challenge library:** 22 challenges (Impact: 7, Creative: 7, Business: 8) — ALL 9 signal types covered
- **Short-code identity:** ✅ 18 tests
- **5-phase conversation handlers:** ✅ 47 tests
- **Web server + SVG map + rate limiter:** ✅ 23 tests
- **Telegram polling bot:** ✅ Wired + syncing to SQLite (bot→web map sync works)
- **CG Web server:** Running on port 3006 with SQLite persistence
- **AI synthesis module:** Enhanced template (sectioned mirror summary, 10 patterns, growth edges); needs OpenRouter for real LLM
- **Total CG tests: 88** (18 identity + 47 handlers + 23 web) — all passing

### Audio Tool
- **Phase:** Operational (production)
- **Ports:** 3001 (backend), 3005 (frontend)
- **Status:** 34 vitest tests passing
- **9 protocols:** NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE — all demo mode working
- **Frontend:** dist/ pre-built and serving correctly (source missing, can't rebuild)
- **Known issue:** OpenRouter credits exhausted (402 → demo fallback)

### Credo Collaboration Platform
- **Phase:** Operational
- **Ports:** 3000 (API), 3002 (frontend)
- **Status:** 75 tests passing

### JCI Org Manager
- **Phase:** Operational | **Port:** 8080 | **Status:** 41 tests passing

### Youth Empowerment Platform
- **Phase:** Operational | **Port:** 3003 | **Status:** 24 tests passing

### Festival Coordinator
- **Phase:** Operational | **Status:** 49 tests passing

## Test Suite (Verified 2026-03-27 23:00 UTC)

| Project | Tests | Framework |
|---------|-------|-----------|
| Audio Backend (server/) | 34 | vitest |
| Synthesis Platform | 424 | vitest |
| Collaboration Platform | 75 | vitest |
| Festival Coordinator | 49 | pytest |
| JCI Org Manager | 41 | pytest |
| Youth Empowerment Platform | 24 | pytest |
| Contribution Graph | 88 (18+47+23) | pytest |
| **Total** | **735** | |

## Service Status (2026-03-27 23:00 UTC)

All 7 services up: 3000 ✅ | 3001 ✅ | 3002 ✅ | 3003 ✅ | 3005 ✅ | 3006 ✅ | 8080 ✅

## Git

- **Workspace:** `635f6fa` — docs(audio): update PROGRESS - timestamp + 21:28 UTC wakeup session entry
- **Solar Scout:** `a6840c2` — docs: update PROGRESS - document new dashboard.html and generate_dashboard.py
- **Synced with origin/master**

## What's Left (User Action Required)

| Priority | Item | Blocker |
|----------|------|---------|
| P0 | Add OpenRouter credits (~$5-10) | Unblocks real AI meditation + CG synthesis |
| P0 | Deploy CG Web to Vercel | Needs vercel.com import + env vars |
| P0 | Deploy Audio Tool to Vercel | Needs vercel.com import + env vars |
| P1 | Add CG Telegram bot token | Connect bot to actual Telegram |
| P1 | Review CG CONCEPT.md + PILOT.md | Phase 0 go/no-go |
| P2 | Verify Solar Scout duplicate | `melrains@parks.lv` appears twice (user to decide which record to keep) |
| P2 | Add Telegram bot tokens | Youth Platform + Festival Coordinator Phase 2 |
