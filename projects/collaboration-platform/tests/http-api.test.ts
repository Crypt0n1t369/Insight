/**
 * HTTP API Integration Tests for Credo Platform
 * 
 * These tests make actual HTTP requests to the running server on port 3000.
 * They complement the service-layer integration tests (integration.test.ts)
 * which test business logic in isolation.
 * 
 * Run with: npm test -- tests/http-api.test.ts
 * (Requires server running: node dist/index.js)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';

const BASE_URL = 'http://localhost:3000';

function apiRequest(method: string, path: string, body?: object, userId?: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers: http.OutgoingHttpHeaders = { 'Content-Type': 'application/json' };
    if (userId) headers['x-user-id'] = userId;
    const opts: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers,
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode || 0, body: parsed });
        } catch {
          resolve({ status: res.statusCode || 0, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Helper: create a user and return its ID
async function createUser(name = 'Test User'): Promise<string> {
  const res = await apiRequest('POST', '/api/users', { display_name: name });
  if (!res.body?.data?.id) throw new Error(`Failed to create user: ${JSON.stringify(res.body)}`);
  return res.body.data.id;
}

// Helper: create a branch with a user ID
async function createBranch(userId: string, title = 'Test Branch'): Promise<any> {
  const res = await apiRequest('POST', '/api/branches', { title }, userId);
  if (!res.body?.data?.id) throw new Error(`Failed to create branch: ${JSON.stringify(res.body)}`);
  return res.body.data;
}

// Helper: create a contribution (schema: branch_id, type, content, optional parent_id)
async function createContribution(userId: string, branchId: string, content = 'Test content', type = 'idea'): Promise<any> {
  const res = await apiRequest('POST', '/api/contributions', { branch_id: branchId, content, type }, userId);
  if (!res.body?.data?.id) throw new Error(`Failed to create contribution: ${JSON.stringify(res.body)}`);
  return res.body.data;
}

describe('Credo HTTP API Integration', () => {
  describe('Health', () => {
    it('GET /health returns 200', async () => {
      const { status, body } = await apiRequest('GET', '/health');
      expect(status).toBe(200);
      expect(body.status).toBe('ok');
    });
  });

  describe('Users API', () => {
    it('POST /api/users creates a user', async () => {
      const { status, body } = await apiRequest('POST', '/api/users', {
        display_name: 'HTTP Test User'
      });
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.display_name).toBe('HTTP Test User');
      expect(body.data.id).toBeDefined();
      expect(body.data.credibility_score).toBe(0);
    });

    it('POST /api/users without body still works (uses defaults)', async () => {
      const { status, body } = await apiRequest('POST', '/api/users', {});
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
    });

    it('GET /api/users/:id returns the user', async () => {
      // Create first
      const create = await apiRequest('POST', '/api/users', { display_name: 'Find Me' });
      const id = create.body.data.id;
      const { status, body } = await apiRequest('GET', `/api/users/${id}`);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(id);
      expect(body.data.display_name).toBe('Find Me');
    });

    it('GET /api/users/:id returns 404 for unknown id', async () => {
      const { status, body } = await apiRequest('GET', '/api/users/nonexistent-id-999');
      expect(status).toBe(404);
      expect(body.success).toBe(false);
    });

    it('PATCH /api/users/:id/name updates display name', async () => {
      const create = await apiRequest('POST', '/api/users', { display_name: 'Old Name' });
      const id = create.body.data.id;
      const { status, body } = await apiRequest('PATCH', `/api/users/${id}/name`, {
        display_name: 'New Name'
      });
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.display_name).toBe('New Name');
    });

    it('PATCH /api/users/:id/name returns 400 for missing display_name', async () => {
      const create = await apiRequest('POST', '/api/users', { display_name: 'Test' });
      const id = create.body.data.id;
      const { status } = await apiRequest('PATCH', `/api/users/${id}/name`, {});
      expect(status).toBe(400);
    });

    it('GET /api/users/leaderboard returns array', async () => {
      const { status, body } = await apiRequest('GET', '/api/users/leaderboard');
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('GET /api/users/leaderboard respects limit param', async () => {
      const { status, body } = await apiRequest('GET', '/api/users/leaderboard?limit=5');
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      // Results capped at limit
      expect(body.data.length).toBeLessThanOrEqual(5);
    });

    it('POST /api/users/:id/wallet attaches wallet address', async () => {
      const create = await apiRequest('POST', '/api/users', { display_name: 'Wallet Test' });
      const id = create.body.data.id;
      const { status, body } = await apiRequest('POST', `/api/users/${id}/wallet`, {
        wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fEb1'
      }, id);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.wallet_address.toLowerCase()).toBe('0x742d35cc6634c0532925a3b844bc9e7595f8feb1');
    });
  });

  describe('Branches API', () => {
    it('POST /api/branches creates a branch', async () => {
      const userId = await createUser('Branch Creator');
      const { status, body } = await apiRequest('POST', '/api/branches', {
        title: 'HTTP Test Branch'
      }, userId);
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('HTTP Test Branch');
    });

    it('GET /api/branches returns list', async () => {
      const { status, body } = await apiRequest('GET', '/api/branches');
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('GET /api/branches/:id returns branch', async () => {
      const userId = await createUser('Branch Viewer');
      const branch = await createBranch(userId, 'View Test Branch');
      const { status, body } = await apiRequest('GET', `/api/branches/${branch.id}`);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(branch.id);
    });

    it('GET /api/branches/:id returns 404 for unknown', async () => {
      const { status } = await apiRequest('GET', '/api/branches/nonexistent-999');
      expect(status).toBe(404);
    });
  });

  describe('Contributions API', () => {
    it('POST /api/contributions creates a contribution', async () => {
      const userId = await createUser('Contribution Author');
      const branch = await createBranch(userId, 'Contribution Test Branch');
      const { status, body } = await apiRequest('POST', '/api/contributions', {
        branch_id: branch.id,
        type: 'idea',
        content: 'Test content for HTTP integration'
      }, userId);
      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.content).toBe('Test content for HTTP integration');
      expect(body.data.author_id).toBe(userId);
    });

    it('GET /api/contributions?branch_id=X returns branch contributions', async () => {
      const userId = await createUser('Contrib List User');
      const branch = await createBranch(userId, 'List Test Branch');
      await createContribution(userId, branch.id, 'Listed Contribution', 'idea');
      const { status, body } = await apiRequest('GET', `/api/branches/${branch.id}/contributions`);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('GET /api/contributions/:id returns contribution', async () => {
      const userId = await createUser('Contrib Get User');
      const branch = await createBranch(userId, 'Get Test Branch');
      const contrib = await createContribution(userId, branch.id, 'Get Test', 'idea');
      const { status, body } = await apiRequest('GET', `/api/contributions/${contrib.id}`);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(contrib.id);
    });

    it('DELETE /api/contributions/:id deletes contribution', async () => {
      const userId = await createUser('Contrib Delete User');
      const branch = await createBranch(userId, 'Delete Test Branch');
      const contrib = await createContribution(userId, branch.id, 'To Delete', 'idea');
      const { status, body } = await apiRequest('DELETE', `/api/contributions/${contrib.id}`, undefined, userId);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('PATCH /api/contributions/:id/vote votes on contribution', async () => {
      const authorId = await createUser('Vote Author');
      const voterId = await createUser('Vote Voter');
      const branch = await createBranch(authorId, 'Vote Test Branch');
      const contrib = await createContribution(authorId, branch.id, 'Vote Target', 'idea');
      const { status, body } = await apiRequest('POST', `/api/contributions/${contrib.id}/endorse`, {}, voterId);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });
  });
});
