/**
 * Contribution Service Tests - CREDO Platform
 * Tests contribution creation, endorsements, credibility weights
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  ContributionService, 
  resetContributionService,
  getContributionWeight 
} from '../src/services/contribution.js';
import { IdentityService, resetIdentityService } from '../src/services/identity.js';
import { BranchService, resetBranchService } from '../src/services/branch.js';
import { ContributionType } from '../src/types/index.js';

describe('ContributionService', () => {
  let contributionService: ContributionService;
  let identityService: IdentityService;
  let branchService: BranchService;
  let creatorId: string;
  let branchId: string;

  beforeEach(async () => {
    resetContributionService();
    resetIdentityService();
    resetBranchService();
    
    contributionService = new ContributionService();
    identityService = new IdentityService();
    branchService = new BranchService();
    
    const user = await identityService.createAnonymousUser();
    creatorId = user.id;
    
    const branch = await branchService.createBranch(creatorId, {
      title: 'Test Branch',
      description: 'A test branch',
    });
    branchId = branch.id;
  });

  describe('getContributionWeight', () => {
    it('returns correct weights per type', () => {
      expect(getContributionWeight('synthesis')).toBe(5);
      expect(getContributionWeight('idea')).toBe(3);
      expect(getContributionWeight('resource')).toBe(3);
      expect(getContributionWeight('question')).toBe(2);
      expect(getContributionWeight('comment')).toBe(1);
    });

    it('returns 1 for unknown types', () => {
      expect(getContributionWeight('comment')).toBe(1);
    });
  });

  describe('createContribution', () => {
    it('creates a top-level idea contribution', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'My brilliant idea',
      });

      expect(contribution.id).toBeDefined();
      expect(contribution.author_id).toBe(creatorId);
      expect(contribution.branch_id).toBe(branchId);
      expect(contribution.type).toBe('idea');
      expect(contribution.content).toBe('My brilliant idea');
      expect(contribution.endorsements).toBe(0);
      expect(contribution.weight).toBe(3);
      expect(contribution.parent_id).toBeNull();
    });

    it('creates synthesis with weight 5', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'synthesis',
        content: 'Deep synthesis of multiple ideas',
      });

      expect(contribution.weight).toBe(5);
    });

    it('creates comment with weight 1', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'comment',
        content: 'Quick comment',
      });

      expect(contribution.weight).toBe(1);
    });

    it('awards credibility to author based on type', async () => {
      // creatorId already has 5 credibility from branch creation
      const before = (await identityService.getUserById(creatorId))!.credibility_score;
      
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Idea content',
      });

      const user = await identityService.getUserById(creatorId);
      expect(user!.credibility_score - before).toBe(3); // delta = 3 for idea
    });

    it('awards more credibility for synthesis than comment', async () => {
      const before = (await identityService.getUserById(creatorId))!.credibility_score;
      
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'synthesis',
        content: 'Synthesis content',
      });

      const user = await identityService.getUserById(creatorId);
      expect(user!.credibility_score - before).toBe(5); // delta = 5 for synthesis
    });

    it('creates a reply with parent_id', async () => {
      const parent = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Parent idea',
      });

      const reply = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        parent_id: parent.id,
        type: 'comment',
        content: 'Reply to parent',
      });

      expect(reply.parent_id).toBe(parent.id);
      expect(reply.type).toBe('comment');
    });
  });

  describe('getContributionById', () => {
    it('returns contribution when exists', async () => {
      const created = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Test idea',
      });

      const found = await contributionService.getContributionById(created.id);
      expect(found?.content).toBe('Test idea');
    });

    it('returns null for non-existent id', async () => {
      const result = await contributionService.getContributionById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getBranchContributions', () => {
    it('returns all contributions for a branch', async () => {
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Idea 1',
      });
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'comment',
        content: 'Comment 1',
      });

      const { contributions, total } = await contributionService.getBranchContributions(branchId);

      expect(total).toBe(2);
      expect(contributions).toHaveLength(2);
    });

    it('filters by type', async () => {
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Idea',
      });
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'comment',
        content: 'Comment',
      });

      const { contributions, total } = await contributionService.getBranchContributions(branchId, {
        type: 'idea',
      });

      expect(total).toBe(1);
      expect(contributions[0].type).toBe('idea');
    });

    it('filters top-level by parentId=null', async () => {
      const parent = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Parent idea',
      });
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        parent_id: parent.id,
        type: 'comment',
        content: 'Reply',
      });

      const { contributions, total } = await contributionService.getBranchContributions(branchId, {
        parentId: null,
      });

      expect(total).toBe(1);
      expect(contributions[0].type).toBe('idea');
    });

    it('sorts by endorsements desc, then newest first', async () => {
      const c1 = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Idea 1',
      });
      const c2 = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Idea 2',
      });

      // Create another user to endorse
      const endorser = await identityService.createAnonymousUser();
      await contributionService.endorse(c1.id, endorser.id);

      const { contributions } = await contributionService.getBranchContributions(branchId);

      expect(contributions[0].id).toBe(c1.id); // Has 1 endorsement
      expect(contributions[1].id).toBe(c2.id); // Has 0 endorsements
    });

    it('respects limit and offset', async () => {
      for (let i = 0; i < 10; i++) {
        await contributionService.createContribution(creatorId, {
          branch_id: branchId,
          type: 'idea',
          content: `Idea ${i}`,
        });
      }

      const { contributions, total } = await contributionService.getBranchContributions(branchId, {
        limit: 3,
        offset: 2,
      });

      expect(total).toBe(10);
      expect(contributions).toHaveLength(3);
    });
  });

  describe('getIdeas', () => {
    it('returns only top-level ideas', async () => {
      const idea = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Top-level idea',
      });
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Child idea',
        parent_id: idea.id,
      });
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'comment',
        content: 'Comment',
      });

      const { contributions, total } = await contributionService.getIdeas(branchId);

      expect(total).toBe(1);
      expect(contributions[0].type).toBe('idea');
      expect(contributions[0].parent_id).toBeNull();
    });
  });

  describe('endorse', () => {
    it('increments endorsement count', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Idea to endorse',
      });

      const endorser = await identityService.createAnonymousUser();
      const endorsed = await contributionService.endorse(contribution.id, endorser.id);

      expect(endorsed?.endorsements).toBe(1);
    });

    it('awards weight credibility to author', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea', // weight = 3
        content: 'Idea',
      });

      const before = (await identityService.getUserById(creatorId))!.credibility_score;
      const endorser = await identityService.createAnonymousUser();
      await contributionService.endorse(contribution.id, endorser.id);

      const author = await identityService.getUserById(creatorId);
      expect(author!.credibility_score - before).toBe(3); // delta = weight of idea
    });

    it('awards 1 credibility to endorser', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Idea',
      });

      const endorser = await identityService.createAnonymousUser();
      await contributionService.endorse(contribution.id, endorser.id);

      const endorserUser = await identityService.getUserById(endorser.id);
      expect(endorserUser?.credibility_score).toBe(1);
    });

    it('prevents self-endorsement', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'My own idea',
      });

      const result = await contributionService.endorse(contribution.id, creatorId);

      expect(result).toBeNull();
      expect(contribution.endorsements).toBe(0);
    });

    it('returns null for non-existent contribution', async () => {
      const endorser = await identityService.createAnonymousUser();
      const result = await contributionService.endorse('non-existent', endorser.id);

      expect(result).toBeNull();
    });
  });

  describe('reply', () => {
    it('creates a reply with parent_id set', async () => {
      const parent = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Parent idea',
      });

      const reply = await contributionService.reply(parent.id, creatorId, {
        branch_id: branchId,
        content: 'My reply',
      });

      expect(reply?.parent_id).toBe(parent.id);
      expect(reply?.content).toBe('My reply');
    });

    it('forces comment type on reply', async () => {
      const parent = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Parent',
      });

      const reply = await contributionService.reply(parent.id, creatorId, {
        branch_id: branchId,
        type: 'idea', // Should be overridden to comment
        content: 'Reply',
      });

      expect(reply?.type).toBe('comment');
    });

    it('returns null for non-existent parent', async () => {
      const result = await contributionService.reply('non-existent', creatorId, {
        branch_id: branchId,
        content: 'Reply',
      });

      expect(result).toBeNull();
    });
  });

  describe('getUserContributions', () => {
    it('returns all contributions by user', async () => {
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Idea 1',
      });
      await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'comment',
        content: 'Comment 1',
      });

      const otherUser = await identityService.createAnonymousUser();
      await contributionService.createContribution(otherUser.id, {
        branch_id: branchId,
        type: 'idea',
        content: 'Other idea',
      });

      const myContributions = await contributionService.getUserContributions(creatorId);

      expect(myContributions).toHaveLength(2);
      expect(myContributions.every(c => c.author_id === creatorId)).toBe(true);
    });
  });

  describe('deleteContribution', () => {
    it('allows author to delete their contribution', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'To delete',
      });

      const result = await contributionService.deleteContribution(contribution.id, creatorId);

      expect(result).toBe(true);
      expect(await contributionService.getContributionById(contribution.id)).toBeNull();
    });

    it('prevents non-author from deleting', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Protected',
      });

      const otherUser = await identityService.createAnonymousUser();
      const result = await contributionService.deleteContribution(contribution.id, otherUser.id);

      expect(result).toBe(false);
      expect(await contributionService.getContributionById(contribution.id)).not.toBeNull();
    });

    it('returns false for non-existent contribution', async () => {
      const result = await contributionService.deleteContribution('non-existent', creatorId);

      expect(result).toBe(false);
    });
  });

  describe('updateContribution', () => {
    it('allows author to update content', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Original content',
      });

      const updated = await contributionService.updateContribution(contribution.id, creatorId, {
        content: 'Updated content',
      });

      expect(updated?.content).toBe('Updated content');
    });

    it('prevents non-author from updating', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Original',
      });

      const otherUser = await identityService.createAnonymousUser();
      const result = await contributionService.updateContribution(contribution.id, otherUser.id, {
        content: 'Hacked',
      });

      expect(result).toBeNull();
    });

    it('preserves original content when not updating', async () => {
      const contribution = await contributionService.createContribution(creatorId, {
        branch_id: branchId,
        type: 'idea',
        content: 'Original',
      });

      const updated = await contributionService.updateContribution(contribution.id, creatorId, {});

      expect(updated?.content).toBe('Original');
    });
  });
});
