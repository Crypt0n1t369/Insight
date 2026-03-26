# DISCOVERY FLOW — APPENDIX: TEST DESIGN & DEEP DIVES
## Contribution Graph | Kristaps | Aton | 2026-03-26

---

## APPENDIX A: THE OPENING QUESTION — REFINEMENT & TESTING PROTOCOL

### The Current Question

> "What's something you did recently that you didn't have to do — but you did it anyway?"

### Why It Works

- **Behavioral, not abstract** — asks for a story, not a description
- **Tests intrinsic motivation** — distinguishes "I had to" from "I wanted to"
- **Self-attribution without pressure** — the user chooses the action
- **Generates social info** — solitary vs. collaborative, creative vs. analytical, care-oriented vs. curiosity-oriented
- **Diagnostic under low pressure** — easy to answer, hard to fake

### How a User Typically Answers

**Strong answer (high signal):**
> "I was walking past this old bookshop and noticed the display was really bad — like, terrible. So I went in and asked if I could rearrange it for them. I spent three hours on it. They offered me a discount."

Signal: Initiative, aesthetic sensibility, action-oriented, comfortable with informal authority, intrinsic reward (satisfaction from the doing, not external recognition).

**Weak answer (low signal):**
> "I don't know... I cleaned my room? I mean, I had to."

Signal: Obligation-driven, concrete thinker, possibly avoids unstructured voluntary action.

**Mid answer:**
> "I helped my neighbor carry her groceries up the stairs."

Signal: Social instinct, helpfulness, but not necessarily initiative in the creative or intellectual sense. This is care-oriented motivation.

### What the Bot Observs Beyond the Answer

- **Speed to answer** — fast = practiced at self-reflection; slow = genuinely thinking
- **Answer length** — >2 sentences = they have a story to tell; <1 sentence = either blank or trivial
- **Specificity** — named details (person, place, thing) vs. generic "stuff"
- **Energy in delivery** — does the description light up or go flat?
- **Voluntary framing** — do they frame it as "I wanted to" or "I should have"?

### How to Refine the Opening Before Launch

**Test it with 5 people before building.** Run the protocol:

1. Show them the opening question (don't explain what we're testing for)
2. Let them answer naturally
3. Ask: "How did you decide what to answer? Did you have to think about it?"
4. If they say "I had to think" or "I couldn't think of anything" — that's a fail signal for the question, not them
5. Record: speed, specificity, energy, social dimension, initiative dimension

**Success threshold:** ≥4/5 can answer with a specific voluntary action without hesitation, and ≥3/5 describe something with enough detail that another person could visualize it.

### Alternative Opening Questions (If Testing Fails)

If the primary opener fails testing, test these alternatives:

**Option A: Activity-based**
> "What's the last thing you did that made you lose track of time?"

*Tests: flow state, intrinsic absorption. Better for analytical/creative types. Weaker for action-oriented helpers.*

**Option B: Observation-based**
> "What's something you've noticed lately that most people seem to walk past without seeing?"

*Tests: attention pattern, perception vs. absorption. Good for pattern-recognition types. More intellectual framing.*

**Option C: Social choice**
> "Think of a decision you made recently that nobody asked you to make. What was it?"

*More directive but clearer. Lower creative ceiling. Higher completion rate.*

**Recommended:** Test the primary first. Keep the alternatives in the bot's toolkit for users who blank on the primary opener.

---

## APPENDIX B: LIVE BEHAVIORAL TESTS — FULL ALTERNATIVE SET

The behavioral test in the main flow (explain a complex topic to a 10-year-old) is the anchor. Here are 3 full alternatives with rubrics and scoring guidance.

### Test Design Principles

Each behavioral test must:
- Be completable in <3 minutes in the chat
- Generate signal across 3+ behavioral dimensions
- Not require any technical setup or external context
- Be differentiable enough that A/B testing has meaning
- Have a clear "what better looks like" without being subjective

---

### TEST ALPHA: The Translation Test

