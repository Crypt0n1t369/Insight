# MEMORY_CONTEXT.md — Session Context 2026-03-27

## Active Projects

### Solar Scout
- **Phase:** Outreach-ready — 15 validated companies (strict MX validation, 33.4 MW)
- **Location:** `/home/drg/.openclaw/workspace/solar-scout/`
- **Status:** 
  - `docs/leads_outreach_validated.csv` — 15 companies, confirmed deliverable email, strict MX validation ✅
  - `docs/email_drafts_validated.md` — 15 bilingual LV+EN email drafts ✅
  - `send_emails.py` — SMTP mail-merge sender (crash-resilient, per-email log) ✅
  - `docs/SEND_GUIDE.md` — Gmail/Mailgun/SendGrid setup guide ✅
  - Pipeline verified end-to-end: `generate_emails.py` → `regenerate_validated.py` → `send_emails.py --dry-run` ✅
- **Data:** 15 validated companies / 33.4 MW (46 original → 15 validated after MX + non-mfg filtering)
- **⚠️ Remaining 31 non-validatable** — null MX, localhost MX, NXDOMAIN, or non-manufacturers
- **Git:** `440c138` — latest pushed to origin/master

### Contribution Graph (CG — Kristaps' Life Work)
- **Phase:** Phase 0 validation materials COMPLETE — ready for user review + execution
- **Location:** `/home/drg/.openclaw/workspace/projects/contribution-graph/`
- **Git:** `6841c08` (workspace)
- **Key files:**
  - `SPEC.md` — Phase 0 results template, Phase 1 build spec, technical arch
  - `TEST_01_INTERVIEW_SCRIPT.md` — 5-screen prototype, 6 Qs, screener, consent script ✅
  - `TEST_02_ATTRIBUTION_FAIRNESS.md` — task brief, claim template, attestation form, negotiation protocol, survey ✅
  - `TEST_03_FESTIVAL_TOP_OF_FUNNEL.md` — Typeform quiz (7 Qs, 4 archetypes), result card template, 7-day bot onboarding ✅
  - `TEST_04_CLIENT_READINESS.md` — 1-pager, conversation guide, outreach email, problem template ✅
  - `PILOT.md` — Phase 0 validation protocol (4 tests, go/no-go gates)
- **Build tests:** 144 total (110 pytest + 34 vitest) ✅
- **Web server:** Running on port 3006 ✅

### Audio Tool (Audio Transformation Tool)
- **Phase:** Operational (production)
- **Ports:** 3001 (backend), 3005 (frontend)
- **Status:** 17 vitest tests passing ✅
- **Workspace server tests:** 34 vitest tests passing ✅
- **Submodule:** `projects/audio-transformation-tool/code` — updated to `b9ff70b` (fork/main)
- **9 protocols:** NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE — all demo mode working
- **Known issue:** OpenRouter credits exhausted (402 → demo fallback)

### Credo Collaboration Platform
- **Phase:** Operational
- **Ports:** 3000 (API)
- **Status:** 137 vitest tests passing ✅

### JCI Org Manager
- **Phase:** Operational | **Port:** 8080 | **Status:** 41 pytest tests passing (2 async thread warnings — cosmetic only)

### Youth Empowerment Platform
- **Phase:** Operational | **Port:** 3003 | **Status:** 24 pytest tests passing ✅

### Festival Coordinator
- **Phase:** Operational | **Status:** 140 pytest tests passing ✅

## Test Suite (Verified 2026-03-27 15:43 UTC)

| Project | Tests | Framework |
|---------|-------|-----------|
| Synthesis Platform (backend) | 460 | vitest |
| Synthesis Platform (UI client) | 6 | vitest |
| Festival Coordinator | 140 | pytest (venv) |
| Credo (collaboration-platform) | 137 | vitest |
| Contribution Graph | 110 | pytest |
| Audio Backend (workspace/server/ — running on 3001) | 34 | vitest |
| Audio Backend (code/server/ — submodule) | 17 | vitest |
| JCI Org Manager | 41 | pytest |
| Youth Empowerment Platform | 24 | pytest |
| **Total** | **969** | |

> Updated 2026-03-27 15:43 UTC: Synthesis backend = 460 (was 444); Added 6 Synthesis UI API client tests. Total now 969.

## Service Status (2026-03-27 15:43 UTC)

All services healthy: 3000 ✅ | 3001 ✅ (X-Demo-Mode: credits_exhausted on all AI endpoints) | 3003 ✅ | 3005 ✅ | 3006 ✅ | 8080 ✅ | 3004 ✅ | 3007 ✅ (Synthesis UI — NEW)

## Git

- **Workspace:** `d38d30e` — pushed to origin/master ✅
- **Solar Scout:** Pushed and synced (separate repo: `7238f4e`)

## What's Left (User Action Required)

| Priority | Item | Blocker |
|----------|------|---------|
| **P0** | **OpenRouter credits (~$5-10)** | openrouter.ai → add credits — key has ~3 token daily limit (free tier); AI features blocked until credits added |
| **P0** | **CG Test 0.1 — Review script + recruit** | Review `projects/contribution-graph/TEST_01_INTERVIEW_SCRIPT.md` + recruit 10–12 participants |
| **P0** | **CG Test 0.3 — Identify event** | Find 1 event in next 4–8 weeks |
| **P0** | **CG Test 0.4 — Identify orgs** | 5 target orgs for Phase 0 |
| **P1** | **Solar Scout SMTP** | Set SMTP env vars → `send_emails.py --dry-run --all` → `--test` → full send |
| **P1** | **CG Telegram bot token** | BotFather → new token → `TELEGRAM_BOT_TOKEN` for Phase 2 |
| **P1** | **Audio Tool → Vercel** | vercel.com → import + env vars |

## This Session (14:29 UTC)

- **947 tests confirmed** ✅ — all projects verified passing
- **All 6 services healthy** ✅ — 3000, 3001, 3003, 3005, 3006, 8080
- **MEMORY_CONTEXT updated** — test counts corrected (930→947), git hash updated
- **PROGRESS.md updated** ✅ — pushed commit `4259354`
- **Git is clean** ✅
