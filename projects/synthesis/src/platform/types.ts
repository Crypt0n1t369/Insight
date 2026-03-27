// Platform Integration Layer — Types

import type { RouterInput, RouterOutput, ContextPackage } from '../router-agent/types.js';
import type { SessionEvent } from '../specialist-agents/types.js';
import type { KGNode, KGEdge, KGQuery, KGResult } from '../knowledge-graph/types.js';

// ----------------------------------------------------------------
// Session lifecycle
// ----------------------------------------------------------------

/**
 * Outcome of a completed synthesis session.
 */
export interface SessionResult {
  sessionId: string;
  userId: string;
  protocol: string;
  startedAt: string;       // ISO timestamp
  completedAt: string;      // ISO timestamp
  eventCount: number;
  events: SessionEvent[];
  kgSessionNodeId?: string; // Knowledge Graph node ID for this session
  contributionId?: string;  // Credibility Engine contribution ID
}

/**
 * Input for starting a new synthesis session.
 * Thin wrapper around RouterInput with optional KG context.
 */
export interface SessionStartInput {
  /** Raw user input (text or transcript) */
  rawInput: string;
  /** User identifier */
  userId: string;
  /** Session identifier (provide your own or let the orchestrator generate one) */
  sessionId?: string;
  /** Input modality */
  modality?: 'voice' | 'text';
  /** Pre-detected emotion (optional — router will infer if not provided) */
  detectedEmotion?: RouterInput['detectedEmotion'];
  /** Recently used protocols (to avoid repetition) */
  recentProtocols?: RouterInput['recentProtocols'];
  /** Time of day for context-aware routing */
  timeOfDay?: RouterInput['timeOfDay'];
  /**
   * Whether to record this session to the Knowledge Graph.
   * Default: true.
   */
  recordToKG?: boolean;
  /**
   * Whether to record a credibility contribution.
   * Default: true.
   */
  recordContribution?: boolean;
  /**
   * Prior session summary for context continuity.
   */
  priorSessionSummary?: string;
}

// ----------------------------------------------------------------
// KG integration
// ----------------------------------------------------------------

/**
 * Summary of a session stored in the Knowledge Graph.
 */
export interface KGSessionSummary {
  nodeId: string;
  protocol: string;
  eventCount: number;
  durationMinutes: number;
  detectedEmotion?: string;
  createdAt: string;
}

// ----------------------------------------------------------------
// Synthesis stats
// ----------------------------------------------------------------

export interface SynthesisStats {
  totalSessions: number;
  totalEvents: number;
  sessionsByProtocol: Record<string, number>;
  knowledgeGraphStats: {
    nodes: number;
    edges: number;
  };
  topContributors: Array<{
    anonId: string;
    credibilityScore: number;
  }>;
  platformUptime: string;
}

// ----------------------------------------------------------------
// Orchestrator config
// ----------------------------------------------------------------

export interface OrchestratorConfig {
  /**
   * Override the KG initialization function.
   * Allows injecting a test storage instance.
   */
  kgStorageOverride?: unknown;
  /**
   * Override the credibility engine functions.
   * Allows injecting mock profiles for testing.
   */
  credibilityOverride?: unknown;
}
