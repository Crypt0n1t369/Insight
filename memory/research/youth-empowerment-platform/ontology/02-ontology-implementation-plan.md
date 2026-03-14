# Youth Platform - Ontology Implementation Plan

## Overview

This document outlines how to implement an ontology-driven semantic layer for the Youth Platform. The ontology constrains AI behavior, reduces hallucinations, and provides structure even with few users.

---

## Implementation Phases

### Phase 1: Core Schema (Week 1)

#### Entities to Define

| Entity | Attributes | Priority |
|--------|-----------|----------|
| **User** | id, name, journey_stage, created_at | Critical |
| **Vault** | id, owner_id, private_data, public_data | Critical |
| **Opportunity** | id, title, type, requirements, stage_range | Critical |
| **Match** | id, user_id, opportunity_id, score, status | High |
| **Journey** | id, user_id, stage, milestones | High |
| **Contribution** | id, user_id, type, content, impact | Medium |

#### Implementation

```python
# src/ontology/schema.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class JourneyStage(int, Enum):
    ORDINARY = 0
    CALL = 1  
    DEPARTURE = 2
    MENTOR = 3
    TRIALS = 4
    ORDEAL = 5
    REWARD = 6
    RETURN = 7
    TRANSFORMATION = 8
    ELIXIR = 9

class OpportunityType(str, Enum):
    JOB = "job"
    PROJECT = "project"
    MENTORSHIP = "mentorship"
    EVENT = "event"
    CHALLENGE = "challenge"

class User(BaseModel):
    id: str = Field(..., description="Unique user identifier")
    journey_stage: JourneyStage = Field(default=JourneyStage.ORDINARY)
    created_at: datetime = Field(default_factory=datetime.now)

class Vault(BaseModel):
    id: str
    owner_id: str
    private_data: dict = Field(default_factory=dict)
    public_data: dict = Field(default_factory=dict)

class Opportunity(BaseModel):
    id: str
    title: str
    description: str
    type: OpportunityType
    requirements: dict = Field(default_factory=dict)
    stage_min: int = 0
    stage_max: int = 9
    created_by: Optional[str] = None

class Match(BaseModel):
    id: str
    user_id: str
    opportunity_id: str
    score: float = Field(..., ge=0, le=1)
    status: str = "suggested"  # suggested, viewed, engaged, completed
    reasoning: str = ""
```

---

### Phase 2: Relationships & Graph (Week 2)

#### Relationship Types

```
USER owns VAULT
USER has JOURNEY
USER creates OPPORTUNITY
USER makes CONTRIBUTION
USER matched_to OPPORTUNITY (via MATCH)
OPPORTUNITY requires_skill SKILL
OPPORTUNITY for_stage JOURNEY_STAGE
CONTRIBUTION verified_by USER
```

#### Implementation

```python
# src/ontology/relationships.py
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class Relationship:
    from_entity: str
    to_entity: str
    relationship_type: str
    properties: dict = None

# Valid relationships (ontology-defined)
VALID_RELATIONSHIPS = {
    "User": {
        "owns": "Vault",
        "has": "Journey",
        "creates": "Opportunity", 
        "makes": "Contribution",
        "matched_to": "Opportunity",
        "helped_by": "User",
        "mentors": "User"
    },
    "Opportunity": {
        "requires_skill": "Skill",
        "for_stage": "JourneyStage",
        "created_by": "User"
    },
    "Contribution": {
        "by": "User",
        "verified_by": "User"
    },
    "Match": {
        "between": ["User", "Opportunity"]
    }
}

def is_valid_relationship(from_type: str, rel: str, to_type: str) -> bool:
    """Check if relationship is defined in ontology"""
    valid_targets = VALID_RELATIONSHIPS.get(from_type, {}).get(rel, [])
    if isinstance(valid_targets, list):
        return to_type in valid_targets
    return valid_targets == to_type
```

---

### Phase 3: Rules & Validation (Week 3)

#### Rules Engine

```python
# src/ontology/rules.py
from typing import List
from .schema import User, Opportunity, Match, JourneyStage

class OntologyRules:
    """Enforce ontology constraints"""
    
    @staticmethod
    def can_suggest_opportunity(user: User, opportunity: Opportunity, score: float) -> tuple[bool, str]:
        """Rule: AI can only suggest valid matches"""
        
        # Rule 1: Journey stage compatibility
        if not (opportunity.stage_min <= user.journey_stage <= opportunity.stage_max):
            return False, f"User at stage {user.journey_stage} but opportunity requires {opportunity.stage_min}-{opportunity.stage_max}"
        
        # Rule 2: Minimum match score
        if score < 0.3:
            return False, f"Score {score} below threshold 0.3"
        
        # Rule 3: User has relevant skills
        # (check overlap with opportunity requirements)
        
        return True, "Valid match"
    
    @staticmethod
    def can_advance_journey(user: User, milestone_completed: bool, reflection: str) -> tuple[bool, str]:
        """Rule: Journey stage advancement"""
        
        if not milestone_completed:
            return False, "No milestone completed"
        
        if len(reflection) < 20:
            return False, f"Reflection too short ({len(reflection)} chars)"
        
        return True, "Can advance"
    
    @staticmethod
    def validate_ai_response(context: dict, response: str) -> tuple[bool, List[str]]:
        """Rule: AI response must be grounded in ontology"""
        
        # Check: response only references known entities
        # Check: no fabricated relationships
        # Check: cites sources
        
        issues = []
        
        # Example validation
        if "skill" in response.lower():
            user_skills = context.get("skills", [])
            if not any(skill in response for skill in user_skills):
                issues.append("AI referenced unknown skill")
        
        return len(issues) == 0, issues
```

---

### Phase 4: AI Constraints (Week 4)

