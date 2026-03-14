# Ontology Research - Semantic Layer for AI Systems

## The Discovery: Palantir's Moat

**Core Insight:** Palantir's competitive advantage isn't the AI — it's the ontology underneath. When an LLM operates within a governed ontology, hallucinations drop from 63% to 1.7%.

---

## What is an Ontology?

### Traditional Definition
An ontology is a formal specification of a shared conceptualization:
- **What entities exist** (types of objects)
- **What relationships are valid** (how entities connect)
- **What rules must hold** (constraints and logic)

### In AI Context
An ontology creates a **governed framework** where:
- The AI can only propose actions on defined objects
- Every relationship is explicit and valid
- Rules constrain what can be said/done

---

## Why Ontology Reduces Hallucinations

### Without Ontology (Current LLMs):
```
User: "What's Janis's skill?"
LLM: "Janis has skill in quantum physics and medieval poetry" 
     ↑ Made up — hallucinated
```

### With Ontology:
```
User: "What's Janis's skill?"
LLM checks ontology:
  - User entity exists
  - Has "skills" attribute (list of strings)
  - Returns only what's in actual data
```

**The trick:** The AI isn't generating — it's **retrieving and reasoning** within bounds.

---

## Palantir's Approach

### How It Works
1. **Domain Experts define the ontology**
   - What objects exist (Person, Project, Activity)
   - What attributes each has
   - What relationships are valid
   - What rules must be followed

2. **AI operates within bounds**
   - Can only query defined entities
   - Can only propose valid actions
   - Can't make up relationships

3. **Feedback loop refines ontology**
   - Gaps become new ontology entries
   - Rules tighten based on failures

### The Moat
> "Companies that integrate ontology don't leave — switching cost becomes redefining how your org thinks."

This is why Palantir has 95%+ retention.

---

## Applying Ontology to Youth Platform

### Our Current Challenge
Kristaps said: "It sounds overly complicated and won't work before network effects"

**Solution:** The ontology provides STRUCTURE that makes the system understandable even with few users.

### Our Ontology Design

