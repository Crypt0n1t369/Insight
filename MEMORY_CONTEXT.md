# MEMORY_CONTEXT.md — Session Context 2026-03-27

## Active Projects

### Solar Scout
- **Phase:** Outreach-ready — 46 clean manufacturing leads (104.9 MW)
- **Location:** /home/drg/.openclaw/workspace/solar-scout/
- **Status:** 5 non-manufacturers removed (RSU, Maksim, PREMIUM, Tera, Lenda), 11 still "Manufacturing (likely)" unverified
- **Data:** 46 real companies, 35 with confirmed industry, 11 unverified
- **Outreach:** `docs/leads_outreach_real.json` (46 companies), `docs/EMAIL_TEMPLATE.md` (bilingual Latvian+English)
- **Git (solar-scout repo):** `00e3b48` — pushed to origin/master
- **⚠️ Blocked:** 11 companies need Lursoft/phone verification (web search blocked on credits)
- **Key file:** `docs/EMAIL_TEMPLATE.md` — outreach email template ready

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
- **Build tests:** 47/47 pytest passing (verified 2026-03-27 04:28 UTC)
- **Web server:** Running on port 3006 with SQLite persistence ✅
- **AI synthesis module:** Enhanced template; needs OpenRouter for real LLM
- **Git (workspace):** `6841c08` — commit includes SPEC.md + TEST_03_FESTIVAL + PROGRESS.md updates

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

- **Workspace:** `9697300` — docs: update MEMORY_CONTEXT - solar-scout 46 leads, EMAIL_TEMPLATE, git updated
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
