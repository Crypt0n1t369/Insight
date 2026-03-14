# Phase 1: Core Experience - Detailed Implementation Guide

## Goal
User has personalized experience with journey tracking, basic matching, and NPC interactions.

## Week 3: Journey + Database

### Day 11: Journey State Machine

#### `src/journey/engine.py`
```python
"""
Journey State Machine - Hero's Journey implementation
"""
from enum import Enum
from dataclasses import dataclass, field
from typing import Optional
import json
from datetime import datetime

class JourneyStage(Enum):
    ORDINARY = 0       # User's current life
    CALL = 1           # Opportunity presented
    DEPARTURE = 2      # User commits
    MENTOR = 3         # Guide appears
    TRIALS = 4         # Challenges begin
    ORDEAL = 5         # Core challenge
    REWARD = 6         # Growth achieved
    RETURN = 7         # Apply learning
    TRANSFORMATION = 8 # User becomes guide
    ELIXIR = 9         # Help others

STAGE_NAMES = {
    0: "Ordinary World",
    1: "Call to Adventure", 
    2: "Departure",
    3: "Meeting the Mentor",
    4: "Tests and Trials",
    5: "Ordeal",
    6: "Reward",
    7: "Return with Elixir",
    8: "Transformation",
    9: "Elixir - Helping Others"
}

@dataclass
class StageInfo:
    name: str
    description: str
    typical_duration: str  # sessions
    opportunities_unlocked: list[str]
    npcs_appropriate: list[str]

STAGE_INFO = {
    0: StageInfo(
        "Ordinary World",
        "Your current life situation. The journey begins here.",
        "1-2 sessions",
        ["self_assessment", "exploration"],
        ["mentor"]
    ),
    1: StageInfo(
        "Call to Adventure",
        "An opportunity or challenge has appeared.",
        "1 session",
        ["opportunity_1", "challenge_intro"],
        ["mentor", "trickster"]
    ),
    2: StageInfo(
        "Departure",
        "You've committed to the journey.",
        "1-2 sessions",
        ["first_mission", "resource_gathering"],
        ["mentor", "ally"]
    ),
    3: StageInfo(
        "Meeting the Mentor",
        "A guide appears to help you.",
        "2-3 sessions",
        ["mentor_quest", "skill_building"],
        ["mentor"]
    ),
    4: StageInfo(
        "Tests and Trials",
        "Challenges test your resolve.",
        "3-5 sessions",
        ["challenges", "skill_tests"],
        ["ally", "shadow"]
    ),
    5: StageInfo(
        "Ordeal",
        "The deepest challenge. Growth happens here.",
        "2-4 sessions",
        ["major_challenge"],
        ["mentor", "shadow"]
    ),
    6: StageInfo(
        "Reward",
        "Victory and new capabilities.",
        "1-2 sessions",
        ["reward_claim", "new_capability"],
        ["ally"]
    ),
    7: StageInfo(
        "Return",
        "Bringing learning back to ordinary world.",
        "2-3 sessions",
        ["integration", "application"],
        ["mentor"]
    ),
    8: StageInfo(
        "Transformation",
        "You've fundamentally changed.",
        "2-3 sessions",
            ["mentor_others", "leadership"],
        ["ally"]
    ),
    9: StageInfo(
        "Elixir",
        "You help others on their journeys.",
        "Ongoing",
        ["helping", "contribution"],
        []
    )
}

class JourneyEngine:
    """Manages user journey through stages"""
    
    def __init__(self, vault_data: dict):
        self.private = vault_data.get("private", {})
        self.journey_stage = self.private.get("journey_stage", 0)
        self.milestones = self.private.get("milestones", [])
        self.reflections = self.private.get("reflections", [])
    
    def get_current_stage(self) -> dict:
        """Get current journey stage info"""
        return {
            "stage": self.journey_stage,
            "name": STAGE_NAMES[self.journey_stage],
            "info": STAGE_INFO[self.journey_stage].__dict__,
            "progress": self._calculate_progress()
        }
    
    def advance_stage(self, reflection: str = "") -> dict:
        """Move to next stage"""
        if self.journey_stage >= 9:
            return {"error": "Already at final stage"}
        
        # Record milestone
        self.milestones.append({
            "stage": self.journey_stage,
            "completed_at": datetime.now().isoformat(),
            "reflection": reflection
        })
        
        self.journey_stage += 1
        
        return self.get_current_stage()
    
    def can_advance(self) -> bool:
        """Check if user can advance (optional: check requirements)"""
        return self.journey_stage < 9
    
    def get_stage_opportunities(self) -> list[str]:
        """Get opportunities appropriate for current stage"""
        return STAGE_INFO[self.journey_stage].opportunities_unlocked
    
    def _calculate_progress(self) -> float:
        """Calculate journey progress percentage"""
        return (self.journey_stage / 9) * 100
    
    def to_dict(self) -> dict:
        """Export journey state for vault storage"""
        return {
            "journey_stage": self.journey_stage,
            "milestones": self.milestones,
            "reflections": self.reflections
        }
```

