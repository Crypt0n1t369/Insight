# MEMORY_CONTEXT.md — Session Context 2026-03-27

## Active Projects

### Solar Scout
- **Phase:** Outreach-ready — 46 clean manufacturing leads (104.9 MW total)
- **Location:** /home/drg/.openclaw/workspace/solar-scout/
- **Status:** Outreach list `docs/leads_outreach_real.json` — 46 companies, verified by industry + capacity data. Email template `docs/EMAIL_TEMPLATE.md` — 127-line bilingual Latvian+English, ready to send.
- **Data:** 46 companies across 27 industry categories (4×Dairy, 4×Construction, 3×Wood, 3×Food, etc.) = 104.9 MW total rooftop/industrial solar potential
- **⚠️ 11 "Manufacturing (likely)" in leads_dashboard.csv** — Riviera.lv (site under construction), Latsr/Kopa/Gerhard/Krass/Len/Vests/Sakart/Sent/Bermas/Latgales.lv — all confirmed NXDOMAIN/no web presence. NOT in outreach list (already filtered). Verifiable via Lursoft.lv or +371 phone calls if credits added.
- **Outreach:** `docs/leads_outreach_real.json` (46 companies), `docs/EMAIL_TEMPLATE.md` (bilingual, ready)
- **Git (solar-scout repo):** `00e3b48` — pushed to origin/master
- **Ready to send** — user fills [YOUR_NAME], [YOUR_EMAIL], BCC; then send via email client

### Contribution Graph (Kristaps' Life Work)
- **Phase:** Phase 0 validation materials COMPLETE — ready for user review + execution
- **Location:** `/home/drg/.openclaw/workspace/projects/contribution-graph/`
- **Git:** `6841c08` (workspace) — all Phase 0 docs + SPEC.md committed
- **Key files:**
  - `SPEC.md` — **NEWLY CREATED** — Phase 0 results template, Phase 1 build spec, technical arch, open questions tracker
  - `TEST_01_INTERVIEW_SCRIPT.md` — 5-screen prototype, 6 Qs, screener, consent script ✅
  - `TEST_02_ATTRIBUTION_FAIRNESS.md` — task brief, claim template, attestation form, negotiation protocol, survey ✅
  - `TEST_03_FESTIVAL_TOP_OF_FUNNEL.md` — **NEWLY CREATED** — Typeform quiz (7 Qs, 4 archetypes), result card template, 7-day bot onboarding, Day-7 survey, funnel tracking, materials checklist, day-of pitch guide
  - `TEST_04_CLIENT_READINESS.md` — 1-pager, conversation guide, outreach email, problem template ✅
  - `PILOT.md` — Phase 0 validation protocol (4 tests, go/no-go gates)
  - `DISCOVERY-FLOW.md` — 5-phase conversation design
  - `IDENTITY-ARCHITECTURE.md` — short-code identity, map delivery, re-engagement
- **Build tests:** 89/89 pytest passing (added regression test — verified 2026-03-27 04:28 UTC)
- **Web server:** Running on port 3006 with SQLite persistence ✅
- **AI synthesis module:** Enhanced template; needs OpenRouter for real LLM
- **Git (workspace):** `6841c08` — commit includes SPEC.md + TEST_03_FESTIVAL + PROGRESS.md updates

### Audio Tool
- **Phase:** Operational (production)
- **Ports:** 3001 (backend), 3005 (frontend)
- **Status:** 34 vitest tests passing
- **9 protocols:** NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE — all demo mode working
- **Code drift fixed:** workspace root `server/` and code submodule `code/server/` now fully synced (submodule was missing `/api/protocols` + director null-safe handling)
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

## Test Suite (Verified 2026-03-27 09:12 UTC)

| Project | Tests | Framework |
|---------|-------|-----------|
| Synthesis Platform | 424 | vitest |
| Festival Coordinator | 140 (was 49) | pytest |
| Credo (collaboration-platform) | 131 | vitest |
| Contribution Graph | 110 (18 identity + 48 handlers + 23 web + 21 bot) | pytest |
| Audio Backend (server/) | 34 | vitest |
| JCI Org Manager | 41 | pytest |
| Youth Empowerment Platform | 24 | pytest |
| **Total** | **904** | |

## Service Status (2026-03-27 05:58 UTC)

All 7 services up: 3000 ✅ | 3001 ✅ | 3002 ✅ | 3003 ✅ | 3005 ✅ | 3006 ✅ | 8080 ✅

## Git

- **Workspace:** `cb89515` — docs: update PROGRESS — 07:28 session, bot tests 110 total, archived 04:39
- **Solar Scout:** `00e3b48` — pushed to origin/master
- **Synced with origin/master**
- **Audio submodule:** server/*.js,*.map,*.d.ts now gitignored (build artifacts)

## What's Left (User Action Required)

| Priority | Item | Blocker |
|----------|------|---------|
| **P0** | **CG Test 0.1 — Review script + recruit** | Review `projects/contribution-graph/TEST_01_INTERVIEW_SCRIPT.md` + recruit 10–12 participants (aged 18–30, in transition) |
| P0 | Add OpenRouter credits (~$5-10) | Unblocks web research + CG synthesis + AI meditation |
| P0 | Verify 11 Solar Scout leads | Lursoft.lv or +371 calls (Riviera, Latsr, Kopa, JSC Latgales, Gerhard, Krass, Sent, Bermas, Len, Vests, Sakart) |
| P0 | Approve 46-company outreach list | Email template ready in solar-scout/docs/EMAIL_TEMPLATE.md |
| P1 | Deploy Audio Tool to Vercel | vercel.com import + env vars (OPENAI_API_KEY, JWT_SECRET) |
| P1 | Deploy CG Web to Vercel | Needs vercel.com import + env vars |
| P1 | Add CG Telegram bot token | BotFather → new token for Phase 2 |
| P2 | Add Telegram bot tokens | Youth Platform + Festival Coordinator Phase 2 |
