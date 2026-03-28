/**
 * Supabase Database Types — Synthesis Platform
 *
 * These types mirror the PostgreSQL schema defined in docs/SUPABASE_SCHEMA.md.
 * They are DB-level representations of the domain objects used by KGStorage.
 *
 * When Supabase is active, these replace the in-memory representations.
 * When Supabase is not configured, the existing KGStorage continues to work.
 */

import type { NodeType, EdgeType, NodeStatus } from '../../knowledge-graph/types.js';

// ─── Profiles ────────────────────────────────────────────────────────────────

export interface DBProfile {
  id: string; // e.g. "anon_abc123"
  createdAt: string; // ISO timestamp
  metadata: Record<string, unknown>;
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export interface DBSession {
  id: string; // UUID from orchestrator
  profileId: string;
  protocol: string; // 'woop' | 'ifs' | 'nsdr' | etc.
  startedAt: string; // ISO timestamp
  completedAt: string; // ISO timestamp
  eventCount: number;
  confidence: number; // router confidence 0–1
  routingReasoning: string;
  detectedEmotion?: string;
  emotionReasoning?: string;
  recordToKg: boolean;
  recordContribution: boolean;
  contributionId?: string; // FK to contributions.id
  createdAt: string; // ISO timestamp
}

// ─── Session Events ───────────────────────────────────────────────────────────

export type SessionEventType = 'guidance' | 'prompt' | 'transition' | 'completion';

export interface DBSessionEvent {
  id?: number; // SERIAL — assigned by DB on insert
  sessionId: string;
  type: SessionEventType;
  phase: string;
  audioUrl?: string;
  transcript?: string;
  duration?: number; // seconds
  metadata: Record<string, unknown>;
  createdAt: string; // ISO timestamp
}

// ─── Knowledge Graph Nodes ────────────────────────────────────────────────────

export interface DBKGNode {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  tags: string[];
  status: NodeStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Knowledge Graph Edges ────────────────────────────────────────────────────

export interface DBKGEdge {
  id: string;
  fromNode: string; // Node ID (DB column: from_node)
  toNode: string; // Node ID (DB column: to_node)
  type: EdgeType;
  weight: number; // 0.0–1.0
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Contributions ────────────────────────────────────────────────────────────

export type ContributionType = 'session' | 'kg_edit' | 'vote' | 'attestation';

export interface DBContribution {
  id: string;
  profileId: string;
  sessionId?: string;
  contributionType: ContributionType;
  protocol?: string;
  eventCount?: number;
  confidence?: number;
  points: number;
  createdAt: string;
}

// ─── Credibility Scores ──────────────────────────────────────────────────────

export type CredibilityTier = 'newcomer' | 'contributor' | 'expert' | 'elder';

export interface DBCredibilityScore {
  profileId: string;
  credibilityScore: number;
  tier: CredibilityTier;
  updatedAt: string;
}

// ─── Type Conversions (DB ↔ Domain) ──────────────────────────────────────────

/**
 * Convert a DBKGNode to the in-memory KGNode representation.
 * Strips DB-specific fields, maps snake_case to camelCase.
 */
export function dbNodeToKGNode(db: DBKGNode): import('../../knowledge-graph/types.js').KGNode {
  return {
    id: db.id,
    type: db.type,
    name: db.name,
    description: db.description,
    tags: db.tags,
    status: db.status,
    metadata: db.metadata,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
}

/**
 * Convert an in-memory KGNode to a DBKGNode for insertion.
 */
export function kgNodeToDBNode(
  node: import('../../knowledge-graph/types.js').KGNode,
): DBKGNode {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    description: node.description,
    tags: node.tags,
    status: node.status,
    metadata: node.metadata,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
}

/**
 * Convert a DBKGEdge to the in-memory KGEdge representation.
 */
export function dbEdgeToKGEdge(db: DBKGEdge): import('../../knowledge-graph/types.js').KGEdge {
  return {
    id: db.id,
    from: db.fromNode,
    to: db.toNode,
    type: db.type,
    weight: db.weight,
    metadata: db.metadata,
  };
}

/**
 * Convert an in-memory KGEdge to a DBKGEdge for insertion.
 */
export function kgEdgeToDBEdge(
  edge: import('../../knowledge-graph/types.js').KGEdge,
): DBKGEdge {
  return {
    id: edge.id,
    fromNode: edge.from,
    toNode: edge.to,
    type: edge.type,
    weight: edge.weight,
    metadata: edge.metadata,
    createdAt: new Date().toISOString(),
  };
}
