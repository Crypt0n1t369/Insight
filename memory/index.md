# Memory Index

## Structure (PARA)

| Folder | Purpose | TTL |
|--------|---------|-----|
| 00-inbox | Quick captures | <24h |
| 01-areas | Ongoing responsibilities | Permanent |
| 02-resources | Evergreen reference | Permanent |
| 03-projects | Active work | 3-6 months |
| 04-archives | Completed | Archived |

## Areas
- ai-automation
- productivity

## Active Projects (as of 2026-03-29)
- **synthesis** (port 3004 API, port 3007 UI) — WOOP + SE agents, KG graph (102 nodes/48 edges/86 sessions), 495 vitest, Supabase Phase 2 ready
- **audio-transformation-tool** (port 3001 backend, port 3005 frontend) — 10 protocols (NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE, GENERAL), demo mode, Vercel deployment doc written
- **collaboration-platform / Credo** (port 3000 API) — RLS deferred, credibility engine, 137 vitest
- **jci-org-manager** (port 8080) — LLM engagement agent (OpenRouter), 62 pytest
- **festival-coordinator** — Phase 2 pending Telegram bot (140 pytest), admin checks wired in bot.py
- **youth-empowerment-platform** (port 3003) — SEED methodology, 24 pytest
- **contribution-graph** (port 3006 web) — Phase 0 materials ready (TEST_01-04), 110 pytest, Telegram bot token needed
- **solar-scout** (outreach pipeline) — 15 validated companies (33.4 MW, MX-validated), 10 more Tier 2 (~22 MW, no MX), SMTP pre-flight ready

## Areas
- ai-automation
- productivity
- knowledge-management (synthesis KG)
- outreach (solar-scout, CG acquisition)
- bot-development (Telegram bots for Credo, Festival, CG)

## Tags
- #ai - AI/ML
- #project - Active project
- #decision - Key decision
- #todo - Action item
- #learned - Lessons
- #blocked - Requires user action

## Scripts
- capture.py - Quick note
- triage.py - Sort inbox
- link.py - Find connections
- recall.py - Search memory

## Test Suite Summary (1,002 tests, all passing as of 2026-03-29)
| Project | Tests | Type |
|---------|-------|------|
| Synthesis Platform | 495 | vitest |
| Credo Platform | 137 | vitest |
| Contribution Graph | 110 | pytest (47 API + 24 web + 39 bot/db) |
| Festival Coordinator | 140 | pytest |
| JCI Org Manager | 62 | pytest |
| Audio Backend | 34 | vitest |
| Youth Platform | 24 | pytest |

---

Updated: 2026-03-29
