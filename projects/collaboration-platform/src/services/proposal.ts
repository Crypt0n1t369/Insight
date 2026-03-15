// Proposal & Voting Service - Governance
// Version: 0.1.0 (MVP)

import { v4 as uuidv4 } from 'uuid';
import { 
  Proposal, 
  CreateProposalInput, 
  ProposalSchema,
  ProposalStatus,
  Vote,
  CreateVoteInput,
  VoteSchema
} from '../types/index.js';
import { identityService } from './identity.js';
import { branchService } from './branch.js';

// In-memory storage for MVP
const proposals = new Map<string, Proposal>();
const votes = new Map<string, Vote>();

/**
 * Calculate quadratic voting weight
 * Formula: weight = tokens^2 (costs increase quadratically)
 * This reduces influence of large voters
 */
function calculateQuadraticWeight(tokens: number): number {
  return tokens * tokens;
}

/**
 * Proposal Service - governance and decision making
 */
export class ProposalService {
  
  /**
   * Create a new proposal
   */
  async createProposal(authorId: string, input: CreateProposalInput): Promise<Proposal> {
    const now = new Date().toISOString();
    
    const proposal: Proposal = {
      id: uuidv4(),
      branch_id: input.branch_id,
      author_id: authorId,
      type: input.type,
      title: input.title,
      content: input.content,
      status: 'open',
      votes_for: 0,
      votes_against: 0,
      created_at: now,
      closed_at: null,
    };
    
    const validated = ProposalSchema.parse(proposal);
    proposals.set(validated.id, validated);
    
    // Award credibility for creating a proposal
    await identityService.updateCredibility(authorId, 5, 'Created a proposal');
    
    return validated;
  }
  
  /**
   * Get proposal by ID
   */
  async getProposalById(id: string): Promise<Proposal | null> {
    return proposals.get(id) ?? null;
  }
  
  /**
   * Get proposals for a branch
   */
  async getBranchProposals(
    branchId: string,
    options?: {
      status?: ProposalStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ proposals: Proposal[]; total: number }> {
    let result = Array.from(proposals.values())
      .filter(p => p.branch_id === branchId);
    
    if (options?.status) {
      result = result.filter(p => p.status === options.status);
    }
    
    // Sort by newest first
    result.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const total = result.length;
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;
    
    return {
      proposals: result.slice(offset, offset + limit),
      total,
    };
  }
  
  /**
   * Vote on a proposal
   */
  async vote(proposalId: string, voterId: string, input: CreateVoteInput): Promise<Vote | null> {
    const proposal = proposals.get(proposalId);
    if (!proposal) return null;
    
    if (proposal.status !== 'open') {
      throw new Error('Proposal is not open for voting');
    }
    
    // Check if already voted
    for (const vote of votes.values()) {
      if (vote.proposal_id === proposalId && vote.voter_id === voterId) {
        throw new Error('Already voted on this proposal');
      }
    }
    
    const now = new Date().toISOString();
    const quadraticWeight = calculateQuadraticWeight(input.tokens);
    
    const vote: Vote = {
      id: uuidv4(),
      proposal_id: proposalId,
      voter_id: voterId,
      support: input.support,
      tokens: input.tokens,
      quadratic_weight: quadraticWeight,
      created_at: now,
    };
    
    const validated = VoteSchema.parse(vote);
    votes.set(validated.id, validated);
    
    // Update proposal counts using quadratic weights
    const updated: Proposal = {
      ...proposal,
      votes_for: proposal.votes_for + (input.support ? quadraticWeight : 0),
      votes_against: proposal.votes_against + (input.support ? 0 : quadraticWeight),
    };
    proposals.set(proposalId, updated);
    
    // Award credibility for voting
    await identityService.updateCredibility(voterId, 1, 'Voted on a proposal');
    
    return validated;
  }
  
  /**
   * Close a proposal (author or sufficient votes)
   */
  async closeProposal(proposalId: string): Promise<Proposal | null> {
    const proposal = proposals.get(proposalId);
    if (!proposal || proposal.status !== 'open') return null;
    
    const totalVotes = proposal.votes_for + proposal.votes_against;
    const forRatio = totalVotes > 0 ? proposal.votes_for / totalVotes : 0;
    
    // Simple majority rule
    const newStatus: ProposalStatus = forRatio > 0.5 ? 'accepted' : 'rejected';
    
    const updated: Proposal = {
      ...proposal,
      status: newStatus,
      closed_at: new Date().toISOString(),
    };
    
    proposals.set(proposalId, updated);
    
    // Award credibility to author if accepted
    if (newStatus === 'accepted') {
      await identityService.updateCredibility(proposal.author_id, 10, 'Proposal accepted');
    }
    
    return updated;
  }
  
  /**
   * Get votes for a proposal
   */
  async getProposalVotes(proposalId: string): Promise<Vote[]> {
    return Array.from(votes.values())
      .filter(v => v.proposal_id === proposalId);
  }
  
  /**
   * Withdraw a proposal (author only)
   */
  async withdrawProposal(proposalId: string, userId: string): Promise<Proposal | null> {
    const proposal = proposals.get(proposalId);
    if (!proposal) return null;
    
    if (proposal.author_id !== userId) {
      throw new Error('Only the author can withdraw a proposal');
    }
    
    const updated: Proposal = {
      ...proposal,
      status: 'withdrawn',
      closed_at: new Date().toISOString(),
    };
    
    proposals.set(proposalId, updated);
    return updated;
  }
}

// Reset function for testing
export function resetProposalService() {
  proposals.clear();
  votes.clear();
}

// Export singleton instance
export const proposalService = new ProposalService();
