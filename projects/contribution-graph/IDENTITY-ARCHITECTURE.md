# IDENTITY & ACCESS ARCHITECTURE
## Contribution Graph | Kristaps | Aton | 2026-03-26

---

## THE FOUR QUESTIONS

1. **Session continuity** — How does the system remember who you are across conversations?
2. **Unique secure identifier** — How do you identify yourself when you return, without friction?
3. **Map delivery** — How do you receive your map/output after the conversation?
4. **Ongoing engagement** — How are you re-engaged? What's the re-entry point?

These are one system. The answer to all four is the same architecture.

---

## THE CORE ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                      USER (any channel)                     │
│         Telegram / WhatsApp / Instagram / future            │
└─────────────────────┬───────────────────────────────────────┘
                      │ starts conversation
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    IDENTITY LAYER                           │
│  Telegram user_id (auto) OR claimed short_code              │
│  Persistent across channels and sessions                    │
└─────────────────────┬───────────────────────────────────────┘
                      │ links to
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    USER PROFILE DB                         │
│  - Signals accumulated across ALL sessions                  │
│  - Comparative vector (evolves over time)                   │
│  - Challenge history + evidence                             │
│  - Map state (current version)                              │
│  - Conversation phase (where they left off)                 │
│  - Channel preferences + notification permissions           │
└─────────────────────┬───────────────────────────────────────┘
                      │ generates
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      MAP ARTIFACT                          │
│  contributiongraph.ai/map/{short_code}                     │
│  - Personal URL, shareable, updateable                      │
│  - Always current (regenerates from DB)                     │
│  - QR code version for physical delivery                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. SESSION CONTINUITY

### How it works

**Channel-native identity** (Telegram):
When a user messages the bot, Telegram sends the message with their permanent `user_id`. The system checks if that `user_id` exists in the database:
- **New user** → create profile, start session 1, begin onboarding
- **Returning user** → restore profile, restore conversation phase, continue from where they left off

**No login. No password. No friction.**

The system simply knows it's them because Telegram told it who they are.

### What state is preserved

| Data | Purpose | Updated when |
|------|---------|-------------|
| `conversation_phase` | Where in the discovery flow they are | Every message |
| `completed_signals` | Behavioral signals collected | After each relevant answer |
| `comparative_vector` | Computed advantage map | After 3+ sessions or 15+ challenges |
| `challenge_history` | Challenges completed + evidence | After each challenge |
| `current_map_version` | Snapshot of their map at last session | End of each session |
| `last_active` | Timestamp for engagement sequencing | Every interaction |
| `open_questions` | The 2–3 genuine puzzles on their map | Updated in Mirror phase |

### Resuming a conversation

When a returning user starts a new Telegram session:

```
User: [opens bot]
Bot:  "Hey — you're back. I remember where we left off.
       You were working on [challenge type] and you
       had a question about [their specific open question].
       
       Where would you like to pick up?"
       
Options presented as quick-reply buttons:
  [Continue the challenge] [Review my map] [Ask a new question]
```

The system never makes them start over. The map grows. The conversation continues.

---

## 2. UNIQUE SECURE IDENTIFIER

### The Two-Identifier System

**Identifier 1: Telegram `user_id` (Primary, automatic)**
- Assigned by Telegram, permanent, unique per user
- Automatically available on every message
- No friction — Telegram handles it
- Cannot be spoofed (Telegram signs messages cryptographically)
- Used as the primary database key

**Identifier 2: `short_code` (Cross-channel, shareable)**
- 8 characters: `CG-[A-Z0-9]{6}` (e.g., `CG-X7K2M9`)
- Generated server-side using cryptographically secure randomness
- Used for: web map access, cross-platform linking, physical claims, email delivery
- Lookup only — no reverse generation possible
- Rate-limited: max 3 verification attempts per minute per IP

### Why this design

```
If you rely ONLY on Telegram user_id:
  → Users who start on Telegram and later want to access
    via web or a different channel can't
  → No way to share your map as a URL
  → No physical/deliverable artifact

If you rely ONLY on short_code:
  → Requires friction (users must remember/record it)
  → Users lose it
  → No automatic recognition on return

Solution: Telegram user_id as primary key, short_code as
the shareable/cross-channel artifact, linked to the same profile.
```

### Short-code generation (how to make it secure)

```python
import secrets
import hashlib

def generate_short_code(user_id: int) -> str:
    """
    Generate a user-specific short code that's:
    - Unique per user (different codes for different users)
    - Unguessable without knowing user_id
    - Deterministic (same user_id always gets same code — for consistency)
    """
    # Mix user_id with a server secret so even if the code is
    # intercepted, it can't be regenerated without server access
    raw = f"{user_id}:{SERVER_SECRET}"
    token = hashlib.sha256(raw.encode()).hexdigest()[:6].upper()
    return f"CG-{token}"
```

