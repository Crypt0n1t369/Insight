# Festival Coordinator - Implementation Plan

## Project Overview

**Name:** Festival Coordinator  
**Type:** Telegram Bot Module (extends JCI Org Manager)  
**Purpose:** Help volunteers coordinate festival operations through task assignment, reputation tracking, and rewards  
**Target Users:** Festival volunteers, event organizers

---

## Architecture Decision

### Option A: Extend JCI Org Manager ✅ RECOMMENDED
- Leverage existing Telegram bot infrastructure
- Reuse member database
- Integrate with JCI events system
- Faster to ship

### Option B: New Standalone Bot
- Complete control
- Festival-specific branding
- More complex initial setup

### Option C: Credo Branch
- Anonymous reputation system
- Democratic task governance
- More experimental

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

#### Database Models
```python
# New tables for festival_coordinator/

class Festival(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    organization_id = db.Column(db.ForeignKey('organizations.id'))
    status = db.Column(db.String(50))  # planning, active, completed
    
class TaskCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))  # technical, marketing, operations, creative
    emoji = db.Column(db.String(10))
    festival_id = db.Column(db.ForeignKey('festivals.id'))

class FestivalTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    category_id = db.Column(db.ForeignKey('task_categories.id'))
    points_value = db.Column(db.Integer, default=10)
    slots = db.Column(db.Integer, default=1)
    time_estimate = db.Column(db.String(50))  # "2hrs", "4hrs"
    deadline = db.Column(db.DateTime)
    status = db.Column(db.String(50))  # open, claimed, in_progress, completed, verified
    proof_photo_url = db.Column(db.String(500))
    festival_id = db.Column(db.ForeignKey('festivals.id'))
    created_by = db.Column(db.ForeignKey('members.id'))

class TaskClaim(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.ForeignKey('festival_tasks.id'))
    member_id = db.Column(db.ForeignKey('members.id'))
    status = db.Column(db.String(50))  # pending, completed, verified, cancelled
    claimed_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    verification_proof = db.Column(db.Text)

class Reward(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    points_cost = db.Column(db.Integer)
    quantity_total = db.Column(db.Integer)
    quantity_remaining = db.Column(db.Integer)
    festival_id = db.Column(db.ForeignKey('festivals.id'))

class PointRedemption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.ForeignKey('members.id'))
    reward_id = db.Column(db.ForeignKey('rewards.id'))
    redeemed_at = db.Column(db.DateTime)
    status = db.Column(db.String(50))  # pending, fulfilled, cancelled
```

#### Bot Commands (New)
| Command | Handler | Priority |
|---------|---------|----------|
| `/festival` | Show festival info + active tasks | P0 |
| `/tasks` | Browse available tasks | P0 |
| `/claim <id>` | Claim a task | P0 |
| `/my_tasks` | User's claimed tasks | P0 |
| `/complete <id>` | Mark complete + upload proof | P0 |
| `/verify <id>` | Verify someone's completion | P1 |
| `/points` | Point balance | P0 |
| `/leaderboard` | Top volunteers | P1 |
| `/rewards` | Available rewards | P0 |
| `/redeem <id>` | Redeem points | P1 |
| `/create_task` | Create new task (admin) | P1 |
| `/add_reward` | Add reward (admin) | P1 |

### Phase 2: Reputation System (Week 2)

#### Point Calculations
```python
POINTS_TASK_COMPLETE = {
    'small': 10,    # <2hrs
    'medium': 25,  # 2-4hrs  
    'large': 50    # 4hrs+
}

POINTS_VERIFICATION = 5      # For verifying others
POINTS_PEER_VERIFIED = 15    # When your work is verified
POINTS_REFERRAL = 20          # Friend completes task
```

#### Trust Tiers
| Tier | Min Points | Permissions |
|------|-------------|-------------|
| Newcomer | 0 | 1 task at a time |
| Contributor | 50 | 2 tasks at a time |
| Trusted | 200 | 3 tasks + verify others |
| Elder | 500 | Create tasks + moderate |

### Phase 3: Rewards & Gamification (Week 2-3)

#### Inline Keyboards
- Category filters
- Task cards with claim buttons
- Verification workflows

#### Leaderboard
- Top 10 volunteers
- Weekly most active
- Category-specific leaders

### Phase 4: Polish & Testing (Week 3)

- Edge case handling
- No-show timeout (auto-release after 24hrs)
- Dispute resolution flow
- Analytics dashboard

---

## File Structure

```
projects/jci-org-manager/
├── src/
│   ├── bot.py                    # Existing
│   ├── db_service.py             # Existing
│   └── festival/                 # NEW
│       ├── __init__.py
│       ├── models.py             # Festival, Task, Reward models
│       ├── handlers.py            # Command handlers
│       ├── tasks.py              # Task management logic
│       ├── points.py              # Points & reputation logic
│       └── rewards.py            # Rewards catalog
├── tests/
│   └── test_festival.py          # NEW
└── docs/
    └── festival_guide.md         # User guide
```

---

## Dependencies

- **New**: None required (reuse existing)
- **Database**: Add columns to existing org.db

---

## Testing Strategy

### Unit Tests
- Point calculations
- Trust tier logic
- Task status transitions
- Reward redemption

### Integration Tests
- Full task claim → complete → verify → points flow
- Points → redemption flow
- Leaderboard calculation

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Task completion rate | >90% |
| No-show rate | <10% |
| Active volunteers | 50+ |
| Points redeemed | >80% |

---

## Rollout

1. **Internal test**: JCI team runs internal event
2. **Pilot**: Small JCI event (50 volunteers)
3. **Feedback**: Gather issues, iterate
4. **Public**: Open to other organizations

---

*Plan complete. Ready for implementation.*
