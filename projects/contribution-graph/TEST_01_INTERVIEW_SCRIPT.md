# TEST 0.1 — Self-Discovery Desire
## Interview Script & Materials | Contribution Graph Phase 0

**Owner:** Kristaps (user) + Aton
**Date:** 2026-03-27 (draft) | **Status:** Draft — needs user review before use
**Version:** 0.1

---

## Purpose

Validate whether the core consumer value proposition (a bot that discovers your strengths through micro-challenges) produces genuine intent-to-use, not polite interest.

**Hard pass criteria (must both be met):**
- ≥7/10 say "yes, I would actually use this" (not "it sounds interesting")
- ≥5/10 identify a specific, credible fear of dropping off after Day 3

---

## Participant Screener

### Recruitment Criteria
- Aged 18–30
- In a transitional moment: recently graduated, job change, career uncertainty, or "restless but not sure what to do next"
- Has a Telegram account (required — bot is Telegram-only in Phase 0)
- Available for 30-minute remote or in-person session in the next 2 weeks
- NOT: currently employed in a role they feel fully aligned with and satisfied by

### Screener Questions (5 minutes, phone or message)

Ask these before scheduling. Say: *"We're running a short UX research session for a new self-discovery tool. It takes 30 minutes and involves trying a paper prototype. Are you available?"*

1. *"What's your current situation — student, working, between jobs, or something else?"*
   → Confirm transitional moment (student graduating, unemployed, feeling stuck in current role)

2. *"Do you have a Telegram account you use regularly?"*
   → Must be yes

3. *"On a scale of 1–10, how clear are you right now about your strongest skills or what you want to be known for?"*
   → 1–6 is ideal; 7–10 means they're too settled for this product right now

4. *"Have you ever used a personality test, strengths quiz, or career assessment (like Myers-Briggs, StrengthsFinder, etc.)?"*
   → Note: familiar with the category but ideally skeptical of it

5. *"What's one thing you wish you could be better at, or one skill you're curious whether you have?"*
   → Open-ended — captures motivation to use the product

**Accept if:** 3/5 criteria met. Target 12 recruits to allow 2 no-shows = 10 participants.

---

## Consent & Recording

### Consent Script (read aloud before starting)

*"Before we begin, I want to be transparent about this session. This is research for a product called the Contribution Graph — it's a self-discovery tool that uses short chat challenges to help you understand your strengths. We're testing whether the concept is useful, not evaluating you as a person. There are no right or wrong answers.*

*With your permission, I'd like to record audio notes or write down what you say — I'll paraphrase rather than quote you directly, and I'll anonymize everything. The recording is only for my notes and will never be shared publicly. Does that sound okay? Can I take notes during our conversation?"*

**Confirm:** Verbal consent is sufficient. Note consent in your notes.

---

## Paper Prototype — 5 Screens

Print or sketch these 5 screens on A4 paper. Label each one. Show them in order during the walkthrough.

### Screen 1: The Hook (Onboarding)

```
┌──────────────────────────────────┐
│  [Telegram Bot: @YourBot]        │
│                                  │
│  Hey. I noticed you've been      │
│  quietly organizing things at    │
│  work that other people miss.     │
│                                  │
│  Most people don't see that.     │
│  I do.                           │
│                                  │
│  Would you like to know what     │
│  that says about you?            │
│                                  │
│  [Yes, show me] [Not now]        │
└──────────────────────────────────┘
```

**Copy to read aloud:** *"This is the first message you get. The bot has noticed something about you. It doesn't ask you to fill in a profile or take a quiz — it just makes an observation. What do you think when you read this?"*

**Probe:** *"What catches your eye first? What makes you want to continue — or not?"*

---

### Screen 2: First Challenge Prompt

```
┌──────────────────────────────────┐
│  [Telegram Bot: @YourBot]        │
│                                  │
│  Good. Let's start with          │
│  something small.               │
│                                  │
│  Think about the last time you   │
│  saw a problem that everyone     │
│  else seemed to accept — but     │
│  you couldn't stop thinking      │
│  about how to fix it.            │
│                                  │
│  What was the situation?         │
│  And what did you do about it?   │
│                                  │
│  ────────────────────────────    │
│  📝 Reply in 1–3 sentences       │
│  Take your time.                 │
└──────────────────────────────────┘
```

