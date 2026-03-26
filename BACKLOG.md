# BACKLOG.md - Task Queue

## LAST UPDATED: 2026-03-26 00:47 UTC (Worker-1 session)

---

## 📋 WORKER-1 SESSION SUMMARY — 2026-03-26 10:47 UTC

**Status:** ✅ Contribution Graph Phase 0 review COMPLETE. All P0 items still blocked on user action. No unblocked build work.

### Services Verified This Session
| Service | Port | Status |
|---------|------|--------|
| Credo API | 3000 | ✅ Responding |
| Audio Backend | 3001 | ✅ Responding |
| Credo Frontend | 3002 | ✅ Next.js HTML |
| Audio Frontend | 3005 | ✅ HTTP 200 |
| Youth Platform | 3003 | ✅ `{"status":"ok"}` |
| JCI Portal | 8080 | (not checked — no endpoint) |

### Action Required — Top 3 by Impact

**1. Deploy Audio Tool to Vercel** (Highest Impact)
```
vercel.com → import Crypt0n1t369/Insight → Deploy
Env vars: OPENAI_API_KEY, OPENAI_API_BASE_URL=https://api.openai.com/v1, JWT_SECRET
```
→ Public URL + Telegram integration unblocked

**2. Add OpenRouter Credits** (Unblocks AI Meditation)
```
openrouter.ai/settings/keys → add $5-10 → credits
```
→ Fixes 402 on audio backend

**3. Review Contribution Graph Docs** (Phase 0 Go/No-Go)
```
Read: projects/contribution-graph/CONCEPT.md + PILOT.md
```
→ Decision needed to unblock build

---

## 🚨 BLOCKED - Waiting on User Action

### P0 — User Action Required
| # | Item | Action Needed | Impact |
|---|------|---------------|--------|
| 1 | Deploy Audio Tool to Vercel | vercel.com → import Crypt0n1t369/Insight → Deploy | Public URL + Telegram bot |
| 2 | Add OpenRouter Credits | openrouter.ai/settings/keys → add credits | Unblocks real AI meditation (currently 402) |
| 3 | **Contribution Graph Phase 0 — VALIDATION SPRINT** | Run Test 0.1 (paper prototype + 10 interviews) + answer Q6/Q7/Q8 | Phase 0 go/no-go ✅ DONE — see analysis below |
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

### 📋 CONTRIBUTION GRAPH — Phase 0 Go/No-Go Assessment (Aton ☀️🦞)

**Assessment date:** 2026-03-26

#### Concept Quality: ✅ STRONG
The blueprint is tight. Core Bet is explicit and testable. Cybernetic loop is the real product. Attribution mechanism is designed, not deferred. Three-layer architecture correctly sequenced.

#### Phase 0 Status: ❌ NOT STARTED
Zero tests run. Three critical questions unanswered:

| # | Question | Why It Blocks |
|---|----------|--------------|
| Q6 | What does onboarding deliver in the first 5 minutes? | No hook = no retention |
| Q7 | What perk actually motivates YOUR specific audience? | Perk model IS the retention mechanic |
| Q8 | Who is the first festival/event partner? | Gates Test 0.3 + feeds Q6/Q7 |

#### CONDITIONAL GO — Phase 0 Validation Sprint (1–2 weeks, €0–200)

**Week 1 (user action required — I cannot do this):**
1. Talk to 3–5 people aged 16–25. Ask: what would make you come back tomorrow? What perk makes work feel meaningful?
2. Run Test 0.1: Paper prototype + 10 interviews → ≥7/10 must say they'd use it
3. Identify one upcoming event (any event, not perfect)

**Week 2:**
- Test 0.3 at event (≥40% QR → quiz, ≥20% D7 return)
- Test 0.4: 5 org conversations (≥3 willing to provide perks)
- Decision package

**If you can't run a paper prototype interview in 1 week, the critical path is access to your target user — surface that blocker.**

#### Phase 0 Gate for Phase 1 Build:
- Test 0.1 PASS (≥7/10)
- Test 0.2 PASS (≥4/5)
- Q6, Q7, Q8 answered
- At least 1 festival funnel test run

#### My Ask from drg:
**Who are 3–5 people aged 16–25 you'd talk to this week?** I can help design the interview guide and paper prototype if you give me the contacts.

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
- **Contribution Graph Phase 0 review DONE** — CONDITIONAL GO, validation sprint is the critical path
- **All 639 tests passing** — no regressions
- **Git is clean** — workspace synced to `6da0310`

---

*Maintained by: Aton (wakeup cron, 2026-03-26 10:47 UTC)*
