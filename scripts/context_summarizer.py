#!/usr/bin/env python3
"""
Context Summarizer
==================
Automatically summarizes session context when approaching limits.
Run manually or trigger from health_check at 50% threshold.

Usage:
    python3 scripts/context_summarizer.py
"""

import os
import sys
from pathlib import Path
from datetime import datetime

WORKSPACE = Path("/home/drg/.openclaw/workspace")
MEMORY_DIR = WORKSPACE / "memory"
SESSION_SUMMARY = WORKSPACE / ".session_summary.txt"

def summarize_current_session():
    """Create a summary of current session work."""
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Find today's memory file
    today_file = MEMORY_DIR / f"{today}.md"
    
    if not today_file.exists():
        print("No today's memory file found")
        return None
    
    content = today_file.read_text()
    
    # Extract key sections
    lines = content.split('\n')
    key_points = []
    
    for line in lines:
        # Look for completed items, decisions, progress
        if any(kw in line.lower() for kw in ['✅', 'completed', 'done', 'fixed', 'implemented']):
            key_points.append(line.strip())
    
    summary = f"""# Session Summary - {today}

## Key Accomplishments
"""
    for point in key_points[:10]:
        summary += f"- {point}\n"
    
    summary += f"""
## Context Status
- Memory files: {len(list(MEMORY_DIR.glob('*.md')))} total
- Last memory update: {today}

---
Generated: {datetime.now().isoformat()}
"""
    
    return summary

def archive_old_sessions():
    """Archive sessions older than 7 days."""
    import shutil
    archive_dir = MEMORY_DIR / "archive"
    archive_dir.mkdir(exist_ok=True)
    
    cutoff = datetime.now().timestamp() - (7 * 24 * 60 * 60)
    
    archived = []
    for f in MEMORY_DIR.glob("*.md"):
        if f.stat().st_mtime < cutoff:
            if f.name not in ["index.md", "decisions.md"]:
                # Move to archive
                shutil.move(str(f), str(archive_dir / f.name))
                archived.append(f.name)
    
    return archived

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--summarize", action="store_true", help="Summarize current session")
    parser.add_argument("--archive", action="store_true", help="Archive old sessions")
    parser.add_argument("--status", action="store_true", help="Show context status")
    args = parser.parse_args()
    
    if args.status:
        # Show current status
        memory_files = list(MEMORY_DIR.glob("*.md"))
        print(f"📚 Memory files: {len(memory_files)}")
        
        today = datetime.now().strftime("%Y-%m-%d")
        today_file = MEMORY_DIR / f"{today}.md"
        if today_file.exists():
            size = len(today_file.read_text())
            print(f"   Today's entry: {size} chars")
        
        if SESSION_SUMMARY.exists():
            print(f"   Last summary: {len(SESSION_SUMMARY.read_text())} chars")
        
        return
    
    if args.summarize:
        summary = summarize_current_session()
        if summary:
            SESSION_SUMMARY.write_text(summary)
            print(f"✅ Summary written to {SESSION_SUMMARY}")
            print(summary[:500])
    
    if args.archive:
        archived = archive_old_sessions()
        print(f"📦 Archived {len(archived)} old sessions")
        for a in archived:
            print(f"   - {a}")

if __name__ == "__main__":
    main()
