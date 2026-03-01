#!/usr/bin/env python3
"""
Memory Linker
=============
Find and suggest links between notes.

Usage:
    python3 scripts/memory/link.py
    python3 scripts/memory/link.py --auto
"""

import re
from pathlib import Path
from collections import defaultdict
from datetime import datetime

WORKSPACE = Path("/home/drg/.openclaw/workspace")
MEMORY = WORKSPACE / "memory"

def extract_entities(content):
    """Extract potential entities from content."""
    # Extract hashtags
    tags = re.findall(r'#(\w+)', content.lower())
    
    # Extract capitalized words (potential concepts)
    concepts = re.findall(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b', content)
    
    return set(tags), set(concepts)

def build_graph():
    """Build relationship graph."""
    graph = defaultdict(set)
    note_entities = {}
    
    for md_file in MEMORY.rglob("*.md"):
        if md_file.name == "index.md":
            continue
        
        content = md_file.read_text()
        tags, concepts = extract_entities(content)
        
        note_entities[md_file.stem] = {
            'tags': tags,
            'concepts': concepts,
            'path': md_file
        }
        
        # Link tags to notes
        for tag in tags:
            graph[tag].add(md_file.stem)
        
        # Link concepts
        for concept in concepts:
            graph[concept.lower()].add(md_file.stem)
    
    return graph, note_entities

def find_related(note_id, graph, note_entities):
    """Find related notes."""
    if note_id not in note_entities:
        return []
    
    my_tags = note_entities[note_id]['tags']
    my_concepts = note_entities[note_id]['concepts']
    
    related = []
    
    for tag in my_tags:
        for other_id in graph[tag]:
            if other_id != note_id:
                related.append((
                    other_id,
                    'tag',
                    tag
                ))
    
    for concept in my_concepts:
        concept_lower = concept.lower()
        for other_id in graph[concept_lower]:
            if other_id != note_id:
                related.append((
                    other_id,
                    'concept',
                    concept
                ))
    
    return related

def link_all():
    """Find all potential links."""
    graph, note_entities = build_graph()
    
    print("🔗 Potential Links")
    print("=" * 50)
    
    for note_id in note_entities:
        related = find_related(note_id, graph, note_entities)
        
        if related:
            print(f"\n{note_id}:")
            for other, link_type, keyword in related[:5]:
                print(f"  ← {link_type}: {keyword} → {other}")

def suggest_for_note(note_path):
    """Suggest links for a specific note."""
    graph, note_entities = build_graph()
    
    note_id = note_path.stem
    related = find_related(note_id, graph, note_entities)
    
    if not related:
        print("No related notes found")
        return
    
    print(f"Related to {note_id}:")
    for other, link_type, keyword in related[:5]:
        print(f"  - [{link_type}: {keyword}] {other}")

def main():
    import sys
    
    if len(sys.argv) > 1:
        note_path = Path(sys.argv[1])
        suggest_for_note(note_path)
    else:
        link_all()

if __name__ == "__main__":
    main()
