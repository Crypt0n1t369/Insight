// Identity Service - Anonymous User Management
// Version: 0.1.0 (MVP)

import { randomBytes, createHash } from 'crypto';
import { User, CreateUserInput, UserSchema, TrustTier } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for MVP (would be Supabase in production)
const users = new Map<string, User>();

/**
 * Generate a secure anonymous ID
 * This is a hash of a random value, not reversible to identity
 */
function generateAnonymousId(): string {
  const random = randomBytes(32).toString('hex');
  return createHash('sha256').update(random).digest('hex').substring(0, 16);
}

/**
 * Generate an avatar seed for procedural avatars
 */
function generateAvatarSeed(): string {
  return uuidv4();
}

/**
 * Determine trust tier based on credibility score.
 * Thresholds: elder=2000, trusted=500, contributor=100, newcomer=0.
 * Matches SCHEMA.md get_tier() function. Changes here must be reflected there.
 */
function calculateTrustTier(credibility: number): TrustTier {
  if (credibility >= 2000) return 'elder';
  if (credibility >= 500)  return 'trusted';
  if (credibility >= 100)  return 'contributor';
  return 'newcomer';
}

/**
 * Identity Service - handles anonymous user creation and management
 */
export class IdentityService {
  
  /**
   * Create a new anonymous user
   * No authentication required - this is the core innovation
   */
  async createAnonymousUser(input?: CreateUserInput): Promise<User> {
    const now = new Date().toISOString();
    
    const user: User = {
      id: uuidv4(),
      anonymous_id: generateAnonymousId(),
      display_name: input?.display_name ?? null,
      avatar_seed: generateAvatarSeed(),
      trust_tier: 'newcomer',
      credibility_score: 0,
      wallet_address: null,
      created_at: now,
      updated_at: now,
    };
    
    // Validate with Zod
    const validated = UserSchema.parse(user);
    
    // Store in memory (would be Supabase in production)
    users.set(validated.id, validated);
    
    return validated;
  }
  
  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return users.get(id) ?? null;
  }
  
  /**
   * Get user by anonymous ID
   */
  async getUserByAnonymousId(anonymousId: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.anonymous_id === anonymousId) {
        return user;
      }
    }
    return null;
  }
  
  /**
   * Update user's display name
   */
  async updateDisplayName(userId: string, displayName: string): Promise<User | null> {
    const user = users.get(userId);
    if (!user) return null;
    
    const updated: User = {
      ...user,
      display_name: displayName.substring(0, 50),
      updated_at: new Date().toISOString(),
    };
    
    users.set(userId, updated);
    return updated;
  }
  
  /**
   * Connect optional wallet address
   */
  async connectWallet(userId: string, walletAddress: string): Promise<User | null> {
    const user = users.get(userId);
    if (!user) return null;
    
    const updated: User = {
      ...user,
      wallet_address: walletAddress.toLowerCase(),
      updated_at: new Date().toISOString(),
    };
    
    users.set(userId, updated);
    return updated;
  }
  
  /**
   * Update user's credibility score
   */
  async updateCredibility(userId: string, change: number, reason: string): Promise<User | null> {
    const user = users.get(userId);
    if (!user) return null;
    
    const newScore = Math.max(0, user.credibility_score + change);
    const newTier = calculateTrustTier(newScore);
    
    const updated: User = {
      ...user,
      credibility_score: newScore,
      trust_tier: newTier,
      updated_at: new Date().toISOString(),
    };
    
    users.set(userId, updated);
    return updated;
  }
  
  /**
   * Get all users sorted by credibility (leaderboard)
   */
  async getLeaderboard(limit = 10): Promise<User[]> {
    return Array.from(users.values())
      .sort((a, b) => b.credibility_score - a.credibility_score)
      .slice(0, limit);
  }
  
  /**
   * Get total user count
   */
  async getUserCount(): Promise<number> {
    return users.size;
  }
}

// Reset function for testing
export function resetIdentityService() {
  users.clear();
}

// Export singleton instance
export const identityService = new IdentityService();
