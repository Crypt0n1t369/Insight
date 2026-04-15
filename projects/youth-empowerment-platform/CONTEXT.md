# Youth Empowerment Platform — CONTEXT

## What Is This?

User-owned AI agents with encrypted vaults, NPC-guided hero's journey, and opportunity matching. Built for youth (16–25) in transitional moments — finding direction, building identity, connecting to opportunities.

**Core bet:** Youth need personalized guidance through a structured "hero's journey" with an AI companion that respects their agency and privacy.

## Current Status (2026-03-31)

| Component | Status | Notes |
|-----------|--------|-------|
| API Server | ✅ RUNNING | Port 3003 |
| Vault System | ✅ WORKING | Encrypted storage, create/login/logout |
| Character/NPC System | ✅ WORKING | Personality profiles |
| Journey Engine | ✅ WORKING | Progression tracking |
| Opportunity Matching | ✅ WORKING | AI-powered matching |
| Telegram Bot | ⏳ BLOCKED | `TELEGRAM_BOT_TOKEN` not configured |
| Tests | ✅ 24/24 passing | Verified 2026-03-26 |
| Health Check | ✅ Enhanced | `/health` returns detailed status |

## Architecture

```
Telegram Bot ←→ FastAPI (port 3003) ←→ SQLite (vault.db)
                    ↓
              VaultManager
              (Fernet encryption)
                    ↓
              Character/NPC System
              Journey Engine
              Opportunity Matcher
```

## API Endpoints (Port 3003)

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /health` | No | Detailed health + status |
| `POST /vault/create` | No | Create new vault |
| `POST /vault/login` | No | Login to vault |
| `POST /vault/logout` | Yes | Logout |
| `GET /vault/status` | Yes | Get vault status |
| `GET /journey` | Yes | Get journey progress |
| `POST /journey/advance` | Yes | Advance journey step |

## Vault System

- **Encryption:** Fernet (symmetric) — client-side key derivation from passphrase
- **Data stored:** Character profile, journey state, opportunity matches
- **Session:** Token-based (`/vault/login` → token in response body)
- **Privacy:** Platform never stores the encryption key

## Character/NPC System

AI-guided characters that accompany users on their hero's journey:
- Personality-driven engagement
- Adaptive dialogue based on user state
- Goal: companionship without dependency

## Journey Engine

Progression system tracking:
- Current quest/chapter
- Skills developed
- Challenges overcome
- Milestones reached

## Opportunity Matching

AI-powered matching of users to:
- Educational opportunities
- Jobs/internships
- Mentorship programs
- Community events

## Telegram Integration

To activate the Telegram bot:

```bash
# 1. Create bot via @BotFather in Telegram
# 2. Add token:
echo "TELEGRAM_BOT_TOKEN=your_token_here" >> projects/youth-empowerment-platform/src/.env

# 3. Run the bot:
cd projects/youth-empowerment-platform
source venv/bin/activate
python -m uvicorn api.main:app --host 0.0.0.0 --port 3003
```

## Tests

```bash
cd projects/youth-empowerment-platform
source venv/bin/activate
python -m pytest tests/ -v
# 24/24 passing ✅
```

**Last verified:** 2026-03-26

## Next Actions

| Priority | Action | Owner |
|----------|--------|-------|
| 🔴 P0 | Add TELEGRAM_BOT_TOKEN | Kristaps |
| 🟡 P1 | Test Telegram bot with real users | Kristaps |
| 🟡 P2 | Expand character/NPC dialogue trees | Future |
| 🟢 P3 | Add Supabase persistence | Future |

## Relationship to Other Projects

- **JCI Org Manager:** Similar architecture (Telegram + FastAPI); could share patterns
- **Festival Coordinator:** Could integrate as opportunity type in journey engine
- **Contribution Graph:** Opportunity matching could pull from CG's behavioral profiles

*Aton ☀️🦞 | Created: 2026-03-31*
