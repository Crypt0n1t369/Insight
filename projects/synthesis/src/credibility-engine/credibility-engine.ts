/**
 * Credibility Engine — Egoless reputation tracking
 *
 * Contributions are attributed to value provided, not identity.
 * Pseudonymous profiles track credibility without storing PII.
 *
 * Core principles:
 * - A user's reputation is determined by what they contributed — not who they are
 * - Credibility scores reflect actual impact, not tenure
 * - Quadratic voting limits rich-get-richer effects
 */

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export type ContributionType =
  | 'protocol_draft'
  | 'protocol_edit'
  | 'concept_explanation'
  | 'gap_identification'
  | 'peer_review'
  | 'vote'
  | 'correction';

export interface ContributionMetrics {
  votesReceived: number;
  approvals: number;
  rejections: number;
  citations: number;
  reports: number;
}

export interface Contribution {
  id: string;
  anonId: string;
  type: ContributionType;
  contentId: string;
  contentVersion: string;
  score: number;
  metrics: ContributionMetrics;
  timestamp: Date;
}

export interface CredibilityWeights {
  expertiseMatch: number;
  citationCount: number;
  recency: number;
  peerApproval: number;
  constructive: boolean;
}

export interface AnonymousProfile {
  anonId: string;
  walletAddress?: string;
  credibilityScore: number;
  totalContributions: number;
  lastActivityAt: Date;
  createdAt: Date;
}

export type VoteDirection = 'support' | 'oppose';

export interface Vote {
  id: string;
  voterAnonId: string;
  targetId: string;
  weight: number;       // credibility units spent
  cost: number;         // √(weight) — what voter actually pays
  direction: VoteDirection;
  timestamp: Date;
}

// ----------------------------------------------------------------
// Constants
// ----------------------------------------------------------------

/** Base scores per contribution type */
const BASE_SCORES: Record<ContributionType, number> = {
  protocol_draft: 30,
  protocol_edit: 20,
  concept_explanation: 15,
  gap_identification: 15,
  correction: 20,
  peer_review: 10,
  vote: 1,
};

/** Maximum citation multiplier cap (2x) */
const CITATION_CAP = 2.0;

/** Monthly decay factor (5% per month inactive) */
const MONTHLY_DECAY = 0.95;

/** Months until full decay (6 months) */
const FULL_DECAY_MONTHS = 6;

// ----------------------------------------------------------------
// Anonymous ID utilities
// ----------------------------------------------------------------

/**
 * Truncate anonId to first 8 characters for public display.
 * Provides ~280k combinations — enough for anonymous attribution.
 */
export function publicAnonId(anonId: string): string {
  return anonId.slice(0, 8);
}

/**
 * Validate anonId format (synthesis- prefix + hex).
 */
export function isValidAnonId(anonId: string): boolean {
  return /^synthesis-[a-f0-9]{8}$/i.test(anonId);
}

/**
 * Generate a new anonymous ID.
 */
export function generateAnonId(): string {
  const hex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `synthesis-${hex}`;
}

// ----------------------------------------------------------------
// Credibility Score Calculation
// ----------------------------------------------------------------

/**
 * Calculate the citation multiplier (capped at 2x).
 */
export function citationMultiplier(citations: number): number {
  return Math.min(1 + citations * 0.1, CITATION_CAP);
}

/**
 * Calculate recency decay factor.
 * Exponential decay over 6 months to near-zero.
 */
export function recencyDecay(lastActivity: Date): number {
  const now = new Date();
  const monthsInactive = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  return Math.pow(MONTHLY_DECAY, Math.min(monthsInactive, FULL_DECAY_MONTHS));
}

/**
 * Calculate peer approval ratio factor.
 *peerApprovalRate = approvals / (approvals + rejections)
 */
export function peerApprovalFactor(approvals: number, rejections: number): number {
  const total = approvals + rejections;
  if (total === 0) return 1.0;
  const rate = approvals / total;
  // Factor scales from 0.8 (0% approval) to 1.5 (100% approval)
  return 0.8 + rate * 0.7;
}

/**
 * Calculate the credibility score for a contribution.
 *
 * Formula:
 * credibility = base_score
 *   × expertise_match(1.5 if matched, 1.0 otherwise)
 *   × min(1 + citations × 0.1, 2.0)
 *   × recency_decay(age_in_days)
 *   × peer_approval(approval_rate)
 *   × (constructive ? 1.5 : 1.0)
 */
export function calculateContributionScore(
  type: ContributionType,
  expertiseMatch: boolean,
  citations: number,
  lastActivity: Date,
  approvals: number,
  rejections: number,
  constructive: boolean
): number {
  const baseScore = BASE_SCORES[type];
  const expertiseFactor = expertiseMatch ? 1.5 : 1.0;
  const citationFactor = citationMultiplier(citations);
  const recencyFactor = recencyDecay(lastActivity);
  const peerFactor = peerApprovalFactor(approvals, rejections);
  const constructiveFactor = constructive ? 1.5 : 1.0;

  const score =
    baseScore *
    expertiseFactor *
    citationFactor *
    recencyFactor *
    peerFactor *
    constructiveFactor;

  return Math.round(score * 100) / 100;
}

/**
 * Apply decay to a credibility score based on inactivity.
 */
export function applyDecay(score: number, lastActivity: Date): number {
  return score * recencyDecay(lastActivity);
}

// ----------------------------------------------------------------
// Quadratic Voting
// ----------------------------------------------------------------

/**
 * Calculate the cost of a vote using quadratic pricing.
 * cost = √(weight)
 *
 * A user with 100× more credibility can spend 10× more (√100 = 10), not 100× more.
 * This limits the rich-get-richer effect.
 */