**Key properties:**
- The same user always gets the same short_code (no regeneration problem)
- Without `SERVER_SECRET`, the code cannot be reverse-engineered
- The code itself contains no user information — it's just a lookup key
- 6 hex characters = 2.8 billion possibilities — brute-force impractical with rate limiting

### Low-friction first-time claim flow

The first time a user completes the Discovery Flow, the bot prompts:

```
Bot: "Your map is ready. You can access it anytime at:
     
     contributiongraph.ai/map/CG-X7K2M9
     
     This link is yours — save it. You'll use it to
     access your map from any channel or device.
     
     Want me to also send it to your Telegram saved messages?
     (One tap to save it permanently)"
```

If they say yes → bot sends them the link in a message they can forward/save.
If they don't → the short_code is still stored in their profile, accessible when they return.

---

## 3. MAP DELIVERY

### What the map is

The map is a **web page**, not a PDF or image. It is:
- **Dynamic** — always current, regenerates from database on load
- **Shareable** — public URL that looks impressive and personal
- **Linkable** — any channel can reference it
- **Updatable** — every new session adds to it

### URL structure

```
contributiongraph.ai/map/CG-X7K2M9
```

The page renders their current map:
- Operating wavelength (in their own words)
- 3 confirmed signature moves with evidence
- 2–3 open questions
- Signal strength radar
- Challenge history
- "Last updated" timestamp
- Next recommended challenge (with claim button)

### Map page design principles

The map page must:
- **Look credible** — this is what they show to someone else (a friend, a mentor)
- **Feel personal** — their words, not bot-speak, not generic personality type
- **Show it's alive** — "Updated 2 days ago" or "This map is growing — come back after your challenge"
- **Have a clear next action** — one button: "Continue my journey"

### Delivery moments

| Moment | How delivered |
|--------|--------------|
| End of first conversation | Bot sends link + QR code |
| End of each session | Link available in bot at any time via `/map` |
| Challenge completed | Bot sends updated map snippet + full link |
| Long absence (14+ days) | Bot sends: "Your map is waiting — [link]" |
| Map milestone (major update) | Bot sends: "Your map just updated. See what's new: [link]" |

### Physical delivery (festival/in-person)

At the end of a festival conversation, the bot offers:

```
Bot: "One more thing — here's your map card."
```

The bot generates a **QR code** linking to their map page, rendered in the Telegram chat as an image. They can:
- Scan it with their phone camera
- Screenshot it
- Take a photo of it

The card also shows their short_code in text, as a backup if the QR doesn't scan.

---

## 4. ONGOING ENGAGEMENT

### The engagement architecture

```
RETURN TRIGGER                  RE-ENGAGEMENT CHANNEL
─────────────────────────────────────────────────────
Challenge completed        →   Telegram push: "Your map updated"
Challenge abandoned        →   Telegram push: "What happened?" (day 3)
14 days inactive           →   Telegram push: "Your map is still here"
Map milestone reached      →   Telegram push: "New things on your map"
New challenge unlocked     →   Telegram push: "A new challenge is ready"
Peer comparison available  →   Telegram push: "Users like you tried..."
```

### The re-entry point

**The Telegram bot is always the hub.**

```
contributiongraph.ai/bot  ←  always resolves to the Telegram bot
```

This URL can be:
- Embedded in a QR code (physical)
- Linked in a bio (Instagram, other platforms)
- Sent via email (for cross-channel users)
- Shared by a friend (referral mechanic)

When they click it on mobile → opens Telegram with the bot
When they click it on desktop → shows a page with a QR code to scan

### Cross-channel identity

For users who discover the platform on Instagram or WhatsApp first:

```
Instagram DM → bot asks for their phone number or email
              → sends them their short_code + map link
              → all future Telegram interactions are linked
              to the same profile via short_code

WhatsApp → same flow
Email → sends map link, user claims it, same profile
```

**Critical principle:** The `short_code` is the cross-channel key. Once a user claims their short_code on any channel, all channels are linked to the same profile.

### Notification preferences

The bot respects user preferences:

```
/notifications on   → all re-engagement triggers active
/notifications focus → only: challenge completed, map milestone
/notifications off  → user must initiate all return visits
```

Default for new users: `focus` (2–3 notifications per week max).

---

## 5. DATA MODEL

### Database schema (core tables)

