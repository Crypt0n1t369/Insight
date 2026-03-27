# SPEC.md — Contribution Graph Product Specification
## Phase 0 Results + Phase 1 Build Blueprint

**Owner:** Kristaps (user) + Aton  
**Status:** Living document — Phase 0 in progress  
**Version:** 0.1-draft

---

## Purpose

This document is the single source of truth for what the Contribution Graph is, what it does, and why each decision was made. It overrides all prior assumptions in CONCEPT.md and DISCOVERY-FLOW.md.

It is updated after each Phase 0 test with:
- Verbatim quotes from participants
- Objection maps
- Specific numbers (conversion rates, satisfaction, price points)
- Problem backlog from real clients
- Design constraints from real users

---

## The One-Sentence Product Definition

> A Telegram bot that discovers your strengths through 30-day conversational micro-challenges, builds a personal contribution map, and connects you to real problems posted by organizations who will pay for solutions.

---

## Phase 0 Validation Results

### TEST 0.1 — Self-Discovery Desire
**Status:** Pending (materials drafted ✅ | execution pending user action)

**Materials:** `TEST_01_INTERVIEW_SCRIPT.md`

**When completed:** Fill in verbatim quotes, objection map, design constraints below.

#### Pass Criteria
- [ ] ≥7/10 say "yes, I would actually use this" (Q3 intent-to-use score ≥7)
- [ ] ≥5/10 identify a specific Day-3 fear (Q1)
- [ ] ≥3/10 raise genuinely new Day-30 insight (Q2)

**Results TBD — test not yet run**

---

### TEST 0.2 — Attribution Fairness Intuition
**Status:** Pending (materials drafted ✅ | execution pending user action)

**Materials:** `TEST_02_ATTRIBUTION_FAIRNESS.md`

**When completed:** Fill in verbatim quotes, fairness dynamics observed, renegotiation outcomes.

#### Pass Criteria
- [ ] ≥4/5 say "roughly fair" after negotiation
- [ ] No single person systematically undermined
- [ ] Claims + attestation format produces useful signal (not noise)

**Results TBD — test not yet run**

---

### TEST 0.3 — Festival Top-of-Funnel
**Status:** Pending (materials drafted ✅ | event identification required)

**Materials:** `TEST_03_FESTIVAL_TOP_OF_FUNNEL.md` (this file, see below)

**Event:** TBD — identify 1 upcoming event (hackathon, youth conference, creative festival)

**When completed:** Fill in event name, QR scan count, quiz completion rate, bot install rate, 7-day return rate.

#### Pass Criteria
- [ ] ≥40% of QR scanners complete the quiz
- [ ] ≥25% of completers install the Telegram bot
- [ ] ≥20% of installers return to the bot in 7 days
- [ ] ≥10% complete ≥50% of the profile after 14 days

**Results TBD — event not yet identified**

---

### TEST 0.4 — Client Problem Readiness
**Status:** Pending (materials drafted ✅ | org outreach pending user action)

**Materials:** `TEST_04_CLIENT_READINESS.md`

**When completed:** Fill in verbatim client quotes, price ranges, objection map, problem backlog.

#### Pass Criteria
- [ ] ≥3/5 express willingness to pay at some price
- [ ] ≥2/5 give concrete budget range
- [ ] ≥1 problem genuinely solvable by distributed team

**Results TBD — client conversations not yet run**

---

## Phase 0 Decision Matrix

```
                    │ TEST 0.2 PASS          │ TEST 0.2 FAIL
────────────────────┼────────────────────────┼─────────────────────
TEST 0.1 PASS       │   → Phase 1            │ Redesign attribution
TEST 0.1 FAIL       │ Rethink core consumer  │ Rethink core +
                    │ value                 │ redesign attribution

TEST 0.3 PASSES → Festival is acquisition channel
TEST 0.4 PASSES → Client launch partners identified

If BOTH 0.3 AND 0.4 pass → Strong foundation for Phase 1 + 2
If only 0.3 passes       → Phase 1 (contributors exist, no clients yet)
If only 0.4 passes       → Build waitlist, find acquisition channel first
If NEITHER passes        → Major pivot required
```

---

## Design Constraints (from Phase 0)

These are non-negotiable inputs to Phase 1 build. They override all prior assumptions.