**Prompt:**
> "Give me a topic you know reasonably well — something you've studied, worked on, or figured out. Now explain the most important thing about it to someone who's 10 years old. You have 3 sentences. Go."

**What it measures:**

| Dimension | Low signal | High signal |
|-----------|-----------|-------------|
| Translation ability | Simplifies vocabulary only ("big words become small words") | Reduces structural complexity, not just vocabulary |
| Genuine understanding | Parrots definition | Identifies what is counterintuitive or surprising about the topic |
| Engagement | Treats it as a chore | Gets genuinely into the challenge, one sentence becomes two |
| Topic selection | Picks something trivial or abstract | Picks something with real stakes or surprise |
| Self-awareness | Doesn't check if the listener got it | Includes a "did that make sense?" or tests understanding |

**Scoring:** (0–2 per dimension, max 10)
- Does their explanation distinguish what matters from what doesn't? (0=didn't, 1=partial, 2=yes)
- Does the explanation contain a genuine insight or just a simplification? (0=simplification only, 1=some insight, 2=sharp insight)
- Did they pick up on non-verbal cues that the explanation wasn't landing? (adaptive behavior)

**Follow-up if they do well:**
> "Good. Now explain it without using any analogies or comparisons — just the idea itself."

*Tests whether their understanding is structural or metaphorical.*

**Follow-up if they struggle:**
> "What do you think is the hardest part of explaining this to a 10-year-old?"

*Tests metacognition even when execution is weak.*

---

### TEST BETA: The Skeptic's Challenge

**Prompt:**
> "I'm going to give you a claim. Your job is to tell me the single most important thing wrong with it. You have 60 seconds. Here it is:"
>
> **Option 1 (general):** "The best way to understand a complex problem is to break it down into its parts and study each one separately."
>
> **Option 2 (social):** "The most successful people are the ones who are best at networking and building relationships."
>
> **Option 3 (creative):** "The more you practice something, the better you get at it — mastery is just a matter of repetition."
>
> *(Pick based on context from earlier in the conversation. If no context, use Option 1.)*

**What it measures:**

| Dimension | Low signal | High signal |
|-----------|-----------|-------------|
| Critical thinking | Challenges surface features | Identifies the structural assumption being made |
| Precision | Vague critique ("it's not always true") | Specific, named mechanism ("the fallacy of decomposition") |
| Commercial awareness | Can't find the flaw in the social claim | Identifies survivorship bias, correlation/causation, or selection effect |
| Intellectual honesty | Defends a position they already held | Follows the argument even when it conflicts with their prior |

**Scoring:** (0–2 per dimension, max 8)
- Is the objection specific and structural? (0=vague, 1=somewhat specific, 2=precise)
- Does the objection engage with the strongest version of the claim? (0=no, 1=partial, 2=yes)
- Did they identify an alternative explanation or just deny the original? (extra credit)

**Follow-up if they do well:**
> "Okay, now defend that claim against your own objection. Go."

*Tests whether they can argue both sides — a signature move for synthesis types.*

---

### TEST GAMMA: The Pattern Chase

**Prompt:**
> "Look at this sequence and tell me what comes next — and more importantly, tell me why:"
>
> **Sequence A:** 2, 6, 12, 20, 30, 42, ?
>
> **Sequence B:** 1, 1, 2, 3, 5, 8, 13, ?
>
> **Sequence C:** J, F, M, A, M, J, J, ?
>
> *(Sequence A = n(n+1), B = Fibonacci, C = months)*
>
> **Pick the one most likely to match their profile based on earlier signals:**
> - If they've shown logical/analytical patterns → Sequence A
> - If they've been creative/synthesis-oriented → Sequence B
> - If they've shown attention to systems and cycles → Sequence C

**What it measures:**

| Dimension | Low signal | High signal |
|-----------|-----------|-------------|
| Pattern recognition speed | Takes >60 seconds | Takes <15 seconds |
| Solution strategy | Trial and error | Sees the rule structure first |
| Explanation quality | Just gives the answer | Articulates the generative rule |
| Resilience | Gives up or guesses | Articulates what makes it hard |
| Alternative thinking | Finds one pattern | Notices the sequence could be multiple things |