```sql
-- Core user profile (linked to Telegram user_id)
CREATE TABLE users (
    telegram_user_id  BIGINT PRIMARY KEY,  -- From Telegram message
    short_code       VARCHAR(12) UNIQUE NOT NULL,  -- e.g. CG-X7K2M9
    created_at       TIMESTAMP DEFAULT NOW(),
    last_active      TIMESTAMP DEFAULT NOW(),
    notification_mode VARCHAR(20) DEFAULT 'focus',  -- full/focus/off
    current_phase    VARCHAR(30),  -- e.g. 'mirror', 'first_stretch'
    current_session_id UUID
);

-- Behavioral signals accumulated per user
CREATE TABLE signals (
    id           UUID PRIMARY KEY,
    user_id      BIGINT REFERENCES users(telegram_user_id),
    signal_type  VARCHAR(30),  -- e.g. 'intrinsic_motivation', 'synthesis_quality'
    value        JSONB,       -- Raw signal data
    confidence   FLOAT,       -- 0-1, how certain the system is
    source_session UUID,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- The comparative vector (computed from signals)
CREATE TABLE comparative_vector (
    user_id      BIGINT PRIMARY KEY REFERENCES users(telegram_user_id),
    vector       JSONB,  -- {pattern_recognition: 0.82, synthesis: 0.65, ...}
    confidence   JSONB,  -- Confidence per dimension
    updated_at   TIMESTAMP DEFAULT NOW(),
    version      INT DEFAULT 1
);

-- Challenge history
CREATE TABLE challenge_history (
    id              UUID PRIMARY KEY,
    user_id         BIGINT REFERENCES users(telegram_user_id),
    challenge_type  VARCHAR(30),  -- impact/creative/business + sub-type
    challenge_id    VARCHAR(30),
    status          VARCHAR(20),  -- in_progress/completed/abandoned
    evidence        JSONB,        -- What the user produced
    peer_attestation JSONB,
    completed_at    TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Map version history (for "your map just updated" feature)
CREATE TABLE map_versions (
    id           UUID PRIMARY KEY,
    user_id      BIGINT REFERENCES users(telegram_user_id),
    version      INT,
    snapshot     JSONB,  -- Full map snapshot at this version
    change_note  VARCHAR(100),  -- "Completed first challenge" / "New pattern detected"
    created_at   TIMESTAMP DEFAULT NOW()
);

-- Conversation sessions (for resuming)
CREATE TABLE conversation_sessions (
    id           UUID PRIMARY KEY,
    user_id      BIGINT REFERENCES users(telegram_user_id),
    phase        VARCHAR(30),
    messages     JSONB,   -- Full conversation history for this session
    ended_at     TIMESTAMP,
    created_at   TIMESTAMP DEFAULT NOW()
);
```

---

## 6. SECURITY CONSIDERATIONS

### Threat model

| Threat | Mitigation |
|--------|-----------|
| Someone guesses a short_code | 6-char entropy + rate limiting (3 attempts/min) + server secret |
| Telegram ID spoofed | Telegram signs messages — verify `user_id` from `message.from.id` only |
| User claims someone else's code | Codes are only shown to the legitimate user via DM |
| Profile data accessed | All data is per-user, no aggregate queries without aggregation layer |
| Bot scraped by bots | Telegram has its own anti-abuse; add bot detection on rapid message patterns |

### Key security decisions

1. **Short_code is a lookup key, not a bearer token** — the server knows which `telegram_user_id` owns which `short_code`. The code alone cannot access anything without a successful lookup, which is rate-limited.

2. **Telegram `user_id` cannot be set by the user** — it's set by Telegram's infrastructure, not the message payload. This prevents ID spoofing.

3. **The map page requires no authentication** — it's designed to be shareable. The user controls what goes on it. If they share their map URL, the recipient sees their map. This is intentional (it IS a portfolio artifact).

4. **For sensitive profiles** — the user can set a map to private, which requires re-authentication (via Telegram link) to view.

---

## 7. SIMPLIFIED USER FLOWS

### Flow A: Festival first contact (Telegram)

```
1. User scans QR code at festival booth
   → Opens Telegram bot (no app install needed)
   
2. Discovery Flow conversation (20–40 min)
   → Bot builds profile session by session
   
3. End of conversation:
   Bot sends:
   "Your map is ready: contributiongraph.ai/map/CG-X7K2M9
   [QR code image]
   Save this link — it's yours forever.
   See you in the bot when you complete your challenge."
   
4. User receives QR card on phone
   → Scans or screenshots
   
5. Day 3 reminder:
   Bot: "How did the [challenge] go?"
```

### Flow B: Return user (Telegram)

```
1. User opens Telegram bot (anytime)
2. Bot recognizes telegram_user_id
3. Bot: "Welcome back. Your map has [X] new signals since last time.
   You're in the middle of [current phase].
   Ready to continue?"
4. Conversation picks up exactly where it left off
```

### Flow C: Cross-channel access (started Telegram, continue on web)

```
1. User completes Discovery Flow on Telegram
2. Bot sends: "Your map: contributiongraph.ai/map/CG-X7K2M9"
3. User opens link on desktop
4. Page shows full map with "Continue on Telegram" button
5. User clicks → opens Telegram bot to their session
6. Same profile, same map, different channel
```

### Flow D: Web-first (someone shares their map link)

```
1. Friend sends user: "Check out this map I made: .../CG-X7K2M9"
2. User visits link → sees map page
3. Page shows: "Make your own map → [Start here] → Opens Telegram bot
4. User clicks → starts their own Discovery Flow
5. Their map is independent (not linked to the sharer's code)
```

---

*Identity & Access Architecture: 2026-03-26 | Aton ☀️🦞*
