#!/usr/bin/env python3
"""
Context Loader
=============
Loads relevant context for session initialization.
Can be sourced before starting a conversation.

Usage:
    source <(python3 -c "print(open('.memory_context').read())")
    # Or for more detailed context:
    python3 scripts/context_loader.py --full
"""

import os
import sys
from pathlib import Path

WORKSPACE = Path("/home/drg/.openclaw/workspace")
MEMORY_CONTEXT = WORKSPACE / ".memory_context"
CONTEXT_INJECTION = WORKSPACE / ".context_for_prompt.txt"

def load_short_context():
    """Load the short memory context."""
    if MEMORY_CONTEXT.exists():
        return MEMORY_CONTEXT.read_text()
    return ""

def load_project_contexts():
    """Load CONTEXT.md from active projects."""
    contexts = []
    projects_dir = WORKSPACE / "projects"
    
    if projects_dir.exists():
        for project in projects_dir.iterdir():
            if project.is_dir():
                ctx_file = project / "CONTEXT.md"
                if ctx_file.exists():
                    # Get last 30 lines (recent updates)
                    lines = ctx_file.read_text().split('\n')[-30:]
                    contexts.append(f"## {project.name}")
                    contexts.append('\n'.join(lines))
    
    return '\n\n'.join(contexts)

def load_recent_decisions():
    """Extract recent decisions from memory files."""
    decisions = []
    memory_dir = WORKSPACE / "memory"
    
    for f in sorted(memory_dir.glob("**/*.md"), reverse=True)[:3]:
        if f.name == "index.md":
            continue
        content = f.read_text()
        
        # Look for decision patterns
        for line in content.split('\n'):
            if any(kw in line.lower() for kw in ['decided', 'decision:', '### decision', '✓ done']):
                if len(line) > 20:
                    decisions.append(f"- {f.stem[:10]}: {line.strip()}")
    
    if decisions:
        return "## Recent Decisions\n" + '\n'.join(decisions[:10])
    return ""

def generate_prompt_context():
    """Generate full context for prompt injection."""
    output = []
    
    output.append("=== ACTIVE CONTEXT ===")
    
    # Short memory context
    short = load_short_context()
    if short:
        output.append("\n### Recent Memory")
        output.append(short[:1000])
    
    # Recent decisions
    decisions = load_recent_decisions()
    if decisions:
        output.append("\n" + decisions)
    
    # Project contexts (abbreviated)
    output.append("\n### Active Projects")
    for f in sorted((WORKSPACE / "projects").iterdir())[:3]:
        if f.is_dir():
            output.append(f"- {f.name}")
    
    return '\n'.join(output)

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true", help="Full context")
    parser.add_argument("--short", action="store_true", help="Short context only")
    parser.add_argument("--decisions", action="store_true", help="Decisions only")
    args = parser.parse_args()
    
    if args.full:
        print(generate_prompt_context())
    elif args.decisions:
        print(load_recent_decisions())
    else:
        print(load_short_context())

if __name__ == "__main__":
    main()
