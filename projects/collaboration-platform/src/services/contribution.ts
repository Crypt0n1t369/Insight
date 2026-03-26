// Contribution Service - Ideas, Comments, Resources
// Version: 0.1.0 (MVP)

import { v4 as uuidv4 } from 'uuid';
import { 
  Contribution, 
  CreateContributionInput, 
  ContributionSchema,
  ContributionType 
} from '../types/index.js';
import { identityService } from './identity.js';
import { branchService } from './branch.js';

// In-memory storage for MVP
const contributions = new Map<string, Contribution>();

/**
 * Contribution weight by type.
 * Higher-effort contributions (synthesis, research) earn more credibility.
 * Matches SPEC.md §4 credibility weights.
 */
export function getContributionWeight(type: ContributionType): number {
  const weightMap: Record<ContributionType, number> = {
    'synthesis': 5,  // Deep integration of multiple ideas
    'idea': 3,      // Novel proposal
    'resource': 3,  // Valuable reference
    'question': 2,  // Thoughtful inquiry
    'comment': 1,   // Basic participation
  };
  return weightMap[type] ?? 1;
}

/**
 * Contribution Service - handles all content contributions
 */
export class ContributionService {
  
  /**
   * Create a new contribution
   */
  async createContribution(authorId: string, input: CreateContributionInput): Promise<Contribution> {
    const now = new Date().toISOString();
    
    const contribution: Contribution = {
      id: uuidv4(),
      author_id: authorId,
      branch_id: input.branch_id,
      parent_id: input.parent_id ?? null,
      type: input.type,
      content: input.content,
      endorsements: 0,
      weight: getContributionWeight(input.type),
      created_at: now,
      updated_at: now,
    };
    
    const validated = ContributionSchema.parse(contribution);
    contributions.set(validated.id, validated);
    
    // Award credibility based on contribution type
    const credibilityMap: Record<ContributionType, number> = {
      'idea': 3,
      'resource': 3,
      'synthesis': 5,
      'question': 2,
      'comment': 1,
    };
    
    const points = credibilityMap[input.type];
    await identityService.updateCredibility(authorId, points, `Created ${input.type}`);
    
    return validated;
  }
  
  /**
   * Get contribution by ID
   */
  async getContributionById(id: string): Promise<Contribution | null> {
    return contributions.get(id) ?? null;
  }
  
  /**
   * Get contributions for a branch
   */
  async getBranchContributions(
    branchId: string, 
    options?: {
      type?: ContributionType;
      parentId?: string | null;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ contributions: Contribution[]; total: number }> {
    let result = Array.from(contributions.values())
      .filter(c => c.branch_id === branchId);
    
    // Filter by type
    if (options?.type) {
      result = result.filter(c => c.type === options.type);
    }
    
    // Filter by parent (null = top-level)
    if (options?.parentId !== undefined) {
      result = result.filter(c => c.parent_id === options.parentId);
    }
    
    // Sort by endorsements (popular first), then newest
    result.sort((a, b) => {
      if (b.endorsements !== a.endorsements) {
        return b.endorsements - a.endorsements;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    const total = result.length;
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;
    
    return {
      contributions: result.slice(offset, offset + limit),
      total,
    };
  }
  
  /**
   * Get top-level contributions (ideas)
   */
  async getIdeas(branchId: string, limit = 20, offset = 0): Promise<{ contributions: Contribution[]; total: number }> {
    return this.getBranchContributions(branchId, { 
      type: 'idea', 
      parentId: null, 
      limit, 
      offset 
    });
  }
  
  /**
   * Endorse a contribution.
   *
   * Credibility effects:
   * - Contribution author earns `weight` credibility (endorsement_received).
   *   Matches SPEC.md §4: weight by contribution type (synthesis=5, idea=3, etc.)
   * - Endorser earns 1 credibility (endorsement_given) — encourages curation.
   *
   * Endorsers cannot endorse their own contributions.
   */
  async endorse(contributionId: string, userId: string): Promise<Contribution | null> {
    const contribution = contributions.get(contributionId);
    if (!contribution) return null;

    // Prevent self-endorsement
    if (contribution.author_id === userId) return null;

    const updated: Contribution = {
      ...contribution,
      endorsements: contribution.endorsements + 1,
      updated_at: new Date().toISOString(),
    };

    contributions.set(contributionId, updated);

    // Author earns credibility based on contribution weight
    await identityService.updateCredibility(
      contribution.author_id,
      contribution.weight,
      `Received endorsement on ${contribution.type} (weight=${contribution.weight})`
    );

    // Endorser earns 1 credibility for giving the endorsement
    await identityService.updateCredibility(
      userId,
      1,
      `Gave endorsement to ${contribution.id}`
    );

    return updated;
  }
  
  /**
   * Reply to a contribution (nested comment)
   */
  async reply(parentId: string, authorId: string, input: CreateContributionInput): Promise<Contribution | null> {
    const parent = contributions.get(parentId);
    if (!parent) return null;
    
    const replyInput: CreateContributionInput = {
      ...input,
      branch_id: parent.branch_id,
      parent_id: parentId,
      type: 'comment', // Force comment type for replies
    };
    
    return this.createContribution(authorId, replyInput);
  }
  
  /**
   * Get user's contributions
   */
  async getUserContributions(userId: string): Promise<Contribution[]> {
    return Array.from(contributions.values())
      .filter(c => c.author_id === userId)
      .sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
  
  /**
   * Get contribution count for a branch
   */
  async getBranchContributionCount(branchId: string): Promise<number> {
    return Array.from(contributions.values())
      .filter(c => c.branch_id === branchId)
      .length;
  }
  
  /**
   * Delete a contribution (soft delete - author only)
   * Returns true if deleted, false if not found or not authorized
   */
  async deleteContribution(contributionId: string, userId: string): Promise<boolean> {
    const contribution = contributions.get(contributionId);
    if (!contribution) return false;
    
    // Only author can delete their contribution
    if (contribution.author_id !== userId) return false;
    
    // Remove from storage
    contributions.delete(contributionId);
    
    return true;
  }

  /**
   * Update a contribution (author only)
   * Returns updated contribution or null if not found/unauthorized
   */
  async updateContribution(
    contributionId: string, 
    userId: string, 
    updates: { content?: string }
  ): Promise<Contribution | null> {
    const contribution = contributions.get(contributionId);
    if (!contribution) return null;
    
    // Only author can update their contribution
    if (contribution.author_id !== userId) return null;
    
    const updated: Contribution = {
      ...contribution,
      content: updates.content ?? contribution.content,
      updated_at: new Date().toISOString(),
    };
    
    contributions.set(contributionId, updated);
    return updated;
  }
}

// Reset function for testing
export function resetContributionService() {
  contributions.clear();
}

// Export singleton instance
export const contributionService = new ContributionService();
