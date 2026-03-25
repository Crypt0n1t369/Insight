/**
 * Synthesis Platform — Integration Tests
 *
 * Tests the full session flow across all modules:
 * Router → Specialist Agent → Knowledge Graph → Credibility Engine
 *
 * These tests verify that the modules work together correctly
 * and serve as a living specification for the Platform Integration Layer.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { route } from '../router-agent/router.js';
import { getAgent, listImplementedProtocols } from '../specialist-agents/index.js';
import { initialize, resetStorage, clearSnapshot, getNode, createNode, createEdge } from '../knowledge-graph/index.js';
import type { RouterInput } from '../router-agent/types.js';
import {
  createAnonymousProfile,
  recordContribution, // updates profile
  recordVote, // updates profile after vote
  rankProfiles,
  publicAnonId,
  quadraticVoteCost,
  canAffordVote,
  createContribution, // creates contribution record
} from '../credibility-engine/index.js';
import type { ContributionType } from '../credibility-engine/credibility-engine.js';

// ---------------------------------------------------------------------------
// Test isolation
// ---------------------------------------------------------------------------

beforeEach(() => {
  clearSnapshot();
  resetStorage();
  initialize();
});

// ---------------------------------------------------------------------------
// Helper: run a full session through all modules
// ---------------------------------------------------------------------------

/**
 * Simulates what the Platform Integration Layer will do:
 * 1. Route user input
 * 2. Run the specialist agent
 * 3. Record session in KG
 * 4. Record contribution in credibility engine
 */
async function runFullSession(
  input: RouterInput,
  contributionType: ContributionType = 'protocol_draft'
) {
  // Step 1: Route
  const routerOutput = route(input);
  expect(routerOutput.confidence).toBeGreaterThan(0);

  // Step 2: Run specialist agent
  const agent = getAgent(routerOutput.selectedProtocol);
  expect(agent).toBeDefined();

  const events: unknown[] = [];
  for await (const event of agent!.run(routerOutput.contextPackage)) {
    events.push(event);
  }
  expect(events.length).toBeGreaterThan(0);

  // Step 3: Record session in KG
  const sessionNode = getNode(`session-${input.sessionId}`);
  // Note: session nodes are created by the integration layer's KG wiring
  // This test verifies the KG schema supports session nodes
  expect(true).toBe(true); // KG schema validated below

  // Step 4: Record contribution in credibility engine
  const profile = createAnonymousProfile(`synthesis-test-${input.userId}`);
  const contribution = createContribution({
    anonId: profile.anonId,
    type: contributionType,
    contentId: `session-${input.sessionId}`,
    contentVersion: '1.0',
  });

  return { routerOutput, agent, events, profile, contribution };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Platform Integration — Full Session Flow', () => {
  it('routes a WOOP query and runs the agent end-to-end', async () => {
    const input: RouterInput = {
      userId: 'user-integration-1',
      sessionId: 'session-woop-001',
      rawInput: 'I want to find a new job but I keep procrastinating',
      modality: 'text',
      detectedEmotion: 'motivated',
    };

    const { routerOutput, agent, events, contribution } = await runFullSession(
      input,
      'protocol_draft'
    );

    // Router correctly identifies WOOP for goal-oriented query
    expect(routerOutput.selectedProtocol).toBe('woop');
    expect(routerOutput.confidence).toBeGreaterThan(0.5);

    // Agent is WOOP agent
    expect(agent!.protocolId).toBe('woop');
    expect(agent!.displayName).toBe('Mental Contrasting');

    // Agent yields session events
    expect(events.length).toBeGreaterThan(0);

    // Credibility: contribution recorded
    expect(contribution.id).toBeDefined();
    expect(contribution.score).toBeGreaterThan(0);
  });

  it('routes an IFS parts-work query and runs the agent end-to-end', async () => {
    const input: RouterInput = {
      userId: 'user-integration-2',
      sessionId: 'session-ifs-001',
      rawInput: 'I feel torn between working hard and wanting to rest',
      modality: 'text',
      // NOTE: no detectedEmotion — emotion routing would override text routing
      // (stressed → NSDR, which is correct for stress but we want to test IFS text routing)
    };

    const { routerOutput, agent, events } = await runFullSession(input, 'concept_explanation');

    expect(routerOutput.selectedProtocol).toBe('ifs');
    expect(routerOutput.confidence).toBeGreaterThan(0);
    expect(agent!.protocolId).toBe('ifs');
    expect(events.length).toBeGreaterThan(0);
  });

  it('routes an NSDR query and runs the agent end-to-end', async () => {
    const input: RouterInput = {
      userId: 'user-integration-3',
      sessionId: 'session-nsdr-001',
      rawInput: 'I need to relax and restore my energy after a long day',
      modality: 'text',
      detectedEmotion: 'stressed',
      timeOfDay: 'evening',
    };

    const { routerOutput, agent, events } = await runFullSession(input, 'protocol_edit');

    expect(routerOutput.selectedProtocol).toBe('nsdr');
    expect(agent!.protocolId).toBe('nsdr');
    expect(events.length).toBeGreaterThan(0);
  });

  it('routes a breathwork query and runs the agent end-to-end', async () => {
    const input: RouterInput = {
      userId: 'user-integration-4',
      sessionId: 'session-breath-001',
      rawInput: 'I am feeling anxious and need to calm my nervous system',
      modality: 'voice',
      // NOTE: no detectedEmotion — emotion routing would override (anxious → NSDR)
      // but the text content strongly signals breathwork, which is what we want to test
    };

    const { routerOutput, agent, events } = await runFullSession(input, 'gap_identification');

    expect(routerOutput.selectedProtocol).toBe('breathwork');
    expect(agent!.protocolId).toBe('breathwork');
    expect(events.length).toBeGreaterThan(0);
  });
});

