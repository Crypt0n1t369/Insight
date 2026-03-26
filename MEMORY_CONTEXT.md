# MEMORY_CONTEXT.md — Session Context 2026-03-26

## Active Projects

### Contribution Graph (Kristaps' Life Work)
**Phase:** Discovery Flow Design complete. CONCEPT.md + DISCOVERY-FLOW.md + DISCOVERY-FLOW-APPENDIX.md written.
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

**Key remaining decisions before Phase 1 build:**
- Q6: Onboarding hook (first 5 minutes, specific challenge type + feedback)
- Q7: Most motivating perk for target demographic
- Q8: Next event for Test 0.2 (festival/acquisition)

### Audio Tool
- **Phase:** Operational (production)
- **Ports:** 3001 (backend), 3005 (frontend via vite preview)
- **Status:** 68 tests passing (34 workspace root + 34 in submodule code/)
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

## Session Summary (2026-03-26 13:05 UTC)

### This Session
- **Fixed contribution-graph identity tests** — 3 tests failing due to `CG_SERVER_SECRET` set after import instead of before. Moved env var before import. All 18/18 now pass.
- **Full test suite verified: 728 tests passing** (34+424+42+75+49+41+24+39)
- **All 6 services confirmed healthy** (3000, 3001, 3002, 3003, 3005, 8080)
- **Git:** pushed 2 commits to origin (`8af3924`, `d8e8e7c`)

## What's Left (User Action Required)

| Priority | Item | Blocker |
|----------|------|---------|
| P0 | Deploy Audio Tool to Vercel | Needs vercel.com import + env vars |
| P0 | Add OpenRouter credits ($5-10) | Unblocks real AI meditation |
| P1 | Review Contribution Graph docs | Phase 0 go/no-go decision |
| P1 | Review Credo docs | MVP build decision |
| P2 | Add Telegram bot tokens | Youth Platform + Festival Coordinator Phase 2 |

## Infrastructure

- **Persistent service manager:** `systemctl --user start/stop/restart workspace-services`
- **Test suite:** 681 tests across 7 projects (vitest + pytest)
- **Cron:** Wakeup (30min), Worker-1 (5h), Worker-3 (5h)
- **Git:** master at `2f60a31`, synced with origin
