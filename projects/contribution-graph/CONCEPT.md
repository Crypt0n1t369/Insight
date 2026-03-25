# CONTRIBUTION GRAPH — MASTER BLUEPRINT
## Kristaps | Aton | Rebuild 2026-03-25

---

## PART 0: WHAT THIS IS AND WHAT THIS ISN'T

This document defines ONE product, not a platform ecosystem. It is structured as:
1. **The Core Bet** — what you're actually building and why
2. **The Structural Gaps** — what was wrong with the previous concept (honest)
3. **Product Definition** — who it's for, what they get, how it works
4. **The System** — how the pieces connect mechanistically
5. **The Filetree** — what to build
6. **The Test Plan** — exactly what to validate before spending engineering time
7. **The Roadmap** — what to build in what order, with clear gates between phases

---

## PART 1: THE CORE BET

**The one sentence:**

> A behavioral profiling system that discovers your comparative advantage through micro-challenge participation, then matches you to real work you can actually do — starting with a Telegram bot and escalating to a marketplace.

**The one question this whole concept depends on:**

> Can a bot, by observing what you actually do, build a richer picture of your comparative advantage than a CV or self-assessment — and does that picture predict challenge success?

If the answer to that question is **yes**, you have a defensible product. If the answer is **no**, you have a chatbot.

Everything else (marketplace, enterprise clients, synergetic challenges, monetary instruments) is Layer 2 and Layer 3 of the same bet. It only matters if Layer 1 proves out.

---

## PART 2: THE FIVE STRUCTURAL GAPS (And How This Document Fixes Them)

### Gap 1: Two Products Conflated
**Problem:** The concept tried to serve two fundamentally different users simultaneously — individuals seeking self-discovery AND organizations seeking distributed contributors.

**Fix:** This blueprint defines ONE primary user for Phase 1: the individual contributor. The enterprise/client layer is explicitly deferred to Phase 3 and is described only as a future buyer, not as a simultaneous build target.

### Gap 2: Causal Chain Unproven
**Problem:** The concept assumed a pipeline from self-discovery → portfolio → money without explaining WHY a rich behavioral profile would produce better outcomes than existing alternatives.

**Fix:** The Core Bet is now explicit. The mechanism is specified: behavioral signals → demonstrated capability → challenge matching. Each step is described with a specific test.

### Gap 3: Retention Mechanic Undefined
**Problem:** "Gamification and principles of cybernetics" described nothing actionable.

**Fix:** Part 4 specifies a concrete cybernetic loop with defined sensor, comparator, effector, and feedback. The daily engagement mechanic is specified.

### Gap 4: Revenue Model Assumed
**Problem:** "Take a bounty fee" was proposed without modeling unit economics.

**Fix:** Part 6 (roadmap) includes explicit unit economics gates. If they fail, the phase does not proceed.

### Gap 5: Attribution Hand-Waved
**Problem:** "We'll figure out contribution weighting" was not acceptable.

**Fix:** Part 4 specifies a concrete attribution mechanism (structured contribution claims + peer attestation + client ratification) with a clear dispute path. This is designed, not deferred.

---

## PART 3: PRODUCT DEFINITION

### Who It's For (Primary User)

**The primary user in Year 1 is a person aged 18–30 who:**
- Is curious about what they're genuinely good at (not just interested in)
- Has tried career quizzes, personality tests, or coaching and found them shallow or useless
- May be in a transitional moment (graduating, career change, unemployed, or just restless)
- Wants to build something real that they can point to and say "I made this"
- Does not yet know if they can earn money from their skills

**Who it's NOT for (explicitly deferred):**
- Active professionals looking for freelance gigs (use Upwork)
- Researchers looking for collaboration (use academic networks)
- Companies looking for consultants (build the enterprise layer in Phase 3)

### What They Get (The Value Ladder)

