# Youth Empowerment Platform - Resource Analysis & Local Deployment

## Host Specifications (drg-ThinkPad-Edge)
- **RAM:** 7.6GB (4.6GB available)
- **CPU:** 4 cores
- **Storage:** 117GB (66GB free)
- **OS:** Linux

## Resource-Efficient Architecture Options

### Option A: Lightweight Stack (Recommended for MVP)
```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL STACK (MVP)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Agent Runtime:                                             │
│  - Python processes (no containers)                        │
│  - Spawn on-demand, kill after session                     │
│  - Memory: ~200MB per agent                                │
│                                                             │
│  Database:                                                  │
│  - SQLite (shared) + JSON files (user vaults)             │
│  - No separate DB server needed                           │
│  - Storage: ~10MB for 1000 activities                     │
│                                                             │
│  Embedding/Matching:                                        │
│  - TF-IDF or BM25 (not vectors) for Phase 0-1            │
│  - Optional: sentence-transformers (CPU) for Phase 2      │
│  - Memory: ~500MB for model                                │
│                                                             │
│  API Server:                                                │
│  - FastAPI (Python)                                        │
│  - Memory: ~50MB                                           │
│                                                             │
│  UI:                                                        │
│  - Telegram Bot (already configured)                       │
│  - No additional resources                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  TOTAL ESTIMATED RAM: ~1GB (well under 4.6GB available)  │
│  STORAGE: Minimal                                           │
│  COLD START: ~3-5 seconds                                   │
└─────────────────────────────────────────────────────────────┘
```

### Option B: Medium Stack (Phase 2)
```
┌─────────────────────────────────────────────────────────────┐
│                 MEDIUM STACK (Phase 2+)                     │
├─────────────────────────────────────────────────────────────┤
│  Add:                                                       │
│  - Qdrant (vector DB): ~200MB RAM                         │
│  - sentence-transformers: ~500MB RAM                       │
│  - Neo4j or Memgraph (optional, for relationships)        │
│                                                             │
│  TOTAL RAM: ~1.7GB                                          │
└─────────────────────────────────────────────────────────────┘
```

### Option C: Full Stack (Production)
```
┌─────────────────────────────────────────────────────────────┐
│                    FULL STACK (Scale)                       │
├─────────────────────────────────────────────────────────────┤
│  - Docker/Kubernetes cluster                               │
│  - Multiple agent containers                               │
│  - Managed vector DB (Pinecone)                            │
│  - Cloud deployment                                        │
│                                                             │
│  NOT SUITABLE FOR LOCAL - skip for now                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Lightweight Encryption Options

### Comparison for Local Deployment

| Library | Language | Features | Resources | Recommendation |
|---------|----------|----------|-----------|----------------|
| **age** | Go/Rust CLI | Modern, simple | Very low | ✓ Best for files |
| **libsodium** | C | Complete | Low | Good for apps |
| **GPG** | CLI | Standard | Medium | Legacy, avoid |
| **PyNaCl** | Python | libsodium binding | Low | ✓ Best for Python |
| **cryptography** | Python | OpenSSL wrapper | Low | Good alternative |

### Recommended: age + PyNaCl Hybrid
- **Vault files:** age (simple CLI, encrypted at rest)
- **Session keys:** PyNaCl (in-memory for agent runtime)

---

## Matching Algorithm Progression

### Phase 0-1: TF-IDF + Keyword (MVP)
```python
# Simple, no ML model needed
from sklearn.feature_extraction.text import TfidfVectorizer

# Pros: Fast, lightweight, no GPU
# Cons: Basic semantic understanding
# Memory: <10MB
```

### Phase 2: Sentence Transformers
```python
# Local CPU inference
from sentence_transformers import SentenceTransformer