**Copy to read aloud:** *"You'd tap 'Yes, show me' and the bot asks you this question. You'd reply in chat, like a normal conversation. How does this type of question feel to answer?"*

**Probe:** *"Is this easier or harder than writing a cover letter or CV? Why?"*

---

### Screen 3: First Signal Detected (Aha Moment)

```
┌──────────────────────────────────┐
│  [Telegram Bot: @YourBot]        │
│                                  │
│  Interesting.                   │
│                                  │
│  What you just described is      │
│  called Pattern Recognition —   │
│  the ability to see systems      │
│  others accept as normal.        │
│                                  │
│  Most people develop this       │
│  skill slowly, if at all.        │
│  Yours is already active.        │
│                                  │
│  [Show me my map →]              │
└──────────────────────────────────┘
```

**Copy to read aloud:** *"The bot has analyzed your answer and gives you this insight. It tells you one specific strength. How does that land?"*

**Probe:** *"Does this feel accurate to you, or does it feel like a generic horoscope? What would make it more believable?"*

---

### Screen 4: Your Contribution Map

```
┌──────────────────────────────────┐
│  contributiongraph.ai/you       │
│                                  │
│  YOUR CONTRIBUTION MAP          │
│  ══════════════════════════      │
│                                  │
│     Pattern Recognition  ████░░  │
│     Initiative           ███░░░  │
│     Synthesis           █████░  │
│     Systems Thinking    ███░░░  │
│     Creative Output     ██░░░░  │
│                                  │
│  ⚡ Growth edge: You notice     │
│    patterns. Next challenge:    │
│    turn one into something      │
│    other people can use.        │
│                                  │
│  Day 1 of 30 │ 1 challenge      │
└──────────────────────────────────┘
```

**Copy to read aloud:** *"This is what your contribution map looks like after the first challenge. It's a personal radar chart that gets more detailed the more you interact. How does this visual land for you?"*

**Probe:** *"Does this feel like something you'd want to come back to tomorrow? What would make you return on Day 3? Day 30?"*

---

### Screen 5: Challenge Complete + Sharing

```
┌──────────────────────────────────┐
│  [Telegram Bot: @YourBot]        │
│                                  │
│  Challenge complete.            │
│                                  │
│  🎯 Pattern Recognition: +2     │
│  Your map is 12% more accurate. │
│                                  │
│  Tomorrow: a new challenge      │
│  matched to your growth edge.   │
│                                  │
│  ——— Optional ———               │
│  Share your map with a friend:  │
│  [Copy link]  [Send to friend]  │
│                                  │
│  ─────────────────────────────  │
│  Day 1 complete. See you        │
│  tomorrow.                       │
└──────────────────────────────────┘
```

**Copy to read aloud:** *"After completing a challenge, you see this. You get a score update, a preview of tomorrow's challenge, and an option to share. What stands out to you here?"*

**Probe:** *"Would you send the link to a friend? Why or why not? What would make you want to — or make you hesitate?"*

---

## Interview Script (Full Flow)

### Part 1: Warm-Up (2 minutes)

*"Thanks for being here. To start — tell me a little about yourself. What are you up to right now?"*

*"When you think about your skills or strengths, how do you currently figure out what you're good at?"*

→ Listen. Don't correct. This establishes baseline language around self-assessment.

---

### Part 2: Prototype Walkthrough (10 minutes)

Show Screen 1. Say: *"Imagine you open Telegram and see this message. What goes through your head?"*

- Probe: *"What would make you reply 'Yes'? What would stop you?"*
- Probe: *"Does the fact that it noticed something about you feel creepy or interesting?"*
- Probe: *"Have you ever gotten a message from a bot or app that felt like it 'got' you? What made that work?"*

Show Screen 2. Say: *"You tap yes, and this is the first question. How does this feel to answer?"*

- Probe: *"Is it easier or harder than a job application question? In what way?"*
- Probe: *"Do you feel pressure to give a 'good' answer or the 'right' answer?"*

Show Screen 3. Say: *"The bot analyzes your answer and sends this back. How does this land?"*

