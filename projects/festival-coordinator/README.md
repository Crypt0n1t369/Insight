# Festival Coordinator — Phase 1 Complete ✅

## What Is This?

Telegram bot module that extends JCI Org Manager for **festival volunteer coordination**. Volunteers claim tasks → complete them → earn points → redeem rewards. Built on top of the existing JCI Org Manager Telegram infrastructure.

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Phase 1: Database Models | ✅ COMPLETE | 7 models, 49 tests passing |
| Phase 2: Bot Commands | ⏳ NOT STARTED | Telegram bot handlers |
| Phase 3: Reputation/Gamification | ⏳ NOT STARTED | Trust tiers, leaderboard |
| Phase 4: Polish | ⏳ NOT STARTED | Edge cases, analytics |

## Architecture

Extends JCI Org Manager — reuses the existing bot infrastructure, member DB, and Telegram token config.

```
projects/jci-org-manager/
├── src/org_manager/          # Existing bot + DB
└── src/festival/             # NEW — Festival-specific
    ├── models.py             # Festival, TaskCategory, FestivalTask, TaskClaim, Reward
    ├── handlers.py           # /festival, /tasks, /claim, /complete, /verify, /points, /rewards
    ├── tasks.py              # Task lifecycle logic
    ├── points.py             # Points + trust tier logic
    └── rewards.py            # Rewards catalog + redemption

# Shared models (reuse from JCI Org Manager):
# Member, Project, Task, Meeting, Opportunity — already in org_manager/db_service.py
```

## Database Models (Phase 1 — Complete)

| Model | Purpose |
|-------|---------|
| `Festival` | Festival instance (name, dates, status) |
| `TaskCategory` | Categories: technical, marketing, operations, creative, logistics |
| `FestivalTask` | Task (title, points, slots, deadline, proof_photo_url) |
| `TaskClaim` | Volunteer claims (pending → completed → verified) |
| `Reward` | Rewards catalog (title, points_cost, quantity_remaining) |
| `PointRedemption` | Redemption ledger (pending → fulfilled) |

## Phase 2: Bot Commands (Next Step)

Requires TELEGRAM_BOT_TOKEN configured in JCI Org Manager `.env`.

| Command | Handler | Priority |
|---------|---------|----------|
| `/festival` | Festival info + active tasks | P0 |
| `/tasks` | Browse available tasks | P0 |
| `/claim <id>` | Claim a task | P0 |
| `/my_tasks` | User's claimed tasks | P0 |
| `/complete <id>` | Mark complete + upload proof | P0 |
| `/verify <id>` | Verify someone's completion | P1 |
| `/points` | Point balance | P0 |
| `/leaderboard` | Top volunteers | P1 |
| `/rewards` | Available rewards | P0 |
| `/redeem <id>` | Redeem points | P1 |

## Trust Tiers

| Tier | Min Points | Permissions |
|------|------------|-------------|
| Newcomer | 0 | 1 task at a time |
| Contributor | 50 | 2 tasks at a time |
| Trusted | 200 | 3 tasks + verify others |
| Elder | 500 | Create tasks + moderate |

## Point System

| Action | Points |
|--------|--------|
| Small task complete (<2hrs) | 10 |
| Medium task (2–4hrs) | 25 |
| Large task (4hrs+) | 50 |
| Peer verification given | 5 |
| Your work verified by peer | 15 |

## Tests

```bash
cd projects/jci-org-manager
python -m pytest tests/ -v
# 49/49 tests passing (includes festival models)
```

## Next Steps (Blocked on Telegram Token)

1. Add `TELEGRAM_BOT_TOKEN` to `projects/jci-org-manager/.env`
2. Implement Phase 2 bot handlers (`src/festival/handlers.py`)
3. Wire festival models into existing bot (`src/bot.py`)
4. Test with JCI team internally → pilot event → iterate

## Reference

- Full spec: `IMPLEMENTATION_PLAN.md`
- Extends: JCI Org Manager (`projects/jci-org-manager/`)
- Built by: Aton ☀️🦞 for Kristaps

*Aton ☀️🦞 | Created: 2026-03-31*
