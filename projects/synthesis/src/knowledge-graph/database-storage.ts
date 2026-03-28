/**
 * Knowledge Graph — Supabase Database Adapter
 *
 * Phase 1 design: wraps existing KGStorage (JSON file) and optionally
 * mirrors writes to Supabase when SUPABASE_URL + SUPABASE_SERVICE_KEY are set.
 * The KGStorage singleton remains the primary data source.
 *
 * Phase 2 design (DATABASE_ADAPTER=supabase):
 *   Supabase becomes the primary data source; KGStorage is swapped out.
 *   A one-time migration script handles the JSON → Supabase transition.
 *
 * Usage:
 *   import { getKGDatabase } from './database-storage.js';
 *   const db = await getKGDatabase();
 *   await db.saveSession(session, events);
 *   const stats = await db.stats();
 */

import type { KGNode, KGEdge, KGQuery, KGResult } from './types.js';
import type {
  DBSession,
  DBSessionEvent,
  DBKGNode,
  DBKGEdge,
  DBProfile,
  DBContribution,
  DBCredibilityScore,
} from '../platform/database/types.js';
import {
  dbNodeToKGNode,
  kgNodeToDBNode,
  dbEdgeToKGEdge,
  kgEdgeToDBEdge,
} from '../platform/database/types.js';
import { getStorage } from './storage.js';
import { query } from './query.js';

// ─── Supabase Client (lazy-initialized) ─────────────────────────────────────

/** Minimal Supabase client result shape we use throughout the adapter */
interface SupabaseResult<T> {
  data: T | null;
  error: unknown | null;
}

type SupabaseClient = {
  from(table: string): {
    select(cols?: string): {
      eq(column: string, value: string): SupabaseResult<unknown>;
      limit(n: number): { data: unknown[] | null; error: unknown | null };
      order(col: string, opts: object): { limit(n: number): SupabaseResult<unknown[]> };
      data: unknown[] | null;
      error: unknown | null;
    };
    insert(row: unknown): SupabaseResult<unknown>;
    update(patch: Record<string, unknown>): {
      eq(column: string, value: string): SupabaseResult<unknown>;
    };
    delete(): { eq(column: string, value: string): SupabaseResult<unknown> };
    upsert(row: unknown): SupabaseResult<unknown>;
  };
};

