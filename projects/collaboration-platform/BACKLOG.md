# Credo Collaboration Platform - Backlog

## Overview

This backlog tracks all remaining work for the Credo collaboration platform. Items are prioritized by impact and dependencies.

---

## Completed (Pre-MVP)

| Item | Status | Notes |
|------|--------|-------|
| Research: UX Deep Dive | ✅ Done | Detailed wireframes in ux-deep-dive.md |
| Research: Security Deep Dive | ✅ Done | ZK proofs, threat model in security-deep-dive.md |
| Research: Governance Deep Dive | ✅ Done | Quadratic voting, tiers in governance-deep-dive.md |
| Research: Avatar/Synthetic Deep Dive | ✅ Done | Persona synthesis in avatar-deep-dive.md |
| Research: Gamification Deep Dive | ✅ Done | Intrinsic motivation in gamification-deep-dive.md |
| Research: Alternatives Deep Dive | ✅ Done | Competitive analysis in alternatives-deep-dive.md |
| Strategy: Overview | ✅ Done | STRATEGY.md |
| Spec: Technical | ✅ Done | SPEC.md |
| Schema: Database | ✅ Done | SCHEMA.md |
| Plan: Pilot | ✅ Done | PILOT.md |
| Integration: Synthetic + Knowledge | ✅ Done | INTEGRATION.md |

---

## MVP (Version 0.1.0) — Priority 0

### Must Have for MVP

| ID | Item | Type | Effort | Dependencies |
|----|------|------|--------|--------------|
| M1 | Set up Next.js project | Dev | 2h | None |
| M2 | Configure Supabase + schema | Dev | 4h | None |
| M3 | Implement anonymous auth | Dev | 4h | M2 |
| M4 | Build branch CRUD | Dev | 6h | M2 |
| M5 | Build contribution CRUD | Dev | 6h | M2, M4 |
| M6 | Implement endorsement system | Dev | 4h | M5 |
| M7 | Build credibility calculation | Dev | 4h | M6 |
| M8 | Create basic UI components | Dev | 8h | M3 |
| M9 | Build landing page | Dev | 4h | M8 |
| M10 | Build branch view page | Dev | 6h | M4, M8 |
| M11 | Build contribution form | Dev | 4h | M5, M8 |
| M12 | Build user profile page | Dev | 3h | M3 |
| M13 | Deploy to Vercel | Dev | 2h | M1-M12 |

**Total MVP Effort:** ~57 hours

### MVP Timeline (4 weeks)

```
Week 1: Foundation
├── Day 1-2: Set up Next.js + Supabase
├── Day 3-4: Auth + Branch CRUD
├── Day 5-7: Contribution + Endorsement

Week 2: Core Features
├── Day 8-10: Credibility + Profiles
├── Day 11-13: UI components + Pages
└── Day 14: Testing

Week 3: Polish
├── Day 15-17: UI refinement
├── Day 18-20: Edge cases
└── Day 21: Bug fixes

Week 4: Launch
├── Day 22-24: Deploy staging
├── Day 25-26: Deploy production
├── Day 27: Run Paper Branch pilot
└── Day 28: Review
```

---

## Phase 2 (Version 0.2.0) — Priority 1

### Features

| ID | Item | Type | Effort | Dependencies |
|----|------|------|--------|--------------|
| P1 | Wallet connection (optional) | Dev | 8h | M3 |
| P2 | Basic voting (non-quadratic) | Dev | 6h | M4 |
| P3 | Proposal system | Dev | 8h | P2 |
| P4 | Comment threads | Dev | 4h | M5 |
| P5 | Search functionality | Dev | 6h | None |
| P6 | User settings page | Dev | 3h | M3 |
| P7 | Branch hierarchy UI | Dev | 4h | M4 |
| P8 | Basic moderation UI | Dev | 6h | M2 |
| P9 | Notifications | Dev | 6h | M3 |
| P10 | Real-time updates | Dev | 8h | M2 |

**Total Phase 2 Effort:** ~59 hours

---

## Phase 3 (Version 0.3.0) — Priority 2

### Advanced Features

| ID | Item | Type | Effort | Dependencies |
|----|------|------|--------|--------------|
| A1 | Quadratic voting | Dev | 8h | P3 |
| A2 | Fork branch UI | Dev | 6h | M4 |
| A3 | Merge proposals | Dev | 8h | A2 |
| A4 | Advanced credibility (decay) | Dev | 6h | M7 |
| A5 | Trust tier progression | Dev | 4h | M7 |
| A6 | Report system | Dev | 6h | P8 |
| A7 | Moderation queue | Dev | 6h | A6 |
| A8 | Analytics dashboard | Dev | 8h | M2 |

**Total Phase 3 Effort:** ~52 hours

---

## Phase 4 (Version 0.4.0) — Priority 3

