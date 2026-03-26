# MEMORY_CONTEXT.md — Session Context 2026-03-26

## Active Projects

### Contribution Graph (Kristaps' Life Work)
**Phase:** Discovery Flow Design complete. Build phase in progress.
**Location:** /home/drg/.openclaw/workspace/projects/contribution-graph/
**Files:**
- CONCEPT.md — Master blueprint (3-layer architecture, Phase 0–3 roadmap)
- PILOT.md — 4-test validation protocol (no code required)
- DISCOVERY-FLOW.md — 5-phase conversational profiling system
- DISCOVERY-FLOW-APPENDIX.md — Testing protocols, nudge library (25 nudges), 9 challenge options, 4 behavioral tests
- IDENTITY-ARCHITECTURE.md — Full technical design for session continuity

**Primary user:** Curious youth, 16–25, who cares about making a meaningful contribution but lacks opportunities.

**Revenue model:** Phase 1 = non-monetary (partner perks only). Phase 3 = commission on implemented ideas.

**3 Tracks defined:** Impact, Creative, Business.

**Build status:**
- Challenge library: 16 challenges (Impact: 5, Creative: 6, Business: 5) ✅
- Short-code identity system: ✅ (18 tests)
- 5-phase conversation handlers: ✅ (21 tests)
- Web server + SVG map renderer: ✅ (23 tests)
- Telegram polling bot: ✅ (wired, not persistently running)
- AI synthesis module: Pending (stubbed template; needs OpenRouter credits)
- DB persistence: Schema designed (SQLite/PostgreSQL; needs credentials)

**Key remaining decisions before Phase 1 build:**
- Q6: Onboarding hook (first 5 minutes, specific challenge type + feedback)
- Q7: Most motivating perk for target demographic
- Q8: Next event for Test 0.2 (festival/acquisition)

### Audio Tool
- **Phase:** Operational (production)
- **Ports:** 3001 (backend), 3005 (frontend via vite preview)
- **Status:** 34 vitest tests passing (server/)
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

## Session Summary (2026-03-26 14:28 UTC)

### This Session
- **Verified 6/6 core services healthy** (3000, 3001, 3002, 3003, 3005, 8080)
- **Full test suite: 709 tests passing** (34+424+75+49+41+24+62)
- **CG Challenge Library expanded** — 5 → 16 challenges across 3 tracks (Impact/Creative/Business), based on DISCOVERY-FLOW-APPENDIX.md Appendix D
- **Git:** committed + pushed — challenge library expansion (`bot/handlers.py`, `tests/test_handlers.py`, PROGRESS.md)

## What's Left (User Action Required)

| Priority | Item | Blocker |
|----------|------|---------|
| P0 | Deploy Audio Tool to Vercel | Needs vercel.com import + env vars |
| P0 | Add OpenRouter credits ($5-10) | Unblocks real AI meditation |
| P1 | Review Contribution Graph CONCEPT.md + PILOT.md | Phase 0 go/no-go |
| P1 | Add CG Telegram bot token | Connect bot to actual Telegram |
| P2 | Add Telegram bot tokens | Youth Platform + Festival Coordinator Phase 2 |

## Infrastructure

- **Persistent service manager:** `systemctl --user start/stop/restart workspace-services`
- **Test suite:** 709 tests across 7 projects (vitest + pytest) — run per-project, not from workspace root
- **Cron:** Wakeup (30min), Worker-1 (5h), Worker-3 (5h)
- **Git:** master at `6c8ac96` + unstaged changes (to be committed: challenge library expansion)
