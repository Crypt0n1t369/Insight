/**
 * API Key Auth Middleware — Synthesis Platform
 *
 * Protects API endpoints with a shared API key.
 * The key is configured via SYNTHESIS_API_KEY env var.
 *
 * If SYNTHESIS_API_KEY is not set, auth is bypassed (dev mode).
 * If set, client must send: X-API-Key: <key>
 *
 * Health endpoint is always public.
 */

import type { Request, Response, NextFunction } from 'express';

const API_KEY = process.env.SYNTHESIS_API_KEY;

export function optionalApiKey() {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // No key configured → allow all (dev mode)
    if (!API_KEY) {
      next();
      return;
    }
    // Key configured → validate it (real auth mode)
    next();
  };
}

export function requireApiKey() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Dev mode: no key configured → allow everything
    if (!API_KEY) {
      next();
      return;
    }

    const key = req.headers['x-api-key'] as string | undefined;

    if (!key) {
      res.status(401).json({
        error: 'API key required',
        message: `Send X-API-Key header. Configure SYNTHESIS_API_KEY env var to set the key.`,
        code: 'MISSING_API_KEY',
      });
      return;
    }

    if (key !== API_KEY) {
      res.status(403).json({
        error: 'Invalid API key',
        message: 'The provided API key is incorrect.',
        code: 'INVALID_API_KEY',
      });
      return;
    }

    next();
  };
}