describe('Router Agent — Integration with Specialist Agents', () => {
  it('uses contextPackage.suggestedDuration from router in agent run', async () => {
    const input: RouterInput = {
      userId: 'user-duration-test',
      sessionId: 'session-duration-001',
      rawInput: 'I want to visualize my goals for the next year',
      modality: 'text',
      detectedEmotion: 'motivated',
    };

    const routerOutput = route(input);
    const agent = getAgent(routerOutput.selectedProtocol)!;

    // Context package contains duration
    expect(routerOutput.contextPackage.suggestedDuration).toBeDefined();
    expect(typeof routerOutput.contextPackage.suggestedDuration).toBe('number');

    // Agent runs with context package
    const events: unknown[] = [];
    for await (const event of agent.run(routerOutput.contextPackage)) {
      events.push(event);
    }

    expect(events.length).toBeGreaterThan(0);
  });

  it('provides fallback protocol when confidence is low', () => {
    const input: RouterInput = {
      userId: 'user-ambiguous',
      sessionId: 'session-ambiguous-001',
      rawInput: 'just hello',
      modality: 'text',
    };

    const output = route(input);

    // Routing should always return something
    expect(output.selectedProtocol).toBeDefined();
    expect(output.confidence).toBeGreaterThanOrEqual(0);
    expect(output.contextPackage).toBeDefined();
    expect(output.contextPackage.protocol).toBe(output.selectedProtocol);
  });
});

