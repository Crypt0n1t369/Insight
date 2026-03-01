#!/usr/bin/env python3
"""
Memory Capture
==============
Quick capture to inbox or direct to project.

Usage:
    python3 scripts/memory/capture.py "Note content here"
    python3 scripts/memory/capture.py "content" --project audio-transformation-tool
    python3 scripts/memory/capture.py "content" --area ai-automation
"""

import sys
import re
from pathlib import Path
from datetime import datetime

WORKSPACE = Path("/home/drg/.openclaw/workspace")
MEMORY = WORKSPACE / "memory"
INBOX = MEMORY / "00-inbox"

def parse_args():
    """Parse command line arguments."""
    args = sys.argv[1:]
    
    content = []
    project = None
    area = None
    tags = []
    
    i = 0
    while i < len(args):
        arg = args[i]
        if arg.startswith("--project="):
            project = arg.split("=")[1]
        elif arg.startswith("--area="):
            area = arg.split("=")[1]
        elif arg.startswith("--tag="):
            tags.append(arg.split("=")[1])
        else:
            content.append(arg)
        i += 1
    
    return " ".join(content), project, area, tags

def generate_id():
    """Generate timestamp-based ID."""
    return datetime.now().strftime("%Y%m%d%H%M%S")

def extract_tags(content):
    """Auto-extract tags from content."""
    tags = re.findall(r'#(\w+)', content)
    return list(set(tags))

def capture(text, project=None, area=None, custom_tags=None):
    """Capture note to appropriate location."""
    if not text:
        print("Usage: capture.py <text> [--project=x] [--area=y] [--tag=z]")
        return
    
    # Auto-extract tags
    auto_tags = extract_tags(text)
    all_tags = list(set((custom_tags or []) + auto_tags))
    
    # Generate ID
    note_id = generate_id()
    
    # Clean text (remove explicit tags for body)
    clean_text = re.sub(r'#\w+', '', text).strip()
    
    # Determine destination
    if project:
        dest = MEMORY / "03-projects" / project / f"{note_id}.md"
        dest.parent.mkdir(parents=True, exist_ok=True)
    elif area:
        dest = MEMORY / "01-areas" / f"{note_id}.md"
    else:
        dest = INBOX / f"{note_id}.md"
    
    INBOX.mkdir(parents=True, exist_ok=True)
    
    # Write note
    content = f"""# Note {note_id}
Created: {datetime.now().isoformat()}

{clean_text}

Tags: {', '.join(['#' + t for t in all_tags]) if all_tags else 'none'}
"""
    
    dest.write_text(content)
    
    print(f"✅ Captured to: {dest.relative_to(WORKSPACE)}")
    print(f"   Tags: {all_tags}")
    
    return dest

def main():
    text, project, area, tags = parse_args()
    capture(text, project, area, tags)

if __name__ == "__main__":
    main()
