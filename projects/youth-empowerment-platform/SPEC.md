# Youth Empowerment Platform - SPEC.md

## Project Overview

**Name:** Spark (working title - "Your Spark")  
**Type:** Telegram-based youth empowerment platform  
**Core Function:** Enable at-risk youth (10-18) to discover capabilities through collaborative challenges  
**Target Users:** Youth aged 10-18, particularly those from orphanages or at-risk backgrounds

---

## Core Philosophy

1. **Low barrier, high ceiling** - Easy to start, unlimited growth
2. **Impact visibility** - Every action should feel meaningful
3. **Peer-powered** - Youth help youth
4. **Safe anonymity** - Pseudonyms, no real names/locations
5. **Viral by design** - Every win is shareable

---

## Architecture

### Tech Stack (Inherited from Credo)
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite (can upgrade to PostgreSQL)
- **Frontend:** Next.js (mobile-optimized)
- **Platform:** Telegram Bot API

### Core Data Models

#### User
```
- id: string (UUID)
- telegram_id: string
- nickname: string (anonymous)
- avatar: string (generated)
- points: number
- reputation: number
- badges: string[]
- created_at: timestamp
```

#### Challenge
```
- id: string (UUID)
- title: string
- description: string
- category: enum (creative, technical, community, physical, knowledge)
- difficulty: enum (starter, quick, serious, epic)
- points: number
- duration_days: number
- is_team: boolean
- min_team_size: number
- max_team_size: number
- proof_type: enum (photo, video, text, link)
- created_by: string (user_id)
```

#### ChallengeCompletion
```
- id: string (UUID)
- challenge_id: string
- user_id: string
- team_id: string (optional)
- proof: string (URL or text)
- points_earned: number
- submitted_at: timestamp
- verified: boolean
```

#### Team
```
- id: string (UUID)
- challenge_id: string
- name: string
- members: string[] (user_ids)
- status: enum (forming, active, completed)
- created_at: timestamp
```

---

## Feature Specifications

### 1. Onboarding Flow
- **/start** command triggers welcome sequence
- Age verification (simple - just confirm age range)
- Nickname selection (no real names)
- Auto-generate avatar or choose from preset
- Interest selection (choose 2-3 categories)
- Show quick tutorial challenge

### 2. Challenge System

#### Challenge Discovery
- **/challenges** - List available challenges
- **/daily** - Get daily recommended challenge
- **/solo** - Solo challenges only
- **/team** - Team challenges only
- Filter by: category, difficulty, duration

#### Challenge Lifecycle
1. Browse → Select → Accept
2. Complete challenge (off-platform)
3. Submit proof via bot
4. Earn points + badge
5. Share result (optional)

### 3. Team System

#### Team Formation
- **/team create [challenge_id]** - Create team for challenge
- **/team join [team_id]** - Join existing team
- **/team invite [@user]** - Invite friend
- Team size: 3-5 people

#### Team Roles
- **Contributor:** Complete assigned tasks
- **Coordinator:** Organize team work
- **Reviewer:** Verify submissions (reputation-based)

### 4. Gamification

#### Points
| Action | Points |
|--------|--------|
| Complete starter challenge | 10 |
| Complete quick challenge | 25 |
| Complete serious challenge | 50 |
| Complete epic challenge | 200 |
| Help teammate | 10 |
| Get first place | +50% |
| Submit early | +10% |

#### Badges
- 🌱 First Step (complete 1 challenge)
- 🔥 On Fire (7-day streak)
- 🤝 Team Player (5 team challenges)
- 🎯 Specialist (10 in one category)
- 🌍 Impact Maker (1000+ points)
- ⭐ Rising Star (weekly top performer)
- 👑 Legend (all-time top)

#### Leaderboards
- Weekly Top 10
- Monthly Top 20
- Category Leaders
- All-Time Legends

### 5. Social Features

#### Sharing
- Generate shareable achievement card
- Share to main channel (opt-in)
- Tag friends to challenge
- Team completion celebrations

#### Community
- Main channel for announcements
- Category channels for interests
- Team channels (auto-created)
- Showcase channel for best work

---

## Telegram Bot Commands

| Command | Description |
|---------|-------------|
| /start | Begin onboarding |
| /help | Show all commands |
| /challenges | Browse challenges |
| /daily | Today's challenge |
| /solo | Solo challenges |
| /team | Team challenges |
| /my | My stats & progress |
| /badges | View badges |
| /leaderboard | View rankings |
| /team create | Create team |
| /team join | Join team |
| /submit [proof] | Submit challenge proof |
| /share | Share latest achievement |

