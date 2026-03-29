=== ATON CONTEXT ===
Generated: 2026-03-29 10:26 Cairo (08:26 UTC)

## Active Projects

### Solar Scout (Latvia Solar Leads) — EMAIL PIPELINE READY ⚠️ SMTP BLOCKED
- **Status:** Pipeline complete, SMTP not configured
- **What works:** `regenerate_validated.py` → `generate_emails.py` → `send_emails.py --dry-run-all`
- **15 validated companies / 33.4 MW** — all MX-validated, personalized LV+EN emails
- **P0 blocker:** User must configure SMTP env vars (Gmail App Password / Mailgun / SendGrid)
- **Docs:** solar-scout/docs/SEND_GUIDE.md

### Audio Transformation Tool — DEMO MODE RUNNING ⚠️
- **Status:** Backend (3001) running from workspace root `server/` — demo mode, 10 protocols
- **⚠️ CRITICAL:** `workspace/server/` is git-tracked; feature/festival-coordinator branch would DELETE it
- **Working:** NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE, GENERAL
- **P0 blocker:** Vercel deployment for public URL + Telegram integration
- **No OpenRouter credits:** AI features return 402 errors

### Synthesis Platform — RUNNING ✅
- **Status:** 3004 API healthy, 3007 UI healthy
- **KG:** 102 nodes, 47 edges, 86 sessions, 3251 events
- **Note:** KGStoragePassthroughAdapter (no Supabase) — data not persisted to disk
- **P0 blocker:** Supabase project needed for KG persistence + Phase 2

### Contribution Graph (CG) — PHASE 0 VALIDATION ⚠️
- **Status:** Tests 0.1–0.4 drafted, no participants recruited
- **P0 blockers:** User must review interview script, recruit, identify event + orgs
- **Bot token:** BotFather token needed for Phase 2

### Other Projects (JCI, Festival, Youth, Credo) — STABLE ✅
- All services healthy, tests passing
- No immediate action needed

## 🚨 CRITICAL — feature/festival-coordinator Branch: DO NOT MERGE AS-IS
- **Confirmed:** Branch would DELETE `workspace/server/` which runs audio backend on port 3001
- **Impact if merged:** Audio backend stops, 34 workspace vitest tests fail, frontend (3005) stops
- **Why it's dangerous:** `server/` is git-tracked in master; branch does not contain it
- **What branch DOES right:** Removes exposed `.env.supabase` (Supabase URL + key), obsolete skills, test configs
- **Options:** Rebase cleanup on master keeping server/, OR cherry-pick security fixes, OR close branch

## Key Blockers (User Action Required)
| # | Item | Blocker |
|---|------|---------|
| 1 | **Approve security fixes** | `exec.security=allowlist` + `groupPolicy=restricted` — 9+ HOURS overdue |
| 2 | **Solar Scout email send** | SMTP env vars not configured |
| 3 | **OpenRouter credits** | openrouter.ai → add $5–10 |
| 4 | **Audio Tool → Vercel** | vercel.com → import + env vars |
| 5 | **Supabase** | supabase.com → create project |
| 6 | **CG Test 0.1** | Review interview script + recruit |

## Security Issues (CRITICAL — Awaiting Approval Since 2026-03-29 01:26 UTC — 9+ HOURS)
- `tools.exec.security = "full"` — should be `"allowlist"` 
- `channels.telegram.groupPolicy = "open"` — should be `"restricted"`
- **Approval needed:** `/approve` the security fixes

## Quick Status
- Services: 8/8 HTTP 200 (3000/3001/3003/3004/3005/3006/3007/8080) ✅
- Tests: 778 passing this session (workspace 34, synthesis 495, CG 47, JCI 62, festival 140)
- Git: clean ✅
- Cron: running OK ✅
