# Knowledge Graph Systems

## Overview

Knowledge graphs structure information as interconnected nodes, enabling flexible querying and discovery of relationships between concepts.

## Structure

```
Node Types:
- entities (people, places, concepts)
- events (occurrences in time)
- relationships (edges between nodes)
- attributes (properties of nodes)

Query Patterns:
- Find related concepts
- Trace causal chains
- Identify clusters
- Path finding between domains
```

## Implementation Options

### 1. Graph Databases
- Neo4j - Mature, Cypher query language
- Amazon Neptune - Managed, multi-model
- Supabase (pg_graph) - PostgreSQL extension

### 2. Vector + Knowledge Hybrid
- Store embeddings alongside structured data
- Semantic search + exact queries
- Best of both worlds

### 3. Linked Data (Semantic Web)
- RDF, OWL standards
- Universal identifiers (URIs)
- Federation across datasets

## Application to Synthesis Platform

### Protocol Knowledge
```
NSDR ──uses──▶ Polyvagal Theory
   │
   └──relates_to──▶ iCOVER Protocol
        │
        └──inspired_by──▶ Somatic Experiencing
```

### Research Gaps
- Track vaguely touched subjects
- Identify connections between domains
- Surface implicit knowledge

### Extension Mechanism
- Every new insight adds nodes
- Automatic connection suggestions
- Human validation of links

---

*Status: Developing*