---

## Challenge Library (Initial 30)

### Creative (6)
1. Create a 30-sec beat (Starter, 10pts)
2. Design a logo for something you care about (Quick, 25pts)
3. Make a poster for your community (Serious, 50pts)
4. Write a poem about hope (Starter, 10pts)
5. Create a 1-minute video about your area (Serious, 50pts)
6. Design your dream room (Quick, 25pts)

### Technical (6)
1. Fix something broken today (Starter, 10pts)
2. Learn 3 keyboard shortcuts (Starter, 10pts)
3. Build a simple website (Serious, 50pts)
4. Help someone with their phone (Quick, 25pts)
5. Create a simple app idea (Quick, 25pts)
6. Make something from recycled materials (Serious, 50pts)

### Community (6)
1. Help a neighbor with something (Starter, 10pts)
2. Pick up 5 pieces of litter (Starter, 10pts)
3. Write a thank you note to someone (Quick, 25pts)
4. Plant something that will grow (Quick, 25pts)
5. Organize a small cleanup (Serious, 50pts)
6. Teach a skill to someone (Serious, 50pts)

### Physical (6)
1. Do 20 jumping jacks (Starter, 10pts)
2. Take a 15-minute walk (Starter, 10pts)
3. Try a new sport for 30 min (Quick, 25pts)
4. Do a 7-day workout streak (Serious, 50pts)
5. Teach someone a game (Quick, 25pts)
6. Run or jog for 20 minutes (Quick, 25pts)

### Knowledge (6)
1. Learn 1 new word in another language (Starter, 10pts)
2. Read about something you don't know (Starter, 10pts)
3. Write about your goals (Quick, 25pts)
4. Research a career you're curious about (Quick, 25pts)
5. Teach 3 people something you know (Serious, 50pts)
6. Create a guide for something you know well (Epic, 200pts)

---

## Viral Growth Mechanics

### 1. Referral System
- Share unique invite link
- Both get 50 bonus points on friend's first completion
- Special "Squad" badge for groups who join together

### 2. Competitions
- **Friend Battle:** Challenge a friend to complete same challenge
- **Leaderboard Wars:** City/school/team vs team
- **Weekly Tournaments:** Bracket-style competitions

### 3. Shareable Content
- Auto-generate achievement cards with:
  - Challenge name
  - Points earned
  - Badge earned
  - Rank/leaderboard position
  - "I did it!" message

### 4. Milestone Celebrations
- First challenge completion → celebration in channel
- 7-day streak → special badge
- 100 points → shoutout
- Referral milestones → unlock features

---

## Safety & Moderation

### Anonymous Identity
- No real names allowed
- Auto-generated avatars or preset selection
- No sharing exact location
- Report button for concerns

### Content Moderation
- All submissions reviewed (initially AI, later peer)
- Flagged content hidden until approved
- Three strikes = temporary ban
- Clear community guidelines

### Data Privacy
- Minimal data collection
- No selling user data
- User can delete all data
- GDPR-compliant by design

---

## Success Metrics

### Engagement
- **DAU/MAU:** >40%
- **Challenges/week:** >3 average
- **Session length:** >5 min
- **Return rate (Day 7):** >50%

### Growth
- **Referral rate:** >1.5 per user
- **Social shares:** >30% of completions
- **Organic vs paid:** 80%+ organic

### Impact
- **Total completions:** Track monthly
- **User satisfaction (NPS):** >50
- **Badge distribution:** >50% have 1+ badge

---

## Phases

### Phase 1: MVP (Weeks 1-4)
- Basic bot with 10 challenges
- Points + basic badges
- Simple leaderboard
- Test with 50 users
- Iterate based on feedback

### Phase 2: Growth (Weeks 5-8)
- Team challenges
- Referral system
- Share cards
- Partnership outreach
- More challenges

### Phase 3: Scale (Weeks 9-12)
- Advanced gamification
- Mentorship tier
- API for partners
- Scale to 10K users

---

## Technical Notes

- Forked from Credo Collaboration Platform (2026-03-12)
- Keep compatible with Credo for potential future merge
- Mobile-first design essential
- Offline capability consideration
- Localization ready (i18n)

---

*Spec version: 1.0*
*Created: 2026-03-12*