**Scoring:** (0–2 per dimension, max 10)
- Correct answer: (0=no, 1=yes with explanation, 2=yes + elegant explanation)
- Articulates the generative mechanism: (0=no, 1=partial, 2=full)
- Noticed ambiguity or alternative interpretation: (0=no, 1=yes)

**Follow-up:**
> "Is there another answer that could also work? What would it mean?"

*Tests whether they hold their answer lightly — a pattern for adaptive reasoning types.*

---

### TEST SELECTION GUIDE

| Signal gap to fill | Primary test | When to switch |
|-------------------|-------------|---------------|
| Not enough synthesis data | Test Alpha (Translation) | If they answer quickly but shallowly |
| Not enough critical thinking data | Test Beta (Skeptic) | If they struggle with abstraction |
| Not enough pattern/data data | Test Gamma (Sequence) | If they seem more verbal than mathematical |
| First test was inconclusive | Use next in order | — |
| User seems intimidated | Switch to Alpha (easiest to enter) | If they say "I'm not good at this" |

---

## APPENDIX C: THE NUDGE LIBRARY

### The Framework First

Every nudge follows one of 5 moves:

```
MOVE 1: RETURN TO EVIDENCE — "You said X earlier..."
MOVE 2: SEEK THE QUESTION — "So what's the real question here?"
MOVE 3: INVERT — "What would it look like if you were wrong?"
MOVE 4: EXTERNALIZE — "What would [person] notice about this?"
MOVE 5: SPECULATE FORWARD — "Fast forward a year — what changed?"
```

### When to Use Each Nudge

| Situation | Default move | Alternative |
|-----------|-------------|------------|
| "I don't know what to do" | Move 4 (externalize) | Move 2 (seek the question) |
| "I don't know what I'm good at" | Move 1 (return to evidence) | Move 5 (speculate forward) |
| "I'm not sure" | Move 2 (seek the question) | Move 3 (invert) |
| "That doesn't feel right" | Move 1 (return to evidence) | Move 5 (speculate forward) |
| "I can't choose" | Move 5 (speculate forward) | Move 4 (externalize) |
| "This is too hard" | Move 5 (speculate forward) | Move 2 (seek the question) |
| "What should I do?" | Move 4 (externalize) | Move 2 (seek the question) |
| "I don't understand" | Move 2 (seek the question) | Move 1 (return to evidence) |
| They seem stuck after a challenge | Move 1 (return to evidence) | Move 5 (speculate forward) |
| They're about to give up | Move 5 (speculate forward) | Move 4 (externalize) |

---

### NUDGE LIBRARY (25 Nudges)

#### RETURN TO EVIDENCE nudges

These work when: the user is speculating without grounding, or making claims unsupported by their own history.

**N1 — "You mentioned X earlier..."**
> "You mentioned earlier that you [specific thing they said]. Does that point anywhere? Where does that want to go?"

**N2 — "The pattern in your answers..."**
> "I'm noticing something in what you're telling me. You've described a few situations now where you [observed pattern]. That's the same energy as what you're describing now. Does that fit?"

**N3 — "You did X without being asked..."**
> "You told me earlier you [specific voluntary action]. That's the same kind of move as what you're weighing now. The fact that you did it then — what does that tell you about whether you can do it now?"

**N4 — "Your track record says..."**
> "Based on what you've shared, you've done X, Y, and Z — all voluntary, all on your own initiative. You're now saying you don't know if you should do [this thing]. The question isn't whether you *can*. You've done harder things. What's the actual question?"

**N5 — "The thing you noticed but didn't say..."**
> "You described [situation]. And then you mentioned [detail]. I think there's a signal in what you noticed but didn't lead with. What was that about?"

---

#### SEEK THE QUESTION nudges

These work when: the user is answering the wrong question or has not yet found the real question underneath their stated question.

**N6 — "So what's the actual question?"**
> "You've told me what you're worried about. But I think the real question is something underneath that. What do you think it is?"

