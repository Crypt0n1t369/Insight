// Tests for Credo Branch Service
import { describe, it, expect, beforeEach } from 'vitest';
import { BranchService, resetBranchService } from '../src/services/branch.js';
import { IdentityService, resetIdentityService } from '../src/services/identity.js';

describe('BranchService', () => {
  let branchService: BranchService;
  let identityService: IdentityService;
  let testUser: any;
  
  beforeEach(async () => {
    branchService = new BranchService();
    resetBranchService();
    identityService = new IdentityService();
    resetIdentityService();
    testUser = await identityService.createAnonymousUser();
  });
  
  it('should create a branch', async () => {
    const result = await branchService.createBranch(testUser.id, {
      title: 'Test Branch',
      description: 'A test branch'
    });
    
    expect(result.id).toBeDefined();
    expect(result.title).toBe('Test Branch');
    expect(result.description).toBe('A test branch');
    expect(result.status).toBe('active');
    expect(result.parent_id).toBeNull();
  });
  
  it('should create child branch', async () => {
    const parent = await branchService.createBranch(testUser.id, {
      title: 'Parent Branch'
    });
    
    const child = await branchService.createBranch(testUser.id, {
      title: 'Child Branch',
      parent_id: parent.id
    });
    
    expect(child.parent_id).toBe(parent.id);
  });
  
  it('should get branch by ID', async () => {
    const created = await branchService.createBranch(testUser.id, {
      title: 'Test Branch'
    });
    
    const retrieved = await branchService.getBranchById(created.id);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(created.id);
    expect(retrieved!.title).toBe('Test Branch');
  });
  
  it('should return null for nonexistent branch', async () => {
    const result = await branchService.getBranchById('nonexistent');
    
    expect(result).toBeNull();
  });
  
  it('should get root branches', async () => {
    await branchService.createBranch(testUser.id, {
      title: 'Root Branch'
    });
    
    const result = await branchService.getRootBranches();
    
    expect(result.total).toBe(1);
    expect(result.branches).toHaveLength(1);
  });
  
  it('should get child branches', async () => {
    const parent = await branchService.createBranch(testUser.id, {
      title: 'Parent'
    });
    
    await branchService.createBranch(testUser.id, {
      title: 'Child 1',
      parent_id: parent.id
    });
    await branchService.createBranch(testUser.id, {
      title: 'Child 2',
      parent_id: parent.id
    });
    
    const result = await branchService.getChildBranches(parent.id);
    
    expect(result.total).toBe(2);
    expect(result.branches).toHaveLength(2);
  });
  
  it('should update branch status', async () => {
    const created = await branchService.createBranch(testUser.id, {
      title: 'Test Branch'
    });
    
    const updated = await branchService.updateBranchStatus(created.id, 'archived');
    
    expect(updated).not.toBeNull();
    expect(updated!.status).toBe('archived');
  });
  
  it('should get branch tree', async () => {
    const root = await branchService.createBranch(testUser.id, {
      title: 'Root'
    });
    
    await branchService.createBranch(testUser.id, {
      title: 'Child 1',
      parent_id: root.id
    });
    await branchService.createBranch(testUser.id, {
      title: 'Child 2',
      parent_id: root.id
    });
    
    const tree = await branchService.getBranchTree(root.id, 0, 2);
    
    expect(tree).not.toBeNull();
    expect(tree.title).toBe('Root');
    expect(tree.children).toHaveLength(2);
  });
  
  it('should support pagination', async () => {
    for (let i = 0; i < 5; i++) {
      await branchService.createBranch(testUser.id, {
        title: `Branch ${i}`
      });
    }
    
    const result = await branchService.getBranches({ limit: 2, offset: 0 });
    
    expect(result.total).toBe(5);
    expect(result.branches).toHaveLength(2);
  });
  
  it('should award credibility for branch creation', async () => {
    const initialUser = await identityService.getUserById(testUser.id);
    const initialScore = initialUser!.credibility_score;
    
    await branchService.createBranch(testUser.id, {
      title: 'Test Branch'
    });
    
    const updatedUser = await identityService.getUserById(testUser.id);
    
    expect(updatedUser!.credibility_score).toBe(initialScore + 5);
  });
});
