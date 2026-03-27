# TEST 0.3 — Festival Top-of-Funnel
## Event Activation + Digital Experience Handoff | Contribution Graph Phase 0

**Owner:** Kristaps (user) + Aton
**Date:** 2026-03-27 (draft) | **Status:** Draft — event identification required before use
**Version:** 0.1

---

## Purpose

Validate whether a physical activation at a real event drives people to a digital experience (Telegram bot) they actually return to. The full funnel:

```
Event Booth
    ↓ (QR scan)
Typeform Quiz (10 questions)
    ↓
Result Card (shareable screenshot + bot install CTA)
    ↓
Telegram Bot Onboarding (day 0)
    ↓ (7 days later)
Day-7 Retention Survey
```

**This test does NOT require engineering.** Tools: Typeform (free tier), Manychat or Telegram bot template (free tier), spreadsheet.

---

## Event Selection Criteria

**Find one event in the next 4–8 weeks.** Target:

| Event Type | Why | Conversion Likelihood |
|-----------|-----|----------------------|
| Hackathon (24–48h) | High transitional energy, tech-savvy, aged 18–30 | ★★★★☆ |
| Youth conference (TechCrunch Disrupt, local equivalent) | Same crowd, more diverse | ★★★★☆ |
| Creative festival (artist showcase, design week) | High social sharing instinct | ★★★☆☆ |
| Startup / entrepreneur meetup | Already thinking about skills + impact | ★★★★☆ |
| University career day | Transitional moment = prime for self-discovery | ★★★★☆ |

**Minimum requirements:**
- Ability to have a physical booth or table (or QR codes placed somewhere visible)
- Expected foot traffic ≥100 people over event duration
- Event is within 4–8 weeks (do not wait for the "perfect" event)

**Quick identification questions to ask event organizers:**
- "What's the expected attendance?"
- "What's the age range of attendees?"
- "Are you open to a QR code activation or a small booth?"
- "What's the Wi-Fi situation like?"

---

## The Physical Experience (Booth Design)

### Booth Setup (Budget: €50–150)

**Required:**
- 1 A2/A3 poster with QR code + tagline
- 50–100 printed result cards (see Result Card Design below)
- QR code: links to Typeform quiz (see below)

**Optional (if budget allows):**
- 1 roll-up banner (€30–50 from Vistaprint or similar)
- Lanyard clips with QR codes (€20 for 100 from Amazon)
- Small giveaways (pens, stickers) to draw people to the booth

### QR Code Placement Strategy

Place QR codes **at the point of highest energy / waiting**, not at registration:
- Near the coffee station (people wait in line)
- At the back of the room during talks (people check phones)
- On the demo table (people waiting for their turn)
- On business cards or lanyard clips

**Do NOT:** Put QR code only at a quiet booth in a corner. People will not walk over just to scan.

---

## Typeform Quiz Design

Create a Typeform (free: 10 questions max on free tier). Title: **"What's Your Challenge Archetype?"**

### The Quiz Flow

**Opening (not counted as a question):**
> "Answer 7 quick questions and we'll tell you how you approach problems — and what kind of challenges bring out your best work."

**Questions (7 — must fit free tier):**

**Q1 (pattern_recognition):**
> "You're in a meeting where everyone is accepting a problem as normal. But something about it bothers you. What do you do?"
> - Bring it up immediately
> - Wait and think about it more
> - Take notes and raise it after the meeting
> - Assume someone else will mention it
> *(Purpose: distinguish pattern-seers from process-followers)*

**Q2 (initiative_taking):**
> "You have an idea for something that wasn't in today's plan. What happens next?"
> - I suggest it right away
> - I wait until someone asks for ideas
> - I think about it but don't say anything
> - I quietly start working on it without telling anyone
> *(Purpose: distinguish initiators from executors)*

**Q3 (contribution_drive):**
> "You're working on something important and someone is struggling nearby. What do you do?"
> - Stop what I'm doing and help
> - Send them a helpful resource
> - Hope they figure it out
> - Offer help only if they ask
> *(Purpose: distinguish contributors from专注自我)*

**Q4 (purpose_clarity):**
> "How clearly can you describe what you're actually good at?"
> - I have a clear, specific answer
> - I know my general area but not the specifics
> - I'm still figuring it out
> - I'm not sure I'd recognize it if I saw it
> *(Purpose: self-awareness baseline + product fit check)*

**Q5 (voice_authenticity):**
> "In a group discussion, what's usually your role?"
> - I synthesize everyone's points into something new
> - I ask the question nobody else thought to ask
> - I push back on things that don't add up
> - I usually go with the flow
> *(Purpose: distinguish synthesizers, challengers, connectors)*