**N7 — "Strip it back..."**
> "If you take all the details away — the who, when, how — what's the one thing this is actually about? What's the shape of it?"

**N8 — "When you say [X]..."**
> "When you say [repeat their words], I want to make sure I'm understanding the real thing. Can you say it a different way? What are you really asking?"

**N9 — "What would a good answer look like?"**
> "You want to know [their question]. Good. Now — if you found a really good answer, what would it let you do? What changes when you know?"

**N10 — "What's the question behind the question?"**
> "You're asking me [their question]. But I'm curious what question *you* wish you could answer that would make this one obvious. What are you really trying to figure out?"

---

#### INVERT nudges

These work when: the user is stuck in one direction of thinking and needs to see the problem from upside-down.

**N11 — "Flip it..."**
> "You've been thinking about [X]. Now flip it. What if the opposite were true? What would that look like?"

**N12 — "What if you're wrong?"**
> "You've made a strong case for [their position]. Now I'm going to ask you to make the case against it — not because I disagree, but because I want to know if you can. What would someone who thinks you're wrong say?"

**N13 — "The worst version of this..."**
> "Imagine the worst possible version of what you're thinking about doing. The one where everything goes wrong. Now — what's the thing you just imagined? Is that actually likely? And even if it happened — what would you do?"

**N14 — "What would it look like if this was exactly right?"**
> "You've been worried about [the thing]. Now describe what it would look like if it were exactly the right thing to do. What has to be true for that to be the case? Is it?"

**N15 — "You're describing the problem as [X]..."**
> "But what if that's not the problem? What if the problem is actually [inverted framing]? What changes if we look at it from there?"

---

#### EXTERNALIZE nudges

These work when: the user is in their own head and needs an external perspective to get unblocked, or is using "I don't know" as avoidance.

**N16 — "What would you tell them?"**
> "You know [person they respect or care about]. Imagine they were sitting here and told you what you're telling me. What would you say to them? Is that different from what you're saying to yourself?"

**N17 — "What would they notice?"**
> "Think of someone who knows you well. Not someone who agrees with you — someone who actually sees you. They're watching you struggle with this. What are they noticing? What would they say?"

**N18 — "What's the most obvious next step?"**
> "You're in the middle of something complicated. I want you to pretend you're watching yourself from the outside — like a friend who's on your side. What's the most obvious next step they'd point to? The thing you're maybe overcomplicating?"

**N19 — "What have you done for others in the same position?"**
> "You know people. Have you ever been in a situation where someone you know was going through something similar to what you're going through now? What did you tell them? Was it good advice?"

**N20 — "If you were advising a younger version of yourself..."**
> "Think back to when you were [age 14–16]. You're explaining your current situation to that version of yourself. What do they say? Are they worried? Are they excited? What do they tell you to do?"

---

#### SPECULATE FORWARD nudges

These work when: the user is stuck in the present and needs to see the arc or the consequence.

**N21 — "Fast forward a year..."**
> "It's one year from now. You've done [the thing they didn't do]. What changed? What's different? Is that version of the future better or worse than you imagined?"

**N22 — "What would you regret more?"**
> "There are two possible regrets here: doing it and it not working, or not doing it and wondering. Which one do you think would hurt more six months from now? Which one do you think you'd recover from faster?"

**N23 — "What does the version of you who did this look like?"**
> "I want you to imagine the version of you who actually did this thing. What do they look like? How do they carry themselves? What did they have to be before they could do it? Do you recognize them?"

**N24 — "When you come back in a month..."**
> "Imagine we're talking in a month. You've done the thing. You come back and tell me what happened. What do you most hope you'll be able to tell me? What's the story you want to have?"

**N25 — "The thing you're avoiding..."**
> "You're avoiding [the thing]. Here's what I know about things we avoid: they usually have a simpler version inside them that we're scared to find. What's the actual, simplest version of what you're avoiding? Strip away the story. What's the real thing?"

---

### NUDGE DEPLOYMENT RULES

