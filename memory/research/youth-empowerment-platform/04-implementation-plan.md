# Youth Empowerment Platform - Implementation Plan

## Phase Overview

| Phase | Focus | Duration | Key Deliverable |
|-------|-------|----------|-----------------|
| **Phase 0** | Foundation | 2 weeks | Vault + Agent Runtime |
| **Phase 1** | Core Experience | 3 weeks | Basic matching + Journey |
| **Phase 2** | Collaboration | 3 weeks | Shared DB + Helping network |
| **Phase 3** | Intelligence | 4 weeks | Vector matching + Advanced NPCs |
| **Phase 4** | Scale | 4 weeks | Multi-user + Performance |

---

# PHASE 0: Foundation (Weeks 1-2)

## Goal
User can create encrypted vault, spawn personal agent, have basic conversation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 0 ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Telegram Bot ──▶ FastAPI Server ──▶ Agent Process        │
│                      │                    │                  │
│                      ▼                    ▼                  │
│                 ┌────────┐           ┌──────────┐          │
│                 │ Vault  │           │  Agent   │          │
│                 │ Manager│           │ Runtime  │          │
│                 └────────┘           └──────────┘          │
│                      │                    │                  │
│                      ▼                    ▼                  │
│                 ┌────────┐           ┌──────────┐          │
│                 │ Vault  │           │  Memory  │          │
│                 │ Files  │           │  (RAM)   │          │
│                 └────────┘           └──────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 0.1 Vault System
- **Purpose:** Encrypted storage for user data
- **Technology:** age (CLI) + JSON files
- **Structure:**
  ```
  vaults/
  └── {user_id}/
      ├── .meta/
      │   ├── manifest.json.enc
      │   └── public.key
      ├── private/
      │   ├── intentions.json.enc
      │   ├── challenges.json.enc
      │   └── journey-state.json.enc
      └── public/
          ├── profile.json.enc
          └── skills.json.enc
  ```
- **Key Management:** User passphrase → Argon2id → Vault key
- **Default Data:** Seed with empty structures for new users

### 0.2 Agent Spawner
- **Purpose:** Create ephemeral agent per user session
- **Technology:** Python subprocess
- **Lifecycle:**
  1. User starts session (sends message)
  2. Spawner creates agent process
  3. Agent loads user context from vault
  4. Agent processes message
  5. Response sent to user
  6. Agent memory wiped, process exits
- **Cold Start Target:** <5 seconds

### 0.3 Agent Runtime
- **Purpose:** Process user messages, generate responses
- **Technology:** Python + LangChain (lightweight)
- **Capabilities:**
  - Load user vault (decrypted in memory)
  - Maintain conversation history (session-only)
  - Generate responses via LLM
  - Access to user journey state
- **Memory:** Wiped after each session

### 0.4 Basic Telegram Bot
- **Purpose:** User interface
- **Commands:**
  - `/start` - Initialize user vault
  - `/vault` - View/edit vault
  - `/journey` - View journey stage
  - (direct message) - Chat with agent

## Implementation Steps

### Week 1: Vault + Bot
| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Setup project structure | `youth-platform/` folder |
| 2 | Create vault manager module | `vault_manager.py` |
| 3 | Implement encryption (age) | Vault files encrypted |
| 4 | Setup FastAPI server | `main.py` running |
| 5 | Integrate Telegram bot | Bot responds to /start |

### Week 2: Agent Runtime
| Day | Task | Deliverable |
|-----|------|-------------|
| 6 | Create agent spawner | `agent_spawner.py` |
| 7 | Build agent runtime | `agent_runtime.py` |
| 8 | Connect agent to vault | Agent reads vault |
| 9 | Basic LLM integration | Agent generates responses |
| 10 | End-to-end test | User can chat with agent |

## Code Structure

```
youth-platform/
├── src/
│   ├── __init__.py
│   ├── vault/
│   │   ├── __init__.py
│   │   ├── manager.py       # Vault CRUD operations
│   │   ├── encryption.py   # age wrapper
│   │   └── keychain.py     # Key derivation
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── spawner.py      # Process management
│   │   ├── runtime.py     # Agent logic
│   │   └── memory.py      # Session memory
│   ├── api/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI app
│   │   ├── routes.py       # Endpoints
│   │   └── models.py       # Pydantic models
│   └── bot/
│       ├── __init__.py
│       ├── handler.py      # Telegram handlers
│       └── client.py       # Bot API client
├── tests/
│   ├── test_vault.py
│   ├── test_agent.py
│   └── test_api.py
├── config.py
├── requirements.txt
└── README.md
```

## Success Criteria Phase 0
- [ ] User can create vault with passphrase
- [ ] Data encrypted at rest
- [ ] User can chat with agent
- [ ] Agent has access to vault context
- [ ] Cold start <5 seconds
- [ ] Session memory wiped after each use

---

# PHASE 1: Core Experience (Weeks 3-5)

## Goal
User has personalized experience with journey tracking and basic matching.

## New Components

### 1.1 Journey State Machine
- Track user's progress through hero's journey
- 10 stages: Ordinary → Call → Departure → Mentor → Trials → Ordeal → Reward → Return → Transformation → Elixir
- Each stage unlocks different opportunities

### 1.2 Matching Engine (Basic)
- TF-IDF based matching
- Match user intentions to activity database
- Score: 0-1 relevance

### 1.3 Activity Database
- Pre-seeded with sample opportunities
- Categories: Role, Challenge, Task, Idea, Event
- Tags for matching

### 1.4 Interaction Objectives
- Each session has stated objective
- Agent adapts response style

