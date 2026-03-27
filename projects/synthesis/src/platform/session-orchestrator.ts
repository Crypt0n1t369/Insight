/**
 * Session Orchestrator — Platform Integration Layer
 *
 * Wires together: Router → Specialist Agents → Knowledge Graph → Credibility Engine
 *
 * Flow:
 *   1. route(input)        → Router Agent selects protocol
 *   2. runSession(ctx)     → Specialist Agent produces SessionEvent stream
 *   3. recordSessionToKG() → Session summary stored in Knowledge Graph
 *   4. recordContribution() → Contribution tracked in Credibility Engine
 *   5. queryKG()           → Query the knowledge graph
 */

import { randomUUID } from 'crypto';

import { route } from '../router-agent/router.js';
import type {
  RouterInput,
  RouterOutput,
  ContextPackage,
  ProtocolId,
} from '../router-agent/types.js';

import { getAgent, listImplementedProtocols } from '../specialist-agents/index.js';
import type { SessionEvent } from '../specialist-agents/types.js';

import * as KG from '../knowledge-graph/index.js';
import type { KGNode, KGQuery, KGResult } from '../knowledge-graph/types.js';

import {
  createAnonymousProfile,
  createContribution,
  recordContribution as updateProfileOnContribution,
  getProfile,
  getAllProfiles,
  rankProfiles,
  type ContributionType,
} from '../credibility-engine/index.js';

import type {
  SessionResult,
  SessionStartInput,
  KGSessionSummary,
  SynthesisStats,
  OrchestratorConfig,
} from './types.js';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function makeRouterInput(input: SessionStartInput): RouterInput {
  return {
    userId: input.userId,
    sessionId: input.sessionId ?? randomUUID(),
    rawInput: input.rawInput,
    modality: input.modality ?? 'text',
    detectedEmotion: input.detectedEmotion,
    recentProtocols: input.recentProtocols,
    timeOfDay: input.timeOfDay,
  };
}

/** Build a readable prior-session summary from an array of prior SessionResults. */
function buildPriorSummary(priorSessions: SessionResult[]): string | undefined {
  if (priorSessions.length === 0) return undefined;
  const lines = priorSessions.slice(-3).map(
    (s) =>
      `[${s.protocol}] ${s.eventCount} events, ${s.completedAt.slice(0, 10)}`,
  );
  return `Recent sessions:\n${lines.join('\n')}`;
}

// ----------------------------------------------------------------
// Session Orchestrator
// ----------------------------------------------------------------

export class SessionOrchestrator {
  private kgInitialized = false;
  private config: OrchestratorConfig;
  private readonly startTime = Date.now();

  constructor(config: OrchestratorConfig = {}) {
    this.config = config;
  }

  // ─── Initialization ────────────────────────────────────────────

  /** Initialize the Knowledge Graph (idempotent). */
  initializeKG(): void {
    if (this.kgInitialized) return;
    KG.initialize();
    this.kgInitialized = true;
  }

  // ─── Core session lifecycle ──────────────────────────────────────

