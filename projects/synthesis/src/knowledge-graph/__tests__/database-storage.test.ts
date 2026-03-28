/**
 * KGDatabaseAdapter — Unit Tests
 *
 * Tests the KGStoragePassthroughAdapter (default when Supabase is not configured).
 * When Supabase is configured with DATABASE_ADAPTER=supabase, SupabaseKGStorage is used instead.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getKGDatabase, resetKGDatabase } from '../database-storage.js';
import type { KGDatabaseAdapter } from '../database-storage.js';
import type { KGNode, KGEdge } from '../types.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeNode(overrides: Partial<KGNode> = {}): KGNode {
  const now = new Date().toISOString();
  return {
    id: `node-${Math.random().toString(36).slice(2)}`,
    type: 'protocol',
    name: 'Test Protocol',
    description: 'A test protocol node',
    tags: ['test'],
    status: 'sketch',
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeEdge(overrides: Partial<KGEdge> = {}): KGEdge {
  return {
    id: `edge-${Math.random().toString(36).slice(2)}`,
    from: 'node-a',
    to: 'node-b',
    type: 'uses_technique',
    weight: 0.8,
    metadata: {},
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('KGDatabaseAdapter — KGStoragePassthroughAdapter', () => {
  let adapter: KGDatabaseAdapter;

  beforeEach(async () => {
    // Reset singleton before each test
    resetKGDatabase();
    adapter = await getKGDatabase();
  });

  // ─── Mode ──────────────────────────────────────────────────────────────────

  it('is Supabase primary = false when no Supabase credentials', () => {
    expect(adapter.isSupabasePrimary()).toBe(false);
  });

  // ─── Node CRUD ──────────────────────────────────────────────────────────────

  it('getNode returns undefined for non-existent node', async () => {
    const result = await adapter.getNode('non-existent-id-12345');
    expect(result).toBeUndefined();
  });

  it('addNode inserts a node and getNode retrieves it', async () => {
    const node = makeNode({ id: 'test-node-add-1', name: 'Add Test Node' });
    await adapter.addNode(node);
    const retrieved = await adapter.getNode('test-node-add-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe('test-node-add-1');
    expect(retrieved?.name).toBe('Add Test Node');
    expect(retrieved?.type).toBe('protocol');
  });

  it('addNode throws if node ID already exists', async () => {
    const node = makeNode({ id: 'test-duplicate-id' });
    await adapter.addNode(node);
    await expect(adapter.addNode(node)).rejects.toThrow();
  });

  it('getAllNodes returns all inserted nodes', async () => {
    const node1 = makeNode({ id: 'test-all-1', name: 'Node One' });
    const node2 = makeNode({ id: 'test-all-2', name: 'Node Two' });
    await adapter.addNode(node1);
    await adapter.addNode(node2);
    const all = await adapter.getAllNodes();
    const ids = all.map((n) => n.id);
    expect(ids).toContain('test-all-1');
    expect(ids).toContain('test-all-2');
  });

  it('updateNode updates an existing node and returns the updated node', async () => {
    const node = makeNode({ id: 'test-update-1', status: 'sketch' });
    await adapter.addNode(node);

    const updated = await adapter.updateNode('test-update-1', {
      status: 'developing',
      description: 'Updated description',
    });

    expect(updated).toBeDefined();
    expect(updated?.status).toBe('developing');
    expect(updated?.description).toBe('Updated description');
    expect(updated?.id).toBe('test-update-1'); // ID must not change
  });

  it('updateNode returns undefined for non-existent node', async () => {
    const result = await adapter.updateNode('non-existent-update', { status: 'mature' });
    expect(result).toBeUndefined();
  });

  it('deleteNode removes a node', async () => {
    const node = makeNode({ id: 'test-delete-1' });
    await adapter.addNode(node);
    const deleted = await adapter.deleteNode('test-delete-1');
    expect(deleted).toBe(true);
    const retrieved = await adapter.getNode('test-delete-1');
    expect(retrieved).toBeUndefined();
  });

  it('deleteNode returns false for non-existent node', async () => {
    const result = await adapter.deleteNode('non-existent-delete');
    expect(result).toBe(false);
  });

  it('deleteNode also removes connected edges', async () => {
    const nodeA = makeNode({ id: 'test-edge-node-a' });
    const nodeB = makeNode({ id: 'test-edge-node-b' });
    await adapter.addNode(nodeA);
    await adapter.addNode(nodeB);

    const edge = makeEdge({ id: 'test-edge-1', from: 'test-edge-node-a', to: 'test-edge-node-b' });
    await adapter.addEdge(edge);

    await adapter.deleteNode('test-edge-node-a');

    const retrievedEdge = await adapter.getEdge('test-edge-1');
    expect(retrievedEdge).toBeUndefined();
  });

  // ─── Edge CRUD ──────────────────────────────────────────────────────────────

  it('getEdge returns undefined for non-existent edge', async () => {
    const result = await adapter.getEdge('non-existent-edge');
    expect(result).toBeUndefined();
  });

  it('addEdge inserts an edge and getEdge retrieves it', async () => {
    const node1 = makeNode({ id: 'test-edge-from' });
    const node2 = makeNode({ id: 'test-edge-to' });
    await adapter.addNode(node1);
    await adapter.addNode(node2);

    const edge = makeEdge({
      id: 'test-edge-add',
      from: 'test-edge-from',
      to: 'test-edge-to',
      weight: 0.9,
    });
    await adapter.addEdge(edge);

    const retrieved = await adapter.getEdge('test-edge-add');
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe('test-edge-add');
    expect(retrieved?.weight).toBe(0.9);
    expect(retrieved?.from).toBe('test-edge-from');
    expect(retrieved?.to).toBe('test-edge-to');
  });

  it('addEdge throws if edge ID already exists', async () => {
    const node1 = makeNode({ id: 'test-edge-dup-a' });
    const node2 = makeNode({ id: 'test-edge-dup-b' });
    await adapter.addNode(node1);
    await adapter.addNode(node2);

    const edge = makeEdge({ id: 'test-edge-dup', from: 'test-edge-dup-a', to: 'test-edge-dup-b' });
    await adapter.addEdge(edge);
    await expect(adapter.addEdge(edge)).rejects.toThrow();
  });

  it('getAllEdges returns all inserted edges', async () => {
    const node1 = makeNode({ id: 'test-edges-all-1' });
    const node2 = makeNode({ id: 'test-edges-all-2' });
    const node3 = makeNode({ id: 'test-edges-all-3' });
    await adapter.addNode(node1);
    await adapter.addNode(node2);
    await adapter.addNode(node3);

    await adapter.addEdge(makeEdge({ id: 'test-e1', from: 'test-edges-all-1', to: 'test-edges-all-2' }));
    await adapter.addEdge(makeEdge({ id: 'test-e2', from: 'test-edges-all-2', to: 'test-edges-all-3' }));

    const all = await adapter.getAllEdges();
    const ids = all.map((e) => e.id);
    expect(ids).toContain('test-e1');
    expect(ids).toContain('test-e2');
  });

  it('deleteEdge removes an edge', async () => {
    const node1 = makeNode({ id: 'test-del-edge-a' });
    const node2 = makeNode({ id: 'test-del-edge-b' });
    await adapter.addNode(node1);
    await adapter.addNode(node2);

    await adapter.addEdge(makeEdge({ id: 'test-del-edge', from: 'test-del-edge-a', to: 'test-del-edge-b' }));
    const deleted = await adapter.deleteEdge('test-del-edge');
    expect(deleted).toBe(true);

    const retrieved = await adapter.getEdge('test-del-edge');
    expect(retrieved).toBeUndefined();
  });

  it('deleteEdge returns false for non-existent edge', async () => {
    const result = await adapter.deleteEdge('non-existent-edge-delete');
    expect(result).toBe(false);
  });

  // ─── Query ─────────────────────────────────────────────────────────────────

  it('queryNodes returns all nodes when no filters', async () => {
    const node = makeNode({ id: 'test-query-all' });
    await adapter.addNode(node);
    const result = await adapter.queryNodes({});
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges).toBeDefined();
  });

  it('queryNodes filters by type', async () => {
    const node1 = makeNode({ id: 'test-q-type-1', type: 'protocol' });
    const node2 = makeNode({ id: 'test-q-type-2', type: 'technique' });
    await adapter.addNode(node1);
    await adapter.addNode(node2);

    const result = await adapter.queryNodes({ filters: { type: 'protocol' } });
    const types = result.nodes.map((n) => n.type);
    expect(types.every((t) => t === 'protocol')).toBe(true);
  });

  it('queryNodes filters by tags (case-insensitive)', async () => {
    const node1 = makeNode({ id: 'test-q-tag-1', tags: ['breathwork', 'relaxation'] });
    const node2 = makeNode({ id: 'test-q-tag-2', tags: ['visualization'] });
    await adapter.addNode(node1);
    await adapter.addNode(node2);

    const result = await adapter.queryNodes({ filters: { tags: ['breathwork'] } });
    const ids = result.nodes.map((n) => n.id);
    expect(ids).toContain('test-q-tag-1');
    expect(ids).not.toContain('test-q-tag-2');
  });

  it('queryNodes applies limit', async () => {
    for (let i = 0; i < 5; i++) {
      await adapter.addNode(makeNode({ id: `test-q-limit-${i}` }));
    }
    const result = await adapter.queryNodes({ limit: 3 });
    expect(result.nodes.length).toBeLessThanOrEqual(3);
  });

  // ─── Bulk ──────────────────────────────────────────────────────────────────

  it('seed inserts multiple nodes and edges', async () => {
    const nodeA = makeNode({ id: 'seed-node-a' });
    const nodeB = makeNode({ id: 'seed-node-b' });
    const edge = makeEdge({ id: 'seed-edge', from: 'seed-node-a', to: 'seed-node-b' });

    await adapter.seed([nodeA, nodeB], [edge]);

    const retrievedNode = await adapter.getNode('seed-node-a');
    const retrievedEdge = await adapter.getEdge('seed-edge');
    expect(retrievedNode).toBeDefined();
    expect(retrievedEdge).toBeDefined();
  });

  it('stats returns node and edge counts', async () => {
    const node = makeNode({ id: 'stats-test-node', type: 'protocol' });
    await adapter.addNode(node);

    const stats = await adapter.stats();
    expect(typeof stats.nodes).toBe('number');
    expect(typeof stats.edges).toBe('number');
    expect(typeof stats.byType).toBe('object');
    expect(stats.nodes).toBeGreaterThan(0);
  });

  // ─── Session persistence (no-op in JSON mode) ──────────────────────────────

  it('saveSession logs warning and does not throw (JSON-file mode)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await adapter.saveSession(
      {
        id: 'test-session',
        profileId: 'test-profile',
        protocol: 'woop',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        eventCount: 5,
        confidence: 0.9,
        routingReasoning: 'test',
        recordToKg: true,
        recordContribution: true,
        createdAt: new Date().toISOString(),
      },
      [],
    );
    expect(warnSpy).toHaveBeenCalledWith(
      '[KGDatabase] saveSession: sessions not persisted in JSON-file mode',
    );
    warnSpy.mockRestore();
  });

  it('getSession returns undefined (not supported in JSON-file mode)', async () => {
    const result = await adapter.getSession('any-session-id');
    expect(result).toBeUndefined();
  });

  it('listSessions returns empty array (not supported in JSON-file mode)', async () => {
    const result = await adapter.listSessions();
    expect(result).toEqual([]);
  });

  // ─── Profile operations (no-op in JSON mode) ───────────────────────────────

  it('getProfile returns undefined (not supported in JSON-file mode)', async () => {
    const result = await adapter.getProfile('any-profile');
    expect(result).toBeUndefined();
  });

  it('upsertProfile is no-op (does not throw)', async () => {
    await expect(
      adapter.upsertProfile({
        id: 'test-profile',
        createdAt: new Date().toISOString(),
        metadata: {},
      }),
    ).resolves.not.toThrow();
  });

  // ─── Contributions (no-op in JSON mode) ───────────────────────────────────

  it('getContributionsByProfile returns empty array (not supported in JSON-file mode)', async () => {
    const result = await adapter.getContributionsByProfile('any-profile');
    expect(result).toEqual([]);
  });

  it('saveContribution is no-op (does not throw)', async () => {
    await expect(
      adapter.saveContribution({
        id: 'test-contrib',
        profileId: 'test-profile',
        contributionType: 'session',
        points: 10,
        createdAt: new Date().toISOString(),
      }),
    ).resolves.not.toThrow();
  });

  // ─── Credibility (no-op in JSON mode) ──────────────────────────────────────

  it('getCredibilityScore returns undefined (not supported in JSON-file mode)', async () => {
    const result = await adapter.getCredibilityScore('any-profile');
    expect(result).toBeUndefined();
  });

  it('updateCredibilityScore is no-op (does not throw)', async () => {
    await expect(
      adapter.updateCredibilityScore('any-profile', 50, 'contributor'),
    ).resolves.not.toThrow();
  });

  // ─── Singleton behavior ────────────────────────────────────────────────────

  it('getKGDatabase returns the same singleton instance', async () => {
    resetKGDatabase();
    const a = await getKGDatabase();
    const b = await getKGDatabase();
    expect(a).toBe(b);
  });

  it('resetKGDatabase clears the singleton', async () => {
    resetKGDatabase();
    const a = await getKGDatabase();
    resetKGDatabase();
    const b = await getKGDatabase();
    // Different instances after reset
    expect(a).not.toBe(b);
  });
});
