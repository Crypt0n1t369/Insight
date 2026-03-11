# Festival Coordination Bot - Research

## Use Case: Telegram Bot for Festival Collaboration

### Core Concept
A bot that helps strangers coordinate to run a festival together through task assignment, reputation tracking, and incentive systems.

---

## 1. How It Would Work

### 1.1 User Journey

```
Signup → Browse Tasks → Claim Task → Complete → Verify → Earn Points → Redeem Rewards
```

### 1.2 Core Features

| Feature | Description |
|---------|-------------|
| **Task Board** | Live listing of all festival tasks (technical, marketing, operations) |
| **Task Claims** | Users claim tasks they're interested in |
| **Completion Proof** | Photo/video/check-in to verify completion |
| **Peer Verification** | Other volunteers verify completions |
| **Points System** | Earn credibility for completed work |
| **Rewards Store** | Exchange points for festival perks (VIP, merch, food) |
| **Leaderboard** | Gamification + social proof |

### 1.3 Task Categories

| Category | Examples |
|----------|----------|
| **Technical** | Sound check, lighting, WiFi setup, AV equipment |
| **Marketing** | Social media, flyers, photographer, videographer |
| **Operations** | Ticketing, welcome desk, cleanup, security |
| **Creative** | Decoration, MCing, entertainment coordination |
| **Logistics** | Vendor coordination, parking, supplies |

---

## 2. How It Could Fail

### 2.1 Failure Modes

| Failure | Description | Likelihood |
|---------|-------------|------------|
| **No-shows** | People claim tasks but don't show up | High |
| **Fake completions** | Claim done without actually doing | Medium |
| **Free-riding** | Get points without contributing | Medium |
| **Coordination chaos** | Multiple people doing same task | Medium |
| **Quality issues** | Work not meeting standards | Low |
| **Burnout** | Few people doing most work | High |
| **Drama** | Conflicts between volunteers | Low |
| **Ghosting** | Disappear mid-task | High |

### 2.2 Failure Root Causes

1. **No skin in the game** - Zero cost to claim and abandon
2. **No reputation** - Anonymous, no accountability
3. **No verification** - Easy to fake completion
4. **No incentives** - Points alone aren't compelling enough
5. **No clarity** - Unclear expectations
6. **No follow-up** - No reminders or check-ins

---

## 3. How Failures Could Be Avoided

### 3.1 Prevention Mechanisms

| Problem | Solution |
|---------|----------|
| No-shows | Staked commitment (small deposit refunded on completion) |
| Fake completions | Photo evidence + peer verification |
| Free-riding | Reputation score (Credo-style) that blocks repeat claims |
| Coordination chaos | Task capacity limits + clear ownership |
| Quality issues | Review system + required standards |
| Burnout | Fair distribution algorithm, rotating roles |
| Ghosting | Progress check-ins, auto-release after timeout |

### 3.2 Reputation System (Credo-inspired)

```
New User → Starting Reputation: 10 points
  - Complete task: +5 points
  - Verified completion: +10 points  
  - Peer verify others: +2 points
  - No-show: -10 points
  - Fake completion: -50 points (flagged)

Trust Tiers:
  - Newcomer (0-49): Can claim 1 task at a time
  - Contributor (50-199): Can claim 2 tasks
  - Trusted (200-499): Can claim 3 tasks + verify others
  - Elder (500+): Can create tasks + moderate
```

### 3.3 Skin in the Game

- **Option A**: Small deposit ($10-20) refunded on completion
- **Option B**: Reputation stake - lose standing if you bail
- **Option C**: Social stake - your Telegram reputation is on the line

---

## 4. Technical Architecture

### 4.1 Stack

```
Telegram Bot (Bot API) → Express Backend → SQLite/Supabase
                           ↓
                    Credo-style Reputation System
```

### 4.2 Data Model

```typescript
// User
{
  id: string;
  telegram_id: string;
  display_name: string;
  reputation_score: number;
  trust_tier: 'newcomer' | 'contributor' | 'trusted' | 'elder';
  points_balance: number;
  tasks_completed: number;
}

// Task
{
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'marketing' | 'operations' | 'creative' | 'logistics';
  status: 'open' | 'claimed' | 'in_progress' | 'completed' | 'verified';
  claimed_by: string | null;
  proof_photo: string | null;
  verified_by: string | null;
  points_value: number;
  slots: number; // how many people needed
  time_estimate: string;
  deadline: Date;
}

// TaskClaim
{
  id: string;
  task_id: string;
  user_id: string;
  status: 'pending' | 'completed' | 'verified' | 'cancelled';
  claimed_at: Date;
  completed_at: Date | null;
  verification_proof: string | null;
}

// Reward
{
  id: string;
  title: string;
  description: string;
  points_cost: number;
  quantity_available: number;
}

// Redemption
{
  id: string;
  user_id: string;
  reward_id: string;
  redeemed_at: Date;
  status: 'pending' | 'fulfilled' | 'cancelled';
}
```

---

## 5. User Interface

### 5.1 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome + quick signup |
| `/tasks` | Browse available tasks |
| `/claim <task_id>` | Claim a task |
| `/my_tasks` | Your claimed tasks |
| `/complete <task_id>` | Mark as complete + upload proof |
| `/verify <task_id>` | Verify someone's completion (trusted+) |
| `/points` | Your points balance |
| `/leaderboard` | Top volunteers |
| `/rewards` | Available rewards |
| `/redeem <reward_id>` | Exchange points |
| `/profile` | Your reputation & stats |