### Day 12-13: SQLite Database

#### `src/database/schema.py`
```python
"""
Database schema and initialization
"""
import sqlite3
from pathlib import Path
from typing import Optional
import json

DB_PATH = Path("/home/drg/.openclaw/workspace/data/platform.db")

def init_db():
    """Initialize database with schema"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT,
            journey_stage INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Activities table (opportunities)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activities (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            tags TEXT,
            requirements TEXT,
            stage_min INTEGER DEFAULT 0,
            stage_max INTEGER DEFAULT 9,
            created_by TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Matches table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            activity_id TEXT,
            score REAL,
            presented BOOLEAN DEFAULT FALSE,
            responded BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (activity_id) REFERENCES activities(id)
        )
    """)
    
    # Contributions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contributions (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            type TEXT,
            content TEXT,
            attributed_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    conn.commit()
    conn.close()
    
    return DB_PATH

def seed_sample_activities():
    """Seed database with sample opportunities"""
    import uuid
    
    activities = [
        # Stage 0-1: Self-assessment & exploration
        {
            "title": "Self-Assessment Quest",
            "description": "Discover your strengths, values, and aspirations through guided reflection.",
            "category": "challenge",
            "tags": json.dumps(["self-discovery", "values", "strengths"]),
            "stage_min": 0, "stage_max": 1
        },
        {
            "title": "Explore Opportunities",
            "description": "Browse available roles, projects, and challenges that match your interests.",
            "category": "task",
            "tags": json.dumps(["exploration", "matching"]),
            "stage_min": 0, "stage_max": 2
        },
        # Stage 1-2: Opportunity introduction
        {
            "title": "Youth Leadership Program",
            "description": "Join a 12-week leadership development program for young changemakers.",
            "category": "role",
            "tags": json.dumps(["leadership", "development", "cohort"]),
            "stage_min": 1, "stage_max": 3
        },
        {
            "title": "Community Project Volunteer",
            "description": "Contribute to local community initiatives and earn experience.",
            "category": "task",
            "tags": json.dumps(["volunteer", "community", "experience"]),
            "stage_min": 1, "stage_max": 4
        },
        # Stage 3-4: Mentorship & trials
        {
            "title": "Mentorship Matching",
            "description": "Get matched with a mentor in your field of interest.",
            "category": "role",
            "tags": json.dumps(["mentor", "guidance", "growth"]),
            "stage_min": 2, "stage_max": 5
        },
        {
            "title": "Skills Workshop Series",
            "description": "Weekly workshops to build practical skills in your domain.",
            "category": "event",
            "tags": json.dumps(["skills", "learning", "workshop"]),
            "stage_min": 3, "stage_max": 6
        },
        # Stage 5-6: Ordeal & reward
        {
            "title": "Capstone Project",
            "description": "Apply everything you've learned in a real-world project.",
            "category": "challenge",
            "tags": json.dumps(["project", "application", "achievement"]),
            "stage_min": 5, "stage_max": 7
        },
        {
            "title": "Certification Program",
            "description": "Earn certification in your chosen field.",
            "category": "role",
            "tags": json.dumps(["certification", "credential", "achievement"]),
            "stage_min": 6, "stage_max": 8
        },
        # Stage 8-9: Transformation & giving back
        {
            "title": "Become a Mentor",
            "description": "Share your experience and guide others on their journey.",
            "category": "role",
            "tags": json.dumps(["mentor", "giving-back", "leadership"]),
            "stage_min": 8, "stage_max": 9
        },
        {
            "title": "Contribute an Idea",
            "description": "Share your ideas to help others in the community.",
            "category": "idea",
            "tags": json.dumps(["contribution", "ideas", "sharing"]),
            "stage_min": 6, "stage_max": 9
        }
    ]
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for activity in activities:
        activity["id"] = str(uuid.uuid4())
        activity["created_by"] = "system"
        activity["requirements"] = json.dumps([])
        
        cursor.execute("""
            INSERT OR IGNORE INTO activities 
            (id, title, description, category, tags, requirements, stage_min, stage_max, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            activity["id"], activity["title"], activity["description"],
            activity["category"], activity["tags"], activity["requirements"],
            activity["stage_min"], activity["stage_max"], activity["created_by"]
        ))
    
    conn.commit()
    conn.close()

# Run initialization
if __name__ == "__main__":
    init_db()
    seed_sample_activities()
    print("Database initialized with sample activities")
```