export function quadraticVoteCost(weight: number): number {
  if (weight < 0) throw new Error('Vote weight must be non-negative');
  // Use sqrt directly (not floored) to preserve quadratic property:
  // cost(w1)/cost(w2) = sqrt(w1/w2)
  // A user with 100× more credibility spends 10× more (√100 = 10), not 100×.
  return Math.sqrt(weight);
}

/**
 * Validate that a voter has sufficient credibility to cast a vote.
 */
export function canAffordVote(credibilityScore: number, weight: number): boolean {
  const cost = quadraticVoteCost(weight);
  return credibilityScore >= cost;
}

/**
 * Calculate the maximum vote weight a user can afford.
 */
export function maxAffordableWeight(credibilityScore: number): number {
  // cost = √(weight) ≤ credibilityScore
  // weight ≤ credibilityScore²
  return credibilityScore * credibilityScore;
}

// ----------------------------------------------------------------
// Anonymous Profile Operations
// ----------------------------------------------------------------

/**
 * Create a new anonymous profile.
 */
export function createAnonymousProfile(
  anonId: string,
  walletAddress?: string
): AnonymousProfile {
  return {
    anonId,
    walletAddress,
    credibilityScore: 0,
    totalContributions: 0,
    lastActivityAt: new Date(),
    createdAt: new Date(),
  };
}

/**
 * Update profile after a contribution.
 */
export function recordContribution(
  profile: AnonymousProfile,
  contributionScore: number
): AnonymousProfile {
  return {
    ...profile,
    credibilityScore: profile.credibilityScore + contributionScore,
    totalContributions: profile.totalContributions + 1,
    lastActivityAt: new Date(),
  };
}

/**
 * Update profile after a vote is cast.
 */
export function recordVote(
  profile: AnonymousProfile,
  voteCost: number
): AnonymousProfile {
  return {
    ...profile,
    credibilityScore: Math.max(0, profile.credibilityScore - voteCost),
    lastActivityAt: new Date(),
  };
}

// ----------------------------------------------------------------
// Contribution Creation
// ----------------------------------------------------------------

let contributionCounter = 0;

export function generateContributionId(): string {
  contributionCounter++;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  return `contrib-${timestamp}-${random}-${contributionCounter}`;
}

/**
 * Create a new contribution record.
 */
export function createContribution(params: {
  anonId: string;
  type: ContributionType;
  contentId: string;
  contentVersion: string;
  expertiseMatch?: boolean;
  lastActivity?: Date;
  approvals?: number;
  rejections?: number;
  constructive?: boolean;
  citations?: number;
}): Contribution {
  const {
    anonId,
    type,
    contentId,
    contentVersion,
    expertiseMatch = false,
    lastActivity = new Date(),
    approvals = 0,
    rejections = 0,
    constructive = false,
    citations = 0,
  } = params;

  const score = calculateContributionScore(
    type,
    expertiseMatch,
    citations,
    lastActivity,
    approvals,
    rejections,
    constructive
  );

  return {
    id: generateContributionId(),
    anonId,
    type,
    contentId,
    contentVersion,
    score,
    metrics: {
      votesReceived: 0,
      approvals,
      rejections,
      citations,
      reports: 0,
    },
    timestamp: new Date(),
  };
}

// ----------------------------------------------------------------
// Vote Creation
// ----------------------------------------------------------------

let voteCounter = 0;

export function generateVoteId(): string {
  voteCounter++;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  return `vote-${timestamp}-${random}-${voteCounter}`;
}

/**
 * Create a new vote record.
 * Throws if the voter cannot afford the vote.
 */
export function createVote(params: {
  voterAnonId: string;
  targetId: string;
  weight: number;
  direction: VoteDirection;
  voterCredibilityScore: number;
}): Vote {
  const { voterAnonId, targetId, weight, direction, voterCredibilityScore } = params;

  if (weight < 0) throw new Error('Vote weight must be non-negative');

  const cost = quadraticVoteCost(weight);

  if (voterCredibilityScore < cost) {
    throw new Error(
      `Insufficient credibility: need ${cost}, have ${voterCredibilityScore}`
    );
  }

  return {
    id: generateVoteId(),
    voterAnonId,
    targetId,
    weight,
    cost,
    direction,
    timestamp: new Date(),
  };
}

// ----------------------------------------------------------------
// Leaderboard
// ----------------------------------------------------------------

/**
 * Sort profiles by credibility score descending.
 */
export function rankProfiles(profiles: AnonymousProfile[]): AnonymousProfile[] {
  return [...profiles].sort((a, b) => b.credibilityScore - a.credibilityScore);
}

/**
 * Calculate percentile rank of a profile.
 * Returns a number 0–100 representing what percentile the profile is in.
 */
export function calculatePercentile(
  profile: AnonymousProfile,
  allProfiles: AnonymousProfile[]
): number {
  if (allProfiles.length <= 1) return 100;
  const sorted = rankProfiles(allProfiles);
  const index = sorted.findIndex((p) => p.anonId === profile.anonId);
  return Math.round(((sorted.length - index - 1) / (sorted.length - 1)) * 100);
}

// ----------------------------------------------------------------
// Display helpers
// ----------------------------------------------------------------

/**
 * Format a credibility score for display.
 * Shows percentile rank when a population is provided.
 */
export function formatCredibility(
  score: number,
  percentile?: number
): string {
  if (percentile !== undefined) {
    return `top ${100 - percentile}%`;
  }
  return score.toFixed(1);
}
