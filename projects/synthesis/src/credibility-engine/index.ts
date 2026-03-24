/**
 * Credibility Engine — Public API
 *
 * Egoless reputation tracking for the Synthesis Platform.
 * Contributions are attributed to value, not identity.
 */

// Re-export all public functions and types
export {
  // Types
  type ContributionType,
  type ContributionMetrics,
  type Contribution,
  type CredibilityWeights,
  type AnonymousProfile,
  type VoteDirection,
  type Vote,
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
} from './credibility-engine.js';
