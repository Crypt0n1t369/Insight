#!/usr/bin/env python3
"""
Enhanced Memory Search with TF-IDF + Keyword Matching
=====================================================
Lightweight semantic search without heavy dependencies.

Usage:
    python3 scripts/memory_recall.py "what did we discuss about X"
"""

import os
import sys
import json
from pathlib import Path
from collections import defaultdict
import re

MEMORY_DIR = Path("/home/drg/.openclaw/workspace/memory")

def tokenize(text):
    """Simple tokenizer."""
    # Lowercase and extract words
    text = text.lower()
    # Remove markdown links
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    # Extract alphanumeric words
    words = re.findall(r'\b[a-z0-9]{2,}\b', text)
    return words

def build_index():
    """Build TF-IDF index from memory files."""
    documents = {}
    doc_lengths = {}
    term_freq = defaultdict(lambda: defaultdict(int))
    doc_count = 0
    
    # Load all memory files
    for f in MEMORY_DIR.glob("*.md"):
        if f.name == "index.md":
            continue
        
        try:
            content = f.read_text(encoding='utf-8')
            doc_id = f.stem
            
            documents[doc_id] = content
            doc_lengths[doc_id] = len(content)
            
            words = tokenize(content)
            for word in words:
                term_freq[word][doc_id] += 1
            
            doc_count += 1
        except Exception as e:
            print(f"  ⚠️  Error reading {f}: {e}")
    
    return documents, term_freq, doc_count

def search_memory(query: str, n_results: int = 5):
    """Search memory using TF-IDF scoring."""
    print(f"🔍 Searching memory for: '{query}'")
    print("=" * 50)
    
    documents, term_freq, doc_count = build_index()
    
    if not documents:
        print("❌ No memory files found")
        return []
    
    # Tokenize query
    query_words = tokenize(query)
    print(f"   Keywords: {query_words[:10]}")
    
    # Calculate scores
    scores = defaultdict(float)
    
    for word in query_words:
        # Calculate IDF
        df = sum(1 for doc_id in term_freq[word].values() if doc_id > 0)
        if df == 0:
            continue
        idf = (doc_count + 1) / (df + 1)
        
        # Score each document
        for doc_id, tf in term_freq[word].items():
            tf_idf = (1 + tf) * idf
            scores[doc_id] += tf_idf
    
    # Sort by score
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
    if not ranked:
        print("❌ No matches found")
        return []
    
    # Display results
    print(f"\n📚 Top {min(n_results, len(ranked))} results:\n")
    
    results = []
    for i, (doc_id, score) in enumerate(ranked[:n_results], 1):
        content = documents[doc_id]
        
        # Find relevant excerpt
        excerpt = content[:500].replace('\n', ' ')
        
        # Try to find query words in context
        for word in query_words[:3]:
            pattern = re.compile(r'.{0,50}' + word + r'.{0,50}', re.IGNORECASE)
            matches = pattern.findall(content)
            if matches:
                excerpt = matches[0].replace('\n', ' ')
                break
        
        print(f"{i}. 📄 {doc_id[:20]}")
        print(f"   Score: {score:.2f}")
        print(f"   \"{excerpt[:120]}...\"")
        print()
        
        results.append({
            'doc_id': doc_id,
            'score': score,
            'excerpt': excerpt[:200]
        })
    
    return results

if __name__ == "__main__":
    query = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "project status"
    search_memory(query)
