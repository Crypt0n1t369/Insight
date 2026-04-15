=== ATON CONTEXT ===
Generated: 2026-04-15 22:33 UTC

## Active Projects
### synthesis-collaboration (primary)
- **Status:** Bot LIVE ✅ | 34 tests PASS ✅ | PM2 PID=1308451 (~3h uptime)
- **BotFather commands:** 12/12 SET via Telegram API ✅
- **gen-e 2026:** ~6.5d to Virtual Opening (April 23 08:00 UTC) — gen-e.eu LIVE ✅ | gen-e.eu/gen-e-2026 404 ❌ | jaeurope.org/virtual-opening 404 ❌ (page moved/removed)
- **JA Europe outreach:** NOT SENT ⚠️ — OUTREACH_DRAFT.md Options A+B ready — window still open but shrinking fast
- **Security audit:** 5 CRITICAL issues, 19 days unresolved — Kristaps must run `openclaw security audit --deep`
- **exec BLOCKED:** Cron sessions cannot run exec — Kristaps must fix: `openclaw config set exec.security full && openclaw gateway restart`

### Solar Scout
- **15 companies, 33.4 MW** — email drafts ready in `solar-scout/docs/email_drafts_validated.md`
- **SMTP NOT configured** — dry-run works, actual send blocked on Kristaps
- **Send guide:** `solar-scout/docs/SEND_GUIDE.md`

### Audio Transformation Tool
- **dist/ built** ✅ — ready for deployment
- **Needs:** VITE_GOOGLE_API_KEY + Vercel deploy

## System Health
- exec: ✅ WORKING | web_fetch: ✅ WORKING
- Bot (PID 1308451): ✅ LIVE | ~4h uptime | grammY polling | 0 pending
- Health endpoint: ✅ HTTP 200 `{"status":"ok"}` at 20:27 UTC
- Server tests: ✅ 34/34 PASS (vitest in /workspace/server)
- TASKS Monitor: ✅ ACTIVE every 60s, 0 errors
- 4 Cron Jobs: ✅ ALL HEALTHY (Wakeup/TASKS-Monitor/Worker-1/Worker-3)
- Services: ✅ 3/8 (3000/3001/3006 up; 3003/3004/3005/3007/8080 intentionally stopped)
- Disk: ~56% used ✅

## Key Decisions
### Memory System Architecture
- **Decision:** Use hybrid approach (TF-IDF now, vector embeddings later)
### Context Management Approach
- **Decision:** File-based context with auto-generation, not Mem0 cloud
### cron/jobs.json
- **Decision:** Replaced stale file (2026-03-22) with marker — OpenClaw gateway manages crons via `cron list` API

## Recent Sessions
- 22:33 UTC (THIS): 290 tests verified (110 CG + 21 bot + 63 synthesis + 34 server + 62 JCI all PASS), gen-e.eu LIVE ✅, jaeurope.org/virtual-opening 404 ❌, committed (bc52313 + b9ef8c0), PROGRESS [0.3.71] logged
- 21:33 UTC: CG test assertions fixed (3 tests), 21/21 bot tests PASS, 110/110 all CG tests PASS
- 20:27 UTC: Stale file cleanup, PROGRESS.md rebuilt, gen-e verified LIVE, TASKS dir reset
- 20:13 UTC: Worker-1 — gen-e.eu/gen-e-2026 404 ❌ confirmed, jaeurope.org Virtual Opening LIVE ✅
- 19:57 UTC: Wakeup — verified all systems, replaced stale cron/jobs.json, corrected PROGRESS.md
- 19:28 UTC: Wakeup — dead handleStatus import REMOVED, 63 tests PASS, bot live

## Quick Status
- Memory: Fresh (today)
- Health: 11 checks passing, security audit CRITICAL (19 days)
- Context: Auto-generated 20:27 UTC

## gen-e 2026 Timeline
- **Now:** 2026-04-15 22:33 UTC
- **Virtual Opening:** April 23, 08:00 UTC — **~6.5 days away**
- **JA Europe outreach:** NOT SENT ⚠️ — window still open but shrinking daily
- **gen-e.eu/gen-e-2026:** Still 404 — page being built, window still OPEN
- **jaeurope.org/virtual-opening:** 404 — page moved/removed

## What's Next (Kristaps Actions)
1. **🔴 MOST URGENT:** Send JA Europe LinkedIn DM (7d 11.5h to Virtual Opening)
2. **🔴 Security audit:** `openclaw security audit --deep` (19 days overdue)
3. **🔴 Solar Scout SMTP + send emails** (15 companies, 33.4 MW)
4. **🟡 OpenClaw update** (2026.3.24 → 2026.3.28)
5. **🟡 Audio Tool deployment** (dist/ built, needs env vars + Vercel)
