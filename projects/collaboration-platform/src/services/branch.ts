// Branch Service - Collaboration Branches
// Version: 0.1.0 (MVP)

import { v4 as uuidv4 } from 'uuid';
import { Branch, CreateBranchInput, BranchSchema, BranchStatus } from '../types/index.js';
import { identityService } from './identity.js';

// In-memory storage for MVP
const branches = new Map<string, Branch>();

/**
 * Branch Service - handles collaboration branches (like Git branches for ideas)
 */
export class BranchService {
  
  /**
   * Create a new branch
   */
  async createBranch(creatorId: string, input: CreateBranchInput): Promise<Branch> {
    const now = new Date().toISOString();
    
    const branch: Branch = {
      id: uuidv4(),
      parent_id: input.parent_id ?? null,
      creator_id: creatorId,
      title: input.title,
      description: input.description ?? null,
      status: 'active',
      created_at: now,
      updated_at: now,
    };
    
    const validated = BranchSchema.parse(branch);
    branches.set(validated.id, validated);
    
    // Award credibility for creating a branch
    await identityService.updateCredibility(creatorId, 5, 'Created a new branch');
    
    return validated;
  }
  
  /**
   * Get branch by ID
   */
  async getBranchById(id: string): Promise<Branch | null> {
    return branches.get(id) ?? null;
  }
  
  /**
   * Get all branches (with optional filtering)
   */
  async getBranches(options?: {
    parentId?: string;
    status?: BranchStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ branches: Branch[]; total: number }> {
    let result = Array.from(branches.values());
    
    // Filter by parent
    if (options?.parentId) {
      result = result.filter(b => b.parent_id === options.parentId);
    }
    
    // Filter by status
    if (options?.status) {
      result = result.filter(b => b.status === options.status);
    }
    
    // Sort by newest first
    result.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const total = result.length;
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;
    
    return {
      branches: result.slice(offset, offset + limit),
      total,
    };
  }
  
  /**
   * Get root branches (no parent)
   */
  async getRootBranches(limit = 20, offset = 0): Promise<{ branches: Branch[]; total: number }> {
    return this.getBranches({ parentId: undefined, limit, offset });
  }
  
  /**
   * Get child branches
   */
  async getChildBranches(parentId: string, limit = 20, offset = 0): Promise<{ branches: Branch[]; total: number }> {
    return this.getBranches({ parentId, limit, offset });
  }
  
  /**
   * Update branch status
   */
  async updateBranchStatus(branchId: string, status: BranchStatus): Promise<Branch | null> {
    const branch = branches.get(branchId);
    if (!branch) return null;
    
    const updated: Branch = {
      ...branch,
      status,
      updated_at: new Date().toISOString(),
    };
    
    branches.set(branchId, updated);
    return updated;
  }
  
  /**
   * Get branch tree (recursive)
   */
  async getBranchTree(rootId: string, depth = 0, maxDepth = 3): Promise<any> {
    const branch = branches.get(rootId);
    if (!branch || depth > maxDepth) return null;
    
    const children = Array.from(branches.values())
      .filter(b => b.parent_id === rootId);
    
    return {
      ...branch,
      children: await Promise.all(
        children.map(child => this.getBranchTree(child.id, depth + 1, maxDepth))
      ),
    };
  }
}

// Reset function for testing
export function resetBranchService() {
  branches.clear();
}

// Export singleton instance
export const branchService = new BranchService();