**Q6 (obstacle_persistence):**
> "Something you really care about hit a wall. What do you do?"
> - Find another way around the wall
> - Reassess whether it's actually worth it
> - Ask someone for help
> - Put it aside and work on something else for a while
> *(Purpose: distinguish problem-solvers from pivoters)*

**Q7 (time + motivation):**
> "If a bot sent you a 5-minute challenge every day for 30 days that helped you understand your strengths — would you do it?"
> - Yes, every day
> - Yes, most days
> - Maybe, if I had time
> - Probably not
> *(Purpose: self-selection for bot install intent)*

### Result Logic (Typeform branching)

Based on Q1–Q6, assign one of 4 archetypes:

| Archetype | Signals | Description |
|-----------|---------|-------------|
| **The Synthesizer** | High Q1 + Q5 | You see patterns others miss and connect ideas in original ways |
| **The Igniter** | High Q2 + Q6 | You start things and keep going when they get hard |
| **The Connector** | High Q3 + Q5 | You make others better and create momentum in groups |
| **The Architect** | High Q1 + Q2 + Q6 | You see systems, start initiatives, and push through obstacles |

### Typeform End Screen

**NOT "thank you" — this is the conversion moment:**

```
[ARCHETYPE RESULT — e.g. "You're The Synthesizer"]

You find patterns in chaos.

The Synthesizer sees what others miss — the hidden connection between two ideas, the reason a process keeps breaking, the opportunity nobody has named yet.

Your next step: Take the full Contribution Graph.
A 30-day Telegram challenge that maps your real strengths — not a personality test, but a living picture of what you actually do.

[→ Install the Bot]
[📸 Copy my result]

Your result is saved. Come back to contributiongraph.ai/you
```

**→ Install the Bot** = deep link to Telegram bot with start parameter capturing archetype  
**📸 Copy my result** = opens share card image

---

## Result Card Design

### What It Shows (shareable PNG, 1080×1080)

```
┌──────────────────────────────────────────────┐
│                                              │
│     What's Your                              │
│     Challenge                                │
│     Archetype?                               │
│                                              │
│  ════════════════════════════════════════    │
│                                              │
│  🎯 YOU'RE THE SYNTHESIZER                   │
│                                              │
│  "You see patterns in chaos.                 │
│   You connect ideas that shouldn't          │
│   fit — and make them fit."                 │
│                                              │
│  Take the full 30-day challenge →          │
│  contributiongraph.ai/you                   │
│                                              │
│  [QR code → Typeform quiz]                 │
│                                              │
└──────────────────────────────────────────────┘
```