### Day 14-15: Journey API Integration

#### `src/api/routes_journey.py`
```python
"""
Journey API endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sqlite3
import json
from pathlib import Path

from journey.engine import JourneyEngine, STAGE_NAMES

router = APIRouter(prefix="/api/journey", tags=["journey"])

DB_PATH = Path("/home/drg/.openclaw/workspace/data/platform.db")

class AdvanceStageRequest(BaseModel):
    user_id: str
    reflection: Optional[str] = ""

@router.get("/{user_id}")
def get_journey(user_id: str):
    """Get user's current journey state"""
    # Load vault for journey data
    from vault.manager import VaultManager
    vault_manager = VaultManager()
    
    try:
        # For MVP, require passphrase (in production, use session)
        vault_data = vault_manager.load_vault(user_id, "temp")
    except:
        raise HTTPException(status_code=404, detail="User not found")
    
    engine = JourneyEngine(vault_data)
    return engine.get_current_stage()

@router.post("/advance")
def advance_journey(request: AdvanceStageRequest):
    """Advance user to next journey stage"""
    from vault.manager import VaultManager
    vault_manager = VaultManager()
    
    try:
        vault_data = vault_manager.load_vault(request.user_id, "temp")
    except:
        raise HTTPException(status_code=404, detail="User not found")
    
    engine = JourneyEngine(vault_data)
    
    if not engine.can_advance():
        raise HTTPException(status_code=400, detail="Already at final stage")
    
    result = engine.advance_stage(request.reflection)
    
    # Save updated journey to vault
    vault_data["private"]["journey_stage"] = engine.journey_stage
    vault_data["private"]["milestones"] = engine.milestones
    vault_manager.save_vault(request.user_id, "temp", vault_data)
    
    # Update user table
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET journey_stage = ? WHERE user_id = ?",
        (engine.journey_stage, request.user_id)
    )
    conn.commit()
    conn.close()
    
    return result

@router.get("/{user_id}/opportunities")
def get_stage_opportunities(user_id: str):
    """Get opportunities appropriate for user's current stage"""
    from vault.manager import VaultManager
    vault_manager = VaultManager()
    
    try:
        vault_data = vault_manager.load_vault(user_id, "temp")
    except:
        raise HTTPException(status_code=404, detail="User not found")
    
    engine = JourneyEngine(vault_data)
    stage = engine.journey_stage
    
    # Query activities for this stage
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, description, category, tags
        FROM activities
        WHERE stage_min <= ? AND stage_max >= ?
        ORDER BY stage_min
    """, (stage, stage))
    
    activities = []
    for row in cursor.fetchall():
        activities.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "category": row[3],
            "tags": json.loads(row[4])
        })
    
    conn.close()
    
    return {
        "stage": stage,
        "stage_name": STAGE_NAMES[stage],
        "activities": activities
    }
```

---

## Week 4: Matching + NPCs

### Day 16-17: Matching Engine

