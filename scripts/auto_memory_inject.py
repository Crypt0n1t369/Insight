#!/usr/bin/env python3
"""
Auto Memory Inject
==================
Automatically pulls relevant context for active projects on startup.
Saves to .memory_context for automatic loading.

Run from cron:
*/30 * * * * cd /home/drg/.openclaw/workspace && python3 scripts/auto_memory_inject.py
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import json
import re
from collections import defaultdict

MEMORY_DIR = Path("/home/drg/.openclaw/workspace/memory")
OUTPUT_FILE = Path("/home/drg/.openclaw/workspace/.memory_context")
WORKSPACE = Path("/home/drg/.openclaw/workspace")

# Active projects to track - auto-generated from context
ACTIVE_QUERIES = [
    "solar leads latvia",
    "audio transformation tool",
    "insight protocol",
    "openclaw memory",
    "project status"
]

def tokenize(text):
    """Simple tokenizer."""
    text = text.lower()
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    words = re.findall(r'\b[a-z0-9]{2,}\b', text)
    return words

def build_index():
    """Build simple index from memory files."""
    documents = {}
    term_freq = defaultdict(lambda: defaultdict(int))
    doc_count = 0
    
    for f in MEMORY_DIR.glob("**/*.md"):
        if f.name == "index.md":
            continue
        if f.name.startswith("."):
            continue
            
        try:
            content = f.read_text(encoding='utf-8')
            doc_id = f.stem[:15]  # Shorten for display
            
            documents[doc_id] = {
                'content': content,
                'file': f.name,
                'date': f.stem[:10] if len(f.stem) >= 10 else "unknown"
            }
            
            words = tokenize(content)
            for word in words:
                term_freq[word][doc_id] += 1
            
            doc_count += 1
        except:
            pass
    
    return documents, term_freq, doc_count

def search_memory(query: str, max_results: int = 3) -> list:
    """Search memory for query."""
    documents, term_freq, doc_count = build_index()
    
    if not documents:
        return []
    
    query_words = tokenize(query)
    scores = defaultdict(float)
    
    for word in query_words:
        df = sum(1 for doc_id in term_freq[word].values() if doc_id > 0)
        if df == 0:
            continue
        idf = (doc_count + 1) / (df + 1)
        
        for doc_id, tf in term_freq[word].items():
            tf_idf = (1 + tf) * idf
            scores[doc_id] += tf_idf
    
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
    results = []
    for doc_id, score in ranked[:max_results]:
        doc = documents[doc_id]
        # Extract relevant excerpt
        content = doc['content']
        excerpt = content[:400].replace('\n', ' ')
        
        # Try to find query in context
        for word in query_words[:2]:
            pattern = re.compile(r'.{0,40}' + word + r'.{0,60}', re.IGNORECASE)
            matches = pattern.findall(content)
            if matches:
                excerpt = matches[0].replace('\n', ' ')
                break
        
        results.append({
            'query': query,
            'file': doc['file'],
            'date': doc['date'],
            'score': score,
            'excerpt': excerpt[:200]
        })
    
    return results

def generate_context():
    """Generate context for all active queries."""
    print("🧠 Auto Memory Inject")
    print("=" * 40)
    
    all_context = []
    all_context.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    all_context.append("")
    
    for query in ACTIVE_QUERIES:
        results = search_memory(query)
        if results:
            all_context.append(f"## Related to: {query}")
            for r in results:
                all_context.append(f"- {r['file']} ({r['date']}): {r['excerpt']}...")
            all_context.append("")
    
    # Get recent memories summary
    now = datetime.now()
    recent = []
    for f in MEMORY_DIR.glob("**/*.md"):
        if f.name == "index.md" or f.name.startswith("."):
            continue
        try:
            date_str = f.stem[:10]
            file_date = datetime.strptime(date_str, "%Y-%m-%d")
            if (now - file_date).days <= 3:
                recent.append(f.name)
        except:
            pass
    
    if recent:
        all_context.append("## Recent Memory Files (last 3 days)")
        all_context.append(", ".join(recent))
    
    # Write to output file
    content = "\n".join(all_context)
    OUTPUT_FILE.write_text(content)
    
    print(f"✅ Written to: {OUTPUT_FILE}")
    print(f"   Size: {len(content)} chars")
    print(f"   Queries tracked: {len(ACTIVE_QUERIES)}")
    
    return content

if __name__ == "__main__":
    generate_context()