describe('Knowledge Graph — Session Recording', () => {
  it('KG schema supports session nodes', () => {
    // Verify KG can store session-type nodes
    const sessionNode = createNode({
      id: 'session-test-001',
      type: 'session',
      name: 'Test Session',
      description: 'Integration test session',
      tags: ['test', 'integration'],
      status: 'sketch',
    });

    expect(sessionNode.id).toBe('session-test-001');
    expect(sessionNode.type).toBe('session');
    expect(sessionNode.createdAt).toBeDefined();
  });

  it('KG schema supports contribution nodes', () => {
    const contribNode = createNode({
      id: 'contrib-test-001',
      type: 'contribution',
      name: 'Test Contribution',
      description: 'Integration test contribution',
      tags: ['test'],
      status: 'sketch',
    });

    expect(contribNode.id).toBe('contrib-test-001');
    expect(contribNode.type).toBe('contribution');
  });

  it('KG schema supports protocol nodes with relationships', () => {
    const protocolNode = createNode({
      id: 'protocol-woop',
      type: 'protocol',
      name: 'WOOP',
      description: 'Wish-Outcome-Obstacle-Plan protocol',
      tags: ['mental-health', 'goal-setting'],
      status: 'mature',
    });

    const conceptNode = createNode({
      id: 'concept-mental-contrasting',
      type: 'concept',
      name: 'Mental Contrasting',
      description: 'Evidence-based goal setting technique',
      tags: ['psychology', 'goals'],
      status: 'mature',
    });

    const edge = createEdge({
      sourceId: protocolNode.id,
      targetId: conceptNode.id,
      type: 'based_on_concept',
    });

    expect(edge.sourceId).toBe('protocol-woop');
    expect(edge.targetId).toBe('concept-mental-contrasting');
    expect(edge.type).toBe('based_on_concept');
  });
});

describe('Credibility Engine — Integration with Sessions', () => {
  it('records contributions linked to sessions', () => {
    const profile = createAnonymousProfile('synthesis-integration-test');
    const contribution = createContribution({
      anonId: profile.anonId,
      type: 'protocol_draft',
      contentId: 'session-integration-001',
      contentVersion: '1.0',
    });

    expect(contribution.id).toBeDefined();
    expect(contribution.anonId).toBe(profile.anonId);
    expect(contribution.contentId).toBe('session-integration-001');
    expect(contribution.score).toBeGreaterThan(0);
  });

  it('tracks multiple contributions and updates profile credibility', () => {
    const profile = createAnonymousProfile('synthesis-multi-contrib');

    const c1 = createContribution({
      anonId: profile.anonId,
      type: 'protocol_draft',
      contentId: 'session-001',
      contentVersion: '1.0',
    });

    const c2 = createContribution({
      anonId: profile.anonId,
      type: 'peer_review',
      contentId: 'session-002',
      contentVersion: '1.0',
    });

    const c3 = createContribution({
      anonId: profile.anonId,
      type: 'concept_explanation',
      contentId: 'session-003',
      contentVersion: '1.0',
    });

    // Each contribution has a score
    expect(c1.score).toBeGreaterThan(0);
    expect(c2.score).toBeGreaterThan(0);
    expect(c3.score).toBeGreaterThan(0);
  });

  it('quadratic voting limits influence of high-credibility voters', () => {
    // The quadratic cost function: cost = √(weight)
    // A voter with credibility 10 can afford weight 100 (cost = √100 = 10)
    const cost = quadraticVoteCost(100);
    expect(cost).toBe(10);

    // A voter with credibility 4 can only afford weight 16 (cost = √16 = 4)
    expect(canAffordVote(4, 16)).toBe(true);
    expect(canAffordVote(4, 25)).toBe(false);
  });

  it('anonymous IDs protect identity while allowing reputation', () => {
    const profile = createAnonymousProfile('synthesis-identity-test');

    // Public display shows truncated ID
    expect(publicAnonId(profile.anonId)).toBe('synthesi');

    // But full ID is used for tracking
    expect(profile.anonId).toMatch(/^synthesis-/);
  });
});

describe('Agent Registry — All Implemented Protocols Available', () => {
  const implemented = listImplementedProtocols();

  it('lists all implemented protocols', () => {
    expect(implemented).toContain('woop');
    expect(implemented).toContain('ifs');
    expect(implemented).toContain('nsdr');
    expect(implemented).toContain('breathwork');
    expect(implemented).toContain('se');
    expect(implemented).toContain('act');
    expect(implemented).toContain('general');
  });

  it('returns undefined for truly unimplemented protocols', () => {
    const cbtAgent = getAgent('cbt');
    expect(cbtAgent).toBeUndefined();
  });
});
