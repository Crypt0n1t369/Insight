/**
 * JSON → Supabase Migration Script
 *
 * One-time migration: reads the existing KG JSON snapshot and bulk-upserts
 * all data into Supabase.
 *
 * Usage (after Supabase is configured):
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=xxx \
 *   DATABASE_ADAPTER=supabase \
 *   npx tsx scripts/migrate-json-to-supabase.ts
 *
 * Safety:
 *   - Uses upsert (INSERT ... ON CONFLICT DO UPDATE) — idempotent, re-runnable
 *   - Does NOT delete the JSON file (backup first)
 *   - Logs every step
 *
 * What it migrates:
 *   - kg_nodes    ← all nodes from JSON snapshot
 *   - kg_edges    ← all edges from JSON snapshot
 *   - sessions    ← session-type KG nodes only
 *   - profiles    ← derived from session userIds (created if not exist)
 *
 * What it does NOT migrate (events were in-memory only):
 *   - session_events — these lived in the server process and were never persisted
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// scripts/synthesis/scripts/ → 3 up = projects/synthesis/
const WORKSPACE_ROOT = join(__dirname, '..');

const SNAPSHOT_PATH = join(
  WORKSPACE_ROOT,
  '..', '..', '..', // projects/synthesis/ → workspace/
  'data', 'synthesis', 'knowledge-graph.json',
);

interface KGSnapshot {
  version: number;
  nodes: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
    tags: string[];
    status: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  }>;
  edges: Array<{
    id: string;
    from: string;
    to: string;
    type: string;
    weight: number;
    metadata?: Record<string, unknown>;
  }>;
  savedAt: string;
}

async function migrate(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    console.error('[migrate] FATAL: SUPABASE_URL and SUPABASE_SERVICE_KEY env vars are required.');
    console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx npx tsx scripts/migrate-json-to-supabase.ts');
    process.exit(1);
  }

  // ── Load JSON snapshot ────────────────────────────────────────────────────
  if (!existsSync(SNAPSHOT_PATH)) {
    console.error(`[migrate] FATAL: Snapshot not found at ${SNAPSHOT_PATH}`);
    console.error('  Run the synthesis server first to generate the snapshot, then re-run this script.');
    process.exit(1);
  }

  const raw = readFileSync(SNAPSHOT_PATH, 'utf-8');
  const snapshot: KGSnapshot = JSON.parse(raw);
  console.log(`[migrate] Loaded snapshot: ${snapshot.nodes.length} nodes, ${snapshot.edges.length} edges`);
  console.log(`[migrate] Saved at: ${snapshot.savedAt}`);

  // ── Init Supabase client ─────────────────────────────────────────────────
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // ── Migrate kg_nodes ────────────────────────────────────────────────────
  console.log('\n[migrate] Migrating kg_nodes...');
  const kgNodesToInsert = snapshot.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    name: n.name,
    description: n.description,
    tags: n.tags,
    status: n.status,
    metadata: n.metadata,
    created_at: n.createdAt,
    updated_at: n.updatedAt,
  }));

  const { error: nodesError } = await supabase.from('kg_nodes').upsert(kgNodesToInsert);
  if (nodesError) {
    console.error('[migrate] FATAL: Failed to upsert kg_nodes:', nodesError);
    process.exit(1);
  }
  console.log(`[migrate] ✓ Upserted ${kgNodesToInsert.length} kg_nodes`);

  // ── Migrate kg_edges ────────────────────────────────────────────────────
  console.log('\n[migrate] Migrating kg_edges...');
  const kgEdgesToInsert = snapshot.edges.map((e) => ({
    id: e.id,
    from_node: e.from,
    to_node: e.to,
    type: e.type,
    weight: e.weight,
    metadata: e.metadata ?? {},
    created_at: new Date().toISOString(),
  }));

  const { error: edgesError } = await supabase.from('kg_edges').upsert(kgEdgesToInsert);
  if (edgesError) {
    console.error('[migrate] FATAL: Failed to upsert kg_edges:', edgesError);
    process.exit(1);
  }
  console.log(`[migrate] ✓ Upserted ${kgEdgesToInsert.length} kg_edges`);

  // ── Migrate sessions (session-type KG nodes → sessions table) ───────────
  console.log('\n[migrate] Migrating sessions...');
  const sessionNodes = snapshot.nodes.filter((n) => n.type === 'session');

  if (sessionNodes.length === 0) {
    console.log('[migrate]   No session nodes found — skipping sessions table');
  } else {
    // Collect all unique profileIds first
    const profileIds = new Set<string>();
    for (const s of sessionNodes) {
      const userId = s.metadata?.userId as string | undefined;
      if (userId) profileIds.add(userId);
    }

    // Upsert profiles first (sessions reference them)
    if (profileIds.size > 0) {
      const profilesToInsert = Array.from(profileIds).map((id) => ({
        id,
        metadata: {},
        created_at: new Date().toISOString(),
      }));
      const { error: profilesError } = await supabase.from('profiles').upsert(profilesToInsert);
      if (profilesError) {
        console.error('[migrate] FATAL: Failed to upsert profiles:', profilesError);
        process.exit(1);
      }
      console.log(`[migrate] ✓ Upserted ${profilesToInsert.length} profiles`);
    }

    // Upsert sessions
    const sessionsToInsert = sessionNodes.map((s) => {
      const m = s.metadata ?? {};
      return {
        id: (m.sessionId as string) ?? s.id,
        profile_id: (m.userId as string) ?? null,
        protocol: (m.protocol as string) ?? 'unknown',
        started_at: (m.startedAt as string) ?? s.createdAt,
        completed_at: (m.completedAt as string) ?? s.updatedAt,
        event_count: (m.eventCount as number) ?? 0,
        confidence: (m.confidence as number) ?? null,
        routing_reasoning: (m.routingReasoning as string) ?? null,
        detected_emotion: (m.detectedEmotion as string) ?? null,
        emotion_reasoning: (m.emotionReasoning as string) ?? null,
        record_to_kg: true,
        record_contribution: true,
        created_at: s.createdAt,
      };
    });

    const { error: sessionsError } = await supabase.from('sessions').upsert(sessionsToInsert);
    if (sessionsError) {
      console.error('[migrate] FATAL: Failed to upsert sessions:', sessionsError);
      process.exit(1);
    }
    console.log(`[migrate] ✓ Upserted ${sessionsToInsert.length} sessions`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log('\n[migrate] Migration complete!');
  console.log(`  kg_nodes:    ${snapshot.nodes.length}`);
  console.log(`  kg_edges:    ${snapshot.edges.length}`);
  console.log(`  sessions:    ${sessionNodes.length}`);
  console.log('\nNext steps:');
  console.log('  1. Verify data in Supabase dashboard');
  console.log('  2. Start synthesis server with DATABASE_ADAPTER=supabase');
  console.log('  3. Remove or archive the JSON snapshot file');
}

migrate().catch((err) => {
  console.error('[migrate] FATAL:', err);
  process.exit(1);
});