# Model: all-MiniLM-L6-v2 (fastest)
# Pros: Better semantic matching
# Cons: ~500MB RAM, slower
# Memory: ~500MB
```

### Phase 3: Fine-tuned (Future)
- Custom embeddings for domain

---

## Network Effects: Delayed Activation

### The Bootstrap Problem
> "How do you provide value without network effects?"

### Solution: Individual-First Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              VALUE PROGRESSION                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PHASE 0-1: Individual Value (No network needed)          │
│  ─────────────────────────────────────────────              │
│  • User defines intentions, challenges, goals              │
│  • System generates personalized opportunities             │
│  • NPC guides user through their journey                   │
│  • User grows regardless of others                         │
│                                                             │
│  PHASE 2: Basic Collaboration (Optional network)          │
│  ─────────────────────────────────────────────              │
│  • User can share ideas to shared database                │
│  • Others can discover and help                           │
│  • Matching happens when both ready                        │
│                                                             │
│  PHASE 3: Network Effects (Full activation)               │
│  ─────────────────────────────────────────────              │
│  • Living network grows                                    │
│  • Synergies emerge organically                           │
│  • User becomes mentor for others                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### This Means:
- **Initial focus:** Personal transformation value
- **Network activation:** User chooses when to share
- **No pressure:** Platform works 100% without others

---

## User Objectives per Interaction

### Concept: Micro-Quests
Each interaction has a purpose:

```
┌─────────────────────────────────────────────────────────────┐
│              INTERACTION OBJECTIVES                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Type 1: EXPLORATION (When user is browsing)              │
│  ─────────────────────────────────────────────              │
│  Objective: Discover relevant opportunities                │
│  Agent action: Present top 3 matches with context         │
│  User action: Choose to engage or continue exploring       │
│                                                             │
│  Type 2: CLARIFICATION (When user is confused)            │
│  ─────────────────────────────────────────────              │
│  Objective: Refine understanding                           │
│  Agent action: Ask questions, help articulate              │
│  User action: Provide more context                         │
│                                                             │
│  Type 3: COMMITMENT (When user decides)                   │
│  ─────────────────────────────────────────────              │
│  Objective: Move forward on a path                        │
│  Agent action: Present next steps, set milestone          │
│  User action: Commit to action                             │
│                                                             │
│  Type 4: REFLECTION (End of session/periodic)             │
│  ─────────────────────────────────────────────              │
│  Objective: Consolidate learning                          │
│  Agent action: Summarize progress, celebrate wins         │
│  User action: Reflect, adjust journey state               │
│                                                             │
│  Type 5: CONTRIBUTION (Optional sharing)                  │
│  ─────────────────────────────────────────────              │
│  Objective: Add to shared knowledge                        │
│  Agent action: Guide how to share meaningfully             │
│  User action: Contribute idea/challenge/task              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Journey State Tracks Objectives
```python
class UserJourney:
    current_stage: int  # 0-9 (hero's journey)
    active_objective: str  # current micro-quest type
    session_goals: list[str]  # what user wants this session
    completed_milestones: list[str]
```

---

## Shared Ideas: "Pay It Forward" Model

### How It Works (Phase 2+)
```
┌─────────────────────────────────────────────────────────────┐
│              IDEA CONTRIBUTION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USER A has idea/challenge                                  │
│         │                                                   │
│         ▼                                                   │
│  Encrypted + Public tags added to shared DB                │
│         │                                                   │
│         ▼                                                   │
│  MASTER AGENT detects potential helpers                    │
│  (based on skills, interests, journey stage)              │
│         │                                                   │
│         ▼                                                   │
│  USER B gets seeded match: "This might interest you"      │
│         │                                                   │
│         ▼                                                   │
│  USER B chooses to help (or not)                           │
│         │                                                   │
│         ▼                                                   │
│  USER A gets notification + gratitude system              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key: Voluntary + Rewarding
- Users help ONLY when interested
- Recognition system (without pressure)
- Both benefit: helper grows, creator's idea advances

---

## Architecture Summary: Phase 0-1 Local

```
┌─────────────────────────────────────────────────────────────┐
│              LOCAL MVP ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                 API SERVER (FastAPI)                │  │
│  │                 Port 3000                            │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                         │                                    │
│         ┌───────────────┼───────────────┐                   │
│         ▼               ▼               ▼                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │  Vault     │  │  Shared    │  │   Agent    │             │
│  │  Manager   │  │  SQLite    │  │  Spawner   │             │
│  │  (age)     │  │  (JSON)    │  │  (Python)  │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                         │               │                    │
│                         ▼               ▼                    │
│                  ┌────────────┐  ┌────────────┐             │
│                  │  Matching  │  │   Agent    │             │
│                  │  Engine    │  │  Runtime   │             │
│                  │  (TF-IDF)  │  │  (ephemeral)│            │
│                  └────────────┘  └────────────┘             │
│                                            │                  │
│                                            ▼                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              TELEGRAM BOT (UI)                        │  │
│  │              (already configured)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Resource Summary

| Component | RAM | Storage | Notes |
|-----------|-----|---------|-------|
| FastAPI | 50MB | - | HTTP server |
| SQLite | 20MB | 10MB/1K items | Shared DB |
| User Vaults | 1MB/user | 100KB/user | Encrypted JSON |
| Agent Process | 200MB | - | Per session |
| TF-IDF | 10MB | - | Matching |
| **TOTAL** | **~300MB** | Minimal | Well within limits |

---

*Research: 2026-03-14*
*Status: Resource analysis complete*
