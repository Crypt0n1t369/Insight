# BACKLOG.md - Task Queue

## LAST UPDATED: 2026-03-27 11:55 UTC (Worker-1 session)

---

## 📋 WORKER-1 SESSION SUMMARY — 2026-03-26 20:50 UTC

**Status:** ✅ CREDO credibility bugs (3) fixed. RLS decision still pending. All P0 code items blocked on user action.

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

**3. Build CREDO MVP** ✅ RLS DECISION DONE — Ready to build
```
SCHEMA.md updated: RLS deferred to Phase 2
→ Application-level auth middleware required at API entry
→ All 3 credibility bugs fixed (commit dca8dfe)
→ CREDO is now unblocked for Phase 1 build
```

---

## 🚨 BLOCKED - Waiting on User Action

### P0 — User Action Required
| # | Item | Action Needed | Impact |
|---|------|---------------|--------|
| 1 | Deploy Audio Tool to Vercel | vercel.com → import Crypt0n1t369/Insight → Deploy | Public URL + Telegram bot |
| 2 | Add OpenRouter Credits | openrouter.ai/settings/keys → add credits | Unblocks real AI meditation (currently 402) |
| 3 | **Contribution Graph Phase 0 — VALIDATION SPRINT** | Run Test 0.1 (paper prototype + 10 interviews) + answer Q6/Q7/Q8 | Phase 0 go/no-go ✅ DONE — see analysis below |
| 4 | ~~Review Credo Docs~~ | ~~Read SPEC.md + SCHEMA.md + PILOT.md~~ | ✅ **REVIEWED — BUILD DECISION MADE** |
| 5 | Add TELEGRAM_BOT_TOKEN (Youth Platform) | Add to projects/youth-empowerment-platform/.env | Phase 2 Telegram bot |
| 6 | Add TELEGRAM_BOT_TOKEN (Festival Coordinator) | Add to projects/festival-coordinator/.env | Phase 2 Telegram bot |

### P2 — Optional Enhancements
| # | Item | Action Needed | Priority |
|---|------|---------------|----------|
| 7 | JCI LLM Enhancement | Add MINIMAX_API_KEY to projects/jci-org-manager/.env | Low |

---

## ✅ COMPLETED (2026-03-25)

### Credibility Engine Bugs Fixed ✅ (2026-03-26)
- **Bug 1:** Endorsement formula now uses contribution `weight` (synthesis=5, idea=3, etc.) instead of flat +1. Endorser also earns +1 (encourages curation). Self-endorsement blocked.
- **Bug 2:** `calculateTrustTier()` threshold fixed — elder=2000 now matches SCHEMA (was 1000).
- **Bug 3:** `on_endorsement()` trigger updated in SCHEMA.md; `get_weight_for_type()` SQL function added; SPEC.md fully documented.
- **Commit:** `dca8dfe` — 34/34 tests passing

**Commit:** `cb5a2f2` — App-level auth middleware (authenticate/optionalAuth/requireTier) ✅
- `src/middleware/auth.ts` — proper UUID v4 validation, 401/400/403 codes
- All 10 protected route handlers updated from manual header checks to middleware
- 6 new tests (auth-middleware.test.ts) — 137 total tests passing
- Git pushed ✅
- **Files:** `src/services/contribution.ts`, `src/services/identity.ts`, `src/types/index.ts`, `SPEC.md`, `SCHEMA.md`

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

- **CREDO MVP is unblocked** — RLS deferred to Phase 2, app-level auth required at API entry
- **Contribution Graph Phase 0 review DONE** — CONDITIONAL GO, validation sprint is the critical path (needs user to run interviews)
- **All 639 tests passing** — no regressions
- **Git is clean** — workspace synced to `dca8dfe` (credibility bug fixes)
- **Credo RLS decision made this session** — SCHEMA.md updated with deferral note

---

*Maintained by: Aton (wakeup cron, 2026-03-26 10:47 UTC)*

---

## ☀️ CREDO MVP BUILD DECISION — Aton Review (2026-03-26)

**Verdict: BUILD IT. Three caveats, all fixable.**

---