1. **Never use the same nudge twice in a row** — if you just used N16, don't use N17 next. Vary the move type.

2. **Maximum 2 nudges per session without telling** — after two nudges without the user making progress, say: "I can keep asking questions all day. But at some point — what do *you* think?" This creates gentle accountability.

3. **If they insist on an answer 2+ times** — give a specific, grounded observation. Then immediately follow with: "But what do you think? Does that land?"

4. **Track which nudges work** — if N21 consistently moves a conversation forward where N16 doesn't, that's signal about the user type. Feed it back into the comparative vector.

5. **When in doubt, go to N1** — returning to evidence is almost always the highest-quality nudge because it grounds speculation in demonstrated pattern.

---

## APPENDIX D: PHASE 5 CHALLENGE OPTIONS — FULL DESIGNS

Phase 5 presents 3 challenge options tailored to the three tracks. Each option is described in one line in the bot, then given full detail below.

---

### TRACK 1: IMPACT CHALLENGES

**Theme:** Helping real people, solving community problems, making things better for others.

**3 Challenge Options:**

---

**Impact Option A: The Observation Challenge**

> *"Find one person in your life who's doing something difficult. Don't solve it. Don't help. Just ask them one question that helps them see their own situation more clearly. Report what happened."*

**Why this challenge:**
- Tests empathy without fixer impulse
- Observes whether they can withhold advice and ask a real question instead
- Generates signal on: listening quality, question formulation, ego management (not making it about themselves)

**Behavioral signals generated:**
- Did they ask a genuine question or offer a solution disguised as a question?
- Did they pick someone easy (venting friend) or someone actually in a hard situation?
- What did they do when the person started talking — did they listen or steer?

