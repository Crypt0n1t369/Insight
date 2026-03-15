// Integration tests for Credo Platform
import { describe, it, expect, beforeEach } from 'vitest';
import { IdentityService, resetIdentityService } from '../src/services/identity.js';
import { BranchService, resetBranchService } from '../src/services/branch.js';
import { ContributionService, resetContributionService } from '../src/services/contribution.js';
import { ProposalService, resetProposalService } from '../src/services/proposal.js';

describe('Credo Platform Integration', () => {
  let identityService: IdentityService;
  let branchService: BranchService;
  let contributionService: ContributionService;
  let proposalService: ProposalService;
  
  beforeEach(() => {
    identityService = new IdentityService();
    branchService = new BranchService();
    contributionService = new ContributionService();
    proposalService = new ProposalService();
    resetIdentityService();
    resetBranchService();
    resetContributionService();
    resetProposalService();
  });
  
  describe('Full User Journey', () => {
    it('should support complete user journey', async () => {
      // 1. Create anonymous user
      const user = await identityService.createAnonymousUser({
        display_name: 'Test User'
      });
      expect(user.display_name).toBe('Test User');
      expect(user.trust_tier).toBe('newcomer');
      
      // 2. Update display name
      const updated = await identityService.updateDisplayName(user.id, 'New Name');
      expect(updated!.display_name).toBe('New Name');
      
      // 3. Check initial credibility
      expect(updated!.credibility_score).toBe(0);
    });
  });
  
  describe('Branch & Contribution Flow', () => {
    it('should support branch → contribution → endorsement flow', async () => {
      // 1. Create user
      const user = await identityService.createAnonymousUser();
      
      // 2. Create branch (earns 5 credibility)
      const branch = await branchService.createBranch(user.id, {
        title: 'Test Branch',
        description: 'A test branch'
      });
      expect(branch.id).toBeDefined();
      
      // Check credibility after branch creation
      let userWithBranch = await identityService.getUserById(user.id);
      expect(userWithBranch!.credibility_score).toBe(5);
      
      // 3. Create contribution (earns 3 credibility for idea)
      const contribution = await contributionService.createContribution(user.id, {
        branch_id: branch.id,
        type: 'idea',
        content: 'Test idea'
      });
      expect(contribution.id).toBeDefined();
      
      // Check credibility after contribution
      let userWithContrib = await identityService.getUserById(user.id);
      expect(userWithContrib!.credibility_score).toBe(8); // 5 + 3
      
      // 4. Endorse contribution (earns 1 credibility)
      const endorsed = await contributionService.endorse(contribution.id, user.id);
      expect(endorsed!.endorsements).toBe(1);
      
      // Check final credibility
      const finalUser = await identityService.getUserById(user.id);
      expect(finalUser!.credibility_score).toBe(9); // 8 + 1
    });
    
    it('should support nested contributions', async () => {
      const user = await identityService.createAnonymousUser();
      const branch = await branchService.createBranch(user.id, { title: 'Test' });
      
      // Create parent idea
      const parent = await contributionService.createContribution(user.id, {
        branch_id: branch.id,
        type: 'idea',
        content: 'Parent idea'
      });
      
      // Create child comment
      const child = await contributionService.createContribution(user.id, {
        branch_id: branch.id,
        type: 'comment',
        content: 'Reply',
        parent_id: parent.id
      });
      
      expect(child.parent_id).toBe(parent.id);
      
      // Get top-level (ideas)
      const ideas = await contributionService.getIdeas(branch.id);
      expect(ideas.total).toBe(1);
      
      // Get replies
      const replies = await contributionService.getBranchContributions(branch.id, {
        parentId: parent.id
      });
      expect(replies.total).toBe(1);
    });
    
    it('should sort contributions by endorsements', async () => {
      const user = await identityService.createAnonymousUser();
      const otherUser = await identityService.createAnonymousUser();
      const branch = await branchService.createBranch(user.id, { title: 'Test' });
      
      const low = await contributionService.createContribution(user.id, {
        branch_id: branch.id,
        type: 'idea',
        content: 'Low'
      });
      
      const high = await contributionService.createContribution(user.id, {
        branch_id: branch.id,
        type: 'idea',
        content: 'High'
      });
      
      // Endorse high 3 times
      await contributionService.endorse(high.id, otherUser.id);
      await contributionService.endorse(high.id, otherUser.id);
      await contributionService.endorse(high.id, otherUser.id);
      
      const contribs = await contributionService.getBranchContributions(branch.id);
      
      expect(contribs.contributions[0].id).toBe(high.id);
      expect(contribs.contributions[0].endorsements).toBe(3);
    });
  });
  
  describe('Proposal & Voting Flow', () => {
    it('should support create proposal → vote → close flow', async () => {
      const user = await identityService.createAnonymousUser();
      const branch = await branchService.createBranch(user.id, { title: 'Test' });
      
      // 1. Create proposal (earns 5 credibility)
      const proposal = await proposalService.createProposal(user.id, {
        branch_id: branch.id,
        type: 'governance',
        title: 'Test Proposal',
        content: 'Test content'
      });
      expect(proposal.id).toBeDefined();
      expect(proposal.status).toBe('open');
      
      // Check credibility after proposal
      let userWithProp = await identityService.getUserById(user.id);
      expect(userWithProp!.credibility_score).toBe(10); // 5 (branch) + 5 (proposal)
      
      // 2. Vote on proposal
      const voter = await identityService.createAnonymousUser();
      const vote = await proposalService.vote(proposal.id, voter.id, {
        support: true,
        tokens: 3  // quadratic weight = 9
      });
      expect(vote!.support).toBe(true);
      expect(vote!.tokens).toBe(3);
      expect(vote!.quadratic_weight).toBe(9);
      
      // Check proposal updated (quadratic voting)
      const updatedProposal = await proposalService.getProposalById(proposal.id);
      expect(updatedProposal!.votes_for).toBe(9);
      
      // 3. Close proposal
      const closed = await proposalService.closeProposal(proposal.id);
      expect(closed!.status).toBe('accepted'); // 100% for
      
      // Check voter credibility
      const voterWithVote = await identityService.getUserById(voter.id);
      expect(voterWithVote!.credibility_score).toBe(1); // 1 for voting
    });
    
    it('should reject proposal when more against than for', async () => {
      const author = await identityService.createAnonymousUser();
      const branch = await branchService.createBranch(author.id, { title: 'Test' });
      
      const proposal = await proposalService.createProposal(author.id, {
        branch_id: branch.id,
        type: 'governance',
        title: 'Test',
        content: 'Test'
      });
      
      const voter = await identityService.createAnonymousUser();
      await proposalService.vote(proposal.id, voter.id, {
        support: false, // against
        tokens: 10
      });
      
      const closed = await proposalService.closeProposal(proposal.id);
      expect(closed!.status).toBe('rejected');
    });
    
    it('should prevent duplicate voting', async () => {
      const user = await identityService.createAnonymousUser();
      const otherUser = await identityService.createAnonymousUser();
      const branch = await branchService.createBranch(user.id, { title: 'Test' });
      
      const proposal = await proposalService.createProposal(user.id, {
        branch_id: branch.id,
        type: 'governance',
        title: 'Test',
        content: 'Test'
      });
      
      // First vote by otherUser
      await proposalService.vote(proposal.id, otherUser.id, { support: true, tokens: 5 });
      
      // Second vote by same user should fail
      await expect(
        proposalService.vote(proposal.id, otherUser.id, { support: true, tokens: 5 })
      ).rejects.toThrow('Already voted on this proposal');
    });
    
    it('should prevent voting on closed proposal', async () => {
      const user = await identityService.createAnonymousUser();
      const branch = await branchService.createBranch(user.id, { title: 'Test' });
      
      const proposal = await proposalService.createProposal(user.id, {
        branch_id: branch.id,
        type: 'governance',
        title: 'Test',
        content: 'Test'
      });
      
      await proposalService.closeProposal(proposal.id);
      
      await expect(
        proposalService.vote(proposal.id, user.id, { support: true, tokens: 5 })
      ).rejects.toThrow('Proposal is not open for voting');
    });
    
    it('should allow author to withdraw proposal', async () => {
      const user = await identityService.createAnonymousUser();
      const branch = await branchService.createBranch(user.id, { title: 'Test' });
      
      const proposal = await proposalService.createProposal(user.id, {
        branch_id: branch.id,
        type: 'governance',
        title: 'Test',
        content: 'Test'
      });
      
      const withdrawn = await proposalService.withdrawProposal(proposal.id, user.id);
      expect(withdrawn!.status).toBe('withdrawn');
    });
    
    it('should prevent non-author from withdrawing', async () => {
      const user = await identityService.createAnonymousUser();
      const other = await identityService.createAnonymousUser();
      const branch = await branchService.createBranch(user.id, { title: 'Test' });
      
      const proposal = await proposalService.createProposal(user.id, {
        branch_id: branch.id,
        type: 'governance',
        title: 'Test',
        content: 'Test'
      });
      
      await expect(
        proposalService.withdrawProposal(proposal.id, other.id)
      ).rejects.toThrow('Only the author can withdraw a proposal');
    });
    
    it('should get proposal votes', async () => {
      const user = await identityService.createAnonymousUser();
      const branch = await branchService.createBranch(user.id, { title: 'Test' });
      
      const proposal = await proposalService.createProposal(user.id, {
        branch_id: branch.id,
        type: 'governance',
        title: 'Test',
        content: 'Test'
      });
      
      await proposalService.vote(proposal.id, user.id, { support: true, tokens: 5 });
      
      const votes = await proposalService.getProposalVotes(proposal.id);
      expect(votes).toHaveLength(1);
      expect(votes[0].support).toBe(true);
    });
  });
  
  describe('Trust Tier Progression', () => {
    it('should progress trust tier based on credibility', async () => {
      const user = await identityService.createAnonymousUser();
      
      // newcomer: 0-99
      expect(user.trust_tier).toBe('newcomer');
      
      // contributor: 100-499
      await identityService.updateCredibility(user.id, 100, 'Test');
      let updated = await identityService.getUserById(user.id);
      expect(updated!.trust_tier).toBe('contributor');
      
      // trusted: 500-999
      await identityService.updateCredibility(user.id, 400, 'Test');
      updated = await identityService.getUserById(user.id);
      expect(updated!.trust_tier).toBe('trusted');
      
      // elder: 1000+
      await identityService.updateCredibility(user.id, 500, 'Test');
      updated = await identityService.getUserById(user.id);
      expect(updated!.trust_tier).toBe('elder');
    });
  });
  
  describe('Branch Tree', () => {
    it('should build multi-level branch tree', async () => {
      const user = await identityService.createAnonymousUser();
      
      const root = await branchService.createBranch(user.id, { title: 'Root' });
      const child1 = await branchService.createBranch(user.id, { 
        title: 'Child 1', 
        parent_id: root.id 
      });
      const child2 = await branchService.createBranch(user.id, { 
        title: 'Child 2', 
        parent_id: root.id 
      });
      const grandchild = await branchService.createBranch(user.id, { 
        title: 'Grandchild',
        parent_id: child1.id
      });
      
      const tree = await branchService.getBranchTree(root.id, 0, 3);
      
      expect(tree.title).toBe('Root');
      expect(tree.children).toHaveLength(2);
      expect(tree.children[0].children).toHaveLength(1);
    });
  });
});