| Phase | What the user does | What they get | How long |
|-------|-------------------|---------------|----------|
| **A — Discovery** | Complete micro-challenges; observe patterns in results | A behavioral profile showing what they're actually good at | Week 1–4 |
| **B — Demonstration** | Take on challenges in their demonstrated strength areas | Portfolio pieces with verifiable proof of capability | Week 4–12 |
| **C — Contribution** | Work on real problems with real stakes | Money + recognition + network access | Ongoing |

**The key insight:** Most people have never had evidence of their comparative advantage. They've had opinions (from others or themselves) but never behavioral data. Phase A solves that.

### What Clients Get (Secondary Buyer, Phase 3)

Organizations post problems. They get:
- Access to contributors whose capabilities have been demonstrated, not self-reported
- A cost structure between freelance (expensive, committed) and open call (cheap, unreliable)
- A traceable contribution history for each contributor

**You do NOT sell to clients in Year 1.** The enterprise layer is gated behind proof of contributor quality.

---

## PART 4: THE MECHANISM

### 4A: The Cybernetic Self-Discovery Loop

This is the core engine. It must be specified precisely.

```
┌─────────────────────────────────────────────────────────────┐
│                     USER STATE                               │
│  "What am I good at?" — the question in their head           │
└─────────────────────────────────────────────────────────────┘
              ▲                              │
              │                              │
    ┌─────────┴──────────┐                   │
    │   SYSTEM OBSERVES   │  ← SENSOR        │
    │  (what they did,    │                   │
    │   how fast, how     │                   │
    │   many attempts)    │                   │
    └─────────┬──────────┘                   │
              │                              │
    ┌─────────┴──────────┐                   │
    │  SYSTEM INTERPRETS  │  ← COMPARATOR     │
    │  (pattern detected: │                   │
    │   "synthesizes well │                   │
    │   under ambiguity")  │                   │
    └─────────┬──────────┘                   │
              │                              │
    ┌─────────┴──────────┐                   │
    │   SYSTEM FEEDS BACK │  ← EFFECTOR       │
    │  "You're unusually  │                   │
    │   good at finding   │                   │
    │   the core of       │                   │
    │   messy problems"   │                   │
    └─────────┬──────────┘                   │
              │                              │
    ┌─────────┴──────────┐                   │
    │   USER DECIDES      │  ← AGENT (USER)   │
    │  (take next         │                   │
    │   challenge in     │                   │
    │   this area?)       │                   │
    └────────────────────┘                   │
```

