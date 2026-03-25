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

> Can a bot, by observing what you actually do, build a richer picture of your comparative advantage than a CV or self-assessment — and does that picture predict who thrives in real challenges?

If the answer to that question is **yes**, you have a defensible product. If the answer is **no**, you have a chatbot.

**Secondary question:** Does evidence of contribution (a real portfolio) + partner perks (real access and relationships) produce enough retention to keep young people engaged for 30 days without monetary rewards?

This is a separate bet from the profiling engine, and both must succeed for Phase 1 to work.

**Revenue model:** Phase 1 is free for users. Partners provide perks (no cash changes hands with contributors). Phase 2 introduces partner-funded rewards (commission on implemented ideas, performance fees). Phase 3 introduces real client bounties. Money is earned, not given by the platform.

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

**The primary user in Year 1 is aged 16–25 and is someone who:**
- Cares about making a meaningful contribution to something real
- Has access to opportunities but finds them overwhelming, irrelevant, or inaccessible
- Has interests but doesn't know if they're actually good at anything
- Wants to build something they can point to and say "I made this"
- Is curious enough to spend time on something that feels like it matters

**Key insight about this age group:** At 16–25, the question isn't "what career should I have" — it's "can I actually do anything that matters." The system answers that question by giving them evidence, not advice.

**Who it's NOT for:**
- People who already know what they're good at and just need to monetize it (use Fiverr/Upwork)
- People looking for academic credentials (use traditional education)
- People who want guaranteed outcomes without real effort (this requires showing up)

### What They Get (The Value Ladder)

| Phase | What the user does | What they get | How long |
|-------|-------------------|---------------|----------|
| **A — Discovery** | Complete micro-challenges; observe patterns in results | A behavioral profile showing what they're actually good at | Week 1–4 |
| **B — Real Contribution** | Apply their demonstrated strengths to real partner challenges | Portfolio evidence + partner perks + network access | Week 4–12 |
| **C — Opportunity Access** | Use their profile and portfolio to access bigger opportunities | Mentorship, introductions, paid work, community | Ongoing |

**After 30 days**, the user should have:
1. A behavioral profile showing their comparative advantage (evidence-backed, not self-reported)
2. At least one completed real challenge that produced a portfolio piece
3. Access to partner perks earned through contribution
4. A sense that opportunities exist and they're capable of pursuing them

**The 30-day outcome in one sentence:** "I now know what I'm actually good at, I've proven it to myself with real work, and I have a track record I can show."

### What "Appearance" Means

Kristaps mentioned "contributions and their appearance." The second part is the portfolio presentation layer — not vanity, but **how evidence of contribution is structured, visualized, and made shareable**. The profile is both the thing they built and the thing they can show to others. It needs to look credible and feel personal.

---

### The Three Challenge Tracks

The platform's real-world challenges organize into three tracks. Each generates different behavioral signals and leads to different partner perks:

**Track 1 — Impact Challenges (Social Good)**
- Focus: Contributing to real community needs
- Example challenges: Design a intergenerational activity for elderly → Run it → Document what worked
- Example challenges: Create a fundraising campaign for a youth disability house → Execute it → Measure results
- Behavioral signals: Empathy, execution follow-through, communication clarity, adaptability
- Partner perks: Gratitude letters from beneficiaries, event invitations, reference letters

**Track 2 — Creative Challenges (Portfolio-Building)**
- Focus: Making something shareable that communicates a real idea
- Example challenges: Create a meme series that explains a complex topic → Get validated engagement
- Example challenges: Design a poster campaign for a cause → Get it printed and distributed
- Behavioral signals: Visual communication, creative iteration, ability to translate complexity, originality
- Partner perks: Published credit, portfolio publication, creator network access

**Track 3 — Business Challenges (Real Commerce)**
- Focus: Helping a real business solve a real problem
- Example challenges: Come up with 3 new sales angles for a BNI member → Best one gets implemented
- Example challenges: Research and propose a new market entry for a local product
- Behavioral signals: Strategic thinking, commercial awareness, persuasiveness, structured problem-solving
- Partner perks: Introduction to the business network, mentorship from entrepreneurs, potential commission on implemented ideas