### Identity & Privacy

| ID | Item | Type | Effort | Dependencies |
|----|------|------|--------|--------------|
| I1 | ZK proof integration | Dev | 16h | P1 |
| I2 | Semaphore setup | Dev | 8h | I1 |
| I3 | Privacy controls | Dev | 6h | I1 |
| I4 | Data export | Dev | 4h | M2 |
| I5 | Account deletion | Dev | 6h | I4 |

**Total Phase 4 Effort:** ~40 hours

---

## Phase 5 (Version 0.5.0) — Priority 4

### Synthetic Characters

| ID | Item | Type | Effort | Dependencies |
|----|------|------|--------|--------------|
| S1 | Synthetic profile creation | Dev | 8h | M3 |
| S2 | Values/positions configuration | Dev | 6h | S1 |
| S3 | Basic summarization | Dev | 8h | S1 |
| S4 | Response generation | Dev | 12h | S3 |
| S5 | User approval flow | Dev | 4h | S4 |
| S6 | Mediation dashboard | Dev | 6h | S5 |

**Total Phase 5 Effort:** ~44 hours

---

## Phase 6 (Version 0.6.0) — Priority 5

### Knowledge & Integration

| ID | Item | Type | Effort | Dependencies |
|----|------|------|--------|--------------|
| K1 | Knowledge graph schema | Dev | 8h | M2 |
| K2 | Graph visualization | Dev | 12h | K1 |
| K3 | Gap detection | Dev | 8h | K1 |
| K4 | Auto-linking | Dev | 10h | K1 |
| K5 | Audio Tool bridge | Dev | 8h | M3 |
| K6 | Session sharing | Dev | 6h | K5 |

**Total Phase 6 Effort:** ~52 hours

---

## Research Backlog (Ongoing)

### Technical Research

| ID | Topic | Priority | Status |
|----|-------|----------|--------|
| R1 | Wallet connect implementation | P1 | Sketch |
| R2 | GraphQL vs REST tradeoffs | P1 | Sketch |
| R3 | Supabase realtime best practices | P1 | Sketch |
| R4 | ZK proof libraries (Semaphore) | P2 | Done |
| R5 | Vector embeddings for search | P2 | Not Started |
| R6 | IPFS integration for content | P3 | Not Started |

### Behavioral Research

| ID | Topic | Priority | Status |
|----|-------|----------|--------|
| R7 | Trust curve calibration | P1 | Not Started |
| R8 | Fork psychology | P2 | Not Started |
| R9 | Moderation triage (AI vs human) | P2 | Not Started |
| R10 | Synthetic character trust | P3 | Sketch |

### Legal Research

| ID | Topic | Priority | Status |
|----|-------|----------|--------|
| R11 | Jurisdiction selection | P1 | Sketch |
| R12 | DAO legal structure | P2 | Not Started |
| R13 | GDPR compliance | P2 | Not Started |
| R14 | Platform liability | P3 | Not Started |

---

## Technical Debt

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| T1 | Add comprehensive tests | P2 | Currently no tests |
| T2 | Performance optimization | P2 | After MVP |
| T3 | Accessibility audit | P2 | Add screen reader support |
| T4 | Mobile responsiveness | P2 | Currently web-only |
| T5 | API documentation | P3 | OpenAPI spec |
| T6 | Error handling | P3 | Better user messages |

---

## Icebox (Future)

| ID | Item | Notes |
|----|------|-------|
| F1 | Mobile app (React Native) | After web is stable |
| F2 | Offline-first PWA | After basic PWA |
| F3 | Voice interface | Audio Tool integration |
| F4 | Multi-language support | After English |
| F5 | Custom domains | For organizations |
| F6 | White-label option | Enterprise feature |

---

## Dependencies Map

```
MVP (M1-M13)
   │
   ├──▶ Phase 2 (P1-P10)
   │       │
   │       ├──▶ Phase 3 (A1-A8)
   │       │       │
   │       │       ├──▶ Phase 4 (I1-I5)
   │       │       │
   │       │       └──▶ Phase 5 (S1-S6)
   │       │
   │       └──▶ Phase 6 (K1-K6)
   │
   └──▶ Research (R1-R14) ──▶ Runs throughout
```

---

## Effort Summary

| Phase | Features | Hours |
|-------|----------|-------|
| MVP | 13 | ~57 |
| Phase 2 | 10 | ~59 |
| Phase 3 | 8 | ~52 |
| Phase 4 | 5 | ~40 |
| Phase 5 | 6 | ~44 |
| Phase 6 | 6 | ~52 |
| **Total** | **48** | **~304 hours** |

---

## Next Up

1. **Start MVP development** (M1-M13)
2. **Run Paper Branch pilot** (in parallel)
3. **Iterate based on learnings**

---

*Last Updated: 2026-03-04*