#### System Prompt

```python
# src/ontology/ai_constraints.py

ONTOLOGY_SYSTEM_PROMPT = """You are a Youth Platform AI Guide.

You operate WITHIN an ontology - a strict framework that defines:
- What entities exist (User, Vault, Opportunity, Journey, Match, Contribution)
- What relationships are valid (USER owns VAULT, USER matched_to OPPORTUNITY)
- What rules must be followed (score > 0.3, stage compatibility)

CONTEXT BOUNDS:
You receive only:
- User's public profile (skills, interests)
- User's journey stage
- Matching opportunities with scores
- User's history

You CANNOT:
- Reference skills the user doesn't have
- Suggest opportunities outside stage range
- Make up relationships
- Claim achievements not in vault

RESPONSE RULES:
1. Only suggest from provided opportunity list
2. Cite match score when recommending
3. If unsure, say "I don't have that information"
4. Focus on user's stated goals

Remember: You're a guide, not a creator. The user owns their journey.
"""

def build_context_prompt(user: User, vault: dict, opportunities: List[dict]) -> str:
    """Build constrained context for AI"""
    
    context = f"""User Profile:
- Skills: {', '.join(vault.get('public_data', {}).get('skills', []))}
- Interests: {', '.join(vault.get('public_data', {}).get('interests', []))}
- Journey Stage: {user.journey_stage.name}

Available Opportunities:
"""
    
    for opp in opportunities:
        context += f"""
- {opp['title']} (type: {opp['type']})
  Score: {opp['score']} | Stage: {opp['stage_min']}-{opp['stage_max']}
  {opp['description'][:100]}...
"""
    
    return ONTOLOGY_SYSTEM_PROMPT + "\n\n" + context
```

---

### Phase 5: Query Builder (Week 5)

#### Safe Data Access

```python
# src/ontology/query.py
from sqlalchemy import and_, or_, select
from typing import List, Optional
from .schema import User, Opportunity, Match
from .rules import OntologyRules

class OntologyQuery:
    """Safe queries that respect ontology"""
    
    def __init__(self, db):
        self.db = db
        self.rules = OntologyRules()
    
    def get_valid_opportunities(self, user_id: str) -> List[dict]:
        """Only return opportunities that pass ontology rules"""
        
        # Get user
        user = self.db.query(User).get(user_id)
        if not user:
            return []
        
        # Get all opportunities
        opportunities = self.db.query(Opportunity).all()
        
        valid = []
        for opp in opportunities:
            # Calculate match score (simplified)
            score = self._calculate_match_score(user, opp)
            
            # Apply rules
            can_suggest, reason = self.rules.can_suggest_opportunity(user, opp, score)
            
            if can_suggest:
                valid.append({
                    **opp.__dict__,
                    'score': score,
                    'reason': reason
                })
        
        # Sort by score
        return sorted(valid, key=lambda x: x['score'], reverse=True)
    
    def _calculate_match_score(self, user: User, opportunity: Opportunity) -> float:
        """Calculate match score within ontology bounds"""
        
        score = 0.0
        
        # Stage compatibility
        if opportunity.stage_min <= user.journey_stage <= opportunity.stage_max:
            score += 0.5
        
        # Skill match (from requirements)
        user_skills = []  # get from vault
        opp_skills = opportunity.requirements.get('skills', [])
        
        if opp_skills and user_skills:
            overlap = len(set(user_skills) & set(opp_skills))
            score += min(overlap * 0.25, 0.5)
        
        return min(score, 1.0)
    
    def get_user_context(self, user_id: str) -> dict:
        """Get only ontology-defined attributes"""
        
        user = self.db.query(User).get(user_id)
        vault = self.db.query(Vault).filter_by(owner_id=user_id).first()
        
        return {
            # Only these attributes exist in our ontology
            "id": user.id,
            "journey_stage": user.journey_stage,
            "skills": vault.public_data.get("skills", []) if vault else [],
            "interests": vault.public_data.get("interests", []) if vault [],
            "milestones": vault.private_data.get("milestones", []) if vault else []
        }
```

---

## Testing the Ontology

```python
# tests/test_ontology.py
import pytest
from src.ontology.schema import User, Opportunity, JourneyStage, OpportunityType
from src.ontology.rules import OntologyRules

def test_opportunity_stage_compatibility():
    """Test journey stage rules"""
    
    user = User(id="1", journey_stage=JourneyStage.CALL)
    opp = Opportunity(
        id="1", 
        title="Leadership Program",
        description="Learn leadership",
        type=OpportunityType.EVENT,
        stage_min=1,
        stage_max=3
    )
    
    rules = OntologyRules()
    valid, reason = rules.can_suggest_opportunity(user, opp, 0.5)
    
    assert valid == True

def test_match_score_threshold():
    """Test minimum score rule"""
    
    user = User(id="1", journey_stage=JourneyStage.ORDINARY)
    opp = Opportunity(
        id="1",
        title="Basic Workshop",
        description="Intro workshop",
        type=OpportunityType.EVENT,
        stage_min=0,
        stage_max=9
    )
    
    rules = OntologyRules()
    
    # Score too low
    valid, reason = rules.can_suggest_opportunity(user, opp, 0.2)
    assert valid == False
    assert "0.3" in reason
    
    # Score high enough
    valid, reason = rules.can_suggest_opportunity(user, opp, 0.5)
    assert valid == True
```

---

## Summary

| Phase | Focus | Deliverable |
|-------|-------|-------------|
| 1 | Schema | Entity definitions |
| 2 | Relationships | Graph structure |
| 3 | Rules | Validation engine |
| 4 | AI Constraints | System prompt |
| 5 | Query Builder | Safe data access |

---

*Implementation Plan: 2026-03-14*