**Design notes:**
- Bold archetype name at top
- 1-sentence quote in large, readable type
- Short CTA with URL
- QR code to Typeform quiz (for people who didn't take it at the booth)
- Format: 1080×1080 PNG, mobile-friendly
- Make it interesting enough to screenshot even if they don't install the bot

**Tools:** Canva (free) or Figma — templates available

---

## Telegram Bot Onboarding Flow

### Day 0 — When They Install

The bot should be pre-populated with their archetype from the Typeform quiz. The start command carries a payload:

```
/start archetype=synthesizer
```

**Message sequence:**

1. **Welcome (immediate):**
> "Hey — you just got your Synthesizer result at [EVENT NAME]. Ready to see what that actually means in practice?"

2. **The hook (after 30 min, or next morning):**
> "Quick question: Think about the last time you saw a problem everyone else treated as normal — but you couldn't stop thinking about how to fix it. What was it?"

3. **First signal (after they reply):**
> "Interesting. That's called Pattern Recognition — the ability to see systems others accept as given. You do this naturally. Most people have to learn it."

4. **Day 1 challenge (after 2h):**
> "Here's your first challenge — it's 5 minutes and it won't be comfortable. But it will show you something real about yourself. Ready? [Yes →]"
> → Challenge: "Describe a time you solved a problem nobody asked you to solve. What did you do, and what would you do differently?"

5. **Send off with map preview:**
> "Your map is taking shape. Come back tomorrow — your next challenge is already waiting. contributiongraph.ai/you"

### Day 1–7 Messages (Automated via Manychat or bot)

| Day | Message | Purpose |
|-----|---------|---------|
| Day 1 (6h after install) | Challenge reminder | Drive first challenge completion |
| Day 2 (morning) | "Your map updated overnight" + screenshot | Show progress, create curiosity |
| Day 3 | Day-3 fear check: "Honest question — are you still finding this useful?" | Detect drop-off signal |
| Day 4 | Challenge + social proof: "Other Synthesizers found this the hardest question yet" | Re-engage |
| Day 5 | No message (let them come on their own) | Test natural retention |
| Day 6 | "Your week one map is ready" + link to web map | Re-engage via visual |
| Day 7 | Day-7 survey: "7 days in — 3 quick questions" + survey link | Collect retention data |

### Day-7 Retention Survey (Typeform, 3 questions)

**Q1:** "How many of the 7 daily challenges did you complete?"
> 0 / 1–2 / 3–4 / 5–6 / All 7

**Q2:** "What's the main reason you did or didn't come back?"
> Open text — capture verbatim

**Q3:** "If this existed as a full product — with real client problems to solve and real money for contributors — would you use it?"
> Definitely / Probably / Not sure / Probably not / Definitely not

---

## Funnel Tracking Spreadsheet

Create one row per QR scan source. Track everything in a Google Sheet.

### Columns

| Column | What to fill |
|--------|-------------|
| Event name | [Event name] |
| Event date | [Date] |
| Booth location | [Where QR was placed] |
| QR scans (total) | Count from QR analytics or manual tally |
| Quiz completions | Count from Typeform results |
| Quiz completion rate | = completions / scans |
| Bot installs | Count from Telegram bot analytics |
| Bot install rate | = installs / completions |
| Day-0 challenge completions | Count from bot |
| Day-7 returns | Count from bot (7-day return event) |
| Day-7 return rate | = 7-day returns / installs |
| 14-day profile completion | Count from bot (50%+ profile = complete) |
| 14-day completion rate | = 14-day completions / installs |
| Survey responses | Count from Day-7 survey |
| NPS or recommendation score | Average from Q3 |

### Target Benchmarks

| Metric | Hard Pass | Target | Stretch |
|--------|-----------|--------|---------|
| QR scan → Quiz completion | 40% | 55% | 70% |
| Quiz completion → Bot install | 25% | 40% | 55% |
| Bot install → 7-day return | 20% | 35% | 50% |
| Bot install → 14-day 50% profile | 10% | 20% | 30% |

---

## Session Notes Template

### Post-Event Debrief (fill in immediately after)

```
Event: _______________
Date: _______________
Booth location: _______________
Booth traffic (est. people who passed): _______________
QR scans: _______________
What worked at the booth:
1. _______________
2. _______________
3. _______________
What didn't work:
1. _______________
2. _______________
What people said (verbatim quotes):
-
-
-
Observations:
-
-
-

Prepared by: _______________
```

---

## Go/No-Go Decision

After the event (or after 14 days post-event for full funnel data):

**Go → Custom bot development is justified** if ALL of:
- ≥40% quiz completion from QR scans
- ≥25% bot install from quiz completions
- ≥20% 7-day return from bot installs

**No-Go → Double down on no-code tooling OR rethink acquisition channel** if ANY metric fails by >50% of target.

---

## Next Deliverable After Test 0.3

If Pass → Update SPEC.md:
- Fill in event details, conversion metrics, verbatim quotes from Day-7 survey
- Add result card design to SPEC.md as acquisition asset
- Document which booth location + QR placement drove best conversion

If Fail → Document which step of the funnel broke:
- QR scan → quiz: booth placement problem or quiz entry problem?
- Quiz → bot install: result card not compelling OR bot onboarding friction?
- Bot → 7-day return: Day-3 drop-off → challenge difficulty problem OR no real hook?

---

## Materials Checklist

Before event day, confirm all are ready:

- [ ] Event identified and confirmed (date, location, booth access)
- [ ] Typeform quiz created and tested (share link works, result logic correct)
- [ ] QR codes generated and printed (test scan on your phone)
- [ ] Result cards designed and printed (50–100 copies)
- [ ] A2/A3 poster with QR designed and printed
- [ ] Telegram bot pre-configured with archetype payloads (`/start?payload=...`)
- [ ] Day-1 through Day-7 automated messages set up (Manychat or bot code)
- [ ] Day-7 survey Typeform created and linked in bot
- [ ] Google Sheet tracking template created (columns above)
- [ ] Team briefed on 30-second pitch (what to say at the booth)
- [ ] Phone/tablet for live tracking of QR scans ready

---

## Running the Activation (Day-Of)

**Pitch (30 seconds, booth):**
> "We're doing a quick quiz — 7 questions, 2 minutes — and we'll tell you your challenge archetype. No email, no account needed. At the end you get a Telegram bot that sends you a 5-minute challenge every day for 30 days."

**If they engage but hesitate at the bot install:**
> "You can just take the result card — screenshot it. But if you install the bot, you get the full picture of what your archetype actually means in practice."

**If they don't want to do the quiz:**
> "That's fine — here's a result card. Take a screenshot. The QR code on it takes you to the quiz if you want to do it later."

---

*PILOT.md v2 — TEST 0.3 Festival Top-of-Funnel | Aton ☀️🦞 | 2026-03-27*
