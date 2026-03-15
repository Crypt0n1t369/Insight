// Credo Platform API Server
// Version: 0.1.0 (MVP)

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { identityService } from './services/identity.js';
import { branchService } from './services/branch.js';
import { contributionService } from './services/contribution.js';
import { proposalService } from './services/proposal.js';

import type { 
  CreateUserInput, 
  CreateBranchInput, 
  CreateContributionInput,
  CreateProposalInput,
  CreateVoteInput
} from './types/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// Identity Routes
// ============================================

// Create anonymous user
app.post('/api/users', async (req, res) => {
  try {
    const input: CreateUserInput = req.body;
    const user = await identityService.createAnonymousUser(input);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get leaderboard (must be before /:id route to avoid matching "leaderboard" as an id)
app.get('/api/users/leaderboard', async (_req, res) => {
  try {
    const limit = Math.min(parseInt(_req.query.limit as string) || 10, 100);
    const users = await identityService.getLeaderboard(limit);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await identityService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Update display name
app.patch('/api/users/:id/name', async (req, res) => {
  try {
    const { display_name } = req.body;
    if (!display_name || typeof display_name !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid display_name' });
    }
    const user = await identityService.updateDisplayName(req.params.id, display_name);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Connect wallet
app.post('/api/users/:id/wallet', async (req, res) => {
  try {
    const { wallet_address } = req.body;
    if (!wallet_address || typeof wallet_address !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid wallet_address' });
    }
    const user = await identityService.connectWallet(req.params.id, wallet_address);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get user's contributions
app.get('/api/users/:id/contributions', async (req, res) => {
  try {
    const contributions = await contributionService.getUserContributions(req.params.id);
    res.json({ success: true, data: contributions });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ============================================
// Branch Routes
// ============================================

// Create branch
app.post('/api/branches', async (req, res) => {
  try {
    const input: CreateBranchInput = req.body;
    const creatorId = req.headers['x-user-id'] as string;
    
    if (!creatorId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    
    const branch = await branchService.createBranch(creatorId, input);
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get branch by ID
app.get('/api/branches/:id', async (req, res) => {
  try {
    const branch = await branchService.getBranchById(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, error: 'Branch not found' });
    }
    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get root branches
app.get('/api/branches', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    
    const result = await branchService.getRootBranches(limit, offset);
    res.json({ 
      success: true, 
      data: result.branches,
      meta: { total: result.total, limit, offset }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get child branches
app.get('/api/branches/:id/children', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    
    const result = await branchService.getChildBranches(req.params.id, limit, offset);
    res.json({ 
      success: true, 
      data: result.branches,
      meta: { total: result.total, limit, offset }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get branch tree
app.get('/api/branches/:id/tree', async (req, res) => {
  try {
    const depth = Math.min(parseInt(req.query.depth as string) || 2, 5);
    const tree = await branchService.getBranchTree(req.params.id, 0, depth);
    
    if (!tree) {
      return res.status(404).json({ success: false, error: 'Branch not found' });
    }
    
    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ============================================
// Contribution Routes
// ============================================

// Create contribution
app.post('/api/contributions', async (req, res) => {
  try {
    const input: CreateContributionInput = req.body;
    const authorId = req.headers['x-user-id'] as string;
    
    if (!authorId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    
    const contribution = await contributionService.createContribution(authorId, input);
    res.status(201).json({ success: true, data: contribution });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get contribution by ID
app.get('/api/contributions/:id', async (req, res) => {
  try {
    const contribution = await contributionService.getContributionById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ success: false, error: 'Contribution not found' });
    }
    res.json({ success: true, data: contribution });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get branch contributions
app.get('/api/branches/:branchId/contributions', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const type = req.query.type as any;
    const parentId = req.query.parentId === 'null' ? null : req.query.parentId as string | null;
    
    const result = await contributionService.getBranchContributions(
      req.params.branchId, 
      { type, parentId, limit, offset }
    );
    
    res.json({ 
      success: true, 
      data: result.contributions,
      meta: { total: result.total, limit, offset }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Endorse contribution
app.post('/api/contributions/:id/endorse', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    
    const contribution = await contributionService.endorse(req.params.id, userId);
    if (!contribution) {
      return res.status(404).json({ success: false, error: 'Contribution not found' });
    }
    res.json({ success: true, data: contribution });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Reply to contribution
app.post('/api/contributions/:id/reply', async (req, res) => {
  try {
    const authorId = req.headers['x-user-id'] as string;
    
    if (!authorId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    
    const input: CreateContributionInput = req.body;
    const reply = await contributionService.reply(req.params.id, authorId, input);
    
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Parent contribution not found' });
    }
    
    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ============================================
// Stats Routes
// ============================================

app.get('/api/stats', async (_req, res) => {
  try {
    const userCount = await identityService.getUserCount();
    const branches = await branchService.getBranches();
    const contributions = Array.from((await contributionService.getBranchContributions('*' as any)).contributions);
    
    res.json({
      success: true,
      data: {
        users: userCount,
        branches: branches.total,
        contributions: contributions.length,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// ============================================
// Proposal Routes
// ============================================

// Create proposal
app.post('/api/proposals', async (req, res) => {
  try {
    const input: CreateProposalInput = req.body;
    const authorId = req.headers['x-user-id'] as string;
    
    if (!authorId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    
    const proposal = await proposalService.createProposal(authorId, input);
    res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get proposal by ID
app.get('/api/proposals/:id', async (req, res) => {
  try {
    const proposal = await proposalService.getProposalById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found' });
    }
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get branch proposals
app.get('/api/branches/:branchId/proposals', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as any;
    
    const result = await proposalService.getBranchProposals(
      req.params.branchId, 
      { status, limit, offset }
    );
    
    res.json({ 
      success: true, 
      data: result.proposals,
      meta: { total: result.total, limit, offset }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Vote on proposal
app.post('/api/proposals/:id/vote', async (req, res) => {
  try {
    const input: CreateVoteInput = req.body;
    const voterId = req.headers['x-user-id'] as string;
    
    if (!voterId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    
    const vote = await proposalService.vote(req.params.id, voterId, input);
    if (!vote) {
      return res.status(404).json({ success: false, error: 'Proposal not found' });
    }
    res.status(201).json({ success: true, data: vote });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Close a proposal
app.post('/api/proposals/:id/close', async (req, res) => {
  try {
    const proposal = await proposalService.closeProposal(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found or already closed' });
    }
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Withdraw proposal
app.post('/api/proposals/:id/withdraw', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID required' });
    }
    
    const proposal = await proposalService.withdrawProposal(req.params.id, userId);
    if (!proposal) {
      return res.status(404).json({ success: false, error: 'Proposal not found' });
    }
    res.json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Get proposal votes
app.get('/api/proposals/:id/votes', async (req, res) => {
  try {
    const votes = await proposalService.getProposalVotes(req.params.id);
    res.json({ success: true, data: votes });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   CREDO PLATFORM v0.1.0 (MVP)                     ║
║   Server running on port ${PORT}                      ║
║                                                   ║
║   Endpoints:                                      ║
║   - POST   /api/users          Create user       ║
║   - GET    /api/users/:id      Get user          ║
║   - GET    /api/users/leaderboard               ║
║   - POST   /api/branches        Create branch    ║
║   - GET    /api/branches        List branches    ║
║   - POST   /api/contributions  Create contribution║
║   - GET    /api/contributions  List contributions║
║   - POST   /api/contributions/:id/endorse       ║
║   - POST   /api/proposals        Create proposal ║
║   - GET    /api/proposals/:id    Get proposal    ║
║   - POST   /api/proposals/:id/vote             ║
║   - POST   /api/proposals/:id/close            ║
╚═══════════════════════════════════════════════════╝
  `);
});

export default app;
