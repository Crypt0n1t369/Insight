#!/usr/bin/env python3
"""
Auto Memory Manager
==================
Automatically manages memory at session boundaries.

Functions:
- Auto-summarize when context > 50%
- Inject relevant memories on startup
- Track memory freshness
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta

MEMORY_DIR = Path("/home/drg/.openclaw/workspace/memory")
WORKSPACE = Path("/home/drg/.openclaw/workspace")

def get_context_usage():
    """Estimate current context usage."""
    # Read session status if available
    status_file = WORKSPACE / ".session_context"
    if status_file.exists():
        try:
            import json
            data = json.loads(status_file.read_text())
            return data.get('tokens', 0) / 200000  # Assuming 200k context
        except:
            pass
    return 0.3  # Default estimate

def should_summarize():
    """Check if memory should be summarized."""
    return get_context_usage() > 0.5

def get_recent_memories(days: int = 7) -> list:
    """Get memories from recent days."""
    memories = []
    now = datetime.now()
    
    for f in MEMORY_DIR.glob("*.md"):
        if f.name == "index.md":
            continue
        
        try:
            # Extract date from filename
            date_str = f.stem[:10]
            file_date = datetime.strptime(date_str, "%Y-%m-%d")
            
            if (now - file_date).days <= days:
                memories.append({
                    'file': f.name,
                    'date': date_str,
                    'content': f.read_text()[:1000]
                })
        except:
            pass
    
    return sorted(memories, key=lambda x: x['date'], reverse=True)

def inject_memory_prompt() -> str:
    """Generate memory injection prompt for new sessions."""
    recent = get_recent_memories(days=3)
    
    if not recent:
        return ""
    
    prompt = "\n## Recent Memory Context\n"
    prompt += "Recent sessions:\n"
    
    for mem in recent[:3]:
        prompt += f"- {mem['date']}: {mem['content'][:200]}...\n"
    
    prompt += "\n"
    return prompt

def check_memory_freshness() -> bool:
    """Check if memory is fresh (written today)."""
    today = datetime.now().strftime("%Y-%m-%d")
    
    for f in MEMORY_DIR.glob("*.md"):
        if today in f.name:
            return True
    
    return False

def create_daily_memory():
    """Create new daily memory file if needed."""
    today = datetime.now().strftime("%Y-%m-%d")
    memory_file = MEMORY_DIR / f"{today}.md"
    
    if not memory_file.exists():
        content = f"""# Memory diary entry - {today}

## Session Notes

### 

### 

---

*Auto-created by memory manager*
"""
        memory_file.write_text(content)
        print(f"📝 Created new memory file: {memory_file.name}")
        return True
    
    return False

# CLI for manual invocation
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Check memory status")
    parser.add_argument("--inject", action="store_true", help="Show memory injection")
    parser.add_argument("--create", action="store_true", help="Create daily memory")
    parser.add_argument("--search", type=str, help="Search memory")
    args = parser.parse_args()
    
    if args.check:
        print(f"Context usage: {get_context_usage()*100:.1f}%")
        print(f"Should summarize: {should_summarize()}")
        print(f"Memory fresh: {check_memory_freshness()}")
    
    if args.inject:
        print(inject_memory_prompt())
    
    if args.create:
        create_daily_memory()
    
    if args.search:
        # Use the recall script
        os.system(f"python3 {WORKSPACE}/scripts/memory_recall.py {args.search}")
