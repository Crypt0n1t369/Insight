# PILOT.md — Phase 0 Validation Protocol
## Contribution Graph | Kristaps | Aton | 2026-03-25

---

## Purpose

Validate the concept's hardest assumptions **before writing a single line of code**. Each test is designed to produce a binary go/no-go signal. No engineering is required for Phase 0.

**Time budget:** 2–3 weeks maximum. If you can't validate core assumptions in 3 weeks with no code, you don't have a concept — you have a hope.

---

## The Four Tests (Run in This Order)

---

### TEST 0.1: Self-Discovery Desire
**Question:** Do people actually want a bot that helps them discover their strengths through micro-challenges?

**Method:**
1. Create a paper prototype: 5 screens showing the onboarding + first challenge experience. Sketch on A4 paper or use Figma.
2. Recruit 10 people: aged 18–30, in a transitional moment (recent graduate, job change, or just restless). Use a screener to confirm.
3. Walk each person through the prototype. Ask them to imagine using it.
4. Record verbatim responses to these three questions:
   - "Would you actually use this? For how long?"
   - "What's the main reason you'd stop using it after Day 3?"
   - "What's missing from this that would make it worth returning on Day 30?"

**Pass Criteria:**
- ≥7/10 say "yes, I would use this" (not "it sounds interesting" — actual intent to use)
- ≥5/10 identify a specific, credible fear of dropping off
- ≥3/10 raise something you genuinely hadn't considered

**Go/No-Go Gate:**
```
Pass → Proceed to Phase 1 (with their objections as design constraints)
Fail → Rethink the core consumer value proposition before any build
```

**Materials needed:** Paper prototype (or Figma sketch), screener questionnaire, interview script, recording consent

---

### TEST 0.2: Attribution Fairness Intuition
**Question:** Does the proposed attribution mechanism (structured claims + peer attestation + client ratification) feel fair to the people being evaluated?

**Method:**
1. Recruit 5 people to work together on a shared, 30-minute task. Examples:
   - Plan a hypothetical event (budget, venue, schedule, marketing)
   - Diagnose a broken process and propose a solution
   - Research a topic and produce a joint recommendation
2. After completing the task, each person writes structured contribution claims:
   - "I did [specific thing] — [evidence]. This enabled [downstream thing]."
3. Each person attests to others' contributions (anonymized).
4. Then reveal the real attribution. Ask: "Does this feel roughly fair? What's unfair about it?"
5. Let them discuss and negotiate. Observe how it plays out.

**Pass Criteria:**
- ≥4/5 say "roughly fair" or "fair" after negotiation
- No single person feels systematically undermined
- The format (claims + attestation) produces useful signal, not just noise

**Go/No-Go Gate:**
```
Pass → Attribution mechanism is sound for Phase 2 synergetic challenges
Fail → Redesign attribution mechanism before Phase 2 (do not defer)
```

**Materials needed:** Task brief, contribution claim template, feedback survey

---

### TEST 0.3: Festival Top-of-Funnel
**Question:** Does a physical activation at a real event drive people to a digital experience they return to?

**Method:**
1. Identify one upcoming event (hackathon, youth conference, creative festival)
2. Design a 10-minute physical experience:
   - QR code → short quiz (Typeform) → immediate personalized result
   - The result must be shareable and interesting enough to screenshot
   - Example: "Your challenge archetype: The Synthesizer. You find patterns in chaos."
3. Track the funnel: QR scans → quiz completions → Telegram bot installs → returns in 7 days
4. Day 7: Send a survey to all completers asking why they did or didn't return

**Pass Criteria:**
- ≥40% of QR scanners complete the quiz
- ≥25% of completers install the Telegram bot
- ≥20% of installers return to the bot in 7 days
- ≥10% complete ≥50% of the profile after 14 days

**Go/No-Go Gate:**
```
Pass → Custom bot development is justified (the acquisition channel works)
Fail → Double down on no-code tooling OR rethink the acquisition strategy
```

**Tools allowed:** Typeform, Manychat or similar no-code bot builder, spreadsheet for tracking
**No engineering required.**

**Materials needed:** Event partnership or own booth, QR code, Typeform quiz, result card design, Telegram bot template

---

