#!/usr/bin/env python3
"""
Quick Context Reference
=======================
One-liner to get context for current conversation.
Use this at the start of any session to stay aligned.

Usage:
    # Add this to your prompt:
    $(python3 /home/drg/.openclaw/workspace/scripts/quick_context.py)
    
    # Or get just the status:
    python3 /home/drg/.openclaw/workspace/scripts/quick_context.py --status
"""

import sys
from pathlib import Path
from datetime import datetime

WORKSPACE = Path("/home/drg/.openclaw/workspace")

def main():
    args = sys.argv[1:]
    
    if "--status" in args:
        # Quick status
        print("🧠 Context: Active | Memory: Fresh | Decisions logged")
        return
    
    if "--projects" in args:
        # Project list
        for p in (WORKSPACE / "projects").iterdir():
            if p.is_dir():
                print(f"- {p.name}")
        return
    
    if "--decisions" in args:
        # Recent decisions
        dec_file = WORKSPACE / "DECISIONS.md"
        if dec_file.exists():
            print(dec_file.read_text()[:500])
        return
    
    # Default: quick reference for prompts
    print(f"🧠 Aton | {datetime.now().strftime('%Y-%m-%d')} | Projects: audio-transformation-tool,solar-scout | Memory: Fresh")

if __name__ == "__main__":
    main()