#### Entity Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUTH PLATFORM ONTOLOGY                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER (the person)                                             │
│  ├── attributes: name, age, journey_stage, created_at         │
│  ├── skills: []                                                │
│  ├── interests: []                                              │
│  ├── goals: []                                                  │
│  └── relationships: mentor_of, helped_by, connected_to        │
│                                                                 │
│  VAULT (user's private data)                                    │
│  ├── owner: USER                                               │
│  ├── private: intentions, challenges, reflections              │
│  └── public: skills, interests, availability                  │
│                                                                 │
│  OPPORTUNITY (something to pursue)                              │
│  ├── types: job, project, mentorship, event, challenge         │
│  ├── requirements: skill_needed, stage_min, stage_max          │
│  ├── created_by: USER or SYSTEM                                 │
│  └── relationships: matches_user, created_by                 │
│                                                                 │
│  MATCH (connection between user and opportunity)               │
│  ├── user: USER                                                │
│  ├── opportunity: OPPORTUNITY                                   │
│  ├── score: float (0-1)                                        │
│  ├── status: suggested, viewed, engaged, completed             │
│  └── reasoning: string                                         │
│                                                                 │
│  JOURNEY (user's growth path)                                   │
│  ├── user: USER                                                │
│  ├── stage: integer (0-9)                                      │
│  ├── milestones: []                                            │
│  ├── active_quests: []                                         │
│  └── npc_relationships: {}                                      │
│                                                                 │
│  CONTRIBUTION (user's shared work)                              │
│  ├── user: USER                                                │
│  ├── type: idea, task, feedback, verification                  │
│  ├── content: string                                           │
│  ├── impact_score: float                                       │
│  └── relationships: contributed_to, verified_by               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Relationship Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                   VALID RELATIONSHIPS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USER ──────┐                                                   │
│    │        │ owns ──────► VAULT                                │
│    │        │ has ───────► JOURNEY                              │
│    │        │ created ───► OPPORTUNITY                         │
│    │        │ made ──────► CONTRIBUTION                        │
│    │        │ matched_to ► OPPORTUNITY                         │
│    │        │ helped ────► USER (mentor)                      │
│    │        │ helped_by ──► USER (mentee)                     │
│    │        │ connected ► USER                                  │
│    │                                                                  │
│    └──────────┐                                                 │
│               │ has ──────► SKILL (value object)               │
│               │ has ──────► INTEREST (value object)            │
│               │ has ──────► GOAL (value object)                │
│                                                                  │
│  OPPORTUNITY ──┐                                                │
│    │        matches ──► USER                                    │
│    │        created_by ► USER                                  │
│    │        requires ──► SKILL                                  │
│    │        for_stage ──► JOURNEY_STAGE                        │
│                                                                  │
│  MATCH ────────┐                                                │
│    │        between USER and OPPORTUNITY                       │
│    │        reasoned_by AI                                      │
│                                                                  │
│  CONTRIBUTION ──┐                                              │
│    │        by USER                                             │
│    │        for OPPORTUNITY                                    │
│    │        verified_by USER                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Rules/Constraints

```
┌─────────────────────────────────────────────────────────────────┐
│                       ONTOLOGY RULES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. USER can only see OPPORTUNITY if:                         │
│     - opportunity.stage_min <= user.journey.stage              │
│     - opportunity.stage_max >= user.journey.stage              │
│     - match.score > 0.3 (threshold)                            │
│                                                                 │
│  2. AI can only suggest OPPORTUNITY if:                       │
│     - user has at least one matching skill                     │
│     - user expressed similar interest                           │
│     - not previously rejected by user                          │
│                                                                 │
│  3. JOURNEY.stage can only advance if:                         │
│     - previous milestone completed                               │
│     - reflection provided                                       │
│     - mentor approval (for stages 3+)                          │
│                                                                 │
│  4. CONTRIBUTION can only be verified if:                      │
│     - 2+ other users approve                                    │
│     - evidence provided                                         │
│                                                                 │
│  5. AI response must:                                          │
│     - reference only known entities                             │
│     - use only defined relationships                            │
│     - cite source for factual claims                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation for Our Platform

### Layer 1: Data Schema (SQLAlchemy/Pydantic)

```python
from pydantic import BaseModel
from enum import Enum
from typing import List, Optional
from datetime import datetime

# Entity Types
class User(BaseModel):
    id: str
    vault_id: str
    journey_stage: int = 0
    created_at: datetime
    
class Vault(BaseModel):
    id: str
    owner_id: str
    private_data: dict  # intentions, challenges
    public_data: dict    # skills, interests

class Opportunity(BaseModel):
    id: str
    title: str
    description: str
    type: str  # job, project, mentorship, event
    requirements: dict
    stage_min: int = 0
    stage_max: int = 9
    created_by: str

class Match(BaseModel):
    id: str
    user_id: str
    opportunity_id: str
    score: float
    status: str = "suggested"
    reasoning: str

# Relationships (via foreign keys)
# - User.vault_id -> Vault.id
# - Match.user_id -> User.id  
# - Match.opportunity_id -> Opportunity.id
# - Opportunity.created_by -> User.id
```

### Layer 2: Validators (Rules Engine)

```python
from typing import List
from pydantic import validator

class OpportunityValidator:
    @staticmethod
    def can_suggest(user: User, opportunity: Opportunity, match_score: float) -> bool:
        # Rule 1: Journey stage compatibility
        if not (opportunity.stage_min <= user.journey_stage <= opportunity.stage_max):
            return False
        
        # Rule 2: Minimum match score
        if match_score < 0.3:
            return False
        
        # Rule 3: Not previously rejected
        # (check match history)
        
        return True

class JourneyValidator:
    @staticmethod
    def can_advance(user: User, milestone_completed: bool, reflection: str) -> bool:
        if not milestone_completed:
            return False
        if not reflection or len(reflection) < 20:
            return False
        return True
```

### Layer 3: AI Constraints (System Prompt)

```python
SYSTEM_PROMPT = """You are a Youth Platform AI Guide.

CONTEXT CONSTRAINTS:
- You can only reference entities that exist in the user's vault
- You can only suggest opportunities from the verified database
- You cannot make up skills, achievements, or relationships
- Always cite your sources when making claims

ONTOLOGY BOUNDS:
- User has: skills[], interests[], goals[], journey_stage(0-9)
- Opportunity has: title, type, requirements, stage_range
- Valid actions: suggest_opportunity, advance_journey, update_vault

If you don't know something, say "I don't have that information" 
rather than making something up.

Remember: You are guiding, not dictating. The user owns their journey.
"""
```

### Layer 4: Query Builder (Safe Retrieval)

```python
from sqlalchemy import select, and_

class OntologyQuery:
    """Safe queries that respect ontology bounds"""
    
    @staticmethod
    def get_matching_opportunities(user_id: str, db) -> List[Opportunity]:
        user = db.query(User).get(user_id)
        
        # Ontology-constrained query
        stmt = select(Opportunity).where(
            and_(
                Opportunity.stage_min <= user.journey_stage,
                Opportunity.stage_max >= user.journey_stage,
                # Only opportunities with user's skills
                Opportunity.requirements['skills'].overlap(user.skills)
            )
        )
        
        return db.execute(stmt).fetchall()
    
    @staticmethod
    def get_user_context(user_id: str, db) -> dict:
        """Retrieve only defined attributes"""
        user = db.query(User).get(user_id)
        vault = db.query(Vault).filter_by(owner_id=user_id).first()
        
        return {
            # Only these attributes exist in our ontology
            "skills": vault.public_data.get("skills", []),
            "interests": vault.public_data.get("interests", []),
            "journey_stage": user.journey_stage,
            "milestones": vault.private_data.get("milestones", [])
        }
```

---

## Why This Solves Our Problems

### Kristaps' Objections & Ontology Solutions

| Objection | Ontology Solution |
|-----------|-------------------|
| "Overly complicated" | Clear entity types, predictable behavior |
| "Won't work before network effects" | Individual value through structured guidance |
| "Data used against me" | Explicit rules, user controls vault |
| "Overpromises" | Constrained AI can't overclaim |

---

## The Semantic Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEMANTIC LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              USER INTERFACE                              │   │
│  │    (Telegram, Web, Mobile)                              │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │              AI LAYER (LLM)                              │   │
│  │    - Receives constrained context                        │   │
│  │    - Operates within ontology bounds                     │   │
│  │    - Can only query, not fabricate                       │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │              ONTOLOGY LAYER                               │   │
│  │    ┌─────────────┬─────────────┬─────────────┐         │   │
│  │    │  Entities   │Relationships │   Rules     │         │   │
│  │    │  (Schema)   │   (Graph)   │ (Validation) │         │   │
│  │    └─────────────┴─────────────┴─────────────┘         │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │              DATA LAYER                                   │   │
│  │    (SQLite + Encrypted Vaults)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. [ ] Define complete entity schema
2. [ ] Build validators for all rules
3. [ ] Create AI constraint system prompt
4. [ ] Implement query builder
5. [ ] Add ontology to Phase 0 implementation

---

*Research: 2026-03-14*
*Inspired by Palantir's ontology approach*
