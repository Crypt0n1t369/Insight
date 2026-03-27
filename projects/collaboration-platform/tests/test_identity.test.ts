/**
 * Identity Service Tests - CREDO Platform
 * Tests anonymous user creation, trust tiers, credibility scoring
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { IdentityService, resetIdentityService } from '../src/services/identity.js';
import { TrustTier } from '../src/types/index.js';

describe('IdentityService', () => {
  let service: IdentityService;

  beforeEach(() => {
    resetIdentityService();
    service = new IdentityService();
  });

  describe('createAnonymousUser', () => {
    it('creates a user with required fields', async () => {
      const user = await service.createAnonymousUser();

      expect(user.id).toBeDefined();
      expect(user.anonymous_id).toBeDefined();
      expect(user.anonymous_id).toHaveLength(16);
      expect(user.trust_tier).toBe('newcomer');
      expect(user.credibility_score).toBe(0);
      expect(user.display_name).toBeNull();
      expect(user.wallet_address).toBeNull();
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    it('generates unique anonymous IDs', async () => {
      const user1 = await service.createAnonymousUser();
      const user2 = await service.createAnonymousUser();

      expect(user1.anonymous_id).not.toBe(user2.anonymous_id);
      expect(user1.id).not.toBe(user2.id);
    });

    it('accepts optional display name', async () => {
      const user = await service.createAnonymousUser({ display_name: 'Phoenix' });

      expect(user.display_name).toBe('Phoenix');
    });

    it('createAnonymousUser rejects display_name > 50 chars', async () => {
      const longName = 'A'.repeat(100);
      // CreateUserSchema: z.string().max(50) — must be enforced on input
      await expect(service.createAnonymousUser({ display_name: longName })).rejects.toThrow();
    });
  });

  describe('trust tier calculation', () => {
    it('newcomer: score 0', async () => {
      const user = await service.createAnonymousUser();
      expect(user.trust_tier).toBe('newcomer');
    });

    it('contributor: score >= 100', async () => {
      const user = await service.createAnonymousUser();
      await service.updateCredibility(user.id, 100, 'test');
      const updated = await service.getUserById(user.id);

      expect(updated?.trust_tier).toBe('contributor');
      expect(updated?.credibility_score).toBe(100);
    });

    it('trusted: score >= 500', async () => {
      const user = await service.createAnonymousUser();
      await service.updateCredibility(user.id, 500, 'test');
      const updated = await service.getUserById(user.id);

      expect(updated?.trust_tier).toBe('trusted');
    });

    it('elder: score >= 2000', async () => {
      const user = await service.createAnonymousUser();
      await service.updateCredibility(user.id, 2000, 'test');
      const updated = await service.getUserById(user.id);

      expect(updated?.trust_tier).toBe('elder');
    });

    it('tier transitions at boundary', async () => {
      const user = await service.createAnonymousUser();
      
      // newcomer → contributor at 100
      await service.updateCredibility(user.id, 99, 'test');
      expect((await service.getUserById(user.id))?.trust_tier).toBe('newcomer');
      
      await service.updateCredibility(user.id, 1, 'test');
      expect((await service.getUserById(user.id))?.trust_tier).toBe('contributor');
      
      // contributor → trusted at 500
      await service.updateCredibility(user.id, 400, 'test');
      expect((await service.getUserById(user.id))?.trust_tier).toBe('trusted');
      
      // trusted → elder at 2000
      await service.updateCredibility(user.id, 1500, 'test');
      expect((await service.getUserById(user.id))?.trust_tier).toBe('elder');
    });
  });

  describe('updateCredibility', () => {
    it('increases credibility score', async () => {
      const user = await service.createAnonymousUser();
      const updated = await service.updateCredibility(user.id, 50, 'test contribution');

      expect(updated?.credibility_score).toBe(50);
      expect(updated?.trust_tier).toBe('newcomer');
    });

    it('does not go below 0', async () => {
      const user = await service.createAnonymousUser();
      const updated = await service.updateCredibility(user.id, -100, 'penalty');

      expect(updated?.credibility_score).toBe(0);
    });

    it('returns null for non-existent user', async () => {
      const result = await service.updateCredibility('non-existent-id', 50, 'test');

      expect(result).toBeNull();
    });

    it('accumulates credibility across multiple updates', async () => {
      const user = await service.createAnonymousUser();
      await service.updateCredibility(user.id, 30, 'first');
      await service.updateCredibility(user.id, 25, 'second');
      await service.updateCredibility(user.id, 45, 'third');

      const updated = await service.getUserById(user.id);
      expect(updated?.credibility_score).toBe(100);
    });
  });

  describe('getUserById', () => {
    it('returns user when exists', async () => {
      const created = await service.createAnonymousUser();
      const found = await service.getUserById(created.id);

      expect(found?.id).toBe(created.id);
      expect(found?.anonymous_id).toBe(created.anonymous_id);
    });

    it('returns null for non-existent id', async () => {
      const result = await service.getUserById('non-existent-uuid');

      expect(result).toBeNull();
    });
  });

  describe('getUserByAnonymousId', () => {
    it('returns user by anonymous ID', async () => {
      const created = await service.createAnonymousUser();
      const found = await service.getUserByAnonymousId(created.anonymous_id);

      expect(found?.id).toBe(created.id);
    });

    it('returns null for non-existent anonymous ID', async () => {
      const result = await service.getUserByAnonymousId('nonexistent123456');

      expect(result).toBeNull();
    });
  });

  describe('updateDisplayName', () => {
    it('updates display name', async () => {
      const user = await service.createAnonymousUser();
      const updated = await service.updateDisplayName(user.id, 'NewName');

      expect(updated?.display_name).toBe('NewName');
    });

    it('truncates long display names', async () => {
      const user = await service.createAnonymousUser();
      const longName = 'B'.repeat(80);
      const updated = await service.updateDisplayName(user.id, longName);

      expect(updated?.display_name).toHaveLength(50);
    });

    it('returns null for non-existent user', async () => {
      const result = await service.updateDisplayName('non-existent', 'name');

      expect(result).toBeNull();
    });
  });

  describe('connectWallet', () => {
    it('stores wallet address lowercase', async () => {
      const user = await service.createAnonymousUser();
      const updated = await service.connectWallet(user.id, '0xABCDEF123456');

      expect(updated?.wallet_address).toBe('0xabcdef123456');
    });

    it('returns null for non-existent user', async () => {
      const result = await service.connectWallet('non-existent', '0x123');

      expect(result).toBeNull();
    });
  });

  describe('getLeaderboard', () => {
    it('returns users sorted by credibility descending', async () => {
      const user1 = await service.createAnonymousUser();
      const user2 = await service.createAnonymousUser();
      const user3 = await service.createAnonymousUser();

      await service.updateCredibility(user3.id, 100, 'test');
      await service.updateCredibility(user1.id, 200, 'test');
      await service.updateCredibility(user2.id, 50, 'test');

      const leaderboard = await service.getLeaderboard();

      expect(leaderboard[0].credibility_score).toBe(200);
      expect(leaderboard[1].credibility_score).toBe(100);
      expect(leaderboard[2].credibility_score).toBe(50);
    });

    it('respects limit parameter', async () => {
      for (let i = 0; i < 10; i++) {
        const user = await service.createAnonymousUser();
        await service.updateCredibility(user.id, i * 10, 'test');
      }

      const leaderboard = await service.getLeaderboard(3);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].credibility_score).toBe(90);
    });
  });

  describe('getUserCount', () => {
    it('returns correct count', async () => {
      expect(await service.getUserCount()).toBe(0);

      await service.createAnonymousUser();
      expect(await service.getUserCount()).toBe(1);

      await service.createAnonymousUser();
      await service.createAnonymousUser();
      expect(await service.getUserCount()).toBe(3);
    });
  });
});