### 1.5 NPC Character System (Basic)
- Template-based responses
- 4 character types: Mentor, Trickster, Ally, Shadow

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 1 ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Telegram Bot ──▶ FastAPI Server ──▶ Agent Process        │
│                      │                    │                  │
│                      ▼                    ▼                  │
│                 ┌────────┐           ┌──────────┐          │
│                 │ Journey│           │  Agent   │          │
│                 │ State  │           │ Runtime  │          │
│                 │ Manager│           │  + NPC   │          │
│                 └────────┘           └──────────┘          │
│                      │                    │                  │
│                      ▼                    ▼                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              SHARED DATABASE (SQLite)                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │  │
│  │  │ Activities │  │   Users    │  │  Matches   │     │  │
│  │  └────────────┘  └────────────┘  └────────────┘     │  │
│  │                                                      │  │
│  │         ┌─────────────────────────────────┐        │  │
│  │         │     Matching Engine (TF-IDF)    │        │  │
│  │         └─────────────────────────────────┘        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

```sql
-- Users (linked to vaults)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    vault_path TEXT NOT NULL,
    journey_stage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities (opportunities)
CREATE TABLE activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- role, challenge, task, idea, event
    tags TEXT, -- JSON array
    requirements TEXT, -- JSON
    created_by TEXT, -- user_id or 'system'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journey milestones
CREATE TABLE milestones (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    stage INTEGER,
    completed_at TIMESTAMP,
    reflection TEXT
);

-- Matches (user-activity)
CREATE TABLE matches (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    activity_id TEXT REFERENCES activities(id),
    score REAL,
    presented BOOLEAN DEFAULT FALSE,
    responded BOOLEAN DEFAULT FALSE
);
```

## Interaction Objectives System

```python
class InteractionObjective(Enum):
    EXPLORATION = "explore"      # Discover opportunities
    CLARIFICATION = "clarify"   # Refine understanding
    COMMITMENT = "commit"       # Take action
    REFLECTION = "reflect"      # Review progress
    CONTRIBUTION = "contribute" # Share with others

class UserSession:
    user_id: str
    objectives: list[InteractionObjective]
    current_objective: InteractionObjective
    conversation_history: list[Message]
    
    def set_objective(self, obj: InteractionObjective):
        self.current_objective = obj
        # Agent tailors response to objective
```

## Implementation Steps

### Week 3: Journey + Database
| Day | Task | Deliverable |
|-----|------|-------------|
| 11 | Design journey state machine | `journey.py` module |
| 12 | Create SQLite schema | Database initialized |
| 13 | Seed sample activities | 50 sample opportunities |
| 14 | Journey tracking in vault | Progress saved |
| 15 | API endpoints for journey | `/api/journey/*` |

### Week 4: Matching + NPCs
| Day | Task | Deliverable |
|-----|------|-------------|
| 16 | Implement TF-IDF matching | `matching.py` |
| 17 | Match user to activities | Score calculation |
| 18 | Create NPC templates | Character responses |
| 19 | Integrate NPC in agent | Dynamic character |
| 20 | Test matching quality | 70%+ relevant matches |

### Week 5: Objectives + Polish
| Day | Task | Deliverable |
|-----|------|-------------|
| 21 | Interaction objectives | Session goals |
| 22 | Response tailoring | Objective-based replies |
| 23 | User onboarding flow | First-time experience |
| 24 | Error handling | Graceful failures |
| 25 | End-to-end testing | Full user flow |

## Success Criteria Phase 1
- [ ] User journey tracked across stages
- [ ] Matching provides relevant suggestions
- [ ] NPC characters provide guidance
- [ ] Interaction objectives affect responses
- [ ] User can complete hero's journey
- [ ] Works without network (local only)

---

# PHASE 2: Collaboration (Weeks 6-8)

## Goal
Users can share ideas, help others, network effects begin.

## New Features

### 2.1 Contribution System
- User can add ideas/challenges to shared DB
- Tagging and categorization
- Attribution (anonymous or named)

### 2.2 Helper Matching
- Match potential helpers to shared ideas
- Notify when good fit detected
- Voluntary participation

### 2.3 Appreciation System
- Thank helpers
- Track contribution counts
- Recognition (no leaderboard - optional)

### 2.4 Privacy Controls
- What to share vs keep private
- Granular permissions

---

# PHASE 3: Intelligence (Weeks 9-12)

## Goal
Vector embeddings, smarter matching, advanced NPCs.

## New Features

### 3.1 Embedding Pipeline
- sentence-transformers model
- Local CPU inference
- Re-embed on content changes

### 3.2 Vector Database
- Qdrant (local)
- Semantic search

### 3.3 Knowledge Graph
- Track relationships
- Suggest connections

### 3.4 LLM-Generated NPCs
- Dynamic character generation
- Consistent voice
- Context-aware narratives

---

# PHASE 4: Scale (Weeks 13-16)

## Goal
Production-ready, multi-user, performant.

## New Features

### 4.1 Multi-User Support
- Authentication system
- Rate limiting
- Resource management

### 4.2 Performance
- Agent pool (warm)
- Caching
- Optimization

### 4.3 Deployment Options
- Docker support
- Cloud ready

---

# Summary Timeline

```
Phase 0: ████████ (2 weeks) - Foundation
Phase 1: █████████████ (3 weeks) - Core Experience  
Phase 2: █████████████ (3 weeks) - Collaboration
Phase 3: ████████████████ (4 weeks) - Intelligence
Phase 4: ████████████████ (4 weeks) - Scale

Total: 16 weeks (~4 months)
```

---

*Plan created: 2026-03-14*
*Status: Ready for implementation*