async function createSupabaseClient(): Promise<{ client: SupabaseClient; url: string } | null> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  try {
    // Dynamic import to avoid hard dependency when Supabase is not configured
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(url, serviceKey, {
      auth: { persistSession: false },
    }) as unknown as SupabaseClient;
    return { client, url };
  } catch (err) {
    console.warn(
      '[KGDatabase] Supabase client failed to initialize:',
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

// ─── Adapter Interface ─────────────────────────────────────────────────────────

/**
 * KGDatabaseAdapter — storage backend for the knowledge graph and sessions.
 *
 * Implemented by:
 *   - KGStoragePassthroughAdapter (in-memory + JSON file — current default)
 *   - SupabaseKGStorage (PostgreSQL via Supabase — Phase 2)
 */
export interface KGDatabaseAdapter {
  // ─── Node CRUD ──────────────────────────────────────────────────────────────

  /** Get a single node by ID */
  getNode(id: string): Promise<KGNode | undefined>;

  /** Add a new node (throws if ID already exists) */
  addNode(node: KGNode): Promise<void>;

  /** Partially update a node, return updated node or undefined if not found */
  updateNode(id: string, patch: Partial<KGNode>): Promise<KGNode | undefined>;

  /** Delete a node and all connected edges */
  deleteNode(id: string): Promise<boolean>;

  /** Get all nodes */
  getAllNodes(): Promise<KGNode[]>;

  /** Query nodes with filters */
  queryNodes(q: KGQuery): Promise<KGResult>;

  // ─── Edge CRUD ──────────────────────────────────────────────────────────────

  /** Get a single edge by ID */
  getEdge(id: string): Promise<KGEdge | undefined>;

  /** Add a new edge (throws if ID already exists) */
  addEdge(edge: KGEdge): Promise<void>;

  /** Delete an edge by ID */
  deleteEdge(id: string): Promise<boolean>;

  /** Get all edges */
  getAllEdges(): Promise<KGEdge[]>;

  // ─── Session persistence ────────────────────────────────────────────────────

  /** Save a synthesis session and its events atomically */
  saveSession(session: DBSession, events: DBSessionEvent[]): Promise<void>;

  /** Get a session and its events */
  getSession(
    id: string,
  ): Promise<(DBSession & { events: DBSessionEvent[] }) | undefined>;

  /** List sessions, optionally filtered by profile */
  listSessions(profileId?: string, limit?: number): Promise<DBSession[]>;

  // ─── Profiles ───────────────────────────────────────────────────────────────

  /** Get a profile by ID */
  getProfile(id: string): Promise<DBProfile | undefined>;

  /** Insert or update a profile */
  upsertProfile(profile: DBProfile): Promise<void>;

  // ─── Contributions ─────────────────────────────────────────────────────────

  /** Save a contribution */
  saveContribution(c: DBContribution): Promise<void>;

  /** Get all contributions for a profile */
  getContributionsByProfile(profileId: string): Promise<DBContribution[]>;

  // ─── Credibility scores ─────────────────────────────────────────────────────

  /** Get credibility score for a profile */
  getCredibilityScore(
    profileId: string,
  ): Promise<{ score: number; tier: string } | undefined>;

  /** Update credibility score for a profile */
  updateCredibilityScore(
    profileId: string,
    score: number,
    tier: string,
  ): Promise<void>;

  // ─── Bulk operations ───────────────────────────────────────────────────────

  /** Seed the graph with initial nodes and edges */
  seed(nodes: KGNode[], edges: KGEdge[]): Promise<void>;

  /** Get statistics about the graph */
  stats(): Promise<{
    nodes: number;
    edges: number;
    byType: Record<string, number>;
  }>;

  /** Whether Supabase is actively being used as primary storage */
  isSupabasePrimary(): boolean;
}

// ─── Supabase KG Storage ──────────────────────────────────────────────────────

/**
 * Supabase-backed KG storage.
 * Activated when DATABASE_ADAPTER=supabase AND Supabase credentials are present.
 */
class SupabaseKGStorage implements KGDatabaseAdapter {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  isSupabasePrimary(): boolean {
    return true;
  }

  // ─── Node CRUD ───────────────────────────────────────────────────────────────

  async getNode(id: string): Promise<KGNode | undefined> {
    const result = await this.client.from('kg_nodes').select('*').eq('id', id);
    if (result.error || !result.data) return undefined;
    return dbNodeToKGNode(result.data as DBKGNode);
  }

  async addNode(node: KGNode): Promise<void> {
    const dbNode = kgNodeToDBNode(node);
    const result = await this.client.from('kg_nodes').insert(dbNode);
    if (result.error) {
      throw new Error(`Failed to insert node ${node.id}: ${String(result.error)}`);
    }
  }

  async updateNode(id: string, patch: Partial<KGNode>): Promise<KGNode | undefined> {
    const patchDb = { ...patch, updatedAt: new Date().toISOString() };
    const result = await this.client
      .from('kg_nodes')
      .update(patchDb)
      .eq('id', id);
    if (result.error || !result.data) return undefined;
    return dbNodeToKGNode(result.data as DBKGNode);
  }

  async deleteNode(id: string): Promise<boolean> {
    // CASCADE in DB schema handles connected edges
    const result = await this.client.from('kg_nodes').delete().eq('id', id);
    return !result.error;
  }

  async getAllNodes(): Promise<KGNode[]> {
    const result = await this.client.from('kg_nodes').select('*');
    if (result.error || !result.data) return [];
    return (result.data as DBKGNode[]).map(dbNodeToKGNode);
  }

  async queryNodes(q: KGQuery): Promise<KGResult> {
    // For now: fetch all and filter in-memory (suitable for graphs <10K nodes).
    // Phase 3 would add proper Supabase query builder with PostgREST filters.
    const result = await this.client.from('kg_nodes').select('*');
    if (result.error || !result.data) return { nodes: [], edges: [] };

    let nodes = (result.data as DBKGNode[]).map(dbNodeToKGNode);

    if (q.filters?.type) {
      const types = Array.isArray(q.filters.type)
        ? new Set(q.filters.type)
        : new Set([q.filters.type]);
      nodes = nodes.filter((n) => types.has(n.type));
    }

    if (q.filters?.tags) {
      const tagSet = new Set(q.filters.tags.map((t) => t.toLowerCase()));
      nodes = nodes.filter((n) => n.tags.some((t) => tagSet.has(t.toLowerCase())));
    }

    if (q.filters?.ids) {
      const idSet = new Set(q.filters.ids);
      nodes = nodes.filter((n) => idSet.has(n.id));
    }

    if (q.limit) {
      nodes = nodes.slice(0, q.limit);
    }

    // Traversal requires recursive CTE — not yet implemented
    return { nodes, edges: [] };
  }

  // ─── Edge CRUD ─────────────────────────────────────────────────────────────

  async getEdge(id: string): Promise<KGEdge | undefined> {
    const result = await this.client.from('kg_edges').select('*').eq('id', id);
    if (result.error || !result.data) return undefined;
    return dbEdgeToKGEdge(result.data as DBKGEdge);
  }

  async addEdge(edge: KGEdge): Promise<void> {
    const dbEdge = kgEdgeToDBEdge(edge);
    const result = await this.client.from('kg_edges').insert(dbEdge);
    if (result.error) {
      throw new Error(`Failed to insert edge ${edge.id}: ${String(result.error)}`);
    }
  }

  async deleteEdge(id: string): Promise<boolean> {
    const result = await this.client.from('kg_edges').delete().eq('id', id);
    return !result.error;
  }

  async getAllEdges(): Promise<KGEdge[]> {
    const result = await this.client.from('kg_edges').select('*');
    if (result.error || !result.data) return [];
    return (result.data as DBKGEdge[]).map(dbEdgeToKGEdge);
  }

  // ─── Session persistence ─────────────────────────────────────────────────────

  async saveSession(session: DBSession, events: DBSessionEvent[]): Promise<void> {
    const sessionResult = await this.client.from('sessions').insert(session);
    if (sessionResult.error) {
      throw new Error(`Failed to insert session: ${String(sessionResult.error)}`);
    }

    if (events.length > 0) {
      const eventsResult = await this.client.from('session_events').insert(events);
      if (eventsResult.error) {
        throw new Error(`Failed to insert session events: ${String(eventsResult.error)}`);
      }
    }
  }

  async getSession(
    id: string,
  ): Promise<(DBSession & { events: DBSessionEvent[] }) | undefined> {
    const sessionResult = await this.client.from('sessions').select('*').eq('id', id);
    if (sessionResult.error || !sessionResult.data) return undefined;
    const session = sessionResult.data as unknown as DBSession;

    const eventsResult = await this.client
      .from('session_events')
      .select('*')
      .eq('session_id', id);
    const events = (eventsResult.data as DBSessionEvent[] | null) ?? [];

    return { ...session, events };
  }

  async listSessions(profileId?: string, limit = 50): Promise<DBSession[]> {
    const result = await this.client
      .from('sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (result.error || !result.data) return [];
    let sessions = result.data as unknown as DBSession[];
    if (profileId) {
      sessions = sessions.filter((s) => s.profileId === profileId);
    }
    return sessions;
  }

  // ─── Profiles ────────────────────────────────────────────────────────────────

  async getProfile(id: string): Promise<DBProfile | undefined> {
    const result = await this.client.from('profiles').select('*').eq('id', id);
    if (result.error || !result.data) return undefined;
    return result.data as unknown as DBProfile;
  }

  async upsertProfile(profile: DBProfile): Promise<void> {
    const result = await this.client.from('profiles').upsert(profile);
    if (result.error) {
      throw new Error(`Failed to upsert profile: ${String(result.error)}`);
    }
  }

  // ─── Contributions ──────────────────────────────────────────────────────────

  async saveContribution(c: DBContribution): Promise<void> {
    const result = await this.client.from('contributions').insert(c);
    if (result.error) {
      throw new Error(`Failed to insert contribution: ${String(result.error)}`);
    }
  }

  async getContributionsByProfile(profileId: string): Promise<DBContribution[]> {
    const result = await this.client
      .from('contributions')
      .select('*')
      .eq('profile_id', profileId);
    if (result.error || !result.data) return [];
    return result.data as unknown as DBContribution[];
  }

  // ─── Credibility scores ─────────────────────────────────────────────────────

  async getCredibilityScore(
    profileId: string,
  ): Promise<{ score: number; tier: string } | undefined> {
    const result = await this.client
      .from('credibility_scores')
      .select('*')
      .eq('profile_id', profileId);
    if (result.error || !result.data) return undefined;
    const row = result.data as unknown as DBCredibilityScore;
    return { score: row.credibilityScore, tier: row.tier };
  }

  async updateCredibilityScore(
    profileId: string,
    score: number,
    tier: string,
  ): Promise<void> {
    const result = await this.client.from('credibility_scores').upsert({
      profile_id: profileId,
      credibility_score: score,
      tier,
      updated_at: new Date().toISOString(),
    });
    if (result.error) {
      throw new Error(`Failed to upsert credibility score: ${String(result.error)}`);
    }
  }

  // ─── Bulk ────────────────────────────────────────────────────────────────────

  async seed(nodes: KGNode[], edges: KGEdge[]): Promise<void> {
    if (nodes.length > 0) {
      const dbNodes = nodes.map(kgNodeToDBNode);
      const result = await this.client.from('kg_nodes').insert(dbNodes);
      if (result.error) {
        throw new Error(`Failed to seed nodes: ${String(result.error)}`);
      }
    }

    if (edges.length > 0) {
      const dbEdges = edges.map(kgEdgeToDBEdge);
      const result = await this.client.from('kg_edges').insert(dbEdges);
      if (result.error) {
        throw new Error(`Failed to seed edges: ${String(result.error)}`);
      }
    }
  }

  async stats(): Promise<{
    nodes: number;
    edges: number;
    byType: Record<string, number>;
  }> {
    const [nodesResult, edgesResult] = await Promise.all([
      this.client.from('kg_nodes').select('type'),
      this.client.from('kg_edges').select('*'),
    ]);

    const nodes = (nodesResult.data as { type: string }[] | null) ?? [];
    const edges = (edgesResult.data as unknown[] | null) ?? [];

    const byType: Record<string, number> = {};
    for (const n of nodes) {
      byType[n.type] = (byType[n.type] ?? 0) + 1;
    }

    return { nodes: nodes.length, edges: edges.length, byType };
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _kgDatabase: KGDatabaseAdapter | null = null;
let _supabaseInitPromise: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Get (or create) the singleton KGDatabaseAdapter instance.
 *
 * Behavior:
 *   - DATABASE_ADAPTER=supabase + credentials → SupabaseKGStorage (Phase 2 primary)
 *   - Credentials only (no DATABASE_ADAPTER) → KGStoragePassthroughAdapter (Phase 1)
 *   - No credentials → KGStoragePassthroughAdapter (current JSON-file mode)
 */
export async function getKGDatabase(): Promise<KGDatabaseAdapter> {
  if (_kgDatabase !== null) return _kgDatabase;

  if (_supabaseInitPromise === null) {
    _supabaseInitPromise = createSupabaseClient();
  }

  const supabase = await _supabaseInitPromise;

  if (supabase && process.env.DATABASE_ADAPTER === 'supabase') {
    // Phase 2: Supabase is primary storage
    _kgDatabase = new SupabaseKGStorage(supabase.client);
    console.log('[KGDatabase] Supabase primary mode active');
    return _kgDatabase;
  }

  if (supabase) {
    console.log(
      '[KGDatabase] Supabase credentials present but DATABASE_ADAPTER!=supabase',
      '— using KGStoragePassthroughAdapter (Phase 1 dual-write not yet active)',
    );
  } else {
    console.log('[KGDatabase] No Supabase credentials — using KGStoragePassthroughAdapter');
  }

  // Default: wrap existing KGStorage through the adapter interface
  _kgDatabase = new KGStoragePassthroughAdapter();
  return _kgDatabase;
}

/**
 * KGStoragePassthroughAdapter — wraps the existing KGStorage singleton
 * and exposes it through the KGDatabaseAdapter interface.
 *
 * This is the default adapter when Supabase is not configured.
 * All async methods delegate to the synchronous KGStorage.
 */
class KGStoragePassthroughAdapter implements KGDatabaseAdapter {
  isSupabasePrimary(): boolean {
    return false;
  }

  private get storage() {
    return getStorage();
  }

  async getNode(id: string): Promise<KGNode | undefined> {
    return this.storage.getNode(id);
  }

  async addNode(node: KGNode): Promise<void> {
    this.storage.addNode(node);
  }

  async updateNode(id: string, patch: Partial<KGNode>): Promise<KGNode | undefined> {
    return this.storage.updateNode(id, patch);
  }

  async deleteNode(id: string): Promise<boolean> {
    return this.storage.deleteNode(id);
  }

  async getAllNodes(): Promise<KGNode[]> {
    return this.storage.getAllNodes();
  }

  async queryNodes(q: KGQuery): Promise<KGResult> {
    // query() uses the global KG singleton (getStorage()) internally.
    // Since this adapter IS the KGStorage singleton wrapper, this is correct.
    return query(q);
  }

  async getEdge(id: string): Promise<KGEdge | undefined> {
    return this.storage.getEdge(id);
  }

  async addEdge(edge: KGEdge): Promise<void> {
    this.storage.addEdge(edge);
  }

  async deleteEdge(id: string): Promise<boolean> {
    return this.storage.deleteEdge(id);
  }

  async getAllEdges(): Promise<KGEdge[]> {
    return this.storage.getAllEdges();
  }

  async saveSession(_session: DBSession, _events: DBSessionEvent[]): Promise<void> {
    // Sessions are stored as KG nodes (kgSessionNodeId) in the orchestrator.
    // Session persistence to a database is Phase 2.
    console.warn('[KGDatabase] saveSession: sessions not persisted in JSON-file mode');
  }

  async getSession(
    _id: string,
  ): Promise<(DBSession & { events: DBSessionEvent[] }) | undefined> {
    return undefined;
  }

  async listSessions(_profileId?: string, _limit?: number): Promise<DBSession[]> {
    return [];
  }

  async getProfile(_id: string): Promise<DBProfile | undefined> {
    return undefined;
  }

  async upsertProfile(_profile: DBProfile): Promise<void> {
    // No-op for JSON mode
  }

  async saveContribution(_c: DBContribution): Promise<void> {
    // No-op for JSON mode
  }

  async getContributionsByProfile(_profileId: string): Promise<DBContribution[]> {
    return [];
  }

  async getCredibilityScore(
    _profileId: string,
  ): Promise<{ score: number; tier: string } | undefined> {
    return undefined;
  }

  async updateCredibilityScore(
    _profileId: string,
    _score: number,
    _tier: string,
  ): Promise<void> {
    // No-op for JSON mode
  }

  async seed(nodes: KGNode[], edges: KGEdge[]): Promise<void> {
    this.storage.seed(nodes, edges);
  }

  async stats() {
    return this.storage.stats();
  }
}

/**
 * Reset the database adapter singleton (for testing).
 */
export function resetKGDatabase(): void {
  _kgDatabase = null;
  _supabaseInitPromise = null;
}
