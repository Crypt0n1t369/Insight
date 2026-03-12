# Spark - Youth Empowerment Platform

**Status:** Forked from Credo Collaboration Platform  
**Date:** 2026-03-12  
**Research:** `../../research/youth-empowerment-platform/01-use-case-research.md`

---

## Quick Start

```bash
cd projects/youth-empowerment-platform
npm install
# Backend
npm run dev
# Frontend (new terminal)
cd frontend && npm run dev
```

---

## What is Spark?

A Telegram-based platform for at-risk youth (10-18) to:
- Discover their capabilities through challenges
- Connect with peers for team projects
- Build skills while earning recognition
- Make a real impact in their communities

---

## Core Features

1. ✅ **Challenge System** - 30+ challenges across 5 categories
2. ✅ **Points & Badges** - Gamification for engagement
3. ✅ **Leaderboards** - Weekly, monthly, all-time
4. ✅ **Team Challenges** - Collaborate with 3-5 peers
5. ✅ **Referral System** - Viral growth mechanics
6. ✅ **Share Cards** - Auto-generated achievements

---

## Research Summary

See `../../research/youth-empowerment-platform/01-use-case-research.md` for:
- Target audience analysis
- Challenge category ideas
- Gamification system design
- Viral growth strategy
- Dissemination plan

---

## Tech Stack

- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite
- **Frontend:** Next.js
- **Platform:** Telegram Bot API

---

## Project Structure

```
youth-empowerment-platform/
├── src/
│   ├── db/           # Database schema
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   ├── types/        # TypeScript types
│   └── index.ts      # Entry point
├── frontend/         # Next.js web app
├── tests/            # Test suite
├── SPEC.md          # Detailed specification
└── package.json
```

---

## Next Steps

1. Install dependencies
2. Set up Telegram bot token
3. Run database migrations
4. Deploy and test with small group
5. Iterate based on feedback
6. Scale with partnerships

---

## Vision

> "Every young person has a spark. We help them fan it into a flame."

**North Star:** 1 million youth making impact by 2028

---

*Built on the shoulders of Credo - thanks to the original team.*