**Sensor (what the system observes):**
- Challenge completion rate by type
- Time-to-first-attempt by challenge type
- Revision patterns (do they iterate? how much?)
- Accuracy vs. confidence correlation (do they know when they're right?)
- Challenge difficulty progression (what happens when things get harder?)
- Drop-off patterns (where do they give up vs. push through?)

**Comparator (what the system detects):**
- "This user scores 2 standard deviations above average on X, relative to their overall score"
- "This user improves faster on Y than on Z"
- "This user demonstrates unusual pattern recognition in ambiguous inputs"
- The system builds a **comparative advantage vector** — not just "good at X" but "better at X relative to Y, compared to peers"

**Effector (what the system does):**
- Daily push: challenge recommendation + why it was chosen
- Weekly summary: "This week you demonstrated strength in X and Y. Here's what's next."
- Milestone reveal: "You've now done 20 challenges. The data shows: [pattern]. New unlock: [harder challenge type]"
- Weakness signal: "You've attempted Z 5 times. The pattern suggests you may be bored by execution-heavy tasks. Try: [strategic synthesis challenge]."

**Feedback (what the user sees):**
- A personal dashboard showing their behavioral fingerprint
- Comparison to peer distribution (anonymized, aggregate)
- Evidence chain: every challenge they've completed with their specific outputs

**This loop is the product. Everything else (challenges, matching, money) is downstream of it working.**

---

### 4B: The Three-Layer Architecture (Decoupled)

```
LAYER A: DISCOVERY ENGINE          ← Build this first (Phase 1)
"Discover what you're good at"
──────────────────────────────────────────────────────────────
Bot + behavioral profiling + engagement loop
Output: contributor profile (evidence-backed)
Who pays: Platform (free to user initially)
Revenue: None (growth/engagement metric)

    │ Once profile density is high enough (N contributors)
    ▼
LAYER B: CHALLENGE MARKETPLACE     ← Build this second (Phase 2)
"Apply what you're good at to real problems"
──────────────────────────────────────────────────────────────
Challenge matching + validation + attribution + payments
Output: completed challenges + portfolio proof + money
Who pays: Client bounty pool (20% platform fee)
Revenue: Bounty spread %

    │ Once marketplace has transaction history
    ▼
LAYER C: COORDINATION PLATFORM     ← Build this third (Phase 3)
"Coordinate complex work across contributors"
──────────────────────────────────────────────────────────────
Multi-track challenges + contribution decomposition + escrow
Output: synthesized solutions + distributed value
Who pays: Enterprise clients (retainer or success fee)
Revenue: Contract value %
```

**These are three separate products sharing one data model. Each has its own acquisition strategy, unit economics, and success metrics. They must be built sequentially, not in parallel.**

---

### 4C: Challenge Types and Validation

**Type 1 — Simulated (Self-referential)**
- The platform defines the challenge and the answer
- Validation: automated test (code output, data accuracy, text coherence score)
- No client involved. The challenge IS the engagement mechanic.
- Purpose: generate behavioral data for profiling

**Type 2 — Matched (One contributor, one problem owner)**
- A client has a defined problem with acceptance criteria
- Validation: client ratifies completion against stated acceptance criteria
- Attribution: one contributor, no attribution complexity
- Purpose: prove real-world value, generate first revenue

**Type 3 — Synergetic (Multiple contributors, shared problem)**
- A complex problem decomposed into multiple contribution tracks
- Validation: structured peer attestation + client ratification
- Attribution: contribution claims + weighted peer confirmation + client override
- Purpose: prove that combining perspectives produces better outcomes

**Attribution Mechanism for Synergetic Challenges (designed, not deferred):**

```
CONTRIBUTION CLAIM FORMAT:
"Contributed: [specific thing they did] + [evidence link] + [what it enabled downstream]"
Example: "Synthesized 12 stakeholder interviews into 3 key themes — enabled the team's strategy recommendation"

PEER ATTESTATION:
Each contributor on the team can attest to others' contributions (not their own).
Attestations are weighted by the attester's own contribution score.

CLIENT RATIFICATION:
Client can allocate a discretionary bonus pool (e.g., 20% of bounty) after seeing claims.

DISPUTE RESOLUTION:
1. Peer vote (weighted by contribution score)
2. Client decision (binding)
3. Platform arbitration (final, for disputes >$X)
```

---

### 4D: The Transition Mechanism (Layer A → Layer B)

**The hardest problem:** How do you get a user who has been doing free simulated challenges to suddenly pay attention to real client challenges?

**The answer must be baked into the product design, not added later.**

The transition happens through **portfolio visibility:**
- Simulated challenge completions generate a public profile page
- That profile shows: challenge types completed, accuracy patterns, speed, difficulty progression
- A contributor with 20+ completed challenges and a strong comparative advantage vector has something real to show
- Layer B introduces: "Challenges where real organizations are paying real money. Your profile shows you're particularly strong in X. Here's a challenge in X that pays $Y."

**The user doesn't transition. The product does. They were always working toward real work.**

---

## PART 5: THE PLATFORM FILETREE

```
contribution-graph/
├── SPEC.md                              # This document (blueprint before spec)
├── README.md                            # What this is, how to navigate
│
├── 00-meta/
│   ├── ASSUMPTIONS.md                   # All key assumptions, explicit
│   ├── GATES.md                         # Phase progression criteria
│   └── DECISIONS.md                     # Why we made each trade-off
│
├── 01-discovery-engine/                 # LAYER A — Phase 1 Build
│   │
│   ├── bot/
│   │   ├── telegram/
│   │   │   ├── app.py                   # Bot entry point, dispatcher
│   │   │   ├── handlers/
│   │   │   │   ├── onboarding.py         # First challenge: 5-min value
│   │   │   │   ├── daily_signal.py       # Daily challenge push
│   │   │   │   ├── feedback.py           # Post-challenge response
│   │   │   │   ├── profile_share.py      # Share profile externally
│   │   │   │   └── milestone.py           # Level-up moments
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   └── user_state.py         # Per-user state machine
│   │   │   │
│   │   │   └── tests/
│   │   │       ├── onboarding.test.py
│   │   │       ├── daily_signal.test.py
│   │   │       └── retention_d7.test.py  # Does D7 return hold?
│   │   │
│   │   └── web/
│   │       ├── profile_page.py           # Public shareable profile
│   │       ├── dashboard.py              # Personal stats view
│   │       └── tests/
│   │           └── profile_completeness.test.py
│   │
│   ├── profiling/
│   │   ├── models/
│   │   │   ├── contributor.py            # Core contributor schema
│   │   │   ├── challenge_attempt.py       # Each attempt at a challenge
│   │   │   ├── behavioral_signal.py       # Observable behavior record
│   │   │   └── comparative_vector.py      # Computed advantage vector
│   │   │
│   │   ├── engine/
│   │   │   ├── sensor.py                  # Observe: what they did
│   │   │   ├── interpreter.py             # Pattern detection
│   │   │   ├── comparator.py              # Peer-relative comparison
│   │   │   └── profile_updater.py         # Update profile from signals
│   │   │
│   │   ├── signals/
│   │   │   ├── completion_rate.py
│   │   │   ├── time_to_first_attempt.py
│   │   │   ├── revision_frequency.py
│   │   │   ├── accuracy_vs_confidence.py
│   │   │   ├── difficulty_progression.py
│   │   │   └── drop_off_analysis.py
│   │   │
│   │   └── tests/
│   │       ├── comparative_vector.test.py  # Does vector predict success?
│   │       └── behavioral_richness.test.py  # Is profile > self-report?
│   │
│   ├── challenges/
│   │   ├── library/
│   │   │   ├── types.yaml                 # Challenge type definitions
│   │   │   ├── difficulty_tiers.yaml      # Scaling definitions
│   │   │   └── signal_map.yaml            # Which signals each type generates
│   │   │
│   │   ├── generator/
│   │   │   └── adaptive_sequencer.py      # Next challenge selection
│   │   │
│   │   ├── simulated/
│   │   │   ├── data_analysis/            # Simulated data challenges
│   │   │   ├── synthesis/                 # Text synthesis challenges
│   │   │   ├── pattern_recognition/       # Visual/logic pattern challenges
│   │   │   ├── strategic_decomposition/  # Break down a problem
│   │   │   └── creative_construction/    # Build something from nothing
│   │   │
│   │   ├── validator/
│   │   │   ├── automated.py               # Test-based validation
│   │   │   ├── rubric.py                  # Rubric-based scoring
│   │   │   └── peer.py                    # Structured peer review
│   │   │
│   │   └── tests/
│   │       ├── challenge_completion.test.py
│   │       └── signal_generation.test.py
│   │
│   ├── gamification/
│   │   ├── streak.py                      # Daily return mechanic
│   │   ├── milestone.py                   # Level markers
│   │   ├── badge.py                       # Achievement markers
│   │   ├── leaderboard.py                  # Optional: peer comparison
│   │   └── tests/
│   │       └── streak_retention.test.py
│   │
│   └── database/
│       ├── schema.sql
│       └── migrations/
│
├── 02-marketplace/                        # LAYER B — Phase 2 Build
│   │
│   ├── matching/
│   │   ├── engine.py                      # Profile → challenge matching
│   │   ├── scorer.py                      # Fit quality scoring
│   │   └── tests/
│   │       └── match_quality.test.py      # Do matches improve over time?
│   │
│   ├── client_portal/
│   │   ├── problem_submission.py
│   │   ├── scope_definition.py
│   │   ├── acceptance_criteria.py
│   │   ├── bounty_management.py
│   │   └── payout_approval.py
│   │
│   ├── attribution/
│   │   ├── claim_format.py                # Structured contribution claims
│   │   ├── peer_attestation.py
│   │   ├── weight_engine.py               # Weighted contribution scores
│   │   ├── dispute_resolver.py
│   │   └── tests/
│   │       └── attribution_fairness.test.py
│   │
│   ├── payments/
│   │   ├── bounty_escrow.py
│   │   ├── payout_processor.py
│   │   ├── platform_fee.py
│   │   └── tests/
│   │       └── payout_completion.test.py
│   │
│   └── tests/
│       ├── marketplace_integration.test.py
│       └── client_satisfaction.test.py
│
├── 03-coordination/                       # LAYER C — Phase 3 Build
│   │
│   ├── decomposer/
│   │   ├── problem_decomposer.py          # Break complex problem into tracks
│   │   ├── track_generator.py
│   │   └── dependency_map.py
│   │
│   ├── synthesis/
│   │   ├── contribution_integrator.py
│   │   ├── output_synthesizer.py
│   │   └── client_delivery.py
│   │
│   ├── monetary/
│   │   ├── milestone_escrow.py
│   │   ├── contribution_token.py
│   │   └── retainer_engine.py
│   │
│   └── governance/
│       ├── contributor_dao.py
│       ├── dispute_arbiter.py
│       └── quality_threshold.py
│
├── 04-shared/
│   ├── api/
│   │   ├── rest/
│   │   ├── graphql/
│   │   └── webhooks/
│   │
│   ├── auth/
│   │   ├── contributor_auth.py
│   │   └── client_auth.py
│   │
│   ├── db/
│   │   ├── schema.sql
│   │   └── migrations/
│   │
│   ├── notifications/
│   │   ├── delivery.py
│   │   └── templates/
│   │
│   └── analytics/
│       ├── event_pipeline.py
│       └── cohort_analysis.py
│
├── 05-festival-toolkit/                  # Acquisition channel (no-code first)
│   ├── booth_design.md                    # Physical experience spec
│   ├── quiz_flow.typeform                 # No-code quiz template
│   ├── result_card.py                     # Personalized takeaway card
│   ├── follow_up_sequence.py              # Post-festival engagement
│   └── metrics_tracker.py                 # Funnel tracking spreadsheet
│
├── 06-hackathon-module/                   # Acquisition channel for tech users
│   ├── workshop_format.md                 # 3-hour workshop spec
│   ├── agent_setup.py                     # Pre-configured agent workflow
│   ├── challenge_brief.py                 # Structured challenge template
│   └── feedback_survey.py
│
├── docs/
│   ├── product/
│   │   ├── user_personas.md
│   │   ├── jobs_to_be_done.md
│   │   └── success_metrics.md
│   ├── legal/
│   │   ├── contributor_agreement.md
│   │   └── client_agreement.md
│   └── architecture/
│       └── decisions.md
│
└── tests/
    ├── unit/
    ├── integration/
    │   ├── discovery_to_profile.test.py
    │   └── profile_to_marketplace.test.py
    └── e2e/
        ├── happy_path_contributor.test.py
        └── happy_path_client.test.py
```

---

## PART 6: THE TEST PLAN (Exactly What to Validate)

### Tests Before Writing Code (Phase 0 — No Engineering)

**Test 0.1: Self-Discovery Desire**
- Recruit 10 people (18–30)
- Show them a paper prototype of the onboarding + first challenge
- Ask: "Would you use this instead of a career quiz?" + "Why would you stop after day 3?"
- **Pass:** ≥7/10 would use it; ≥3 unique new objections emerge

**Test 0.2: Festival Top-of-Funnel**
- Attend one event with a QR code → Typeform quiz → result card
- Measure: scanned QR → completed quiz → returned in 7 days
- **Pass:** ≥40% of QR scanners complete quiz; ≥20% return in 7 days

**Test 0.3: Client Problem Readiness**
- 5 conversations with real organizations
- Describe the concept without a demo. Ask: "Would you pay for this? At what price?"
- **Pass:** ≥3/5 willing to pay at some price; ≥2 give a concrete range

**Test 0.4: Attribution Fairness Intuition**
- Give 5 people a shared task (e.g., plan an event together)
- Ask them to allocate credit afterward using the claim+attestation format
- Ask: "Does this feel fair?"
- **Pass:** ≥4/5 say "roughly fair" or "fair"

### Tests During Phase 1 Build (Discovery Engine)

**Test 1.1: Behavioral Profile Richness**
- After 30 days of bot usage, compare behavioral profiles to self-assessment surveys
- **Pass:** Behavioral profile predicts challenge success ≥30% better than self-assessment

**Test 1.2: D7 Retention**
- After onboarding 50 users, measure return rate on day 7
- **Pass:** ≥35% of users return on day 7

**Test 1.3: D30 Retention**
- Measure day 30 return rate for cohort from Test 1.2
- **Pass:** ≥15% return on day 30

**Test 1.4: Comparative Vector Accuracy**
- For users who complete ≥20 challenges, does their comparative vector predict their performance in new challenge types?
- **Pass:** ≥60% accuracy on out-of-sample prediction

### Tests Before Launching Phase 2 (Marketplace)

**Gate 2.0: Marketplace Readiness Checklist**
- [ ] ≥100 active monthly users in Layer A
- [ ] ≥50 users with comparative vectors (≥20 challenges completed)
- [ ] ≥1 real client problem identified (from Test 0.3)
- [ ] Attribution mechanism tested with ≥5 simulated synergetic challenges
- [ ] Payment flow tested end-to-end (Stripe or test mode)

### Tests During Phase 2 (Marketplace)

**Test 2.1: First Paid Challenge**
- Place first real bounty with first beta client
- **Pass:** Challenge completed; client satisfied (4/5); contributor paid

**Test 2.2: Attribution Fairness (Live)**
- Run ≥3 synergetic challenges with attribution claims + peer attestation
- Measure: % of contributors who dispute attribution
- **Pass:** Dispute rate <10%

**Test 2.3: Matching Quality**
- Do contributors matched by profile outperform cold-start contributors?
- **Pass:** Matched contributors complete challenges ≥20% faster, with ≥15% higher client satisfaction

### Tests Before Phase 3 (Coordination)

**Gate 3.0: Coordination Readiness Checklist**
- [ ] ≥3 paying clients
- [ ] ≥$1,000 total bounty pool distributed
- [ ] Attribution dispute rate <5%
- [ ] Client NPS ≥40

---

## PART 7: THE ROADMAP

### Phase 0 — Validation (Weeks 1–3, No Code)
**Goal:** Prove the four pre-engineering assumptions. Meet the gates.

| Week | Activity | Output |
|------|----------|--------|
| 1 | Design paper prototype + user interview guide | Test materials ready |
| 1–2 | Run Test 0.1 (self-discovery desire) | ≥7/10 pass? → proceed |
| 1–2 | Run Test 0.4 (attribution fairness intuition) | ≥4/5 pass? → proceed |
| 2 | Identify festival event + design booth/quiz | Test materials ready |
| 2–3 | Run Test 0.2 (festival funnel) | ≥40% quiz completion + ≥20% D7 return? → proceed |
| 2–3 | Run Test 0.3 (client willingness) | ≥3/5 willing to pay? → proceed |
| 3 | Review all test results | Go/no-go for Phase 1 |

**Estimated cost:** Time only (you + recruited helpers)
**Who does this:** Kristaps + possibly 1 friend for user interviews

### Phase 1 — Discovery Engine MVP (Weeks 4–14, ~10 weeks)
**Goal:** Build a bot that people return to after day 7 and day 30.

**Deliverables:**
1. Telegram bot with onboarding that delivers first value in ≤5 minutes
2. 5 challenge types in the challenge library
3. Behavioral profiling engine (sensor + comparator + effector)
4. Adaptive challenge sequencer
5. Public profile page for each contributor
6. Streak and milestone gamification

**Team:** Kristaps + 1 developer (full-stack, Telegram API experience)

**Success Gates (must all pass before Phase 2):**
- Test 1.1: Behavioral profile > self-assessment (≥30% better prediction)
- Test 1.2: D7 retention ≥35%
- Test 1.3: D30 retention ≥15%
- Test 1.4: Comparative vector ≥60% out-of-sample accuracy

**Estimated time:** 10 weeks
**Estimated cost:** €3,000–8,000 (contract developer, or free if you build it yourself)

### Phase 2 — Marketplace MVP (Weeks 15–26, ~12 weeks)
**Goal:** First contributors earn money. First clients pay for solutions.

**Prerequisite:** All Phase 1 gates passed

**Deliverables:**
1. Client portal (problem submission, scope definition, bounty management)
2. Matching engine (profile → challenge fit)
3. Attribution system (claims + attestation + dispute resolution)
4. Payment flow (Stripe integration, escrow, payout)
5. ≥3 beta client engagements

**Team:** Phase 1 team + 1 person managing client relationships

**Success Gates (must all pass before Phase 3):**
- Test 2.1: First paid challenge completed and paid
- Test 2.2: Attribution dispute rate <10%
- Test 2.3: Profile-matched contributors outperform cold-start by ≥20%

**Estimated time:** 12 weeks
**Estimated cost:** €5,000–15,000 (adds client person + payment infrastructure)

### Phase 3 — Coordination Platform (Months 7–12)
**Goal:** Complex multi-track challenges. Enterprise clients. Serious money.

**Prerequisite:** All Phase 2 gates + ≥$1,000 bounty pool distributed + ≥3 paying clients

**Deliverables:**
1. Problem decomposition engine
2. Multi-track coordination with dependency management
3. Milestone-based payment with escrow
4. Enterprise client dashboard
5. ≥1 enterprise retainer signed

**Team:** Phase 2 team + technical architect + legal/finance

**Estimated time:** 6 months
**Estimated cost:** €20,000–50,000 (enterprise infrastructure, legal agreements)

---

## PART 8: THE OPEN QUESTIONS (Answer Before Phase 1 Starts)

These must be answered in writing before any code is written:

1. **Who is the specific person you're targeting in Phase 1?** (Name the age range, the context, the trigger moment that brings them to the bot)

2. **What is the single most compelling thing a user gets after 30 days?** (One sentence. Not a list.)

3. **What is the minimum viable challenge library?** (How many challenge types, how many total challenges, before it feels rich enough to retain someone for 30 days?)

4. **What is the first real client problem you'll try to solve?** (It must be identified in Phase 0. It's your proof point for Phase 2.)

5. **What is the Stripe/payout infrastructure in week 1?** (Will you pay contributors even in Phase 1? Using what mechanism?)

---

## APPENDIX A: What Makes This Defensible

The cybernetic profiling loop is novel and takes time to replicate. Here's why:

- It requires a live challenge library generating behavioral data
- It requires the comparative vector model to be trained and validated
- It requires user trust (users won't behave naturally if they feel surveilled)
- It requires the matching engine to be proven against real outcomes

A competitor can copy the interface in weeks. They cannot copy 6 months of behavioral data and validated matching accuracy.

---

## APPENDIX B: What You Are NOT Building in Phase 1

- A web dashboard (profile page only, minimal)
- A native mobile app
- AI agent orchestration (hackathon angle is separate acquisition channel, not core product)
- Enterprise client portal
- Smart contract payments
- A DAO or reputation token

---

*Rebuilt 2026-03-25 | Aton ☀️🦞*
