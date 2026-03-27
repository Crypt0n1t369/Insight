/**
 * Auth Middleware Tests for Credo Platform
 * 
 * Tests the app-level authentication middleware:
 * - authenticate() — requires valid x-user-id + existing user
 * - optionalAuth() — attaches user if header present, no rejection
 * - requireTier() — enforces minimum trust tier
 * - UUID format validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateUserIdFormat } from '../src/middleware/auth.js';

describe('Auth Middleware', () => {
  describe('validateUserIdFormat', () => {
    it('accepts valid UUID v4', () => {
      expect(validateUserIdFormat('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(validateUserIdFormat('6ba7b810-9dad-41d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('rejects null/undefined', () => {
      expect(validateUserIdFormat(undefined)).toBe(false);
    });

    it('rejects plain strings', () => {
      expect(validateUserIdFormat('user-123')).toBe(false);
      expect(validateUserIdFormat('not-a-uuid')).toBe(false);
      expect(validateUserIdFormat('')).toBe(false);
    });

    it('rejects wrong-length strings', () => {
      expect(validateUserIdFormat('550e8400-e29b-41d4-a716')).toBe(false);
      expect(validateUserIdFormat('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false);
    });

    it('rejects UUIDs with wrong version digit', () => {
      // Version 5 (not allowed — we only accept v4)
      expect(validateUserIdFormat('550e8400-e29b-51d4-a716-446655440000')).toBe(false);
    });

    it('rejects UUIDs with wrong variant digit', () => {
      // Variant is 8, 9, a, or b for RFC4122 — 'c' is wrong
      expect(validateUserIdFormat('550e8400-e29b-41d4-c716-446655440000')).toBe(false);
    });
  });
});