#### `src/matching/engine.py`
```python
"""
Matching Engine - TF-IDF based user-activity matching
"""
import json
import sqlite3
from pathlib import Path
from typing import List, Dict
from collections import Counter
import re

DB_PATH = Path("/home/drg/.openclaw/workspace/data/platform.db")

class MatchingEngine:
    """Matches users to activities based on profile and interests"""
    
    def __init__(self):
        self.stop_words = set([
            'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'must', 'shall',
            'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
            'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
            'through', 'during', 'before', 'after', 'above', 'below',
            'between', 'under', 'again', 'further', 'then', 'once',
            'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either',
            'neither', 'not', 'only', 'own', 'same', 'than', 'too',
            'very', 'just', 'also'
        ])
    
    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into words"""
        text = text.lower()
        words = re.findall(r'\w+', text)
        return [w for w in words if w not in self.stop_words and len(w) > 2]
    
    def _tf(self, tokens: List[str]) -> Dict[str, float]:
        """Calculate term frequency"""
        total = len(tokens)
        if total == 0:
            return {}
        counts = Counter(tokens)
        return {word: count / total for word, count in counts.items()}
    
    def _idf(self, documents: List[List[str]]) -> Dict[str, float]:
        """Calculate inverse document frequency"""
        import math
        
        n_docs = len(documents)
        df = Counter()
        
        for doc in documents:
            unique_words = set(doc)
            for word in unique_words:
                df[word] += 1
        
        return {
            word: math.log(n_docs / (1 + count))
            for word, count in df.items()
        }
    
    def _cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        """Calculate cosine similarity between two vectors"""
        common = set(vec1.keys()) & set(vec2.keys())
        
        if not common:
            return 0.0
        
        dot_product = sum(vec1[w] * vec2[w] for w in common)
        mag1 = sum(vec1[w] ** 2 for w in vec1) ** 0.5
        mag2 = sum(vec2[w] ** 2 for w in vec2) ** 0.5
        
        if mag1 == 0 or mag2 == 0:
            return 0.0
        
        return dot_product / (mag1 * mag2)
    
    def build_user_profile(self, vault_data: dict) -> List[str]:
        """Build tokenized profile from user vault"""
        tokens = []
        
        # Private data
        private = vault_data.get("private", {})
        for intention in private.get("intentions", []):
            if isinstance(intention, str):
                tokens.extend(self._tokenize(intention))
        
        for challenge in private.get("challenges", []):
            if isinstance(challenge, str):
                tokens.extend(self._tokenize(challenge))
        
        # Public data
        public = vault_data.get("public", {})
        for skill in public.get("skills", []):
            if isinstance(skill, str):
                tokens.extend(self._tokenize(skill))
        
        for interest in public.get("interests", []):
            if isinstance(interest, str):
                tokens.extend(self._tokenize(interest))
        
        return tokens
    
    def get_all_activity_tokens(self) -> List[tuple]:
        """Get all activities as tokenized documents"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, title, description, tags, category
            FROM activities
        """)
        
        activities = []
        for row in cursor.fetchall():
            tokens = []
            tokens.extend(self._tokenize(row[1]))  # title
            tokens.extend(self._tokenize(row[2] or ""))  # description
            # Tags
            try:
                tags = json.loads(row[3])
                for tag in tags:
                    tokens.extend(self._tokenize(tag))
            except:
                pass
            tokens.extend(self._tokenize(row[4]))  # category
            
            activities.append((row[0], tokens))
        
        conn.close()
        return activities
    
    def find_matches(self, vault_data: dict, top_k: int = 5) -> List[Dict]:
        """Find top matching activities for user"""
        # Get user tokens
        user_tokens = self.build_user_profile(vault_data)
        
        if not user_tokens:
            # Return default activities if no profile
            return self._get_default_activities(top_k)
        
        user_tf = self._tf(user_tokens)
        
        # Get activity IDF (precompute in production)
        activity_docs = self.get_all_activity_tokens()
        
        # Calculate similarities
        similarities = []
        for activity_id, activity_tokens in activity_docs:
            activity_tf = self._tf(activity_tokens)
            score = self._cosine_similarity(user_tf, activity_tf)
            
            if score > 0:  # Only positive matches
                similarities.append((activity_id, score))
        
        # Sort by score
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Get top k activities
        top_matches = similarities[:top_k]
        
        # Fetch activity details
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        results = []
        for activity_id, score in top_matches:
            cursor.execute("""
                SELECT id, title, description, category, tags
                FROM activities WHERE id = ?
            """, (activity_id,))
            
            row = cursor.fetchone()
            if row:
                results.append({
                    "id": row[0],
                    "title": row[1],
                    "description": row[2],
                    "category": row[3],
                    "tags": json.loads(row[4]) if row[4] else [],
                    "score": round(score, 3)
                })
        
        conn.close()
        return results
    
    def _get_default_activities(self, top_k: int) -> List[Dict]:
        """Return default activities for new users"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(f"""
            SELECT id, title, description, category, tags
            FROM activities
            LIMIT {top_k}
        """)
        
        results = []
        for row in cursor.fetchall():
            results.append({
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "category": row[3],
                "tags": json.loads(row[4]) if row[4] else [],
                "score": 0.5  # Default score
            })
        
        conn.close()
        return results
```

