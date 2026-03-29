=== ATON CONTEXT ===
Generated: 2026-03-29 13:29 UTC

## Active Projects

### Solar Scout (Latvia Solar Leads) — EMAIL PIPELINE READY ⚠️ SMTP BLOCKED
- **Status:** Pipeline complete, SMTP not configured
- **What works:** `regenerate_validated.py` → `generate_emails.py` → `send_emails.py --dry-run-all` (all CWD-independent ✅)
- **Email template bug fixed:** Added `SENDER_COMPANY` field; LV body now says "Esmu [name] no [Company]" (commit `d3a2188`)
- **15 validated companies / 33.4 MW** — all MX-validated, personalized LV+EN emails
- **P0 blocker:** User must configure SMTP env vars + `SENDER_COMPANY`
- **Docs:** solar-scout/docs/SEND_GUIDE.md

### Audio Transformation Tool — DEMO MODE RUNNING ⚠️
- **Status:** Backend (3001) running from workspace root `server/` — demo mode, 10 protocols
- **⚠️ CRITICAL:** `workspace/server/` is git-tracked; feature/festival-coordinator branch would DELETE it
- **Working:** NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE, GENERAL
- **P0 blocker:** Vercel deployment for public URL + Telegram integration
- **No OpenRouter credits:** AI features return 402 errors

### Synthesis Platform — RUNNING ✅
- **Status:** 3004 API healthy, 3007 UI healthy
- **KG:** 152 nodes, 67 edges, 136 sessions (updated 13:27 UTC) — healthy, autosaving ✅
- **Route note:** Use `GET /api/stats` (not `/api/kg/stats` — docs outdated)
- **Persistence:** KG autosaves to `data/synthesis/knowledge-graph.json` (14KB)

### Contribution Graph (CG) — PHASE 0 VALIDATION ⚠️
- **Status:** Tests 0.1–0.4 drafted, no participants recruited
- **P0 blockers:** User must review interview script, recruit, identify event + orgs
- **Bot token:** BotFather token needed for Phase 2

### Other Projects (JCI, Festival, Youth, Credo) — STABLE ✅
- All services healthy, tests passing

## 🚨 CRITICAL — feature/festival-coordinator Branch: DO NOT MERGE AS-IS
- **Confirmed:** Branch would DELETE `workspace/server/` which runs audio backend on port 3001
- **Impact if merged:** Audio backend stops, 34 workspace vitest tests fail, frontend (3005) stops
- **Options:** Close branch — no merge needed. All FC content is on master at `projects/festival-coordinator/`.

## Key Blockers (User Action Required)
| # | Item | Blocker |
|---|------|---------|
| 1 | **Approve security fixes** | `exec.security=allowlist` + `groupPolicy=restricted` — 14+ HOURS overdue |
| 2 | **Solar Scout email send** | SMTP env vars not configured |
| 3 | **OpenRouter credits** | openrouter.ai → add $5–10 |
| 4 | **Audio Tool → Vercel** | vercel.com → import + env vars |
| 5 | **CG Test 0.1** | Review interview script + recruit |

## Security Issues (CRITICAL — Awaiting Approval Since 2026-03-29 01:26 UTC — 14+ HOURS)
- `tools.exec.security = "full"` — should be `"allowlist"`
- `channels.telegram.groupPolicy = "open"` — should be `"restricted"`
- **Fix 1:** `openclaw config.patch '{"exec": {"security": "allowlist"}}'`
- **Fix 2:** `openclaw config.patch '{"channels": {"telegram": {"groupPolicy": "restrict"}}}'
- **Approval needed:** `/approve` both fixes (gateway restarts after each)

## Quick Status
- Services: 8/8 HTTP 200 (3000/3001/3003/3004/3005/3006/3007/8080) ✅
- Tests: 844+ passing (synthesis 495, CG 47+24+18, JCI 62, festival 140, youth 24, workspace/server 34)
- Git: clean ✅ (commit e0f31dc)
