#!/usr/bin/env python3
"""
Vector Memory Ingest System
===========================
Ingests memory files into ChromaDB for semantic search.

Usage:
    python3 scripts/memory_ingest.py [--rebuild]
"""

import os
import json
import glob
from datetime import datetime
from pathlib import Path
import chromadb
from chromadb.config import Settings

# Configuration
MEMORY_DIR = Path("/home/drg/.openclaw/workspace/memory")
CHROMA_PATH = "/home/drg/.openclaw/workspace/.chroma"
COLLECTION_NAME = "openclaw_memory"

def get_embedding(text: str) -> list:
    """Generate simple hash-based embedding for demo purposes.
    In production, use sentence-transformers or OpenAI embeddings."""
    import hashlib
    import numpy as np
    
    # Simple hash-based pseudo-embedding (for demo)
    # In production: use 'sentence-transformers' or OpenAI API
    hash_obj = hashlib.sha256(text.encode())
    hash_bytes = hash_obj.digest()
    
    # Convert to normalized vector
    vector = np.frombuffer(hash_bytes, dtype=np.float32)
    vector = vector / np.linalg.norm(vector)  # Normalize
    return vector.tolist()

def load_memory_files() -> list:
    """Load all memory files."""
    documents = []
    ids = []
    metadatas = []
    
    # Find all .md files (recursive to catch subdirectories like 04-archives/)
    md_files = list(MEMORY_DIR.glob("**/*.md"))
    
    for f in sorted(md_files):
        if f.name == "index.md":
            continue
            
        try:
            content = f.read_text(encoding='utf-8')
            
            # Create unique ID
            doc_id = f"{f.stem}_{f.stat().st_mtime}"
            
            # Extract date for metadata
            date = f.stem[:10] if len(f.stem) >= 10 else "unknown"
            
            documents.append(content)
            ids.append(doc_id)
            metadatas.append({
                "source": str(f),
                "date": date,
                "filename": f.name
            })
            
        except Exception as e:
            print(f"  ⚠️  Error reading {f}: {e}")
    
    return documents, ids, metadatas

def ingest_to_chroma():
    """Ingest memory files into ChromaDB."""
    print("🧠 Vector Memory Ingest System")
    print("=" * 40)
    
    # Initialize ChromaDB
    os.makedirs(CHROMA_PATH, exist_ok=True)
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    
    # Get or create collection
    try:
        collection = client.get_collection(name=COLLECTION_NAME)
        print(f"  Using existing collection ({collection.count()} docs)")
    except:
        collection = client.create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "OpenClaw memory store"}
        )
        print("  Created new collection")
    
    # Load memory files
    print(f"\n📂 Loading memory files from {MEMORY_DIR}...")
    documents, ids, metadatas = load_memory_files()
    print(f"  Found {len(documents)} memory files")
    
    # Generate embeddings and add to collection
    print("\n📥 Ingesting to ChromaDB...")
    
    # Clear existing (for rebuild)
    try:
        client.delete_collection(name=COLLECTION_NAME)
        collection = client.create_collection(name=COLLECTION_NAME)
    except:
        pass
    
    # Add in batches
    batch_size = 5
    for i in range(0, len(documents), batch_size):
        batch_docs = documents[i:i+batch_size]
        batch_ids = ids[i:i+batch_size]
        batch_meta = metadatas[i:i+batch_size]
        
        # Generate embeddings
        embeddings = [get_embedding(doc) for doc in batch_docs]
        
        collection.add(
            documents=batch_docs,
            ids=batch_ids,
            embeddings=embeddings,
            metadatas=batch_meta
        )
        
        print(f"  Added {len(batch_docs)} documents...")
    
    print(f"\n✅ Complete! {collection.count()} documents in collection")
    print(f"   Stored at: {CHROMA_PATH}")
    
    return collection.count()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--rebuild", action="store_true", help="Rebuild index")
    args = parser.parse_args()
    
    if args.rebuild:
        print("🔄 Rebuild mode...")
    
    count = ingest_to_chroma()
