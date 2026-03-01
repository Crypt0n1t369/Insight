#!/usr/bin/env python3
"""
Unstructured Input Handler
=========================
Parses any unstructured text and adds to backlog automatically.

This script is designed to be called from the agent when receiving
unstructured requests from the user.

Usage:
    python3 scripts/parse_input.py "you should look into making the audio tool work offline"
"""

import sys
from pathlib import Path

WORKSPACE = Path("/home/drg/.openclaw/workspace")
sys.path.insert(0, str(WORKSPACE / "scripts"))

from task_queue import process_unstructured

def main():
    text = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else ""
    
    if not text:
        print("Usage: python3 parse_input.py <unstructured text>")
        return
    
    print(f"📥 Processing: {text[:60]}...")
    process_unstructured(text)

if __name__ == "__main__":
    main()
