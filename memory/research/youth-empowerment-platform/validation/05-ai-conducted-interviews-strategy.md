# Strategy: AI-Conducted Validation Interviews

## The Concept

I run conversational interviews on your behalf. You set up the channel, I do the talking.

---

## Infrastructure Needed

### Option A: Telegram Bot (Recommended)

```
Kristaps sets up:
1. Telegram bot (via @BotFather)
2. Share bot username with candidates
3. Candidates message the bot
4. I run the conversation via bot API

Pros: 
- Easy to set up
- Candidates already on Telegram
- Natural conversation flow
- Can handle multiple candidates

Cons:
- Need to configure bot token
```

### Option B: Simple Web Form + I Follow Up

```
Kristaps sets up:
1. Typeform or Google Form with screening questions
2. Form collects: name, Telegram username, brief answer to Q1
3. I get list of interested people
4. I message each one directly on Telegram

Pros: 
- Easier to collect initial data
- Filters un interested

Cons: 
- More steps
- Less conversational
```

### Option C: Email + Telegram Bridge

```
Kristaps:
1. Sends initial email to list
2. People reply with interest + Telegram handle
3. I reach out on Telegram
```

---

## My Conversation Strategy

### Phase 1: Warm Outreach

**If candidates come via form/email:**

```
Me: "Hey! Thanks for responding. I'm running some research and 
     would love 5-10 min of your time. No pitch, just questions. 
     Want to chat?"
     
[Wait for yes]
```

### Phase 2: The Adaptive Interview Flow

Here's my core strategy - I adapt based on answers:

```
START → Ask Q1 (pain point)

IF they mention a clear goal:
  → "Tell me more about that"
  → "What stopped you so far?"
  → Go to CONCEPT TEST

IF they say "nothing" or "idk":
  → "Fair enough. What DO you spend time on?"
  → "What apps do you open most?"
  → Try to find hidden interests
  → Go to CONCEPT TEST

CONCEPT TEST → Present idea (vary based on their pain point)

IF they engage:
  → Probe deeper: "Why would that be useful?"
  → Ask about specific features they liked
  → Go to DEEP DIVE

IF they disengage:
  → "That's fair. What would make it better?"
  → Ask what existing solutions they use
  → Don't push

DEEP DIVE → Based on what they engaged with:

  - Mentioned privacy:
    → "You mentioned privacy. What would you NOT put in an app?"
    
  - Mentioned AI:
    → "What's your experience with AI chatbots?"
    → "Would you trust an AI with this?"
    
  - Mentioned growth/tracking:
    → "Do you track progress in anything now?"
    → "What works/doesn't about that?"
    
  - Mentioned opportunities:
    → "Where do you find opportunities now?"
    → "What's wrong with those?"

CLOSING:
  → "One more — if this existed, what's the one thing 
     that would make you delete it?"
  → "Who else should I talk to?"
  → Thank them
```

### Phase 3: Data Capture

After each conversation, I immediately log:

```
Candidate: [Name/Telegram]
Date: [Date]
Age: [If shared]

Pain Point(s): [What they want]
Concept Reaction: [Useful / Not useful / Mixed]
Engaged Features: [What they liked]
Objections: [What they didn't like]
AI Comfort: [High / Medium / Low / Rejected]
Privacy Score: [1-10 from conversation]
Try It Score: [1-10]

Key Quote: "[Direct quote]"
Follow-up With: [Who they mentioned]

Next Step: [N/A / Schedule follow-up / etc]
```

---

## Question Adaptation Examples

### Example 1: The Unmotivated Response

```
Them: "I don't have anything I want to do"

My Adaptation:
- "That's totally fair. What do you spend your time on then?"
- "If you could wave a magic wand and have anything — 
   what would your life look like in 1 year?"
- "What do your friends say you should do?"
- Don't push the product — find the real pain
```

### Example 2: The Overly Positive Response

```
Them: "This sounds amazing! I'd totally use it!"

My Adaptation:
- "That's great! But what would make you NOT use it?"
- "What's the worst thing about it?"
- "Have you tried similar apps before? What happened?"
- Probe for honesty — too positive = suspicious
```

### Example 3: The Skeptic

```
Them: "Another app? No thanks."

My Adaptation:
- "I hear you. What would actually be useful?"
- "What have you tried that didn't work?"
- "What would make you change your mind?"
- Find the real objection
```

### Example 4: The Privacy Concern

```
Them: "I don't want companies knowing my stuff"

My Adaptation:
- "That's interesting. What specifically concerns you?"
- "What would make you trust an app with your goals?"
- "Have you used encryption before?"
- Don't pitch — understand the barrier
```

---

## Outreach Templates

### Initial Message (Telegram)

**Option A: Casual**
```
Hey! I'm doing some research on apps that help people figure out 
what they want to do with their time. No pitch, just questions.

Got 5 min to chat? It'll be quick 🙏
```

**Option B: Direct**
```
Hey! You're one of X people I'm talking to for research. 

Quick Q: What's something you want to do but haven't figured 
out how yet?

[Wait for response, then continue based on answer]
```

### Follow-Up If No Response

```
Hey, just checking if you saw my last message. No worries if not!
Just looking for a few more voices.
```

---

## What I Need From You

### To Start, You Need To:

1. **Create a Telegram bot** (takes 2 min)
   - Message @BotFather on Telegram
   - /newbot
   - Name it "Research Bot" or similar
   - Get the API token

2. **Give me the bot token**
   - I'll use it to message people

3. **Give me candidate list** (any of these):
   - Telegram usernames to reach out to
   - Link to a form where people signed up
   - A group where I can post

4. **Set expectations** (optional):
   - Target demographics
   - How many conversations you want
   - Timeline

### If Telegram Doesn't Work:

Tell me what channel you CAN set up and I'll adapt:
- Email?
- Discord server?
- Something else?

---

## Summary: What's Ready

| Component | Status |
|-----------|--------|
| Conversation strategy | ✅ Ready |
| Adaptive question flow | ✅ Ready |
| Data capture format | ✅ Ready |
| Outreach templates | ✅ Ready |
| Infrastructure needed | ❌ **Need from you** |

---

## Next Step

1. Can you set up a Telegram bot?
2. What's your preferred outreach method?
3. Do you have candidates ready, or should we find them?

