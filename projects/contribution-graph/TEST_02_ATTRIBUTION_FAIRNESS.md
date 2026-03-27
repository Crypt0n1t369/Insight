# TEST 0.2 — Attribution Fairness Intuition
## Materials & Protocol | Contribution Graph Phase 0

**Owner:** Kristaps (user) + Aton
**Date:** 2026-03-27 (draft) | **Status:** Draft — needs user review before use
**Version:** 0.1

---

## Purpose

Validate whether the proposed attribution mechanism — **structured contribution claims + peer attestation + client ratification** — feels genuinely fair to the people being evaluated, not just to the people designing it.

This is the hardest social assumption in the whole system. If people feel systematically undermined by the attribution process, no amount of algorithmic elegance will save it.

**Hard pass criteria:**
- ≥4/5 participants say "roughly fair" or "fair" after seeing the results and negotiating
- No single person feels systematically undermined or credited for things they didn't do
- The structured claim format produces useful signal (not just noise / diplomatic answers)

---

## What This Test Actually Probes

The core fear: *In a distributed team, invisible contributions get no credit. Loud contributors get all the credit. The best work often comes from the person in the background — and that person gets erased.*

The proposed mechanism:
1. Each person writes: "I did [specific thing] — [evidence]. This enabled [downstream thing]."
2. Peers attest to others' contributions (anonymized, weighted by credibility)
3. Client reviews and ratifies final attribution

**What we want to know:** Does this feel like it protects the quiet high-performer? Or does it still reward the loud?

---

## Participant Setup

### Who to Recruit
- 5 people who know each other at least casually (friends, colleagues, classmates)
- They need enough shared context to actually evaluate each other's contributions, not strangers
- Mix: at least 2 people who tend to lead/dominate, at least 2 who tend to support/step back
- This mix is intentional — we're testing whether the quiet ones get a fair hearing

### Setup Time
- 10 minutes: brief + task distribution
- 30 minutes: collaborative task
- 15 minutes: individual claim writing
- 20 minutes: attribution reveal + negotiation + survey

**Total:** ~75 minutes

---

## Part 1: Task Brief — "Plan a Hypothetical Event"

**Say this to start:**

*"We're going to do a quick team task. You'll plan a real event together — the specifics don't matter, we're watching how the work gets distributed and what每个人 ends up contributing. You have 30 minutes. I'm looking for a real plan, not just ideas — a concrete plan with assigned owners."*

### Event Scenario (print on card, give to group):

> **Your team has been asked to plan a 50-person community event.**
>
> **Goal:** A half-day event (Saturday, 2–6 PM) that helps recent graduates in your city feel less alone in their career confusion.
>
> **Budget:** €500 total (including venue, materials, food).
>
> **Deliverable (30 min):** A concrete plan with: date/time, venue shortlist (2 options), 3 agenda items, who's responsible for what, and a one-paragraph pitch for why a graduate would actually come.
>
> **Constraints:** Must happen within 6 weeks. Must be free or very low cost for attendees.

### Facilitator Instructions
- Say nothing during the 30 minutes. Let the group self-organize.
- Take notes on: who speaks first, who gets assigned what, who brings ideas, who stays quiet, who mediates.
- If one person dominates entirely, gently say: *"Make sure everyone has a role."*
- If no one takes a coordinating role, that's data — note it.

### What to Capture While They Work (observational notes)
- Who initiated ideas vs. who elaborated on others' ideas
- Who got assigned tasks vs. who claimed tasks
- Who mediated conflicts
- Who stayed in the background
- Laughter, tension, disagreement patterns

---

## Part 2: Individual Contribution Claims

**After 30 minutes, give each person the claim template (printed or shared via link).**

**Say:**

*"Now I want each of you to write down what you personally contributed — not what the group did, what YOU did. Be specific. Then write down what others did that you couldn't have done without. You'll do this individually — I won't share your answers until the end."*

### Contribution Claim Template

```
CONTRIBUTION CLAIM FORM
Name: ___________________

1. MY CONTRIBUTIONS

[For each thing you did, fill in:]
Action: _________________________________
Evidence: ________________________________
(What did you actually do or produce? A concrete output.)

This enabled: _____________________________
(What happened because of what you did?)

---

2. CONTRIBUTIONS I COULDN'T HAVE DONE WITHOUT

Person: _____________ What they did: ___________________
Person: _____________ What they did: ___________________

---

3. ANYONE WHO CONTRIBUTED BUT DIDN'T GET CREDIT?
Who: _______ What they did: _____________________________
```