  /**
   * Run a complete synthesis session:
   *   route → validate → run specialist → record to KG → record credibility contribution
   *
   * Returns the final SessionResult with all emitted events.
   * Throws if routing fails or the selected agent is not implemented.
   */
  async runSession(input: SessionStartInput): Promise<SessionResult> {
    this.initializeKG();

    const routerInput = makeRouterInput(input);
    const sessionId = routerInput.sessionId;
    const startedAt = new Date().toISOString();

    // ── Step 1: Route ───────────────────────────────────────────
    const routeOutput = route(routerInput);
    const { selectedProtocol, contextPackage, confidence, reasoning } = routeOutput;

    // ── Step 2: Validate ────────────────────────────────────────
    const agent = getAgent(selectedProtocol);
    if (!agent) {
      throw new Error(
        `No agent implemented for protocol "${selectedProtocol}". ` +
          `Implemented: ${listImplementedProtocols().join(', ')}.`,
      );
    }

    const validation = agent.validate(contextPackage);
    if (!validation.valid) {
      throw new Error(
        `Validation failed for protocol "${selectedProtocol}": ${validation.reason}` +
          (validation.suggestedProtocol
            ? ` — suggested: ${validation.suggestedProtocol}`
            : ''),
      );
    }

    // ── Step 3: Run specialist agent ─────────────────────────────
    const events: SessionEvent[] = [];
    let lastEvent: SessionEvent | undefined;

    for await (const event of agent.run(contextPackage)) {
      events.push(event);
      lastEvent = event;
    }

    // Verify session ended with a completion event
    if (!lastEvent || lastEvent.type !== 'completion') {
      throw new Error(
        `Session ended without a 'completion' event (last event: ${lastEvent?.type ?? 'none'}). ` +
          `This indicates a bug in the ${selectedProtocol} agent.`,
      );
    }

    const completedAt = new Date().toISOString();

    // ── Step 4: Record to Knowledge Graph ────────────────────────
    let kgSessionNodeId: string | undefined;
    if (input.recordToKG !== false) {
      kgSessionNodeId = this.recordSessionToKG({
        sessionId,
        userId: input.userId,
        protocol: selectedProtocol,
        eventCount: events.length,
        startedAt,
        completedAt,
        confidence,
        routingReasoning: reasoning,
        detectedEmotion: contextPackage.detectedEmotion,
        emotionReasoning: routeOutput.reasoning,
      });
    }

    // ── Step 5: Record credibility contribution ──────────────────
    let contributionId: string | undefined;
    if (input.recordContribution !== false) {
      contributionId = this.recordContribution({
        userId: input.userId,
        sessionId,
        protocol: selectedProtocol,
        eventCount: events.length,
        confidence,
      });
    }

    return {
      sessionId,
      userId: input.userId,
      protocol: selectedProtocol,
      startedAt,
      completedAt,
      eventCount: events.length,
      events,
      kgSessionNodeId,
      contributionId,
    };
  }

  // ─── Knowledge Graph integration ────────────────────────────────

