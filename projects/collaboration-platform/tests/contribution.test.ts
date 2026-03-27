// Tests for Credo Contribution Service
import { describe, it, expect, beforeEach } from 'vitest';
import { ContributionService, resetContributionService } from '../src/services/contribution.js';
import { BranchService, resetBranchService } from '../src/services/branch.js';
import { IdentityService, resetIdentityService } from '../src/services/identity.js';

describe('ContributionService', () => {
  let contributionService: ContributionService;
  let branchService: BranchService;
  let identityService: IdentityService;
  let testUser: any;
  let testBranch: any;
  
  beforeEach(async () => {
    contributionService = new ContributionService();
    resetContributionService();
    branchService = new BranchService();
    resetBranchService();
    identityService = new IdentityService();
    resetIdentityService();
    
    testUser = await identityService.createAnonymousUser();
    testBranch = await branchService.createBranch(testUser.id, {
      title: 'Test Branch'
    });
  });
  
  it('should create a contribution', async () => {
    const result = await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'Test idea'
    });
    
    expect(result.id).toBeDefined();
    expect(result.content).toBe('Test idea');
    expect(result.type).toBe('idea');
    expect(result.endorsements).toBe(0);
  });
  
  it('should create nested contribution', async () => {
    const parent = await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'Parent idea'
    });
    
    const child = await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'comment',
      content: 'Reply',
      parent_id: parent.id
    });
    
    expect(child.parent_id).toBe(parent.id);
  });
  
  it('should get contribution by ID', async () => {
    const created = await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'Test'
    });
    
    const retrieved = await contributionService.getContributionById(created.id);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(created.id);
  });
  
  it('should return null for nonexistent contribution', async () => {
    const result = await contributionService.getContributionById('nonexistent');
    
    expect(result).toBeNull();
  });
  
  it('should get branch contributions', async () => {
    await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'Idea 1'
    });
    await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'Idea 2'
    });
    
    const result = await contributionService.getBranchContributions(testBranch.id);
    
    expect(result.total).toBe(2);
    expect(result.contributions).toHaveLength(2);
  });
  
  it('should filter contributions by type', async () => {
    await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'An idea'
    });
    await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'question',
      content: 'A question'
    });
    
    const ideas = await contributionService.getBranchContributions(testBranch.id, {
      type: 'idea'
    });
    
    expect(ideas.total).toBe(1);
    expect(ideas.contributions[0].type).toBe('idea');
  });
  
  it('should get top-level contributions', async () => {
    const parent = await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'Parent'
    });
    
    await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'comment',
      content: 'Reply',
      parent_id: parent.id
    });
    
    const ideas = await contributionService.getIdeas(testBranch.id);
    
    expect(ideas.total).toBe(1);
    expect(ideas.contributions[0].parent_id).toBeNull();
  });
  
  it('should endorse contribution', async () => {
    // Create a second user (endorser) distinct from the author
    const endorser = await identityService.createAnonymousUser();
    const contrib = await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'Test idea'
    });
    
    const endorsed = await contributionService.endorse(contrib.id, endorser.id);
    
    expect(endorsed).not.toBeNull();
    expect(endorsed!.endorsements).toBe(1);
  });
  
  it('should sort contributions by endorsements', async () => {
    // Create endorsers (testUser can't self-endorse)
    const endorser1 = await identityService.createAnonymousUser();
    const endorser2 = await identityService.createAnonymousUser();
    const endorser3 = await identityService.createAnonymousUser();
    
    const low = await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'Low endorsed'
    });
    const high = await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'High endorsed'
    });
    
    // Endorse high one 3 times (low gets 0 endorsements)
    await contributionService.endorse(high.id, endorser1.id);
    await contributionService.endorse(high.id, endorser2.id);
    await contributionService.endorse(high.id, endorser3.id);
    
    const result = await contributionService.getBranchContributions(testBranch.id);
    
    expect(result.contributions[0].id).toBe(high.id);
  });
  
  it('should get user contributions', async () => {
    await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'Idea 1'
    });
    await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'question',
      content: 'Question'
    });
    
    const userContribs = await contributionService.getUserContributions(testUser.id);
    
    expect(userContribs).toHaveLength(2);
  });
  
  it('should award credibility by contribution type', async () => {
    await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'An idea'
    });
    
    const user = await identityService.getUserById(testUser.id);
    
    // idea = 3 points (branch creation also gave 5 points)
    expect(user!.credibility_score).toBe(8);  // 5 (branch) + 3 (idea)
  });
  
  it('should award credibility for endorsement', async () => {
    const contrib = await contributionService.createContribution(testUser.id, {
      branch_id: testBranch.id,
      type: 'idea',
      content: 'Test'
    });
    
    // Create another user to endorse
    const otherUser = await identityService.createAnonymousUser();
    
    await contributionService.endorse(contrib.id, otherUser.id);
    
    const author = await identityService.getUserById(testUser.id);
    
    // Author gets 1 point per endorsement
    expect(author!.credibility_score).toBeGreaterThan(3);
  });
});