**Track 4 — Skill Competitions (Progressive Challenge)**
- Focus: Demonstrating ability in a bounded, comparable format
- Example challenges: Sports training competition → Hackathon → Creative sprint
- Behavioral signals: Preparation quality, performance under pressure, improvement rate, learning speed
- Partner perks: Rankings, certificates, invitations to advanced events

**Important:** The tracks converge. A young person might start in Impact (lower barrier, high motivation), develop a strength signal in Creative, and get matched into a Business challenge because their profile shows commercial awareness. The tracks are discovery pathways, not tracks you pick and stay in.

### The Partner Perk System (Non-Monetary Motivation)

Since Phase 1 operates without monetary rewards, **partner perks are the primary retention mechanism**. They must be:
- **Tangible**: Something you can actually hold or attend or show
- **Earned through contribution**: Not given for joining, only for completing
- **Variable**: Different challenges unlock different perks, creating desire to explore
- **Social**: Perk use involves community (events, meetings, shared activities)

**Perk examples by track:**

| Peril | Type | What it requires |
|-------|------|-----------------|
| Gratitude letter from elderly beneficiary | Credential | Complete an Impact challenge |
| Portfolio published on partner platform | Recognition | Complete a Creative challenge |
| Invitation to business networking event | Access | Top 3 in a Business challenge |
| Mentorship coffee session with entrepreneur | Relationship | Contribute ≥3 Business challenge ideas |
| Free ticket to partner organization event | Experience | Complete challenges across 2+ tracks |
| "Verified Contributor" badge for profile | Status | Complete ≥5 challenges with ≥80% peer rating |



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
**Goal:** Prove the four pre-engineering assumptions before writing a line of code.

| Week | Activity | Output |
|------|----------|--------|
| 1 | Design paper prototype + interview guide + perk catalog | Test materials ready |
| 1–2 | Run Test 0.1 (self-discovery desire with 16–25 age group) | ≥7/10 pass? → proceed |
| 1–2 | Run Test 0.4 (attribution fairness intuition) | ≥4/5 pass? → proceed |
| 2 | Identify festival event + design booth/quiz | Test materials ready |
| 2–3 | Run Test 0.2 (festival funnel) | ≥40% quiz + ≥20% D7 return? → proceed |
| 2–3 | Run Test 0.3 (client willingness — now asking about perks, not payment) | ≥3/5 willing to provide perks? → proceed |
| 3 | Review all test results | Go/no-go for Phase 1 |

**Note on Test 0.3:** Since Phase 1 uses non-monetary motivation, reframe the client question. Ask: "Would you offer [mentorship access, event tickets, network introductions, co-creation opportunities] to contributors who help solve your problem?" The answer tells you if the perk model works for partners.

**Estimated cost:** €0–200

### Phase 1 — Discovery Engine MVP (Weeks 4–14, ~10 weeks)
**Goal:** Prove that behavioral profiling + partner perks = 30-day retention, without any money changing hands.

**Deliverables:**
1. Telegram bot with onboarding that delivers first value in ≤5 minutes
2. **18 challenges minimum** across 4 challenge types (see Challenge Library Spec below)
3. Behavioral profiling engine (sensor + comparator + effector)
4. Adaptive challenge sequencer
5. Public portfolio profile page (the "appearance" layer)
6. Partner perk tracker (what you've unlocked, what you're close to)
7. Streak and milestone mechanics

**Team:** Kristaps + 1 developer (Telegram API + web profile page)

**Success Gates (must ALL pass before Phase 2):**
- Test 1.1: Behavioral profile > self-assessment (profiling engine works)
- Test 1.2: D7 retention ≥35% of onboarded users
- Test 1.3: D30 retention ≥15%
- Test 1.4: Comparative vector ≥60% out-of-sample prediction accuracy
- Test 1.5: ≥3 partner organizations providing perks (validated from Test 0.3)
- Test 1.6: At least 1 real challenge completed with each partner type (Impact, Creative, Business)

**Estimated time:** 10 weeks
**Estimated cost:** €2,000–6,000 (developer) + €200–500 (festival materials, partner kickoff meetings)

### Phase 2 — Real Contribution Platform (Weeks 15–26, ~12 weeks)
**Goal:** Prove that contributors who have completed Phase 1 can produce real value for partners, and that perks are sufficient motivation to sustain engagement.

**Prerequisite:** All Phase 1 gates passed