  /**
   * Run a synthesis session and yield events as they are produced (streaming).
   * Unlike runSession, this is an async generator that yields events one-by-one.
   *
   * Use this when you need to stream events to a client in real-time.
   * After the stream ends, call recordSessionAndContribution() to persist.
   */
  async *streamSession(
    input: SessionStartInput,
  ): AsyncGenerator<SessionEvent & { protocol: ProtocolId; sessionId: string }> {
    this.initializeKG();

    const routerInput = makeRouterInput(input);
    const sessionId = routerInput.sessionId;

    const routeOutput = route(routerInput);
    const { selectedProtocol, contextPackage } = routeOutput;

    const agent = getAgent(selectedProtocol);
    if (!agent) {
      throw new Error(`No agent for protocol "${selectedProtocol}".`);
    }

    const validation = agent.validate(contextPackage);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.reason}`);
    }

    for await (const event of agent.run(contextPackage)) {
      yield { ...event, protocol: selectedProtocol, sessionId };
    }
  }

  /**
   * Record a completed session to the Knowledge Graph.
   * Returns the KG node ID for the session.
   */
  recordSessionToKG(data: {
    sessionId: string;
    userId: string;
    protocol: string;
    eventCount: number;
    startedAt: string;
    completedAt: string;
    confidence: number;
    routingReasoning: string;
    detectedEmotion?: string;
    emotionReasoning?: string;
  }): string {
    const { sessionId, protocol, eventCount, startedAt, completedAt, confidence } = data;

    // Create a session node
    const sessionNode = KG.createNode({
      id: `session-${sessionId}`,
      type: 'session',
      name: `${protocol} session ${sessionId.slice(0, 8)}`,
      description: `Synthesis ${protocol} session with ${eventCount} events.`,
      tags: [protocol, 'synthesis'],
      status: 'mature',
      metadata: {
        sessionId,
        userId: data.userId,
        protocol: data.protocol,
        eventCount,
        startedAt,
        completedAt,
        confidence,
        detectedEmotion: data.detectedEmotion,
        routingReasoning: data.routingReasoning,
        emotionReasoning: data.emotionReasoning,
      },
    });

    // Link session to protocol node (try — protocol node may not exist in dev KG)
    const protocolNodes = KG.query({ filters: { type: 'protocol', tags: [protocol] } });
    for (const pNode of protocolNodes.nodes) {
      KG.createEdge({
        id: `session-uses-${sessionId}`,
        from: sessionNode.id,
        to: pNode.id,
        type: 'related_to',
        weight: 1.0,
        metadata: { sessionId, relationship: 'protocol_used_in_session' },
      });
    }

    // Link session to user node (try)
    const userNodes = KG.query({ filters: { type: 'user', tags: [data.userId] } });
    for (const uNode of userNodes.nodes) {
      KG.createEdge({
        id: `user-session-${sessionId}`,
        from: uNode.id,
        to: sessionNode.id,
        type: 'related_to',
        weight: 1.0,
        metadata: { sessionId },
      });
    }

    return sessionNode.id;
  }

  /**
   * Record a credibility contribution for a completed session.
   * Uses the credibility engine's createContribution which handles scoring internally.
   */
  recordContribution(data: {
    userId: string;
    sessionId: string;
    protocol: string;
    eventCount: number;
    confidence: number;
  }): string {
    const { userId, sessionId, eventCount, confidence } = data;

    // Derive an anonymous ID from userId (stable per user)
    const anonId = `synthesis-${userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`;

    const contributionType: ContributionType = 'protocol_draft';
    const contentId = `session-${sessionId}`;
    const contentVersion = '1';

    // Create the contribution record (generates a score internally)
    const contribution = createContribution({
      anonId,
      type: contributionType,
      contentId,
      contentVersion,
      expertiseMatch: confidence > 0.7,
      lastActivity: new Date(),
      approvals: Math.round(eventCount / 5),
      rejections: 0,
      constructive: true,
      citations: 0,
    });

    // Get or create the profile and update it with the contribution score
    // (updateProfileOnContribution stores the updated profile in the in-memory profileStore)
    let profile = getProfile(anonId);
    if (!profile) {
      profile = createAnonymousProfile(anonId);
    }
    updateProfileOnContribution(profile, contribution.score);

    return contribution.id;
  }

  // ─── Query helpers ─────────────────────────────────────────────

  /** Query the Knowledge Graph. */
  queryKG(query: KGQuery): KGResult {
    this.initializeKG();
    return KG.query(query);
  }

  /** Get a session node from the Knowledge Graph by session ID. */
  getSession(sessionId: string): KGNode | undefined {
    return KG.getNode(`session-${sessionId}`);
  }

  /** Get all sessions for a user. */
  getUserSessions(userId: string): KGNode[] {
    // Query all session nodes and filter by userId stored in metadata.
    // This is more reliable than traversing via user nodes (which may not exist in dev KG).
    const allSessions = KG.query({ filters: { type: 'session' } });
    return allSessions.nodes.filter((n) => n.metadata?.userId === userId);
  }

  /** Get protocol usage counts from the KG. */
  getProtocolStats(): Record<string, number> {
    const sessions = KG.query({ filters: { type: 'session' } });
    const counts: Record<string, number> = {};
    for (const node of sessions.nodes) {
      const protocol = node.metadata?.protocol as string | undefined;
      if (protocol) {
        counts[protocol] = (counts[protocol] ?? 0) + 1;
      }
    }
    return counts;
  }

  /** Get overall synthesis platform statistics. */
  getStats(): SynthesisStats {
    this.initializeKG();

    const sessions = KG.query({ filters: { type: 'session' } });
    const kgStats = KG.query({}); // all nodes/edges

    // Sum eventCount from all session node metadata
    let totalEvents = 0;
    for (const node of sessions.nodes) {
      const m = (node as { metadata?: Record<string, unknown> }).metadata ?? {};
      if (typeof m['eventCount'] === 'number') {
        totalEvents += m['eventCount'] as number;
      }
    }

    // Compute uptime string
    const elapsedMs = Date.now() - this.startTime;
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const platformUptime =
      hours > 0 ? `${hours}h ${minutes}m` :
      minutes > 0 ? `${minutes}m ${seconds}s` :
      `${seconds}s`;

    return {
      totalSessions: sessions.nodes.length,
      totalEvents,
      sessionsByProtocol: this.getProtocolStats(),
      knowledgeGraphStats: {
        nodes: kgStats.nodes.length,
        edges: kgStats.edges.length,
      },
      topContributors: rankProfiles(getAllProfiles())
        .slice(0, 10)
        .map((p) => ({ anonId: p.anonId, credibilityScore: p.credibilityScore })),
      platformUptime,
    };
  }
}

// ─── Default orchestrator singleton (lazy-initialized) ─────────────────────

let _defaultOrchestrator: SessionOrchestrator | undefined;

export function getOrchestrator(): SessionOrchestrator {
  if (!_defaultOrchestrator) {
    _defaultOrchestrator = new SessionOrchestrator();
  }
  return _defaultOrchestrator;
}

/**
 * Convenience: run a complete synthesis session in one call.
 */
export async function runSynthesisSession(
  input: SessionStartInput,
): Promise<SessionResult> {
  return getOrchestrator().runSession(input);
}