### SPEC.md — Architecture: Strong

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Architecture | ✅ Strong | 6-service clean separation, GraphQL+REST+WS is right choice |
| Auth (MVP) | ✅ Strong | UUID-in-localStorage + HTTP-only cookie is appropriate |
| ZK Deferral | ✅ Smart | Phase 3 correctly deferred — saves 2 sprints of complexity |
| State Mgmt | ✅ Solid | Zustand + React Query is the right stack |
| GraphQL Schema | ⚠️ Incomplete | Missing `limit`/`offset` on `branchContributions`, no cursor pagination |

**3 bugs to fix before build — ALL FIXED ✅ (commit `dca8dfe`):**
1. ✅ **Tier thresholds mismatch** — Fixed: elder=2000 in identity.ts and SCHEMA.md. SPEC.md now documents exact thresholds.
2. ✅ **Contribution weight derivation** — Fixed: `getContributionWeight()` in contribution.ts, `get_weight_for_type()` in SCHEMA. SPEC.md has full weight table.
3. ✅ **Endorsement score formula missing** — Fixed: Author earns `weight` per endorsement, endorser earns +1. Self-endorsement blocked. Fully documented in SPEC + SCHEMA.

---

### SCHEMA.md — Database: Solid

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Schema design | ✅ Solid | Proper UUID PKs, indexes on FKs and filter fields, composite UNIQUE for endorsements |
| Triggers | ✅ Correct | `update_branch_stats` and `on_endorsement` chains are well-designed |
| Quadratic weight | ✅ Right | `FLOOR(SQRT(tokens))` matches spec |
| RLS | ⚠️ Placeholder | Auth setup assumes `auth.uid()` but anonymous auth has no Supabase user — needs `anon.uid()` or custom JWT approach |
| Seed data | ✅ Good | System user + Welcome branch is correct MVP starting state |

**1 blocker:** The RLS policies reference `auth.uid()` but anonymous auth won't create Supabase auth users. Solution: use a custom `get_session_user_id()` function or skip RLS for MVP (acceptable risk).

---

### PILOT.md — Pilot Plan: Ready to Execute

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Design | ✅ Strong | Low-tech (Notion + Sheets), 4 weeks, clear metrics |
| Consent form | ✅ Good | Covers withdrawal, anonymity, time commitment |
| Contribution types | ✅ Match SPEC | Research/Comment/Review/Synthesis with weights |
| Risk mitigation | ✅ Covered | Low participation, domination, dropout all addressed |
| Status | ❌ Not started | Pilot never ran — this is the actual blocker for Phase 1 |

---

### MVP Build Decision: ✅ PROCEED

**Rationale:**
- ✅ All 3 credibility bugs now resolved (dca8dfe)
- SCHEMA is well-engineered — triggers and indexes are correct
- The concept is genuinely differentiated (cybernetic credibility loop + anonymous synthetic characters)
- Architecture can scale to Phase 2/3 without rework

**Before starting build, fix 1 remaining thing:**
1. ~~⬜ Decide on RLS vs. application-level auth for anonymous users~~ → **DECIDED: Skip RLS for MVP** ✅ (SCHEMA.md updated with deferral note)
   - `auth.uid()` returns NULL for anonymous UUID-in-localStorage users (no Supabase auth session)
   - Application-level auth: set `app.current_user_id` header/middleware at API entry point
   - RLS re-implemented in Phase 2 when proper auth is added (email/password or OAuth)
   - Risk is acceptable for MVP (anonymous read-heavy app, content is public anyway)

**→ CREDO MVP IS READY TO BUILD** ✅

**Completed this session (2026-03-27):**
- ✅ App-level auth middleware — `src/middleware/auth.ts` (cb5a2f2)
  - `authenticate()` — validates x-user-id (UUID v4), 401/400/403 codes
  - `optionalAuth()` — attaches user if header present
  - `requireTier(minTier)` — enforces trust tier gates
  - All 10 protected routes now use middleware (was manual header checks)

**Still needed before deployment:**
1. Supabase project setup (user action needed)
2. `.env` with `SUPABASE_URL`, `SUPABASE_ANON_KEY`
3. `supabase/migrations/001_*.sql` + `002_*.sql` applied to Supabase DB
4. Frontend deployment (Vercel)
5. Telegram bot token (Phase 2)

**If the pilot runs and validates the core loop (≥7/10), this becomes the top-priority build over Audio Tool.**

---

*Review by: Aton ☀️🦞 | 2026-03-26 15:47 UTC*