### From Test 0.1 (Self-Discovery Desire)

_Results TBD — fill in after running interviews._

Constraints observed:
- [TBD] Effort barrier: maximum daily commitment must feel ≤5 minutes
- [TBD] Trust mechanism: how users verify the bot "actually knows" them
- [TBD] Day-30 hook: what makes them return, not just Day-3
- [TBD] Social proof: when / whether sharing the map makes sense

### From Test 0.2 (Attribution Fairness)

_Results TBD — fill in after running group exercise._

Constraints observed:
- [TBD] Attribution reveal timing: when should peer attestation be revealed?
- [TBD] Negotiation protocol: how much group renegotiation improves fairness perception
- [TBD] Quiet-person dynamics: how to prevent erasure in group settings

### From Test 0.3 (Festival Funnel)

_Results TBD — fill in after event._

Constraints observed:
- [TBD] QR-to-quiz drop-off reasons
- [TBD] Bot-to-profile drop-off reasons
- [TBD] Result card shareability: what makes someone screenshot it

### From Test 0.4 (Client Readiness)

_Results TBD — fill in after client conversations._

Constraints observed:
- [TBD] Minimum trust signals clients require before posting a problem
- [TBD] Price sensitivity: at what point does "distributed team" become a liability vs. asset
- [TBD] Problem type: what problems are genuinely suitable for distributed contributors

---

## Problem Backlog (from Test 0.4)

Real problems from client discovery conversations — these become the first Phase 2 challenges.

1. [TBD] Problem: ___________ | Client: ___________ | Budget: ___________
2. [TBD] Problem: ___________ | Client: ___________ | Budget: ___________
3. [TBD] Problem: ___________ | Client: ___________ | Budget: ___________
4. [TBD] Problem: ___________ | Client: ___________ | Budget: ___________
5. [TBD] Problem: ___________ | Client: ___________ | Budget: ___________

---

## Objection Map

Compiled from all Phase 0 sessions. Each objection must be addressed in Phase 1 design or positioning.

| Objection | Source | Response Strategy |
|-----------|--------|-------------------|
| [TBD] | — | — |

---

## Phase 1 Build Specification

### User Journey (Target State)

```
UNAWARE → QR/Festival → Telegram Bot → Onboarding (P1) →
Challenge (P2) → Mirror (P3) → First Stretch (P4) →
Profile Complete (P5) → Challenge → Challenge → ...
→ Map complete → Synergetic Challenge (Phase 2) → Payment
```

### Behavioral Profiling Engine

**Input:** User answers across 5 phases + challenge completions  
**Output:** Comparative vector — normalized scores across 8 signal dimensions  
**Dimensions:**
1. `pattern_recognition` — sees systems others accept as normal
2. `initiative_taking` — acts without being asked
3. `contribution_drive` — oriented toward collective outcomes
4. `purpose_clarity` — clear on what they care about and why
5. `voice_authenticity` — distinctive way of expressing ideas
6. `obstacle_persistence` — doesn't quit when blocked
7. `synthesis_ability` — connects disparate ideas into new frameworks
8. `peer_recognition` — notices and names others' contributions

**Computation:** LLM-powered synthesis (requires OpenRouter credits) | Fallback: rule-based keyword extraction

### Challenge Library

18 challenges across 3 tracks. Each challenge:
- Targets 1–2 signal dimensions
- Has a `duration_minutes` (5, 10, or 15)
- Has a `type`: `meaning` (purpose/identity), `action` (initiative/contribution), `creative` (synthesis/voice)

### Short-Code Identity System

**Registration:** Telegram user ID → deterministic short-code (8 chars) via HMAC-SHA256  
**Verification:** Email or phone verification for map sharing  
**Persistence:** Short-code = permanent identity across sessions  
**Re-engagement:** `/start` with existing short-code resumes from last phase

### Web Map (`/map/{short_code}`)

Public contribution map page. Renders:
- User's name (if provided) or anonymous handle
- Comparative vector as animated SVG radar chart
- Signal strength bars
- Phase badge
- Challenge history (anonymized unless verified)
- Share button (copy link or send to Telegram friend)

### Telegram Bot

**Interface:** Natural language + structured quick-reply buttons  
**Persistence:** PostgreSQL (Supabase) for production; SQLite for dev  
**Rate limiting:** 3 messages/min per user (Phase 1); 10/min (Phase 2)  
**Notifications:** Daily challenge reminder at user-chosen time; streak warning at 47h

