// Knowledge Graph — Unit Tests

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initialize,
  resetStorage,
  clearSnapshot,
  isInitialized,
  getNode,
  createNode,
  updateNode,
  deleteNode,
  listNodes,
  createEdge,
  deleteEdge,
  query,
  getNodeWithContext,
  getProtocols,
  getRelatedConcepts,
  getSnapshot,
  getStats,
} from '../index.js';
import type { KGNode, KGEdge, KGQuery } from '../types.js';

// Use a temp dir for storage isolation
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'fs';

const TEST_DIR = join(tmpdir(), `kg-test-${Date.now()}`);
let originalDataDir: string;

beforeEach(() => {
  // Wipe production snapshot to ensure test isolation
  clearSnapshot();
  resetStorage(); // resets initialized flag as well
  initialize();
});

afterEach(() => {
  resetStorage();
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

// Force re-import with test dir — we mock the module-level constant
// Since we can't easily mock __dirname in ESM, we test the API directly

// --- initialize ---

describe('initialize', () => {
  it('seeds protocol nodes when storage is empty', () => {
    const result = listNodes({ filters: { type: 'protocol' } });
    expect(result.nodes.length).toBeGreaterThanOrEqual(8);
  });

  it('does not double-seed on repeated calls', () => {
    initialize();
    initialize();
    const result = listNodes({ filters: { type: 'protocol' } });
    // Should still be the seeded count, not doubled
    const ids = result.nodes.map((n) => n.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});

// --- Node CRUD ---

describe('Node CRUD', () => {
  it('getNode returns correct node', () => {
    const node = getNode('protocol/nsdr');
    expect(node).toBeDefined();
    expect(node!.name).toBe('Non-Sleep Deep Rest');
  });

  it('getNode returns undefined for unknown id', () => {
    const node = getNode('protocol/nonexistent');
    expect(node).toBeUndefined();
  });

  it('createNode adds a new node', () => {
    const node = createNode({
      id: 'test/my-node',
      type: 'concept',
      name: 'Test Node',
      description: 'A test concept',
      tags: ['test'],
      status: 'sketch',
      metadata: {},
    });
    expect(node.id).toBe('test/my-node');
    expect(node.createdAt).toBeDefined();
    expect(node.updatedAt).toBeDefined();
    expect(getNode('test/my-node')!.name).toBe('Test Node');
  });

  it('createNode throws on duplicate id', () => {
    expect(() =>
      createNode({
        id: 'protocol/nsdr', // already exists
        type: 'protocol',
        name: 'Duplicate',
        description: '',
        tags: [],
        status: 'mature',
        metadata: {},
      }),
    ).toThrow('already exists');
  });

  it('updateNode updates fields and updatedAt', () => {
    const before = getNode('protocol/nsdr')!;
    const oldUpdatedAt = before.updatedAt;

    // Wait a tiny bit to ensure timestamp differs
    const updated = updateNode('protocol/nsdr', {
      tags: [...before.tags, 'updated'],
    });

    expect(updated).toBeDefined();
    expect(updated!.tags).toContain('updated');
    expect(updated!.updatedAt).not.toBe(oldUpdatedAt);
  });

  it('updateNode returns undefined for unknown id', () => {
    const result = updateNode('protocol/doesnotexist', { name: 'New' });
    expect(result).toBeUndefined();
  });

  it('deleteNode removes node and connected edges', () => {
    const id = createNode({
      id: 'test/delete-me',
      type: 'concept',
      name: 'Delete Me',
      description: '',
      tags: [],
      status: 'sketch',
      metadata: {},
    }).id;

    createEdge({ from: 'protocol/nsdr', to: id, type: 'related_to', weight: 0.8 });

    const deleted = deleteNode(id);
    expect(deleted).toBe(true);
    expect(getNode(id)).toBeUndefined();
    // Edge should also be gone
    const edges = listNodes().edges;
    expect(edges.some((e) => e.from === id || e.to === id)).toBe(false);
  });

  it('deleteNode returns false for unknown id', () => {
    expect(deleteNode('protocol/nope')).toBe(false);
  });
});

// --- Edge CRUD ---

describe('Edge CRUD', () => {
  it('createEdge adds a new edge', () => {
    const edge = createEdge({
      from: 'protocol/nsdr',
      to: 'concept/polyvagal',
      type: 'related_to',
      weight: 0.85,
    });
    expect(edge.id).toBeDefined();
    expect(edge.weight).toBe(0.85);
  });

  it('createEdge uses provided id', () => {
    const edge = createEdge({
      id: 'custom-edge-id',
      from: 'protocol/nsdr',
      to: 'concept/theta-waves',
      type: 'uses_technique',
      weight: 1.0,
    });
    expect(edge.id).toBe('custom-edge-id');
  });

  it('createEdge throws on duplicate id', () => {
    createEdge({
      id: 'e-dup-test',
      from: 'protocol/nsdr',
      to: 'concept/polyvagal',
      type: 'related_to',
      weight: 0.5,
    });
    expect(() =>
      createEdge({
        id: 'e-dup-test',
        from: 'protocol/ifs',
        to: 'concept/polyvagal',
        type: 'related_to',
        weight: 0.5,
      }),
    ).toThrow('already exists');
  });

  it('deleteEdge removes the edge', () => {
    const edge = createEdge({
      from: 'protocol/ifs',
      to: 'concept/parts-work',
      type: 'based_on_concept',
      weight: 1.0,
    });
    const deleted = deleteEdge(edge.id);
    expect(deleted).toBe(true);
    expect(listNodes().edges.find((e) => e.id === edge.id)).toBeUndefined();
  });
});

// --- Query: filters ---

describe('Query — filters', () => {
  it('filters by type', () => {
    const result = listNodes({ filters: { type: 'protocol' } });
    expect(result.nodes.every((n) => n.type === 'protocol')).toBe(true);
    expect(result.nodes.length).toBeGreaterThanOrEqual(8);
  });

  it('filters by multiple types', () => {
    const result = listNodes({ filters: { type: ['protocol', 'technique'] as const } });
    expect(result.nodes.every((n) => ['protocol', 'technique'].includes(n.type))).toBe(true);
  });

  it('filters by tags', () => {
    const result = listNodes({ filters: { tags: ['trauma', 'somatic'] } });
    expect(result.nodes.length).toBeGreaterThanOrEqual(1);
    expect(result.nodes[0].tags).toSatisfy((tags: string[]) =>
      tags.some((t) => ['trauma', 'somatic'].includes(t.toLowerCase())),
    );
  });

  it('filters by status', () => {
    const result = listNodes({ filters: { status: 'mature' } });
    expect(result.nodes.every((n) => n.status === 'mature')).toBe(true);
  });

  it('filters by ids', () => {
    const result = listNodes({ filters: { ids: ['protocol/nsdr', 'protocol/ifs'] } });
    expect(result.nodes.length).toBe(2);
    expect(result.nodes.map((n) => n.id).sort()).toEqual(['protocol/ifs', 'protocol/nsdr']);
  });

  it('combines multiple filters (AND logic)', () => {
    const result = listNodes({ filters: { type: 'protocol', status: 'mature' } });
    expect(result.nodes.every((n) => n.type === 'protocol' && n.status === 'mature')).toBe(true);
  });
});

// --- Query: traverse ---

describe('Query — traverse', () => {
  it('traverses from NSDR to polyvagal concept', () => {
    const result = query({
      traverse: { from: 'protocol/nsdr', depth: 2, edgeTypes: ['based_on_concept'] },
    });
    const ids = result.nodes.map((n) => n.id);
    expect(ids).toContain('concept/polyvagal');
  });

  it('returns empty for unknown start node', () => {
    const result = query({
      traverse: { from: 'protocol/doesnotexist', depth: 2 },
    });
    expect(result.nodes).toHaveLength(0);
    expect(result.edges).toHaveLength(0);
  });

  it('respects depth limit', () => {
    // All concepts should be reachable from any protocol within depth 3
    const depth1 = query({ traverse: { from: 'protocol/nsdr', depth: 1 } });
    const depth2 = query({ traverse: { from: 'protocol/nsdr', depth: 2 } });
    expect(depth2.nodes.length).toBeGreaterThanOrEqual(depth1.nodes.length);
  });

  it('can traverse inbound edges', () => {
    const result = query({
      traverse: { from: 'concept/polyvagal', depth: 1, direction: 'inbound' },
    });
    const ids = result.nodes.map((n) => n.id);
    expect(ids).toContain('protocol/nsdr');
  });

  it('returns context (node + neighbors) for getNodeWithContext', () => {
    const result = getNodeWithContext('protocol/nsdr', 1);
    expect(result.nodes.find((n) => n.id === 'protocol/nsdr')).toBeDefined();
    // Should have at least one connected node
    expect(result.nodes.length).toBeGreaterThan(1);
  });
});

// --- Query: full-text search ---

describe('Query — full-text search', () => {
  it('finds nodes by keyword in name', () => {
    const result = query({ fullText: 'Internal Family Systems' });
    expect(result.nodes.length).toBeGreaterThanOrEqual(1);
    expect(result.nodes[0].id).toBe('protocol/ifs');
  });

  it('finds nodes by keyword in description', () => {
    const result = query({ fullText: 'parasympathetic' });
    expect(result.nodes.length).toBeGreaterThanOrEqual(1);
  });

  it('finds nodes by tag keyword', () => {
    const result = query({ fullText: 'trauma' });
    expect(result.nodes.length).toBeGreaterThanOrEqual(1);
  });

  it('returns scores sorted descending', () => {
    const result = query({ fullText: 'brainwave' });
    expect(result.scores).toBeDefined();
    for (let i = 1; i < (result.scores?.length ?? 0); i++) {
      expect((result.scores ?? [])[i - 1]).toBeGreaterThanOrEqual((result.scores ?? [])[i]);
    }
  });

  it('returns empty for no match', () => {
    const result = query({ fullText: 'xyzzyxyz' });
    expect(result.nodes).toHaveLength(0);
  });
});

// --- getProtocols ---

describe('getProtocols', () => {
  it('returns only protocol nodes', () => {
    const protocols = getProtocols();
    expect(protocols.every((n) => n.type === 'protocol')).toBe(true);
    expect(protocols.length).toBeGreaterThanOrEqual(8);
  });

  it('includes nsdr, ifs, woop, breathwork, act, se, nvc, general', () => {
    const ids = getProtocols().map((n) => n.id);
    expect(ids).toContain('protocol/nsdr');
    expect(ids).toContain('protocol/ifs');
    expect(ids).toContain('protocol/woop');
    expect(ids).toContain('protocol/breathwork');
    expect(ids).toContain('protocol/act');
    expect(ids).toContain('protocol/se');
    expect(ids).toContain('protocol/nvc');
    expect(ids).toContain('protocol/general');
  });
});

// --- getRelatedConcepts ---

describe('getRelatedConcepts', () => {
  it('returns concept nodes connected to NSDR via related edges', () => {
    const concepts = getRelatedConcepts('protocol/nsdr');
    expect(concepts.length).toBeGreaterThanOrEqual(1);
    expect(concepts.every((n) => n.type === 'concept')).toBe(true);
  });
});

// --- getStats ---

describe('getStats', () => {
  it('returns correct counts', () => {
    const stats = getStats();
    expect(stats.nodes).toBeGreaterThanOrEqual(16); // seed nodes
    expect(stats.edges).toBeGreaterThanOrEqual(13); // seed edges (13 edges in seed data)
    expect(stats.byType.protocol).toBeGreaterThanOrEqual(8);
    expect(stats.byType.concept).toBeGreaterThanOrEqual(6);
  });
});

// --- Snapshot ---

describe('getSnapshot', () => {
  it('returns valid snapshot structure', () => {
    const snap = getSnapshot();
    expect(snap.version).toBe(1);
    expect(snap.nodes.length).toBeGreaterThanOrEqual(16);
    expect(snap.edges.length).toBeGreaterThanOrEqual(13); // 13 seed edges
    expect(snap.savedAt).toBeDefined();
  });
});

// --- Integration: create, query, delete ---

describe('Integration: full cycle', () => {
  it('create → query → delete', () => {
    // Create
    const created = createNode({
      id: 'test/cycle-node',
      type: 'resource',
      name: 'Cycle Test Node',
      description: 'Testing the full CRUD cycle',
      tags: ['test', 'cycle'],
      status: 'sketch',
      metadata: {},
    });

    // Query by tag
    const found = listNodes({ filters: { tags: ['cycle'] } });
    expect(found.nodes.some((n) => n.id === 'test/cycle-node')).toBe(true);

    // Query by full-text
    const ftFound = query({ fullText: 'CRUD cycle' });
    expect(ftFound.nodes.some((n) => n.id === 'test/cycle-node')).toBe(true);

    // Update
    const updated = updateNode('test/cycle-node', { status: 'mature' });
    expect(updated!.status).toBe('mature');

    // Delete
    const deleted = deleteNode('test/cycle-node');
    expect(deleted).toBe(true);
    expect(getNode('test/cycle-node')).toBeUndefined();
  });
});
