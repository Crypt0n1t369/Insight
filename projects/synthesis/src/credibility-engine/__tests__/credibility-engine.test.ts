/**
 * Credibility Engine — Comprehensive Tests
 *
 * Tests cover:
 * - Anonymous ID generation and validation
 * - Credibility score calculation
 * - Quadratic voting
 * - Contribution tracking
 * - Decay mechanics
 * - Leaderboard ranking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  // ID utilities
  publicAnonId,
  isValidAnonId,
  generateAnonId,
  // Scoring
  citationMultiplier,
  recencyDecay,
  peerApprovalFactor,
  calculateContributionScore,
  applyDecay,
  // Quadratic voting
  quadraticVoteCost,
  canAffordVote,
  maxAffordableWeight,
  // Profile operations
  createAnonymousProfile,
  recordContribution,
  recordVote,
  // Contributions
  generateContributionId,
  createContribution,
  // Votes
  generateVoteId,
  createVote,
  // Leaderboard
  rankProfiles,
  calculatePercentile,
  // Display
  formatCredibility,
} from '../credibility-engine.js';

// ----------------------------------------------------------------
// Anonymous ID Utilities
// ----------------------------------------------------------------

describe('Anonymous ID Utilities', () => {
  describe('publicAnonId', () => {
    it('returns first 8 characters', () => {
      // 'synthesis-a1b2c3d4' → first 8 = 'synthesi'
      expect(publicAnonId('synthesis-a1b2c3d4')).toBe('synthesi');
    });

    it('handles short IDs gracefully', () => {
      expect(publicAnonId('abc')).toBe('abc');
    });

    it('truncates long IDs', () => {
      // 'synthesis-a1b2c3d4e5f6' → first 8 = 'synthesi'
      expect(publicAnonId('synthesis-a1b2c3d4e5f6')).toBe('synthesi');
    });
  });

  describe('isValidAnonId', () => {
    it('accepts valid synthesis anon IDs', () => {
      expect(isValidAnonId('synthesis-a1b2c3d4')).toBe(true);
      expect(isValidAnonId('synthesis-00000000')).toBe(true);
      expect(isValidAnonId('synthesis-ffffffff')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(isValidAnonId('synthesis-')).toBe(false);
      expect(isValidAnonId('synthesis-ghijklmn')).toBe(false); // non-hex
      expect(isValidAnonId('user-12345678')).toBe(false);
      expect(isValidAnonId('synthesis-a1b2c3')).toBe(false); // too short
      expect(isValidAnonId('')).toBe(false);
    });
  });

  describe('generateAnonId', () => {
    it('generates valid synthesis anon IDs', () => {
      const id = generateAnonId();
      expect(id).toMatch(/^synthesis-[a-f0-9]{8}$/);
    });

    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateAnonId()));
      expect(ids.size).toBe(100);
    });
  });
});

// ----------------------------------------------------------------
// Credibility Score Calculation
// ----------------------------------------------------------------

describe('Citation Multiplier', () => {
  it('returns 1.0 for zero citations', () => {
    expect(citationMultiplier(0)).toBe(1.0);
  });

  it('increases linearly up to cap', () => {
    expect(citationMultiplier(5)).toBe(1.5);
    expect(citationMultiplier(10)).toBe(2.0);
  });

  it('caps at 2.0', () => {
    expect(citationMultiplier(100)).toBe(2.0);
  });
});

describe('Recency Decay', () => {
  it('returns 1.0 for very recent activity', () => {
    const recent = new Date(Date.now() - 1000); // 1 second ago
    expect(recencyDecay(recent)).toBeCloseTo(1.0, 2);
  });

  it('applies decay for older activity', () => {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const decay = recencyDecay(oneMonthAgo);
    expect(decay).toBeCloseTo(0.95, 2);
  });

  it('caps decay at 6 months', () => {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const decay = recencyDecay(oneYearAgo);
    // After 6+ months, decay factor is 0.95^6 ≈ 0.735
    expect(decay).toBeCloseTo(Math.pow(0.95, 6), 2);
  });
});

describe('Peer Approval Factor', () => {
  it('returns 1.0 when no votes', () => {
    expect(peerApprovalFactor(0, 0)).toBe(1.0);
  });

  it('returns 0.8 for 0% approval', () => {
    expect(peerApprovalFactor(0, 10)).toBe(0.8);
  });

  it('returns 1.5 for 100% approval', () => {
    expect(peerApprovalFactor(10, 0)).toBe(1.5);
  });

  it('returns 1.15 for 50% approval', () => {
    // 0.8 + 0.5 * 0.7 = 1.15
    expect(peerApprovalFactor(5, 5)).toBe(1.15);
  });
});

describe('calculateContributionScore', () => {
  const recentDate = new Date(Date.now() - 1000);

  it('calculates base score for protocol_draft', () => {
    const score = calculateContributionScore(
      'protocol_draft',
      false, // no expertise match
      0,     // no citations
      recentDate,
      0,     // no approvals
      0,     // no rejections
      false  // not constructive
    );
    // 30 * 1.0 * 1.0 * 1.0 * 1.0 * 1.0 = 30
    expect(score).toBe(30);
  });

  it('applies expertise match multiplier', () => {
    const withMatch = calculateContributionScore(
      'protocol_draft',
      true, // expertise match
      0,
      recentDate,
      0,
      0,
      false
    );
    // 30 * 1.5 = 45
    expect(withMatch).toBe(45);
  });

  it('applies citation multiplier', () => {
    const withCitations = calculateContributionScore(
      'protocol_draft',
      false,
      5, // 5 citations = 1.5x
      recentDate,
      0,
      0,
      false
    );
    // 30 * 1.5 = 45
    expect(withCitations).toBe(45);
  });

  it('caps citation multiplier at 2x', () => {
    const withManyCitations = calculateContributionScore(
      'protocol_draft',
      false,
      50,
      recentDate,
      0,
      0,
      false
    );
    // 30 * 2.0 = 60
    expect(withManyCitations).toBe(60);
  });

  it('applies peer approval factor', () => {
    const withApproval = calculateContributionScore(
      'protocol_draft',
      false,
      0,
      recentDate,
      10, // 100% approval
      0,
      false
    );
    // 30 * 1.5 = 45
    expect(withApproval).toBe(45);
  });

  it('applies constructive multiplier', () => {
    const constructive = calculateContributionScore(
      'protocol_draft',
      false,
      0,
      recentDate,
      0,
      0,
      true
    );
    // 30 * 1.5 = 45
    expect(constructive).toBe(45);
  });

  it('combines all multipliers', () => {
    const combined = calculateContributionScore(
      'protocol_draft',
      true,   // expertise: 1.5x
      5,      // citations: 1.5x
      recentDate,
      10,     // 100% approval: 1.5x
      0,
      true    // constructive: 1.5x
    );
    // 30 * 1.5 * 1.5 * 1.5 * 1.5 ≈ 151.875
    expect(combined).toBeCloseTo(151.875, 1);
  });

  it('returns correct base scores for all contribution types', () => {
    const types: Array<{ type: Parameters<typeof calculateContributionScore>[0]; expected: number }> = [
      { type: 'protocol_draft', expected: 30 },
      { type: 'protocol_edit', expected: 20 },
      { type: 'concept_explanation', expected: 15 },
      { type: 'gap_identification', expected: 15 },
      { type: 'correction', expected: 20 },
      { type: 'peer_review', expected: 10 },
      { type: 'vote', expected: 1 },
    ];

    for (const { type, expected } of types) {
      const score = calculateContributionScore(type, false, 0, recentDate, 0, 0, false);
      expect(score).toBe(expected);
    }
  });
});

describe('applyDecay', () => {
  it('returns near-full score for recent activity', () => {
    const recent = new Date(Date.now() - 1000);
    expect(applyDecay(100, recent)).toBeCloseTo(100, 0);
  });

  it('applies ~5% decay per month (30.44-day month)', () => {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const decayed = applyDecay(100, oneMonthAgo);
    // 0.95^(30/30.44) ≈ 0.9507 (4.93% decay, not exactly 5%)
    expect(decayed).toBeCloseTo(95.07, 1);
  });

  it('compounds over multiple months', () => {
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const decayed = applyDecay(100, threeMonthsAgo);
    // 0.95^(90/30.44) ≈ 0.8573 (14.3% total decay)
    expect(decayed).toBeCloseTo(85.7, 0); // within 1 unit
  });
});

// ----------------------------------------------------------------
// Quadratic Voting
// ----------------------------------------------------------------

describe('Quadratic Voting', () => {
  describe('quadraticVoteCost', () => {
    it('returns 0 for weight 0', () => {
      expect(quadraticVoteCost(0)).toBe(0);
    });

    it('returns 1 for weight 1', () => {
      expect(quadraticVoteCost(1)).toBe(1);
    });

    it('returns 10 for weight 100', () => {
      expect(quadraticVoteCost(100)).toBe(10);
    });

    it('returns 14 for weight 196 (floors correctly)', () => {
      expect(quadraticVoteCost(196)).toBe(14);
    });

    it('returns 15 for weight 225', () => {
      expect(quadraticVoteCost(225)).toBe(15);
    });

    it('throws for negative weight', () => {
      expect(() => quadraticVoteCost(-1)).toThrow('Vote weight must be non-negative');
    });

    it('demonstrates quadratic scaling (key property)', () => {
      // 10x weight doesn't cost 10x — it costs √10 ≈ 3.16x
      const cost1 = quadraticVoteCost(100);
      const cost10x = quadraticVoteCost(1000);
      expect(cost10x / cost1).toBeCloseTo(Math.sqrt(10), 1);
    });
  });

  describe('canAffordVote', () => {
    it('returns true when score equals cost', () => {
      expect(canAffordVote(10, 100)).toBe(true); // cost=10, have=10
    });

    it('returns true when score exceeds cost', () => {
      expect(canAffordVote(15, 100)).toBe(true); // cost=10, have=15
    });

    it('returns false when score is insufficient', () => {
      expect(canAffordVote(9, 100)).toBe(false); // cost=10, have=9
    });
  });

  describe('maxAffordableWeight', () => {
    it('returns 0 for 0 credibility', () => {
      expect(maxAffordableWeight(0)).toBe(0);
    });

    it('returns 100 for 10 credibility (10²)', () => {
      expect(maxAffordableWeight(10)).toBe(100);
    });

    it('returns 10000 for 100 credibility (100²)', () => {
      expect(maxAffordableWeight(100)).toBe(10000);
    });
  });
});

// ----------------------------------------------------------------
// Profile Operations
// ----------------------------------------------------------------

describe('Profile Operations', () => {
  describe('createAnonymousProfile', () => {
    it('creates profile with zero credibility', () => {
      const profile = createAnonymousProfile('synthesis-a1b2c3d4');
      expect(profile.anonId).toBe('synthesis-a1b2c3d4');
      expect(profile.credibilityScore).toBe(0);
      expect(profile.totalContributions).toBe(0);
    });

    it('optionally attaches wallet address', () => {
      const profile = createAnonymousProfile(
        'synthesis-a1b2c3d4',
        '0x1234567890abcdef'
      );
      expect(profile.walletAddress).toBe('0x1234567890abcdef');
    });

    it('sets createdAt and lastActivityAt', () => {
      const before = new Date();
      const profile = createAnonymousProfile('synthesis-a1b2c3d4');
      const after = new Date();
      expect(profile.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(profile.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(profile.lastActivityAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('recordContribution', () => {
    it('increases credibility score', () => {
      const profile = createAnonymousProfile('synthesis-a1b2c3d4');
      const updated = recordContribution(profile, 30);
      expect(updated.credibilityScore).toBe(30);
    });

    it('increments contribution count', () => {
      const profile = createAnonymousProfile('synthesis-a1b2c3d4');
      const updated = recordContribution(profile, 20);
      expect(updated.totalContributions).toBe(1);
    });

    it('accumulates over multiple contributions', () => {
      let profile = createAnonymousProfile('synthesis-a1b2c3d4');
      profile = recordContribution(profile, 30);
      profile = recordContribution(profile, 20);
      profile = recordContribution(profile, 15);
      expect(profile.credibilityScore).toBe(65);
      expect(profile.totalContributions).toBe(3);
    });

    it('updates lastActivityAt', () => {
      const oldDate = new Date(Date.now() - 10000);
      const profile = { ...createAnonymousProfile('synthesis-a1b2c3d4'), lastActivityAt: oldDate };
      const updated = recordContribution(profile, 10);
      expect(updated.lastActivityAt.getTime()).toBeGreaterThan(oldDate.getTime());
    });
  });

  describe('recordVote', () => {
    it('deducts vote cost from credibility', () => {
      const profile = createAnonymousProfile('synthesis-a1b2c3d4');
      const withCred = recordContribution(profile, 100); // score = 100
      const afterVote = recordVote(withCred, 10); // cost = 10
      expect(afterVote.credibilityScore).toBe(90);
    });

    it('does not go below 0', () => {
      const profile = createAnonymousProfile('synthesis-a1b2c3d4');
      const afterVote = recordVote(profile, 100);
      expect(afterVote.credibilityScore).toBe(0);
    });

    it('updates lastActivityAt', () => {
      const oldDate = new Date(Date.now() - 10000);
      const profile = { ...createAnonymousProfile('synthesis-a1b2c3d4'), lastActivityAt: oldDate };
      const updated = recordVote(profile, 1);
      expect(updated.lastActivityAt.getTime()).toBeGreaterThan(oldDate.getTime());
    });
  });
});

// ----------------------------------------------------------------
// Contribution Creation
// ----------------------------------------------------------------

describe('Contribution Creation', () => {
  describe('generateContributionId', () => {
    it('generates unique IDs', () => {
      const ids = new Set(
        Array.from({ length: 50 }, () => generateContributionId())
      );
      expect(ids.size).toBe(50);
    });

    it('starts with contrib- prefix', () => {
      expect(generateContributionId()).toMatch(/^contrib-/);
    });
  });

  describe('createContribution', () => {
    it('creates a contribution with calculated score', () => {
      const contrib = createContribution({
        anonId: 'synthesis-a1b2c3d4',
        type: 'protocol_draft',
        contentId: 'ifs-v1',
        contentVersion: '1.0',
      });
      expect(contrib.anonId).toBe('synthesis-a1b2c3d4');
      expect(contrib.type).toBe('protocol_draft');
      expect(contrib.score).toBe(30); // base score
      expect(contrib.metrics.votesReceived).toBe(0);
    });

    it('applies all modifiers', () => {
      const recent = new Date(Date.now() - 1000);
      const contrib = createContribution({
        anonId: 'synthesis-a1b2c3d4',
        type: 'protocol_draft',
        contentId: 'ifs-v1',
        contentVersion: '1.0',
        expertiseMatch: true,
        citations: 5,
        approvals: 10,
        rejections: 0,
        constructive: true,
        lastActivity: recent,
      });
      // 30 * 1.5 * 1.5 * 1.0 * 1.5 * 1.5 ≈ 151.875
      expect(contrib.score).toBeCloseTo(151.875, 1);
    });

    it('defaults all optional parameters', () => {
      const contrib = createContribution({
        anonId: 'synthesis-a1b2c3d4',
        type: 'vote',
        contentId: 'proposal-1',
        contentVersion: '1.0',
      });
      expect(contrib.score).toBe(1); // vote base
      expect(contrib.metrics.citations).toBe(0);
      expect(contrib.metrics.approvals).toBe(0);
    });
  });
});

// ----------------------------------------------------------------
// Vote Creation
// ----------------------------------------------------------------

describe('Vote Creation', () => {
  describe('generateVoteId', () => {
    it('generates unique IDs', () => {
      const ids = new Set(Array.from({ length: 50 }, () => generateVoteId()));
      expect(ids.size).toBe(50);
    });

    it('starts with vote- prefix', () => {
      expect(generateVoteId()).toMatch(/^vote-/);
    });
  });

  describe('createVote', () => {
    it('creates a vote with correct cost', () => {
      const vote = createVote({
        voterAnonId: 'synthesis-a1b2c3d4',
        targetId: 'proposal-1',
        weight: 100,
        direction: 'support',
        voterCredibilityScore: 10,
      });
      expect(vote.weight).toBe(100);
      expect(vote.cost).toBe(10); // √100
      expect(vote.direction).toBe('support');
    });

    it('throws when insufficient credibility', () => {
      expect(() =>
        createVote({
          voterAnonId: 'synthesis-a1b2c3d4',
          targetId: 'proposal-1',
          weight: 100,
          direction: 'support',
          voterCredibilityScore: 5, // can only afford √5 ≈ 2
        })
      ).toThrow('Insufficient credibility');
    });

    it('throws for negative weight', () => {
      expect(() =>
        createVote({
          voterAnonId: 'synthesis-a1b2c3d4',
          targetId: 'proposal-1',
          weight: -10,
          direction: 'support',
          voterCredibilityScore: 100,
        })
      ).toThrow('Vote weight must be non-negative');
    });

    it('allows zero-weight votes', () => {
      const vote = createVote({
        voterAnonId: 'synthesis-a1b2c3d4',
        targetId: 'proposal-1',
        weight: 0,
        direction: 'support',
        voterCredibilityScore: 0,
      });
      expect(vote.cost).toBe(0);
    });
  });
});

// ----------------------------------------------------------------
// Leaderboard
// ----------------------------------------------------------------

describe('Leaderboard', () => {
  const profiles: ReturnType<typeof createAnonymousProfile>[] = [];

  beforeEach(() => {
    profiles.length = 0;
    // Create 5 profiles with known scores
    const scores = [30, 100, 50, 20, 80];
    for (const score of scores) {
      const p = createAnonymousProfile(generateAnonId());
      // Directly set credibility for testing
      profiles.push({ ...p, credibilityScore: score });
    }
  });

  describe('rankProfiles', () => {
    it('sorts descending by credibility', () => {
      const ranked = rankProfiles(profiles);
      expect(ranked[0].credibilityScore).toBe(100);
      expect(ranked[1].credibilityScore).toBe(80);
      expect(ranked[2].credibilityScore).toBe(50);
      expect(ranked[3].credibilityScore).toBe(30);
      expect(ranked[4].credibilityScore).toBe(20);
    });

    it('does not mutate original array', () => {
      const original = [...profiles];
      rankProfiles(profiles);
      expect(profiles[0].credibilityScore).toBe(original[0].credibilityScore);
    });
  });

  describe('calculatePercentile', () => {
    it('returns 100 for the top profile', () => {
      const ranked = rankProfiles(profiles);
      const percentile = calculatePercentile(ranked[0], ranked);
      expect(percentile).toBe(100); // top of 5
    });

    it('returns 0 for the bottom profile', () => {
      const ranked = rankProfiles(profiles);
      const percentile = calculatePercentile(ranked[4], ranked);
      expect(percentile).toBe(0); // bottom of 5
    });

    it('returns 100 for single profile', () => {
      const percentile = calculatePercentile(profiles[0], [profiles[0]]);
      expect(percentile).toBe(100);
    });

    it('returns correct intermediate percentiles', () => {
      // 5 profiles: sorted [100, 80, 50, 30, 20]
      // position 0 (100) → 100th percentile
      // position 2 (50) → ((5-2-1)/(5-1))*100 = 50th percentile
      const ranked = rankProfiles(profiles);
      const p = calculatePercentile(ranked[2], ranked);
      expect(p).toBe(50);
    });
  });
});

// ----------------------------------------------------------------
// Display Helpers
// ----------------------------------------------------------------

describe('Display Helpers', () => {
  describe('formatCredibility', () => {
    it('formats score to 1 decimal place without percentile', () => {
      expect(formatCredibility(45.678)).toBe('45.7');
    });

    it('formats as percentile when provided', () => {
      expect(formatCredibility(45.678, 75)).toBe('top 25%');
    });

    it('formats zero score', () => {
      expect(formatCredibility(0)).toBe('0.0');
    });
  });
});
