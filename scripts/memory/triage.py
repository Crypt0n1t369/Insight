#!/usr/bin/env python3
"""
Memory Triage
=============
Sort inbox notes to appropriate folders.

Usage:
    python3 scripts/memory/triage.py          # Interactive
    python3 scripts/memory/triage.py --auto   # Auto-triage
"""

import os
import re
from pathlib import Path
from datetime import datetime, timedelta

WORKSPACE = Path("/home/drg/.openclaw/workspace")
MEMORY = WORKSPACE / "memory"
INBOX = MEMORY / "00-inbox"

# Keywords mapping to areas/projects
KEYWORDS = {
    "audio-transformation-tool": ["audio", "insight", "meditation", "transformation", "tts", "speech"],
    "solar-scout": ["solar", "lead", "latvia", "crm", "energy"],
    "openclaw": ["openclaw", "cron", "health", "context", "memory", "agent"],
    "ai-automation": ["ai", "automation", "agent", "llm", "gpt"],
    "productivity": ["productivity", "second brain", "para", "zettelkasten"],
}

AREAS = ["ai-automation", "productivity", "health", "finances"]

def auto_triage(note_path):
    """Auto-triage based on keywords."""
    content = note_path.read_text().lower()
    
    # Check project keywords
    for project, keywords in KEYWORDS.items():
        if any(kw in content for kw in keywords):
            dest = MEMORY / "03-projects" / project / note_path.name
            dest.parent.mkdir(parents=True, exist_ok=True)
            return dest, project
    
    # Default to general inbox review
    return None, "inbox"

def interactive_triage(note_path):
    """Interactive triage."""
    print(f"\n📝 {note_path.name}")
    print(f"   {note_path.read_text()[:100]}...")
    print("\nOptions:")
    print("  p:<project> - Move to project")
    print("  a:<area>    - Move to area")
    print("  d           - Delete")
    print("  s           - Skip")
    
    choice = input("> ").strip()
    
    if choice.startswith("p:"):
        project = choice[2:]
        dest = MEMORY / "03-projects" / project / note_path.name
        dest.parent.mkdir(parents=True, exist_ok=True)
        return dest, project
    elif choice.startswith("a:"):
        area = choice[2:]
        dest = MEMORY / "01-areas" / area / note_path.name
        dest.parent.mkdir(parents=True, exist_ok=True)
        return dest, area
    elif choice == "d":
        return None, "delete"
    else:
        return None, "skip"

def run_triage(auto=False):
    """Run triage on inbox."""
    if not INBOX.exists():
        print("✅ Inbox empty")
        return
    
    notes = list(INBOX.glob("*.md"))
    
    if not notes:
        print("✅ Inbox empty")
        return
    
    print(f"📥 Inbox: {len(notes)} notes")
    
    stats = {"triaged": 0, "skipped": 0, "deleted": 0}
    
    for note in notes:
        if auto:
            dest, category = auto_triage(note)
        else:
            dest, category = interactive_triage(note)
        
        if dest:
            note.rename(dest)
            print(f"   → {category}: {note.name}")
            stats["triaged"] += 1
        elif category == "delete":
            note.unlink()
            print(f"   🗑️  Deleted: {note.name}")
            stats["deleted"] += 1
        else:
            stats["skipped"] += 1
    
    print(f"\n✅ Triage complete: {stats['triaged']} moved, {stats['deleted']} deleted, {stats['skipped']} skipped")

def main():
    import sys
    auto = "--auto" in sys.argv
    run_triage(auto)

if __name__ == "__main__":
    main()