### Day 18-19: NPC Character System

#### `src/characters/base.py`
```python
"""
NPC Character System - Template-based character responses
"""
from enum import Enum
from typing import Optional
from dataclasses import dataclass
import random

class CharacterType(Enum):
    MENTOR = "mentor"        # Wise guide
    TRICKSTER = "trickster" # Challenge assumptions
    ALLY = "ally"           # Supportive companion
    SHADOW = "shadow"        # Represents growth edges

@dataclass
class Character:
    name: str
    type: CharacterType
    greeting: str
    style: dict  # Response style guidelines
    
    def generate_response(self, context: dict, user_message: str) -> str:
        """Generate character response"""
        # Template-based for MVP
        # Later: LLM-powered
        
        if self.type == CharacterType.MENTOR:
            return self._mentor_response(context, user_message)
        elif self.type == CharacterType.TRICKSTER:
            return self._trickster_response(context, user_message)
        elif self.type == CharacterType.ALLY:
            return self._ally_response(context, user_message)
        else:  # SHADOW
            return self._shadow_response(context, user_message)
    
    def _mentor_response(self, context: dict, user_message: str) -> str:
        """Mentor character responses"""
        stage = context.get("journey_stage", 0)
        
        responses = {
            0: "Welcome, young traveler. Your journey begins with knowing yourself. What do you truly seek?",
            1: "The call has come. Many hear it but few answer. Will you?",
            2: "Courage is not the absence of fear, but the decision that there is something more important. You have chosen well.",
            3: "I was once where you are now. The path ahead is challenging but rewarding.",
            # ... more stages
        }
        
        base = responses.get(stage, "Tell me more about what you're facing.")
        
        # Add personalized element based on user data
        intentions = context.get("intentions", [])
        if intentions:
            base += f" I sense your intention to {intentions[0]} drives you."
        
        return base
    
    def _trickster_response(self, context: dict, user_message: str) -> str:
        """Trickster character - challenges assumptions"""
        tricks = [
            "What if you're wrong about what you want?",
            "Have you considered the opposite?",
            "That sounds reasonable... but reasonable is rarely remarkable.",
            "Everyone thinks they know. Few are willing to question.",
            "The obvious path is rarely the right one."
        ]
        
        return random.choice(tricks)
    
    def _ally_response(self, context: dict, user_message: str) -> str:
        """Ally character - supportive"""
        allies = [
            "You've got this! I've seen others face similar challenges.",
            "Remember, progress isn't always linear. Every step counts.",
            "I'm here with you. What do you need?",
            "Your determination inspires me. Keep going.",
            "Challenges are just opportunities in disguise."
        ]
        
        return random.choice(allies)
    
    def _shadow_response(self, context: dict, user_message: str) -> str:
        """Shadow character - represents what holds user back"""
        shadows = [
            "That fear you're avoiding... it's trying to tell you something.",
            "You've been here before. Same choice, different day.",
            "Comfort is the enemy of growth. Are you comfortable?",
            "The voice in your head that says you can't? That's the shadow talking.",
            "What you're avoiding is exactly what you need to face."
        ]
        
        return random.choice(shadows)

# Character registry
CHARACTERS = {
    "sage": Character(
        name="Sage",
        type=CharacterType.MENTOR,
        greeting="Greetings, traveler. I am here to guide you.",
        style={"tone": "wise", "length": "medium"}
    ),
    "jester": Character(
        name="Jester",
        type=CharacterType.TRICKSTER,
        greeting="Oh, another serious one. Let me lighten things up.",
        style={"tone": "playful", "length": "short"}
    ),
    "companion": Character(
        name="Companion",
        type=CharacterType.ALLY,
        greeting="Hey! I'm here with you on this journey.",
        style={"tone": "supportive", "length": "short"}
    ),
    "shadow": Character(
        name="Shadow",
        type=CharacterType.SHADOW,
        greeting="...",
        style={"tone": "challenging", "length": "medium"}
    )
}

def get_character(name: str) -> Optional[Character]:
    """Get character by name"""
    return CHARACTERS.get(name.lower())

def get_appropriate_characters(stage: int) -> list[Character]:
    """Get characters appropriate for journey stage"""
    mapping = {
        0: ["sage", "companion"],
        1: ["sage", "jester"],
        2: ["sage", "companion"],
        3: ["sage"],
        4: ["companion", "shadow"],
        5: ["sage", "shadow"],
        6: ["companion"],
        7: ["sage"],
        8: ["companion"],
        9: []
    }
    
    names = mapping.get(stage, ["sage", "companion"])
    return [CHARACTERS[n] for n in names if n in CHARACTERS]
```

