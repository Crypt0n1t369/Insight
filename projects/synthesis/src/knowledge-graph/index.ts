// Knowledge Graph — Public API

import { getStorage, resetStorage as _resetStorage, clearSnapshot } from './storage.js';
import { query, getNodeWithContext, getProtocols, getRelatedConcepts } from './query.js';
import { SEED_NODES, SEED_EDGES } from './seed.js';
import type {
  KGNode,
  KGEdge,
  KGQuery,
  KGResult,
  NodeType,
  EdgeType,
  KGStorageSnapshot,
} from './types.js';

export type { KGNode, KGEdge, KGQuery, KGResult, NodeType, EdgeType };

// --- Initialization ---

let initialized = false;

export function initialize(force = false): void {
  if (initialized && !force) return;
  const storage = getStorage();

  // Only seed if storage is empty
  if (storage.getAllNodes().length === 0) {
    storage.seed(SEED_NODES, SEED_EDGES);
    storage.forceSave();
  }
  initialized = true;
}

export function isInitialized(): boolean {
  return initialized;
}

// --- Node CRUD ---

export function getNode(id: string): KGNode | undefined {
  return getStorage().getNode(id);
}

export function createNode(node: Omit<KGNode, 'createdAt' | 'updatedAt'>): KGNode {
  const now = new Date().toISOString();
  const full: KGNode = { ...node, createdAt: now, updatedAt: now };
  getStorage().addNode(full);
  return full;
}

export function updateNode(id: string, patch: Partial<KGNode>): KGNode | undefined {
  return getStorage().updateNode(id, patch);
}

export function deleteNode(id: string): boolean {
  return getStorage().deleteNode(id);
}

export function listNodes(q?: KGQuery): KGResult {
  if (!q) {
    const nodes = getStorage().getAllNodes();
    return { nodes, edges: getStorage().getAllEdges() };
  }
  return query(q);
}

// --- Edge CRUD ---

export function getEdge(id: string): KGEdge | undefined {
  return getStorage().getEdge(id);
}

export function createEdge(edge: Omit<KGEdge, 'id'> & { id?: string }): KGEdge {
  const id = edge.id ?? `${edge.from}_${edge.type}_${edge.to}`;
  const full: KGEdge = { ...edge, id };
  getStorage().addEdge(full);
  return full;
}

export function deleteEdge(id: string): boolean {
  return getStorage().deleteEdge(id);
}

export function listEdges(): KGEdge[] {
  return getStorage().getAllEdges();
}

// --- Query helpers ---

export { query, getNodeWithContext, getProtocols, getRelatedConcepts };

// --- Storage ---

export function getSnapshot(): KGStorageSnapshot {
  const storage = getStorage();
  return {
    version: 1,
    nodes: storage.getAllNodes(),
    edges: storage.getAllEdges(),
    savedAt: new Date().toISOString(),
  };
}

export function getStats(): { nodes: number; edges: number; byType: Record<string, number> } {
  return getStorage().stats();
}

/** Force-persist the in-memory KG to the JSON snapshot file (bypasses debounce). */
export function forceSave(): void {
  getStorage().forceSave();
}

export function resetStorage(): void {
  _resetStorage();
  initialized = false;
}

export { clearSnapshot };