**Evidence of success:**
- A specific conversation described in detail
- Something the other person said that surprised the user
- What the user learned about listening (not about the other person's problem)

**Follow-up question in the bot after completion:**
> "What was harder — coming up with the question, or not giving advice after they answered?"

---

**Impact Option B: The Documentation Challenge**

> *"There's an issue in your neighborhood, school, or community that you care about but don't fully understand. Find one person who knows more about it than you. Ask them three good questions. Write down not just what they said — but what you noticed about how they said it. What did you learn about the problem? What did you learn about them?"*

**Why this challenge:**
- Tests research curiosity and listening depth
- Requires both inquiry and observation (dual signal)
- Generates evidence about how they handle complexity and incomplete information

**Behavioral signals generated:**
- Did their questions get at root causes or surface symptoms?
- Did they notice non-verbal information or only content?
- How did they choose who to ask?
- Did they seek one perspective or try to triangulate?

**Evidence of success:**
- Three questions written out
- What they noticed in how the person answered (not just what they answered)
- A refined understanding of the problem (not just "I learned a lot")

---

**Impact Option C: The Prototyping Challenge**

> *"Design one small thing that could make one person's life a little better this week. It has to be something you could actually do in the next 7 days with no budget. Do it. Report what happened — including if you didn't do it."*

**Why this challenge:**
- Tests whether insight converts to action
- Generates the most powerful behavioral signal: did they actually do it?
- Observes planning quality (did they scope it small enough to be doable?)

**Behavioral signals generated:**
- Did they pick something meaningful or something trivial to ensure success?
- Did they actually do it? (Most honest signal in the system)
- How did the recipient respond?
- What did they learn about the gap between "helping in theory" and "helping in practice"?

**Evidence of success:**
- Description of the thing they made/did
- What the recipient said or did
- What they'd do differently

---

### TRACK 2: CREATIVE CHALLENGES

**Theme:** Making something from nothing, communicating an idea, translating complexity.

**3 Challenge Options:**

---

**Creative Option A: The Translation Challenge**

> *"Take something you know a lot about — a skill, a subject, a world you understand. Now make something that helps a 14-year-old understand the single most important thing about it. It can be a drawing, a meme, a short video, a one-page comic, a metaphor — anything except just explaining it in plain language. Make the thing. Show me."*

**Why this challenge:**
- Tests translation without simplification (the hardest creative skill)
- Generates signal on: creative medium selection, understanding of audience, whether they can make something vs. explain something

**Behavioral signals generated:**
- What medium did they choose and why?
- Does the thing work (would a 14-year-old actually get it)?
- Is it creative or derivative?
- Did they iterate or show the first thing that came to mind?

**Evidence of success:**
- The thing itself (image, video, text description)
- A reflection: what was harder than expected, what surprised them

---

**Creative Option B: The Uncomfortable Truth Challenge**

> *"What's something you believe that most people around you probably wouldn't agree with? Now make something — a post, a meme, a short video, a drawing — that expresses that belief in a way that might actually make someone reconsider. Not attack their views. Just plant a seed. Make the thing. Share it somewhere. Report what happened."*

**Why this challenge:**
- Tests intellectual honesty and social courage
- Observes whether they can hold a minority view without aggression or self-censorship
- Generates signal on: risk tolerance, identity coherence, creative courage

**Behavioral signals generated:**
- Did they pick a genuine minority belief or a safe provocation?
- Is the creative output designed to open minds or win arguments?
- Did they actually share it? (Social risk-taking vs. performative risk-taking)
- How did others respond?

**Evidence of success:**
- The belief articulated clearly
- The thing they made
- Whether they shared it and what happened

**Note for the bot:** Only offer this if the user has demonstrated willingness to engage with uncomfortable topics in the conversation (detected through language patterns in Phase 2–3).

---

**Creative Option C: The Remix Challenge**

> *"Find something that exists — a piece of information, a concept, a story, a dataset — and remix it into something new. Give it a new context, a new audience, or a new format. The remixed version has to reveal something the original didn't, or make it matter to someone different. Tell me what you started with, what you made, and why."*

**Why this challenge:**
- Tests synthesis (combining two things that haven't been combined)
- Observes whether they can find the essential thing in something and transform it
- Generates signal on: originality, critical analysis, transformation skill

**Behavioral signals generated:**
- What did they choose to remix and why?
- Is the remix derivative or genuinely new?
- Does the remix reveal something real about the original?
- How much better is the remix than the original for its new purpose?

---

### TRACK 3: BUSINESS CHALLENGES

**Theme:** Solving real commercial problems, understanding value, making things happen in the real world.

**3 Challenge Options:**

---

**Business Option A: The Intelligence Challenge**

> *"Think of a local business you interact with regularly — a shop, a café, a service. Pretend you're advising them for free. What's one thing they're doing really well that they probably don't realize is their competitive advantage? And what's one thing they should change that would make a meaningful difference to their business in the next 3 months? Write a one-page brief. (You're not going to give it to them unless you want to — this is just the exercise.)"*

**Why this challenge:**
- Tests commercial observation without domain expertise
- Observes whether they can identify value and generate actionable insight
- Generates signal on: strategic thinking, business pattern recognition, communication quality

**Behavioral signals generated:**
- What did they choose as the competitive advantage and why?
- Is the recommendation specific and actionable or vague and generic?
- Did they do any additional research or rely on surface observation?
- Is the recommendation connected to the competitive advantage (strategic coherence)?

**Evidence of success:**
- The one-page brief
- Whether the two parts (advantage + recommendation) connect
- What they'd need to verify the recommendation

---

**Business Option B: The Sales Challenge**

> *"Find one person who might be interested in something you could offer — not something you're selling, just something you'd be willing to do. It could be a skill, a help, a favor, a small service. Approach them. Have a real conversation about it. Don't pitch. Listen first. See if there's a fit. Report what happened — including if there wasn't."*

**Why this challenge:**
- Tests real-world value articulation without scripts
- Observes whether they can identify and articulate value for a specific person
- Generates signal on: persuasion without manipulation, listening quality, comfort with rejection

**Behavioral signals generated:**
- Did they approach someone they knew or a stranger? (risk tolerance)
- Did they pitch or listen first?
- How did they handle "no" or hesitation?
- What did they learn about the difference between offering and selling?

**Evidence of success:**
- Who they approached and why
- How the conversation went
- What they learned about themselves in the process

---

**Business Option C: The Problem Decomposition Challenge**

> *"Pick a business problem you've heard about — it could be from a friend who runs a business, something you read about a company, or something you observed. It has to be a problem that involves more than one person or more than one step to solve. Now: break it down. What are the 3 most important causes? What's the one thing that, if fixed, would make everything else easier? And what's the one thing almost everyone gets wrong about this problem? Write it up in a way that would help someone who actually has this problem."*

**Why this challenge:**
- Tests strategic decomposition — the core skill of strategic thinking
- Observes whether they can distinguish symptoms from causes
- Generates signal on: analytical hierarchy, cause-effect mapping, practical judgment

**Behavioral signals generated:**
- Did they identify root causes or list symptoms?
- Is the "one thing" genuinely pivotal or arbitrary?
- Is the "what people get wrong" actually a misconception, or just a second symptom?
- Is the write-up clear enough that someone with the problem would find it useful?

---

## APPENDIX E: TESTING PROTOCOL FOR ALL THREE COMPONENTS

### Protocol: Nudge Library Testing

**Before launch:**
1. Have 3 people use the bot (can be yourself and 2 others)
2. Intentionally get stuck at defined points (say "I don't know what to do")
3. Note which nudge moves you forward and which feels hollow
4. Flag any nudge that feels manipulative or condescending

**Success criteria:** ≥80% of nudges feel genuinely helpful and not scripted.

### Protocol: Challenge Options Testing

**Before finalizing:**
1. Run each of the 9 challenge options with 1 person each (can be you)
2. Actually do the challenge — don't just describe what you'd do
3. Report: was the challenge energizing, boring, or anxiety-producing?
4. After 7 days: do you remember what you made/did? Do you want to continue?

**Success criteria:** ≥7/9 challenges produce real outputs (not "I meant to do it"). ≥6/9 leave the person wanting to tell someone about it.

### Protocol: Behavioral Test Selection

**Before launch:**
1. Run all 4 behavioral tests (primary + 3 alternatives) with 5 participants
2. Measure: completion rate (did they finish the test?), signal quality (could you score it?), user experience (did they enjoy it or find it stressful?)
3. A/B test the primary opener (the voluntary action question) vs. alternatives

**Success criteria:** Primary opener: ≥80% completion rate. At least 1 behavioral test alternative produces higher signal quality than the primary.

---

## APPENDIX F: SESSION ARC — FULL MULTI-SESSION MAP

### Session 1 (Onboarding — described in main DISCOVERY-FLOW.md)
- Full conversation through all 5 phases
- Map generated and shared
- First challenge accepted

### Session 2 (Challenge Check-in)
**Entry question:** "So — what happened? I want to know what you noticed, not just what you did."

| If challenge completed | If challenge incomplete | If they want a new challenge |
|---|---|---|
| Mirror what they learned from doing it | "What stopped you — outside circumstance or inside?" | "Before we pick another one — what did you learn about yourself from not finishing?" |
| Propose challenge of next type | Offer the same challenge with lower scope | Match to type they haven't tried |

**New challenge type introduced:** whichever track they haven't explored yet.

### Session 3 (Deep Exploration)
**Entry:** "Last time we talked about [pattern from their map]. I still have a question about that. Can we go a little deeper?"

Explore the open questions from the map — specifically:
- The contradiction or tension (they said X but also did Y)
- The thing they mentioned but didn't lead with
- The area where their self-image might be ahead of their behavior

### Session 4+ (Pattern Confirmation)
**Entry:** "Your map has [X, Y] confirmed now. But there's still this question about [Z]. We've got a challenge that might answer it. Interested?"

By session 4, the comparative vector should be stable enough to introduce the matching mechanic: "Users who show your pattern tend to do particularly well in [type] challenges. Want to see if that's true for you?"

---

*Discovery Flow Appendix: 2026-03-26 | Aton ☀️🦞*