---

## Week 5: Interaction Objectives + Polish

### Day 21-22: Interaction Objectives

#### `src/agent/objectives.py`
```python
"""
Interaction Objectives - Each session has a purpose
"""
from enum import Enum
from dataclasses import dataclass
from typing import Optional

class InteractionObjective(Enum):
    EXPLORATION = "explore"      # Discover opportunities
    CLARIFICATION = "clarify"   # Refine understanding
    COMMITMENT = "commit"       # Take action
    REFLECTION = "reflect"      # Review progress
    CONTRIBUTION = "contribute" # Share with others

@dataclass
class ObjectiveHandler:
    objective: InteractionObjective
    
    def should_present_opportunities(self) -> bool:
        """Should agent present matching opportunities?"""
        return self.objective in [
            InteractionObjective.EXPLORATION,
            InteractionObjective.CLARIFICATION
        ]
    
    def should_ask_questions(self) -> bool:
        """Should agent ask clarifying questions?"""
        return self.objective in [
            InteractionObjective.CLARIFICATION,
            InteractionObjective.REFLECTION
        ]
    
    def should_encourage_action(self) -> bool:
        """Should agent push for commitment?"""
        return self.objective == InteractionObjective.COMMITMENT
    
    def response_style(self) -> dict:
        """Get response style guidelines"""
        styles = {
            InteractionObjective.EXPLORATION: {
                "tone": "curious",
                "length": "medium",
                "include_options": True
            },
            InteractionObjective.CLARIFICATION: {
                "tone": "inquisitive", 
                "length": "short",
                "ask_questions": True
            },
            InteractionObjective.COMMITMENT: {
                "tone": "direct",
                "length": "short",
                "present_next_steps": True
            },
            InteractionObjective.REFLECTION: {
                "tone": "contemplative",
                "length": "long",
                "summarize": True
            },
            InteractionObjective.CONTRIBUTION: {
                "tone": "appreciative",
                "length": "medium",
                "explain_benefit": True
            }
        }
        return styles.get(self.objective, {})

# Session objective manager
class ObjectiveManager:
    """Manages interaction objectives during session"""
    
    def __init__(self):
        self.current_objective: Optional[InteractionObjective] = None
        self.objective_history: list = []
    
    def set_objective(self, obj: InteractionObjective):
        """Set current session objective"""
        self.current_objective = obj
        self.objective_history.append({
            "objective": obj.value,
            "set_at": "now"
        })
    
    def detect_objective_from_message(self, message: str) -> InteractionObjective:
        """Detect objective from user message"""
        msg_lower = message.lower()
        
        if any(word in msg_lower for word in ["explore", "find", "discover", "browse", "what can"]):
            return InteractionObjective.EXPLORATION
        
        if any(word in msg_lower for word in ["confused", "unclear", "explain", "help me understand"]):
            return InteractionObjective.CLARIFICATION
        
        if any(word in msg_lower for word in ["decide", "commit", "do it", "going for", "sign up"]):
            return InteractionObjective.COMMITMENT
        
        if any(word in msg_lower for word in ["reflect", "review", "progress", "how am i", "summary"]):
            return InteractionObjective.REFLECTION
        
        if any(word in msg_lower for word in ["share", "contribute", "add", "idea", "create"]):
            return InteractionObjective.CONTRIBUTION
        
        # Default to exploration
        return InteractionObjective.EXPLORATION
    
    def get_handler(self) -> Optional[ObjectiveHandler]:
        """Get handler for current objective"""
        if self.current_objective:
            return ObjectiveHandler(self.current_objective)
        return None
```

### Day 23-25: Integration & Testing

#### Complete integration test flow:
1. User starts → vault created
2. User sets intentions → saved to vault
3. User asks to explore → matching engine finds activities
4. User commits → journey advances
5. NPC responds based on stage

---

## Phase 1 Success Criteria

| Criterion | Test |
|-----------|------|
| Journey tracked | Stage advances correctly |
| Matching works | Relevant activities returned |
| NPCs respond | Characters give appropriate responses |
| Objectives affect flow | Different responses per objective |
| Full flow works | Complete user journey test |

---

*Phase 1 Implementation Guide: 2026-03-14*
*Ready to build after Phase 0*