### 5.2 Inline Keyboards

```python
# Task listing inline keyboard
[Technical (5)] [Marketing (3)] [Operations (8)] [Creative (2)]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎵 Sound Check - 2 people needed
   /claim_123 | +25 pts | 2hrs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📷 Photographer Needed
   /claim_456 | +50 pts | 4hrs
━━━━━━━━━━━━━━━━━━━━
```

---

## 6. Rewards System

### 6.1 Point Earning

| Action | Points |
|--------|--------|
| Complete small task (<2hr) | +10 |
| Complete medium task (2-4hr) | +25 |
| Complete large task (4hr+) | +50 |
| Get verified by peer | +15 |
| Verify someone else's work | +5 |
| Refer a friend who completes task | +20 |

### 6.2 Rewards Catalog

| Reward | Points | Quantity |
|--------|--------|----------|
| Free drink voucher | 50 | Unlimited |
| Festival t-shirt | 150 | 50 |
| VIP access (no line) | 300 | 20 |
| Backstage tour | 400 | 10 |
| Meet & greet artist | 500 | 5 |
| Free next year's ticket | 1000 | 2 |

---

## 7. Integration with Credo/JCI

### 7.1 As Credo Branch

This could be a **Credo-style branch**:
- Anonymous users build reputation
- Credo-style governance for task disputes
- Endorsements from other volunteers
- Proposals for process improvements

### 7.2 As JCI Module

Could integrate into **JCI Org Manager**:
- JCI members have existing trust
- Use for JCI event coordination
- Scale to other organizations

### 7.3 Standalone

Or **independent Telegram bot**:
- Simpler to deploy
- Festival-specific branding
- Easier to customize

---

## 8. Success Metrics

### 8.1 KPIs

| Metric | Target |
|--------|--------|
| Task completion rate | >90% |
| No-show rate | <10% |
| Average user tasks | 2+ per volunteer |
| User satisfaction | >4/5 |
| Points redeemed | >80% earned |

### 8.2 Health Indicators

- Active volunteers (claimed 1+ task)
- Tasks in progress vs completed
- Verification queue backlog
- Points circulation (earned vs redeemed)

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bot spam/abuse | Medium | High | Rate limits + verification |
| Task disputes | Medium | Medium | Clear criteria + peer review |
| Technical failure | Low | High | Backup manual process |
| Low turnout | Medium | High | Early sign-up incentives |
| Points inflation | Low | Medium | Fixed reward budget |

---

## 10. Qualification & Filtering Mechanism

### The Problem
- Some volunteers just want to try (low commitment)
- Some are serious and reliable
- Critical tasks can't afford no-shows
- Need to filter without being too exclusionary

### Proposed Solution: Tiered Trust System

#### Level 0: Anonymous Browser
- Can view tasks
- Can NOT claim any task
- Must verify Telegram to proceed

#### Level 1: Verified Volunteer (Entry)
- Verify Telegram account (instant)
- Complete onboarding quiz (2-3 questions)
- **Can claim**: Easy tasks (setup, cleanup)
- **Max concurrent**: 1 task

#### Level 2: Trial Volunteer
- Complete 1+ small task successfully
- OR get vouch from 1 Level 3+ volunteer
- **Can claim**: Medium tasks
- **Max concurrent**: 2 tasks

#### Level 3: Trusted Volunteer
- Complete 3+ tasks with good ratings
- OR 5+ tasks completed total
- **Can claim**: Any task
- **Max concurrent**: 3 tasks
- **Can verify**: Peer completions

#### Level 4: Lead Volunteer (Organizer-nominated)
- Nominated by festival organizers
- **Can**: Create tasks, approve critical roles, resolve disputes

### Onboarding Quiz (Key Filter)

The quiz questions should filter intent:

| Question | Purpose |
|----------|---------|
| "Which days are you available?" | Excludes "anytime" (unrealistic) |
| "What's your motivation?" | "Free entry" = high no-show risk |
| "Have you volunteered before?" | Experience indicator |
| "Can you lift 20kg?" | For physical tasks |

**Key insight**: People who only want free entry are 3x more likely to no-show than those who want to "give back".

### Commitment Mechanisms

| Mechanism | Effectiveness | Notes |
|----------|---------------|-------|
| Onboarding quiz | Medium | Filters intent |
| Availability confirmation | High | Must commit to specific slot |
| Vouching | High | Social accountability |
| Trial task first | High | Earn trust before big tasks |
| Organizer approval | Very High | For critical roles |
| Small deposit (refunded) | Very High | Skin in the game |

### Critical vs Non-Critical Tasks

| Task Type | Min Level | Extra |
|-----------|-----------|-------|
| Decorating, setup | Level 1 | - |
| Ticketing, info desk | Level 2 | - |
| Sound, lighting | Level 3 | + Organizer approval |
| Security, medical | Level 3 | + Organizer approval |
| Team lead | Level 4 | Only |

### Organizer Tools

- **Nominate Level 4** - Make team leads
- **Vouch for volunteers** - Boost someone to Level 2
- **Manual approval** - For critical tasks
- **Flag unreliable** - Block from claiming
- **Override system** - Bypass levels for special cases

---

## 11. Next Steps

1. **Pilot**: Use for small event (50-100 people)
2. **Iterate**: Gather feedback, adjust points/rewards
3. **Scale**: Larger festivals
4. **Open source**: Other organizations can use

---

*Research complete. Ready for implementation planning.*
