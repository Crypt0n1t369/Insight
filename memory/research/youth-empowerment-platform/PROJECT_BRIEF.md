# Youth Empowerment Platform - Project Brief

## Overview

A next-generation platform where every user owns their personal AI agent that operates from their encrypted data vault, matches them to meaningful opportunities in a shared ecosystem, and guides them through a transformative hero's journey with NPC characters.

## Core Vision

> **User-owned AI agents that match personal aspirations to meaningful opportunities through a living network of shared knowledge.**

---

## Key Concepts (Refined from Original)

### 1. User-Owned Encrypted Vault
- Each user has a personal data vault
- Data encrypted at rest (client-side)
- Agent accesses decrypted data only during active session
- **Privacy-first:** Platform cannot read user data

### 2. Personal Agent (On-Demand)
- Spawns when user activates
- Reads user's vault (intentions, challenges, journey state)
- Queries shared database for synergies
- Presents relevant opportunities

### 3. Shared Knowledge Database
- Master repository of:
  - Activities (roles, tasks, projects)
  - Challenges (problems to solve)
  - Ideas (creative contributions)
  - Intentions (what people seek)
- Public/semi-public data others can discover

### 4. Master Orchestrator Agent
- Monitors shared database
- Identifies synergies (user ↔ opportunity)
- Seeds relevant matches to user agents
- Grows the network organically

### 5. NPC Experience Layer
- Characters guide users through journey
- Mentors, tricksters, allies, shadows
- Transformative interactions beyond info delivery
- Each user gets unique experience

### 6. Hero's Journey Structure
- 10-stage transformation arc
- User progresses through stages
- Challenges scale with growth
- Eventually becomes guide for others

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    MASTER ORCHESTRATOR                  │
│  • Synergy detection (vector + graph)                   │
│  • Network growth engine                                 │
│  • NPC narrative generation                              │
└─────────────────────────┬───────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │ Activities  │  │ Challenges  │  │ Characters  │
  │ DB          │  │ DB          │  │ DB          │
  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
         │                │                │
         └────────────────┼────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 USER DATA VAULT (x2)                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ PRIVATE ZONE          │ PUBLIC ZONE            │    │
│  │ • Intentions          │ • Skills               │    │
│  │ • Challenges          │ • Availability         │    │
│  │ • Journey state       │ • Contributions       │    │
│  │ • Private notes       │ • Profile             │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                                │
│                          ▼                                │
│                 ┌────────────────┐                       │
│                 │ ON-DEMAND AGENT│                       │
│                 │ (spawned per   │                       │
│                 │  user session) │                       │
│                 └────────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Encryption | libsodium / age | Mature, secure, developer-friendly |
| Key Derivation | Argon2id | Memory-hard, resistant to GPU attacks |
| Agent Runtime | Serverless (CF Workers) | Fast spawn, pay-per-use |
| Vector DB | Qdrant (self-hosted) | Rust-native, easy deployment |
| Knowledge Graph | Memgraph | Good for synergy traversal |
| UI Channel | Telegram (Phase 1) | Already configured |

---

## Implementation Phases

### Phase 1: Foundation (4 weeks)
- [ ] Vault encryption system (age/x25519)
- [ ] Basic agent spawn runtime
- [ ] Shared database (SQLite → Qdrant)
- [ ] Simple matching (tag-based)
- [ ] Telegram bot UI

### Phase 2: Intelligence (4 weeks)
- [ ] Embedding pipeline
- [ ] Synergy detection engine
- [ ] User profile ingestion
- [ ] Master agent orchestration

### Phase 3: Experience (4 weeks)
- [ ] NPC character system
- [ ] Hero's journey state machine
- [ ] Narrative generation
- [ ] Growth tracking

### Phase 4: Scale (4 weeks)
- [ ] Multi-user support
- [ ] Performance optimization
- [ ] Advanced encryption (ABE)
- [ ] Mobile app

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-------------|
| Encryption UX friction | Users abandon | Progressive disclosure, help flow |
| Agent cold starts | Poor UX | Warm pool of agents |
| Synergy false positives | Trust loss | Human verification queue |
| NPC authenticity | Engagement drops | LLM + templates hybrid |
| Data lock-in | Vendor risk | Export functionality |

---

## Research Files Created

- `01-architecture-research.md` - Deep technical research
- `02-simplified-architecture.md` - Logic refinement
- This brief

---

## Next Steps

1. Validate architecture with key decisions
2. Choose MVP tech stack
3. Build Phase 1: Vault + Basic Agent
4. Test with 5-10 users

---

*Created: 2026-03-14*
*Status: Research complete, ready for architecture validation*