### TEST 0.4: Client Problem Readiness
**Question:** Will organizations pay for solutions from distributed contributors?

**Method:**
1. Identify 5 organizations. Target mix:
   - 1 NGO with a community engagement or communication challenge
   - 1 startup with a technical problem they can't hire for fast enough
   - 1 local government unit with a public engagement or data problem
   - 1 established company with an innovation/exploration challenge
   - 1 creative agency with a content or strategy challenge
2. Do NOT show a demo. Do NOT build anything. Just describe the concept in 10 minutes.
3. Ask:
   - "Do you have a real problem right now that you can't solve with your current team?"
   - "If this platform existed and had proven contributors, would you post this problem?"
   - "At what price is this a no-brainer for you?"
   - "At what price would you never consider it?"
   - "What would you need to see to trust that contributors on this platform are actually capable?"
4. Record: the problem, the price range, and every objection verbatim

**Pass Criteria:**
- ≥3/5 express willingness to pay at some price
- ≥2/5 give a concrete budget range or "would pay €X for this"
- ≥1 problem is genuinely solvable by a distributed team (not requiring on-site presence or proprietary context)
- The objections reveal what's missing in the current concept

**Go/No-Go Gate:**
```
Pass → You have launch partners + concrete problems for Phase 2
Fail → Pivot to a grant/impact-funded model (free to clients initially)
```

**Materials needed:** 1-page concept summary, conversation guide, problem submission template

---

## Decision Matrix After Phase 0

```
                    │ TEST 0.2 PASS │ TEST 0.2 FAIL
────────────────────┼───────────────┼─────────────────
TEST 0.1 PASS       │   → Phase 1   │ Redesign attrib.
TEST 0.1 FAIL       │ Rethink core  │ Rethink core +
                    │ consumer value│ redesign attrib.

If TEST 0.3 PASSES → Festival is acquisition channel
If TEST 0.4 PASSES → Client launch partners identified

If BOTH 0.3 AND 0.4 pass → Strong foundation for Phase 1 + 2
If only 0.3 passes       → Phase 1 (contributors exist, no clients yet)
If only 0.4 passes      → Build waitlist, find acquisition channel first
If NEITHER passes       → Major pivot required
```

---

## What to Capture for SPEC.md

Each test must produce:
1. **Verbatim quotes** — especially objections, surprises, and "why I'd quit" statements
2. **Objection map** — what stopped people from being interested or engaged
3. **Specific numbers** — conversion rates, satisfaction rates, price points
4. **Problem backlog** — real problems from Test 0.4 to turn into first challenges
5. **Design constraints** — what the prototype users said would make them return

This data goes directly into SPEC.md and overrides any assumption in this document.

---

## Timeline (2–3 Weeks)

| Week | Tests | Output |
|------|-------|--------|
| 1 | 0.1 (Self-discovery desire) + 0.2 (Attribution) | Go/no-go decisions on core mechanism |
| 2 | 0.3 (Festival) setup + 0.4 (Client) conversations | Funnel design + client shortlist |
| 3 | 0.3 execution (if event is weekend) + synthesize | Full decision package |

**If event isn't for 3+ weeks:** Run 0.1, 0.2, 0.4 in week 1–2. Run 0.3 at the next available event. Do not wait for the "perfect" event — use any event.

---

## What Phase 0 Does NOT Test

These are tested in Phase 1 (with actual engineering):
- Whether the behavioral profiling engine produces valid comparative vectors
- Whether the challenge library is rich enough to retain people for 30 days
- Whether the adaptive sequencing keeps difficulty appropriate
- Whether the streak/milestone mechanics actually drive retention

These are tested in Phase 2 (with real clients and money):
- Whether clients will actually pay vs. say they'd pay
- Whether attribution works under real social dynamics
- Whether the matching engine outperforms cold-start

---

## Phase 0 Budget

**Estimated cost:** €0–200
- Typeform (free tier): €0
- Manychat trial: €0
- Booth materials (print result cards, QR signage): ~€100–150
- Participant incentives (coffee, small gift for interviews): ~€50

**If you can't run Phase 0 for under €200, you're overthinking it.**

---

*PILOT.md v2 — aligned to CONCEPT.md rebuild 2026-03-25 | Aton ☀️🦞*