**Deliverables:**
1. Full challenge library at 40+ challenges (scaled from Phase 1 learnings)
2. Partner portal (partners submit real challenges, approve completions, issue perks)
3. Structured contribution claims + peer attestation system (Test 0.4 validated)
4. Attribution and recognition system (public credit, portfolio links)
5. ≥5 active partner organizations across all three tracks
6. First "contribution chain" completed: user → profile → challenge → perk earned → real-world use of their work

**The milestone for Phase 2:** A young person's challenge completion results in their work actually being used by the partner. The candle fundraising campaign they designed is actually run. The meme series they created is actually published. The business idea is actually presented to the client. This is the proof point.

**Team:** Phase 1 team + 1 partner relationship manager

**Success Gates:**
- Test 2.1: ≥3 completed contributions that are actually implemented/used by partners
- Test 2.2: Attribution dispute rate <10%
- Test 2.3: ≥50% of active users have completed at least 1 real challenge
- Test 2.4: Partner NPS ≥40 (would you work with young contributors again?)

**Estimated time:** 12 weeks
**Estimated cost:** €5,000–12,000 (adds partner manager + infrastructure)

### Phase 3 — Commission-Based Marketplace (Months 7–12)
**Goal:** Prove that contributors can earn money through commission on implemented ideas, performance on business challenges, or retainer access to their profile.

**Prerequisite:** Phase 2 gates passed + clear evidence that partners value the work enough to pay

**This is where money enters the system.** Not platform-subsidized rewards — partner-funded income.

**Revenue model options:**
- Commission on implemented ideas (e.g., 15% of first-year revenue from adopted business proposal)
- Performance fee per completed business challenge (partner pays bounty on completion)
- Monthly contributor access subscription for partners who want priority matching

**Estimated time:** 6 months
**Estimated cost:** €15,000–40,000 (legal, payment infrastructure, partner sales)

---

## PART 8: THE CHALLENGE LIBRARY SPECIFICATION

This was Question 3 left open. Here is the minimum viable library definition, designed to generate behavioral signals sufficient for the profiling engine to work after 20–30 challenges.

### How Many Challenges Does Phase 1 Need?

**Minimum for profiling engine to work:** 20–25 challenges completed per user

**Minimum challenge library for Phase 1:** 18 challenges across 4 types

**Why 18?** A user who does 18 challenges will have completed enough for the profiling engine to generate a comparative vector (typically requires 15+ challenge attempts with meaningful variation in performance across types). 18 also fits a 30-day engagement loop: roughly 1 challenge every 1–2 days, with natural variation in intensity.

**What "enough challenges" means for retention:** The library must feel like it has depth — not just 18 challenges, but evidence that there are 50+ more. The adaptive sequencer reveals challenges progressively. Users should always feel there's a next level.

### The 4 Core Challenge Types

Each type generates distinct behavioral signals. The profiling engine's comparative advantage detection requires comparing performance *across types*, so all four types must be present from day one.

**Type 1 — Pattern Recognition (Sensing)**
- What it tests: Can you see what others miss? Can you identify structure in ambiguous inputs?
- Format: Find the anomaly. What's the next in the sequence. Which of these doesn't belong.
- Example: "Here are 20 donor giving patterns. One segment is behaving unusually. Which one and why."
- Example: "Here are 5 fundraising email subject lines. Which one will perform best and why."
- Behavioral signals: Accuracy rate, confidence calibration (did they know when they were right?), time to first insight, whether they explain their reasoning or just give an answer.

**Type 2 — Synthesis (Integrating)**
- What it tests: Can you take multiple sources of complexity and find the core?
- Format: Read/hear 3 perspectives on a problem. Write a 3-sentence summary that captures what matters.
- Example: "Here are 3 different stakeholder interviews about the youth disability house. Write the strategy brief for the next fundraising campaign."
- Behavioral signals: Did they capture the essential vs. the superficial? How much did they iterate? Did they synthesize or just list?

**Type 3 — Creative Construction (Building)**
- What it tests: Can you make something from nothing? Can you generate options?
- Format: Generate 5 different approaches to [problem]. Pick the best and explain why.
- Example: "Generate 5 angles for selling candles to fundraise for [house]. One will actually be used."
- Example: "Design a meme series that helps 18-year-olds understand the housing crisis. Make them shareable."
- Behavioral signals: Originality score (are their ideas novel or cliché?), quality of selection rationale, how they balance creative vs. practical.