- Probe: *"Does this feel specific and accurate, or vague and generic?"*
- Probe: *"If a friend told you this about yourself, would you believe them? Why or why not?"*

Show Screen 4. Say: *"This is your personal contribution map — it builds up over time."*

- Probe: *"What's the first thing you notice? What catches your eye?"*
- Probe: *"Is this the kind of thing you'd open every day? Every week? Never?"*
- Probe: *"The growth edge says 'turn one of your patterns into something other people can use.' What do you think about that as a challenge?"*

Show Screen 5. Say: *"This is what you see after completing a challenge."*

- Probe: *"Would you send this to a friend? What would make you want to share it?"*
- Probe: *"What would make you feel like tomorrow's challenge is worth coming back for?"*

---

### Part 3: Day 3 / Day 30 Questions (5 minutes)

Now remove the prototype. Ask directly:

**Q1:** *"Imagine you started using this today. What would make you stop using it after Day 3?"*

→ Pass criteria: ≥5/10 name a *specific* credible fear (not "I might forget").  
→ Listen for: effort barrier, fear of being judged, not seeing value quickly enough, privacy concerns.

**Q2:** *"What's one thing this is missing that would make it worth returning on Day 30?"*

→ Pass criteria: ≥3/10 raise something genuinely new (not already addressed in the prototype).  
→ Listen for: social/professional proof, tangible outcomes, connection to real opportunities.

**Q3:** *"On a scale of 1–10, how likely are you to actually use this if it existed — with 1 being 'I would never open it again after Day 1' and 10 being 'I would make this part of my routine'? What would have to be true for a [your number]?"*

→ Pass criteria: ≥7/10 say 7 or above.

**Q4:** *"Is there anything about this concept that feels presumptuous — like it assumes things about you that aren't true?"*

→ Open. Capture verbatim. This is the "what would make you trust it" question.

---

### Part 4: Close (3 minutes)

**Q5:** *"If this existed right now and worked exactly as described, what's the one thing you would use it for — career planning, understanding yourself better, building a portfolio, something else?"*

→ Capture primary use case. This is the anchor for Phase 1 positioning.

**Q6:** *"If you could change one thing about what I showed you today, what would it be?"*

→ Open-ended. Capture verbatim. This feeds directly into SPEC.md.

*"Thanks. That's everything I needed. Do you have any questions for me?"*

---

## What to Capture Per Session

### In your notes, record:

| Field | What to write |
|-------|---------------|
| Participant # | P1, P2, ... |
| Demographics (brief) | Age range, situation |
| Q1 Day-3 fear | Direct quote or paraphrase |
| Q2 Day-30 missing thing | Direct quote or paraphrase |
| Q3 Likelihood score | Number only |
| Q4 Trust/presumption issue | Direct quote or paraphrase |
| Q5 Primary use case | 1 sentence |
| Q6 Change they'd make | Direct quote |
| **Surprise** | Something they said that wasn't in our assumptions |
| Pass/Fail signal | Does this participant meet the pass criteria? |

---

## Running the Sessions

**Format:** 30 minutes, remote (Zoom/Meet/Phone) or in-person
**Number of sessions:** 10 minimum (target 12 recruits)
**Timeframe:** Week 1 of Phase 0
**Who runs:** Kristaps (user) — Aton helped draft this script
**Tools:** Paper prototype (printed A4), notes template, audio recording (optional, confirm consent)

---

## Go/No-Go Decision

After all 10 sessions:

Count:
1. How many scored ≥7 on Q3 (likelihood to use)
2. How many named a specific Day-3 fear in Q1
3. How many raised a genuinely new Day-30 insight in Q2

**Go → Phase 1** if:
- ≥7/10 meet the intent-to-use threshold (Q3)
- ≥5/10 named a specific Day-3 fear (Q1)

**No-Go → Rethink core consumer value proposition** if either fails.

---

## Next Deliverable After Test 0.1

If Pass → Write up verbatim quotes, objection map, and design constraints → update CONCEPT.md SPEC.md  
If Fail → Document the core objection → present 3 pivot options to user

---

*PILOT.md v2 — TEST 0.1 Interview Script | Aton ☀️🦞 | 2026-03-27*
