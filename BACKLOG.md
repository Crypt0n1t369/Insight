# BACKLOG.md - Task Queue

## LAST UPDATED: 2026-03-25 14:28 UTC (wakeup session)

---

## 🚨 BLOCKED - Waiting on User Action

### P0 — User Action Required
| # | Item | Action Needed | Impact |
|---|------|---------------|--------|
| 1 | Deploy Audio Tool to Vercel | vercel.com → import Crypt0n1t369/Insight → Deploy | Public URL + Telegram bot |
| 2 | Add OpenRouter Credits | openrouter.ai/settings/keys → add credits | Unblocks real AI meditation (currently 402) |
| 3 | Review Contribution Graph docs | Read projects/contribution-graph/ CONCEPT.md + PILOT.md | Phase 0 go/no-go |
| 4 | Review Credo Docs | Read projects/collaboration-platform/ SPEC.md + SCHEMA.md + PILOT.md | MVP build decision |
| 5 | Add TELEGRAM_BOT_TOKEN (Youth Platform) | Add to projects/youth-empowerment-platform/.env | Phase 2 Telegram bot |
| 6 | Add TELEGRAM_BOT_TOKEN (Festival Coordinator) | Add to projects/festival-coordinator/.env | Phase 2 Telegram bot |

### P2 — Optional Enhancements
| # | Item | Action Needed | Priority |
|---|------|---------------|----------|
| 7 | JCI LLM Enhancement | Add MINIMAX_API_KEY to projects/jci-org-manager/.env | Low |

---

## ✅ COMPLETED (2026-03-25)

### ACT Specialist Agent ✅
- **Added:** `act.ts` + `act.test.ts` (29 tests) — Acceptance and Commitment Therapy
- **Commit:** `da88305` — fully integrated with AGENT_REGISTRY
- **Result:** Synthesis platform now has 7 specialist agents (WOOP, IFS, NSDR, BREATHWORK, SE, ACT, GENERAL)
- **Total tests:** 382 synthesis → 639 total across all projects

### SE Specialist Agent ✅
- **Implemented:** Somatic Experiencing agent (22 tests)
- **Commit:** `6da0310` — synthesis SPECS updated

### Service Supervision ✅
- **Fixed:** All 6 services now confirmed running and healthy
- Services: Credo API (3000), Audio API (3001), Credo Frontend (3002), Audio Frontend (5173), Youth (3003), JCI (8080)

### Telegram groupPolicy ✅
- **Hardened:** `groupPolicy: "open"` → `"allowlist"` in gateway config

---

## 📋 READY TO BUILD (When Blockers Resolved)

### Festival Coordinator Phase 2
- Bot handlers ready (334 lines handlers.py, 778 lines service.py)
- Needs TELEGRAM_BOT_TOKEN only

### Youth Platform Phase 2
- Telegram bot complete (src/bot/telegram_bot.py with vault/journey features)
- Needs TELEGRAM_BOT_TOKEN only

### JCI Bot LLM Enhancement
- Optional MINIMAX_API_KEY for LLM-powered features
- Bot fully functional without it

---

## 🔍 NOTES FOR USER

- **All code tasks are blocked** — every remaining item requires user-provided secrets or decisions
- **Nothing to build right now** — all P0/P1/P2 code items are done or waiting on user
- **All 639 tests passing** — no regressions
- **Git is clean** — workspace synced to `6da0310`

---

*Maintained by: Aton (wakeup cron, 2026-03-25)*
