// Tests for Credo Identity Service
import { describe, it, expect, beforeEach } from 'vitest';
import { IdentityService, resetIdentityService } from '../src/services/identity.js';

describe('IdentityService', () => {
  let service: IdentityService;
  
  beforeEach(() => {
    service = new IdentityService();
    resetIdentityService();
  });
  
  it('should create an anonymous user', async () => {
    const user = await service.createAnonymousUser();
    
    expect(user.id).toBeDefined();
    expect(user.anonymous_id).toHaveLength(16);
    expect(user.trust_tier).toBe('newcomer');
    expect(user.credibility_score).toBe(0);
    expect(user.display_name).toBeNull();
  });
  
  it('should create user with display name', async () => {
    const user = await service.createAnonymousUser({
      display_name: 'Test User'
    });
    
    expect(user.display_name).toBe('Test User');
  });
  
  it('should get user by ID', async () => {
    const created = await service.createAnonymousUser();
    const retrieved = await service.getUserById(created.id);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(created.id);
  });
  
  it('should return null for nonexistent user', async () => {
    const result = await service.getUserById('nonexistent-id');
    
    expect(result).toBeNull();
  });
  
  it('should update display name', async () => {
    const user = await service.createAnonymousUser();
    const updated = await service.updateDisplayName(user.id, 'New Name');
    
    expect(updated).not.toBeNull();
    expect(updated!.display_name).toBe('New Name');
  });
  
  it('should truncate long display names', async () => {
    const user = await service.createAnonymousUser();
    const longName = 'A'.repeat(100);
    const updated = await service.updateDisplayName(user.id, longName);
    
    expect(updated).not.toBeNull();
    expect(updated!.display_name).toHaveLength(50);
  });
  
  it('should connect wallet', async () => {
    const user = await service.createAnonymousUser();
    const updated = await service.connectWallet(user.id, '0xABC123');
    
    expect(updated).not.toBeNull();
    expect(updated!.wallet_address).toBe('0xabc123'); // lowercase
  });
  
  it('should update credibility', async () => {
    const user = await service.createAnonymousUser();
    const updated = await service.updateCredibility(user.id, 10, 'Test points');
    
    expect(updated).not.toBeNull();
    expect(updated!.credibility_score).toBe(10);
  });
  
  it('should never go below 0 credibility', async () => {
    const user = await service.createAnonymousUser();
    const updated = await service.updateCredibility(user.id, -100, 'Test');
    
    expect(updated).not.toBeNull();
    expect(updated!.credibility_score).toBe(0);
  });
  
  it('should get leaderboard sorted by credibility', async () => {
    const user1 = await service.createAnonymousUser();
    const user2 = await service.createAnonymousUser();
    
    await service.updateCredibility(user1.id, 50, 'Test');
    await service.updateCredibility(user2.id, 100, 'Test');
    
    const leaderboard = await service.getLeaderboard();
    
    expect(leaderboard).toHaveLength(2);
    expect(leaderboard[0].credibility_score).toBeGreaterThanOrEqual(leaderboard[1].credibility_score);
  });
  
  it('should get user count', async () => {
    await service.createAnonymousUser();
    await service.createAnonymousUser();
    
    const count = await service.getUserCount();
    
    expect(count).toBe(2);
  });
});
