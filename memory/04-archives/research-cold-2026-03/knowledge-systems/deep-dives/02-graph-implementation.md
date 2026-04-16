# Knowledge Graph Implementation

## Database Options

### 1. Neo4j
- Mature graph DB
- Cypher query language
- Good visualization tools
- Cost: Free community / Paid enterprise

### 2. Amazon Neptune
- Managed service
- Gremlin + SPARQL + openCypher
- AWS integration
- Cost: Higher

### 3. Supabase (pg_graph)
- PostgreSQL extension
- OpenCypher support
- Combined relational + graph
- Cost: Included in Supabase

### 4. Memory-Only (Vector + Tags)
- LanceDB for embeddings
- Tag-based connections
- Simple, fast
- Best for MVP

## Schema Design

### Nodes
```typescript
interface Node {
  id: string;
  type: 'protocol' | 'concept' | 'technique' | 'user' | 'session' | 'gap';
  title: string;
  content: string;
  status: 'sketch' | 'developing' | 'mature';
  created: Date;
  updated: Date;
}
```

### Edges
```typescript
interface Edge {
  id: string;
  source: string;
  target: string;
  type: 'uses' | 'related_to' | 'inspired_by' | 'conflicts_with' | 'builds_on';
  weight: number; // strength of connection
}
```

## Query Patterns

### Find Related
```cypher
MATCH (n {id: 'nsdr'})-[:related_to|uses]->(related)
RETURN related
ORDER BY related.updated DESC
```

### Explore Path
```cypher
MATCH path = (polyvagal)-[:inspired_by*1..3]-(target)
RETURN path
LIMIT 10
```

### Find Gaps
```cypher
MATCH (g:gap)
WHERE g.status = 'sketch'
RETURN g
ORDER BY g.created ASC
```

## Frontend Integration

### Visualization
- React Flow for node graphs
- D3.js for custom layouts
- Cytoscape.js for biology-style graphs

### Navigation
- Search bar with autocomplete
- Tag clouds
- Recently viewed
- Related suggestions

---

*Status: Developing*
