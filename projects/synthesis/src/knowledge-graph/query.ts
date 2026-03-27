// Knowledge Graph — Query Engine

import type { KGQuery, KGResult, KGNode, KGEdge, NodeType, EdgeType } from './types.js';
import { getStorage } from './storage.js';

/**
 * Score a node against a full-text query.
 * Uses simple TF-like matching: counts keyword occurrences in name + description + tags.
 * Returns 0 if no match.
 */
function textScore(node: KGNode, query: string): number {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  if (terms.length === 0) return 0;

  const haystack = [
    node.name,
    node.description,
    ...node.tags,
  ]
    .join(' ')
    .toLowerCase();

  let matches = 0;
  for (const term of terms) {
    // Count occurrences
    let idx = 0;
    let count = 0;
    while ((idx = haystack.indexOf(term, idx)) !== -1) {
      count++;
      idx += term.length;
    }
    matches += count;
  }

  return matches > 0 ? Math.min(matches / terms.length, 1.0) : 0;
}

/**
 * Traverse graph from a starting node.
 * Returns all reachable nodes within depth limit, along with the edges connecting them.
 */
function traverseGraph(
  startId: string,
  edgeTypes: EdgeType[] | undefined,
  maxDepth: number,
  direction: 'outbound' | 'inbound' | 'both',
): { nodes: KGNode[]; edges: KGEdge[]; depths: Map<string, number> } {
  const storage = getStorage();
  const startNode = storage.getNode(startId);
  if (!startNode) {
    return { nodes: [], edges: [], depths: new Map() };
  }

  const visited = new Set<string>([startId]);
  const nodes: KGNode[] = [startNode];
  const edges: KGEdge[] = [];
  const depths = new Map<string, number>();
  depths.set(startId, 0);

  const typeFilter = edgeTypes ? new Set(edgeTypes) : null;

  // BFS
  const queue: string[] = [startId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDepth = depths.get(current)!;
    if (currentDepth >= maxDepth) continue;

    const outbound = storage.getOutboundEdges(current, edgeTypes);
    const inbound = storage.getInboundEdges(current, edgeTypes);
    const candidates: Array<{ edge: KGEdge; neighborId: string; dir: 'out' | 'in' }> = [];

    for (const edge of outbound) {
      if (typeFilter && !typeFilter.has(edge.type)) continue;
      candidates.push({ edge, neighborId: edge.to, dir: 'out' });
    }
    for (const edge of inbound) {
      if (typeFilter && !typeFilter.has(edge.type)) continue;
      // Avoid duplicate edges
      const edgeId = `rev_${edge.id}`;
      if (!edges.some((e) => e.id === edgeId)) {
        candidates.push({ edge, neighborId: edge.from, dir: 'in' });
      }
    }

    for (const { edge, neighborId, dir } of candidates) {
      if (visited.has(neighborId)) continue;
      visited.add(neighborId);
      const neighbor = storage.getNode(neighborId);
      if (!neighbor) continue;

      // Store edge with direction context
      const storedEdge: KGEdge =
        dir === 'out'
          ? edge
          : { ...edge, id: `rev_${edge.id}`, from: edge.to, to: edge.from };

      nodes.push(neighbor);
      edges.push(storedEdge);
      depths.set(neighborId, currentDepth + 1);
      queue.push(neighborId);
    }
  }

  return { nodes, edges, depths };
}

/**
 * Main query function.
 * Combines filter, traverse, and full-text search.
 */
export function query(q: KGQuery): KGResult {
  const storage = getStorage();
  let nodes: KGNode[] = storage.getAllNodes();
  let edges: KGEdge[] = storage.getAllEdges();
  let scores: number[] | undefined;

  // --- Filters ---
  if (q.filters) {
    const { type, tags, status, ids } = q.filters;

    if (type !== undefined) {
      const types = Array.isArray(type) ? new Set(type) : new Set([type]);
      nodes = nodes.filter((n) => types.has(n.type));
    }

    if (tags !== undefined && tags.length > 0) {
      const tagSet = new Set(tags.map((t) => t.toLowerCase()));
      nodes = nodes.filter((n) => n.tags.some((t) => tagSet.has(t.toLowerCase())));
    }

    if (status !== undefined) {
      nodes = nodes.filter((n) => n.status === status);
    }

    if (ids !== undefined && ids.length > 0) {
      const idSet = new Set(ids);
      nodes = nodes.filter((n) => idSet.has(n.id));
      // Also filter edges to only those between filtered nodes
      const nodeIds = new Set(nodes.map((n) => n.id));
      edges = edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));
    }
  }

  // --- Traversal ---
  if (q.traverse) {
    const { from, edgeTypes, depth = 2, direction = 'both' } = q.traverse;
    const { nodes: traversedNodes, edges: traversedEdges, depths } = traverseGraph(
      from,
      edgeTypes,
      depth,
      direction,
    );

    // Intersect traversed nodes with current node set
    const traversedIds = new Set(traversedNodes.map((n) => n.id));
    const filteredNodeIds = new Set(nodes.map((n) => n.id));
    const intersectIds = new Set([...traversedIds].filter((id) => filteredNodeIds.has(id)));

    nodes = nodes.filter((n) => intersectIds.has(n.id));
    // Include all traversed edges between intersected nodes
    const traversedEdgeIds = new Set(traversedEdges.map((e) => e.id));
    edges = edges.filter((e) => traversedEdgeIds.has(e.id));

    return { nodes, edges, scores };
  }

  // --- Full-text search ---
  if (q.fullText && q.fullText.trim().length > 0) {
    const query2 = q.fullText.trim();
    const scored: Array<{ node: KGNode; score: number }> = [];

    for (const node of nodes) {
      const score = textScore(node, query2);
      if (score > 0) scored.push({ node, score });
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    nodes = scored.map((s) => s.node);
    scores = scored.map((s) => Math.round(s.score * 100) / 100);
  }

  // --- Apply limit ---
  if (q.limit !== undefined && q.limit > 0) {
    nodes = nodes.slice(0, q.limit);
    // Also trim edges to only those connecting limited nodes
    const nodeIds = new Set(nodes.map((n) => n.id));
    edges = edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));
  }

  return { nodes, edges, scores };
}

/**
 * Get a single node by ID with its immediate neighborhood.
 */
export function getNodeWithContext(id: string, depth = 1): KGResult {
  // Use traverse only — it already includes the start node + neighbors.
  // Adding filters.ids would incorrectly filter out the discovered neighbors.
  return query({
    traverse: { from: id, depth, direction: 'both' },
  });
}

/**
 * List all protocol nodes.
 */
export function getProtocols(): KGNode[] {
  return query({ filters: { type: 'protocol' } }).nodes;
}

/**
 * Find related concepts for a given node.
 */
export function getRelatedConcepts(nodeId: string): KGNode[] {
  const result = query({
    traverse: { from: nodeId, edgeTypes: ['related_to', 'based_on_concept'], depth: 1 },
  });
  return result.nodes.filter((n) => n.type === 'concept');
}