### Phase 2: Synergetic Challenges

Once user reaches Phase 5 (profile complete):
- Match to real client problems from Test 0.4 backlog
- Attribution workflow: structured claims → peer attestation → client ratification
- Payment flow (Phase 2B): client pays platform → platform distributes to contributors

---

## Technical Architecture

### Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Bot runtime | python-telegram-bot v21+ | Polling in dev; webhook in prod |
| Web server | Flask | Port 3006 dev; Vercel prod |
| Database | PostgreSQL | Supabase for prod |
| AI synthesis | OpenRouter API | Requires credits; demo fallback if out |
| Short-code | HMAC-SHA256 | `CG_SERVER_SECRET` env var in prod |
| File storage | Supabase Storage | Map screenshots, share cards |
| Hosting | Vercel | Web frontend + bot webhook |

### Environment Variables

| Variable | Dev | Production |
|----------|-----|------------|
| `TELEGRAM_BOT_TOKEN` | ✅ Required | ✅ Required |
| `CG_SERVER_SECRET` | (empty — dev only) | ✅ Required |
| `DATABASE_URL` | SQLite file | Supabase PostgreSQL |
| `OPENAI_API_KEY` | N/A | OpenRouter via reverse proxy |
| `SUPABASE_URL` | N/A | ✅ Required |
| `SUPABASE_SERVICE_KEY` | N/A | ✅ Required |

### Database Schema

See `db/schema.sql` — 6 tables:
- `users` — short_code, telegram_id, phase, created_at
- `signals` — user_id, signal_type, value, source, confidence
- `challenges` — user_id, challenge_id, completed_at, response_text
- `contribution_maps` — user_id, comparative_vector (JSON), updated_at
- `attestations` — claim_id, attestor_id, attestation_type, created_at
- `payments` — challenge_id, amount, status, client_id (Phase 2)

---

## Open Questions (for Phase 0 to Answer)

| # | Question | Answer From | Status |
|---|----------|-------------|--------|
| 1 | What % of users drop off after Day 3? | Test 0.1 | ⏳ |
| 2 | Does attribution feel fair without face-to-face? | Test 0.2 | ⏳ |
| 3 | What event type drives best QR→bot conversion? | Test 0.3 | ⏳ |
| 4 | At what price do clients say "that's cheap"? | Test 0.4 | ⏳ |
| 5 | Do users share maps without being asked? | Test 0.1/0.3 | ⏳ |
| 6 | Is 30 days enough to build a useful profile? | Test 0.1 | ⏳ |
| 7 | Can a distributed team solve client problems? | Test 0.4 | ⏳ |

---

## Build & QA Status

**CG Web:** 3006 ✅ | **CG Bot:** Code complete, awaiting TELEGRAM_BOT_TOKEN  
**Test suite:** 110 passing (89 CG system + 21 bot handlers)

### Test Coverage
| File | Tests | Coverage |
|------|-------|----------|
| `db/test_identity.py` | 18 | Short-code generation + verification |
| `tests/test_handlers.py` | 47 | Conversation phase handlers, command routing |
| `web/test_web.py` | 23 | Map rendering, rate limiting, API endpoints |
| `bot/tests/test_handlers.py` | 21 | Command handlers, phase routing, state transitions |

### Bug Fixes (Phase 0 Build)
- **SIGNAL_META completeness (2026-03-27):** All 18 `SignalType` entries now have human-readable labels and icons in the SVG map renderer. Previously 12/18 were missing, causing raw key names (e.g. `values_alignment`) to leak into the UI. Committed `98da124`.
- **Bot state sync (2026-03-27):** `TelegramBot._sync_to_map_store` correctly writes user phase, signals, and challenge completions to the CG Web SQLite store so the map URL is always current after bot interaction.

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 0.1-draft | 2026-03-27 | Initial skeleton — all Phase 0 sections created, awaiting test results |
| 0.1-draft | 2026-03-27 | Added Build & QA Status section; SIGNAL_META bug fix documented (98da124); bot handler tests added (21 passing) |

*SPEC.md v0.1 | Contribution Graph | Aton ☀️🦞 | 2026-03-27*