**Time:** 10 minutes individually. Collect all forms.

---

## Part 3: Peer Attestation (Anonymized)

**Do this step after collecting all claim forms.**

Create a sheet with each person's contributions listed **anonymously** (no names). Share with the group.

**Say:**

*"Here are everyone's contributions — anonymized. Read through them and mark: (✓) if you witnessed this and agree, (?) if you're unsure, (✗) if you think this is inaccurate. You can also add contributions you think are missing."*

### Attestation Form

```
ATTESTATION FORM
Your name: _______________

[For each anonymous contribution:]
Contribution: "________________________________"
Your attestation: (✓) / (?) / (✗)
Notes (optional): _________________________________

---

Any contributions you witnessed that aren't listed?
_______________________________________________________
```

**Time:** 10 minutes individually.

---

## Part 4: Attribution Reveal + Negotiation

**This is the key moment.**

Reveal:
1. Who claimed what
2. Who attested to whom
3. The proposed attribution score (your synthesis)

**Say:**

*"Here's what everyone's claims look like when put together, and how others attested to them. Does this feel roughly fair? What feels off? What's missing? Talk it out — this is the real test."*

**Facilitator notes — watch for:**
- Does someone feel overstated? (Did X claim something Y did?)
- Does someone feel understated? (Did the quiet person's key contribution get credited to someone else?)
- Do people negotiate? Or do they accept it silently?
- Does the claim format surface things that wouldn't normally be said out loud?
- Does attestation feel trustworthy?

**Let them negotiate for up to 10 minutes. Don't adjudicate — just observe.**

---

## Part 5: Feedback Survey

**After negotiation, each person fills this out individually.**

```
FEEDBACK SURVEY — Attribution Fairness

1. After seeing the claims and the group discussion, does the final picture feel fair?
   [ ] Yes, completely fair
   [ ] Roughly fair
   [ ] Somewhat unfair
   [ ] Clearly unfair

2. Did the claim format ("I did X — evidence — this enabled Y") capture what you actually contributed?
   [ ] Yes, fully captured
   [ ] Mostly captured
   [ ] Partially captured
   [ ] Missed important things
   [ ] Missed almost everything

3. Did seeing others' anonymous claims change how you thought about their contributions?
   [ ] Yes, I gained new respect for someone
   [ ] Somewhat
   [ ] No, I already knew
   [ ] It created confusion

4. Did attestation (voting on others' claims) feel:
   [ ] Genuinely informative — I learned something
   [ ] Mildly useful
   [ ] Neutral
   [ ] Awkward / uncomfortable
   [ ] Manipulated / gameable

5. Do you think the quietest person on the team got a fair hearing?
   [ ] Yes
   [ ] Probably
   [ ] Unclear
   [ ] Probably not
   [ ] Definitely not

6. What felt most unfair about the process? (open response)
   _______________________________________________________
   _______________________________________________________

7. What would make the attribution feel more fair? (open response)
   _______________________________________________________
   _______________________________________________________
```

---

## What to Capture for SPEC.md

After each session, write up:
1. **Verbatim quotes** — especially the "what felt unfair" responses
2. **Attribution map** — who got credited for what by whom
3. **Quiet person outcome** — did the quiet person's key contribution surface?
4. **Negotiation dynamics** — did people fight for credit? Let things go? Mediate?
5. **Fairness score** — 4/5 or 5/5 or 3/5 or worse?
6. **Format reaction** — did the structured claim format help or feel bureaucratic?

---

## Session Notes Template

```
TEST 0.2 — SESSION NOTES
Date: _______________
Participants: (first names or initials)
Group composition: ___________________________________

TASK: [brief description of what the group produced]

WHO DID WHAT (observational):
- Person 1: _________________________________
- Person 2: _________________________________
- Person 3: _________________________________
- Person 4: _________________________________
- Person 5: _________________________________

DYNAMIC NOTES (quiet/loud/mediator/dominant):
_______________________________________________

ATTRIBUTION RESULT:
[Copy the final attributed contributions here]

NEGOTIATION:
_______________________________________________

FAIRNESS SCORE: ___/5

QUIET PERSON OUTCOME:
_______________________________________________

KEY QUOTES:
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

GO/NO-GO SIGNAL: ________________________________
```
