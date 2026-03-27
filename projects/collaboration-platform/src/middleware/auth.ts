/**
 * Auth Middleware — Credo Platform MVP
 * 
 * App-level authentication for anonymous UUID-in-localStorage users.
 * RLS is deferred to Phase 2; this middleware handles auth at the API entry point.
 * 
 * Flow:
 * 1. Client generates random UUID, stores in localStorage
 * 2. Client sends x-user-id header with each request
 * 3. Middleware validates UUID format + user exists in DB
 * 4. User record attached to req.user for route handlers
 */

import { Request, Response, NextFunction } from 'express';
import { identityService } from '../services/identity.js';

// Extend Express Request to include user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        anonymousId: string;
        displayName: string | null;
        trustTier: string;
        credibilityScore: number;
      };
      userId?: string; // Raw user ID for convenience
    }
  }
}

// UUID v4 regex for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate x-user-id header format (must be UUID v4)
 */
export function validateUserIdFormat(userId: string | undefined): boolean {
  if (!userId) return false;
  return UUID_REGEX.test(userId);
}

/**
 * Authentication middleware — requires valid x-user-id header.
 * Attaches user record to req.user if valid.
 * 
 * Usage: app.get('/protected', authenticate(), (req, res) => { ... })
 */
export function authenticate() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string | undefined;

    // Check header presence
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Send x-user-id header.',
        code: 'MISSING_AUTH',
      });
    }

    // Validate UUID format
    if (!validateUserIdFormat(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid x-user-id format. Must be a valid UUID v4.',
        code: 'INVALID_AUTH_FORMAT',
      });
    }

    // Look up user in database
    const user = await identityService.getUserById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found. Please create an account first.',
        code: 'USER_NOT_FOUND',
      });
    }

    // Attach user to request context
    req.user = {
      id: user.id,
      anonymousId: user.anonymous_id,
      displayName: user.display_name,
      trustTier: user.trust_tier,
      credibilityScore: user.credibility_score,
    };
    req.userId = user.id;

    next();
  };
}

/**
 * Optional authentication middleware — attaches user if x-user-id present,
 * but does NOT reject if absent. Use for public endpoints that benefit from
 * knowing the user (e.g., branch pages showing personalized feed).
 * 
 * Usage: app.get('/branches/:id', optionalAuth(), (req, res) => { ... })
 */
export function optionalAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string | undefined;

    if (!userId) {
      // No auth header — continue as unauthenticated request
      return next();
    }

    if (!validateUserIdFormat(userId)) {
      // Invalid format — continue but without user context
      return next();
    }

    const user = await identityService.getUserById(userId);

    if (user) {
      req.user = {
        id: user.id,
        anonymousId: user.anonymous_id,
        displayName: user.display_name,
        trustTier: user.trust_tier,
        credibilityScore: user.credibility_score,
      };
      req.userId = user.id;
    }

    next();
  };
}

/**
 * Require a specific trust tier for the endpoint.
 * Must be used AFTER authenticate().
 * 
 * Usage: app.post('/branches', authenticate(), requireTier('contributor'), ...)
 */
export function requireTier(minTier: 'newcomer' | 'contributor' | 'trusted' | 'elder') {
  const tierRank: Record<string, number> = {
    newcomer: 0,
    contributor: 1,
    trusted: 2,
    elder: 3,
  };

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED',
      });
    }

    const userTierRank = tierRank[req.user.trustTier] ?? 0;
    const requiredRank = tierRank[minTier] ?? 0;

    if (userTierRank < requiredRank) {
      return res.status(403).json({
        success: false,
        error: `This action requires ${minTier} trust tier or higher. Your current tier: ${req.user.trustTier}`,
        code: 'INSUFFICIENT_TIER',
      });
    }

    next();
  };
}
