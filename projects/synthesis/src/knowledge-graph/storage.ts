// Knowledge Graph — In-Memory Storage with JSON Persistence

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { KGNode, KGEdge, KGStorageSnapshot } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// workspace root = projects/synthesis/src/knowledge-graph/storage.ts
// 3 up = workspace root, then data/synthesis
const DATA_DIR = join(__dirname, '../../../../data/synthesis');
const SNAPSHOT_FILE = join(DATA_DIR, 'knowledge-graph.json');

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export class KGStorage {
  private nodes: Map<string, KGNode> = new Map();
  private edges: Map<string, KGEdge> = new Map();
  private dirty = false;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.load();
  }

  // --- Persistence ---

  private load(): void {
    ensureDataDir();
    if (!existsSync(SNAPSHOT_FILE)) return;
    try {
      const raw = readFileSync(SNAPSHOT_FILE, 'utf-8');
      const snap: KGStorageSnapshot = JSON.parse(raw);
      for (const node of snap.nodes) this.nodes.set(node.id, node);
      for (const edge of snap.edges) this.edges.set(edge.id, edge);
    } catch {
      // Corrupt file — start fresh
    }
  }

  scheduleSave(): void {
    if (this.saveTimer !== null) return;
    this.dirty = true;
    this.saveTimer = setTimeout(() => {
      this.saveSync();
      this.saveTimer = null;
    }, 500); // Debounce: coalesce rapid writes
  }

  private saveSync(): void {
    if (!this.dirty) return;
    ensureDataDir();
    const snap: KGStorageSnapshot = {
      version: 1,
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      savedAt: new Date().toISOString(),
    };
    writeFileSync(SNAPSHOT_FILE, JSON.stringify(snap, null, 2), 'utf-8');
    this.dirty = false;
  }

  forceSave(): void {
    if (this.saveTimer !== null) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.saveSync();
  }

  // --- Node operations ---

  getNode(id: string): KGNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): KGNode[] {
    return Array.from(this.nodes.values());
  }

  addNode(node: KGNode): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node ${node.id} already exists`);
    }
    this.nodes.set(node.id, node);
    this.scheduleSave();
  }

  upsertNode(node: KGNode): void {
    const isNew = !this.nodes.has(node.id);
    this.nodes.set(node.id, {
      ...node,
      updatedAt: new Date().toISOString(),
      createdAt: isNew ? new Date().toISOString() : node.createdAt,
    });
    this.scheduleSave();
  }

  updateNode(id: string, patch: Partial<KGNode>): KGNode | undefined {
    const existing = this.nodes.get(id);
    if (!existing) return undefined;
    const updated: KGNode = { ...existing, ...patch, id, updatedAt: new Date().toISOString() };
    this.nodes.set(id, updated);
    this.scheduleSave();
    return updated;
  }

  deleteNode(id: string): boolean {
    // Remove all edges connected to this node
    const connectedEdges = Array.from(this.edges.values()).filter(
      (e) => e.from === id || e.to === id,
    );
    for (const edge of connectedEdges) {
      this.edges.delete(edge.id);
    }
    const deleted = this.nodes.delete(id);
    if (deleted) this.scheduleSave();
    return deleted;
  }

  // --- Edge operations ---

  getEdge(id: string): KGEdge | undefined {
    return this.edges.get(id);
  }

  getAllEdges(): KGEdge[] {
    return Array.from(this.edges.values());
  }

  addEdge(edge: KGEdge): void {
    if (this.edges.has(edge.id)) {
      throw new Error(`Edge ${edge.id} already exists`);
    }
    this.edges.set(edge.id, edge);
    this.scheduleSave();
  }

  upsertEdge(edge: KGEdge): void {
    this.edges.set(edge.id, edge);
    this.scheduleSave();
  }

  deleteEdge(id: string): boolean {
    const deleted = this.edges.delete(id);
    if (deleted) this.scheduleSave();
    return deleted;
  }

  // --- Query helpers ---

  getNodesByType(type: string | string[]): KGNode[] {
    const types = Array.isArray(type) ? new Set(type) : new Set([type]);
    return Array.from(this.nodes.values()).filter((n) => types.has(n.type));
  }

  getNodesByTags(tags: string[]): KGNode[] {
    const tagSet = new Set(tags.map((t) => t.toLowerCase()));
    return Array.from(this.nodes.values()).filter((n) =>
      n.tags.some((t) => tagSet.has(t.toLowerCase())),
    );
  }

  getOutboundEdges(nodeId: string, edgeTypes?: string[]): KGEdge[] {
    const types = edgeTypes ? new Set(edgeTypes) : null;
    return Array.from(this.edges.values()).filter(
      (e) => e.from === nodeId && (types === null || types.has(e.type)),
    );
  }

  getInboundEdges(nodeId: string, edgeTypes?: string[]): KGEdge[] {
    const types = edgeTypes ? new Set(edgeTypes) : null;
    return Array.from(this.edges.values()).filter(
      (e) => e.to === nodeId && (types === null || types.has(e.type)),
    );
  }

  // --- Bulk seed ---

  seed(nodes: KGNode[], edges: KGEdge[]): void {
    for (const n of nodes) this.nodes.set(n.id, n);
    for (const e of edges) this.edges.set(e.id, e);
    this.scheduleSave();
  }

  // --- Stats ---

  stats(): { nodes: number; edges: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    for (const n of this.nodes.values()) {
      byType[n.type] = (byType[n.type] ?? 0) + 1;
    }
    return { nodes: this.nodes.size, edges: this.edges.size, byType };
  }
}

// Singleton
let _storage: KGStorage | null = null;

export function getStorage(): KGStorage {
  if (_storage === null) {
    _storage = new KGStorage();
  }
  return _storage;
}

export function resetStorage(): void {
  if (_storage) {
    _storage.forceSave();
    _storage = null;
  }
}

export function clearSnapshot(): void {
  ensureDataDir();
  if (existsSync(SNAPSHOT_FILE)) {
    // Overwrite with empty graph instead of deleting (avoids dir cleanup issues)
    const snap: KGStorageSnapshot = { version: 1, nodes: [], edges: [], savedAt: new Date().toISOString() };
    writeFileSync(SNAPSHOT_FILE, JSON.stringify(snap), 'utf-8');
  }
}
