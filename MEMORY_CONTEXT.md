=== ATON CONTEXT ===
Generated: 2026-03-29 09:56 Cairo (07:56 UTC)

## Active Projects

### Solar Scout (Latvia Solar Leads) — EMAIL PIPELINE READY ⚠️ SMTP BLOCKED
- **Status:** Pipeline complete, SMTP not configured
- **What works:** `regenerate_validated.py` → `generate_emails.py` → `send_emails.py --dry-run-all`
- **15 validated companies / 33.4 MW** — all MX-validated, personalized LV+EN emails
- **P0 blocker:** User must configure SMTP env vars (Gmail App Password / Mailgun / SendGrid)
- **Docs:** solar-scout/docs/SEND_GUIDE.md

### Audio Transformation Tool — DEMO MODE READY, VERCEL PENDING ⚠️
- **Status:** Demo mode active, 10 protocols, backend (3001) healthy
- **Working:** NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE, GENERAL
- **P0 blocker:** Vercel deployment needed for public URL + Telegram integration
- **No OpenRouter credits:** AI features return 402 errors

### Synthesis Platform — RUNNING ✅
- **Status:** 3004 API healthy, 3007 UI healthy
- **KG:** 97 nodes, 45 edges, 81 sessions, 3061 events
- **Note:** KGStoragePassthroughAdapter (no Supabase) — data not persisted to disk
- **P0 blocker:** Supabase project needed for KG persistence + Phase 2

### Contribution Graph (CG) — PHASE 0 VALIDATION ⚠️
- **Status:** Tests 0.1–0.4 drafted, no participants recruited
- **P0 blockers:** User must review interview script, recruit, identify event + orgs
- **Bot token:** BotFather token needed for Phase 2

### Other Projects (JCI, Festival, Youth, Credo) — STABLE ✅
- All services healthy, tests passing
- No immediate action needed

## Notable: feature/festival-coordinator Branch (Unmerged)
- `git log master..feature/festival-coordinator` shows massive cleanup (423 files, ~90K deletions)
- Not reviewed/merged yet — user should evaluate

## Key Blockers (User Action Required)
| # | Item | Blocker |
|---|------|---------|
| 1 | **Solar Scout email send** | SMTP env vars not configured |
| 2 | **OpenRouter credits** | openrouter.ai → add $5–10 |
| 3 | **Audio Tool → Vercel** | vercel.com → import + env vars |
| 4 | **Supabase** | supabase.com → create project |
| 5 | **CG Test 0.1** | Review interview script + recruit |
| 6 | **CG Test 0.3/0.4** | Identify event + 5 orgs |

## Security Issues (CRITICAL — Awaiting Approval Since 2026-03-29 01:26 UTC — 6.5+ HOURS)
- `tools.exec.security = "full"` — should be `"allowlist"` 
- `channels.telegram.groupPolicy = "open"` — should be `"restricted"`
- **Approval needed:** `/approve` the security fixes

## Quick Status
- Services: 8/8 HTTP 200 (3000/3001/3003/3004/3005/3006/3007/8080) ✅
- Tests: 884 passing (6 suites verified): workspace 34, festival 140, JCI 62, CG 110, synthesis 495, audio 43 ✅
- Git: clean ✅
- Cron: running OK, no consecutive errors ✅
