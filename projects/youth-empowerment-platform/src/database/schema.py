"""
Database schema and initialization for Youth Empowerment Platform
"""
import sqlite3
from pathlib import Path
from typing import Optional
import json
import uuid
from datetime import datetime

# Database path
DB_PATH = Path("/home/drg/.openclaw/workspace/data/platform.db")


def get_db_path() -> Path:
    """Get database path"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return DB_PATH


def init_db() -> Path:
    """Initialize database with schema"""
    db_path = get_db_path()
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Users table (links to vaults)
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
    
    # Matches table (user-activity matches)
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
    
    # Contributions table (user-submitted ideas/challenges)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contributions (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            type TEXT,
            title TEXT,
            content TEXT,
            tags TEXT,
            attributed_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    # Sessions table (agent session history)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ended_at TIMESTAMP,
            objective TEXT,
            messages_count INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)
    
    conn.commit()
    conn.close()
    
    print(f"Database initialized at: {db_path}")
    return db_path


def seed_sample_activities():
    """Seed database with sample opportunities"""
    db_path = get_db_path()
    
    activities = [
        # Stage 0-1: Self-assessment & exploration
        {
            "title": "Self-Assessment Quest",
            "description": "Discover your strengths, values, and aspirations through guided reflection exercises.",
            "category": "challenge",
            "tags": json.dumps(["self-discovery", "values", "strengths", "reflection"]),
            "stage_min": 0, "stage_max": 1
        },
        {
            "title": "Explore Opportunities",
            "description": "Browse available roles, projects, and challenges that match your interests.",
            "category": "task",
            "tags": json.dumps(["exploration", "matching", "discover"]),
            "stage_min": 0, "stage_max": 2
        },
        {
            "title": "Values Clarification",
            "description": "Deep dive into what truly matters to you and why.",
            "category": "challenge",
            "tags": json.dumps(["values", "clarity", "purpose"]),
            "stage_min": 0, "stage_max": 1
        },
        
        # Stage 1-2: Opportunity introduction
        {
            "title": "Youth Leadership Program",
            "description": "Join a 12-week leadership development program for young changemakers.",
            "category": "role",
            "tags": json.dumps(["leadership", "development", "cohort", "growth"]),
            "stage_min": 1, "stage_max": 3
        },
        {
            "title": "Community Project Volunteer",
            "description": "Contribute to local community initiatives and earn real-world experience.",
            "category": "task",
            "tags": json.dumps(["volunteer", "community", "experience", "impact"]),
            "stage_min": 1, "stage_max": 4
        },
        {
            "title": "Skills Shadowing",
            "description": "Observe and learn from professionals in fields you're interested in.",
            "category": "role",
            "tags": json.dumps(["mentorship", "shadowing", "learning"]),
            "stage_min": 1, "stage_max": 3
        },
        
        # Stage 3-4: Mentorship & trials
        {
            "title": "Find a Mentor",
            "description": "Get matched with a mentor in your field of interest for guidance.",
            "category": "role",
            "tags": json.dumps(["mentor", "guidance", "growth", "support"]),
            "stage_min": 2, "stage_max": 5
        },
        {
            "title": "Skills Workshop Series",
            "description": "Weekly workshops to build practical skills in your chosen domain.",
            "category": "event",
            "tags": json.dumps(["skills", "learning", "workshop", "development"]),
            "stage_min": 3, "stage_max": 6
        },
        {
            "title": "Team Challenge",
            "description": "Join a team to solve a real problem together.",
            "category": "challenge",
            "tags": json.dumps(["teamwork", "challenge", "collaboration"]),
            "stage_min": 3, "stage_max": 5
        },
        
        # Stage 5-6: Ordeal & reward
        {
            "title": "Capstone Project",
            "description": "Apply everything you've learned in a significant real-world project.",
            "category": "challenge",
            "tags": json.dumps(["project", "application", "achievement", "showcase"]),
            "stage_min": 5, "stage_max": 7
        },
        {
            "title": "Certification Program",
            "description": "Earn a certification in your chosen field to validate your skills.",
            "category": "role",
            "tags": json.dumps(["certification", "credential", "achievement"]),
            "stage_min": 6, "stage_max": 8
        },
        {
            "title": "Lead a Workshop",
            "description": "Teach others what you've learned by leading a workshop.",
            "category": "role",
            "tags": json.dumps(["teaching", "leadership", "giving-back"]),
            "stage_min": 6, "stage_max": 9
        },
        
        # Stage 8-9: Transformation & giving back
        {
            "title": "Become a Mentor",
            "description": "Share your experience and guide others on their journey.",
            "category": "role",
            "tags": json.dumps(["mentor", "giving-back", "leadership", "impact"]),
            "stage_min": 8, "stage_max": 9
        },
        {
            "title": "Contribute an Idea",
            "description": "Share your ideas to help others in the community.",
            "category": "idea",
            "tags": json.dumps(["contribution", "ideas", "sharing", "community"]),
            "stage_min": 6, "stage_max": 9
        },
        {
            "title": "Start a Project",
            "description": "Create something new that addresses a need you see.",
            "category": "idea",
            "tags": json.dumps(["entrepreneurship", "creation", "impact"]),
            "stage_min": 7, "stage_max": 9
        }
    ]
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM activities")
    count = cursor.fetchone()[0]
    
    if count == 0:
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
        
        print(f"Seeded {len(activities)} sample activities")
    else:
        print(f"Database already has {count} activities")
    
    conn.commit()
    conn.close()


def get_activities_for_stage(stage: int) -> list:
    """Get activities appropriate for a journey stage"""
    db_path = get_db_path()
    conn = sqlite3.connect(db_path)
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
            "tags": json.loads(row[4]) if row[4] else []
        })
    
    conn.close()
    return activities


# Initialize on import
if __name__ == "__main__":
    init_db()
    seed_sample_activities()