**Type 4 — Strategic Decomposition (Planning)**
- What it tests: Can you break a complex goal into executable steps? Can you identify what matters most?
- Format: [Complex goal]. What are the 3 most important things to get right first? What would kill this?
- Example: "This elderly association wants to engage 50 young volunteers in the next 6 months. What's the plan?"
- Behavioral signals: Do they prioritize correctly? Do they identify blockers or just list steps? Do they think about dependencies?

### Phase 1 Minimum Challenge Library (18 Total)

| Type | Simulated (platform-designed) | Real Partner Challenge |
|------|------------------------------|------------------------|
| Pattern Recognition | 4 challenges | 1 (from Business partner) |
| Synthesis | 3 challenges | 1 (from Impact partner) |
| Creative Construction | 3 challenges | 2 (from Creative partner) |
| Strategic Decomposition | 2 challenges | 2 (from Business partner) |

**Total: 18. Structure:**
- 12 simulated (designed by you, validated automatically)
- 6 real partner challenges (your existing partner relationships: elderly association, disability house, BNI contacts)

**How the real partner challenges work in Phase 1:**
- The partner provides a real problem they've been stuck on (e.g., "we need a new fundraising angle")
- You structure it as a challenge with acceptance criteria (e.g., "3 written proposals, one will be selected")
- A young person completes it → partner approves → perks are issued
- The work may or may not be actually used by the partner (that's Phase 2 evidence)

### Scaling the Library Post-Phase 1

From Phase 2 onward, add:
- 10–15 challenges per quarter from new partner relationships
- Genre-specific challenges (e.g., data analysis, visual design, video production) unlocked progressively as users demonstrate interest
- Seasonally relevant challenges (e.g., "Design a back-to-school campaign for X" in September)

### Challenge Difficulty Tiers

Each challenge type has 3 difficulty tiers:
- **Tier 1 (Foundational)**: Clear inputs, defined outputs, one right approach. For onboarding.
- **Tier 2 (Intermediate)**: Multiple valid approaches, partial information, quality varies. For active users.
- **Tier 3 (Advanced)**: Ambiguous inputs, require creative synthesis, peer review needed. For users with established profiles.

Users enter at Tier 1 and the adaptive sequencer promotes them when their signal quality warrants it.

---

## PART 9: THE OPEN QUESTIONS (Status Update) (Answer Before Phase 1 Starts)

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

## PART 9: THE OPEN QUESTIONS (Status Update)

These were the 5 questions from the original CONCEPT.md. Here's the status:

| # | Question | Status | Answer |
|---|----------|--------|--------|
| 1 | Who is the primary user in Year 1? | ✅ ANSWERED | Curious youth, 16–25, who cares about making a meaningful contribution but lacks clear opportunities |
| 2 | What is the single most important thing they get after 30 days? | ✅ ANSWERED | Evidence that they can do meaningful work + a portfolio they can show + access to a real opportunity |
| 3 | How many challenge types and total challenges for Phase 1? | ✅ ANSWERED | 4 types, 18 challenges minimum. See Part 8 for full spec. |
| 4 | What is the first real client problem? | ✅ ANSWERED | Three categories identified: Impact (elderly/disability house), Creative (meme campaigns), Business (BNI network).具体 problems TBD from Test 0.3. |
| 5 | How do contributors get paid in Phase 1? | ✅ ANSWERED | They don't. Non-monetary: partner perks only. Money enters in Phase 3. |

**Remaining open questions that need answers before Phase 1 build starts:**

**Q6: What exactly does the onboarding deliver in the first 5 minutes?**
The bot's first 5 minutes must deliver value or nothing else matters. Specific answer needed:
- Which challenge type does the user experience first?
- What does the feedback look like immediately after?
- What is the "hook" that makes them want to come back tomorrow?

**Q7: What is the single most motivating perk for your specific audience?**
From your network and context: is it event access? Mentorship? Network introduction? Something else? This drives which partner you pursue first.

**Q8: Who is your first festival/event partner?**
The acquisition channel (Test 0.2) needs a real event. Which one is coming up next?

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
