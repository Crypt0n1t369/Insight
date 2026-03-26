# Credo Collaboration Platform - Technical Specification
## Version 0.1.0 - MVP Specification

---

# 1. Platform Overview

## Core Vision
**Credo** is infrastructure for distributed, pseudo-anonymous collaboration where contributors earn credibility through value-based contributions. The platform enables egoless representation through synthetic characters.

## Mission Statement
> Build a platform where ideas compete on merit, not reputation; where contributors are valued for impact, not identity; and where synthetic characters enable participation without personal exposure.

## Target Users

### Primary
- **Researchers** seeking collaborative knowledge building
- **Mentors** wanting to give back anonymously
- **At-risk youth** needing safe spaces to contribute

### Secondary
- **Communities** organizing around causes
- **DAOs** needing credibility infrastructure
- **Organizations** seeking input without hierarchy

---

# 2. Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CREDO PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    CLIENT LAYER                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │   │
│  │  │ Web (Next)  │  │ PWA         │  │ Mobile (future) │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    API GATEWAY                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │   │
│  │  │ REST        │  │ GraphQL     │  │ WebSocket      │    │   │
│  │  │ Endpoints   │  │ Playground  │  │ (realtime)     │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 APPLICATION LAYER                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │   │
│  │  │ Identity    │  │ Branch      │  │ Contribution   │    │   │
│  │  │ Service     │  │ Service     │  │ Service        │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │   │
│  │  │ Credibility │  │ Governance  │  │ Moderation     │    │   │
│  │  │ Service     │  │ Service     │  │ Service        │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   DATA LAYER                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │   │
│  │  │ PostgreSQL  │  │ Redis       │  │ IPFS (future)  │    │   │
│  │  │ (Supabase) │  │ (sessions)  │  │ (content)      │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Module Design

### 2.1 Identity Service

**Responsibilities:**
- Generate and manage anonymous user IDs
- Handle wallet connections (optional)
- Manage session tokens
- Store user profiles

**Public Interface:**
```typescript
interface IdentityService {
  // Create anonymous user (no auth required)
  createAnonymousUser(): Promise<User>;
  
  // Get current user
  getCurrentUser(): Promise<User | null>;
  
  // Connect wallet (optional)
  connectWallet(address: string): Promise<User>;
  
  // Update display name
  updateDisplayName(name: string): Promise<User>;
  
  // Generate avatar seed
  generateAvatar(seed: string): Avatar;
}
```

### 2.2 Branch Service

**Responsibilities:**
- Create/edit/delete research branches
- Handle branch hierarchy (parent/child)
- Manage branch state (active, archived, merged)
- Track branch history

**Public Interface:**
```typescript
interface BranchService {
  // Create new branch
  createBranch(input: CreateBranchInput): Promise<Branch>;
  
  // Get branch by ID
  getBranch(id: string): Promise<Branch>;
  
  // List branches with filters
  listBranches(filters: BranchFilters): Promise<Branch[]>;
  
  // Update branch
  updateBranch(id: string, input: UpdateBranchInput): Promise<Branch>;
  
  // Archive branch
  archiveBranch(id: string): Promise<Branch>;
  
  // Fork branch
  forkBranch(id: string, userId: string): Promise<Branch>;
  
  // Merge branch
  mergeBranch(sourceId: string, targetId: string): Promise<Branch>;
  
  // Get branch history
  getBranchHistory(id: string): Promise<BranchEvent[]>;
}
```

### 2.3 Contribution Service

**Responsibilities:**
- Create contributions within branches
- Handle contribution hierarchy (parent/child)
- Manage endorsements
- Track contribution metadata

**Public Interface:**
```typescript
interface ContributionService {
  // Create contribution
  createContribution(input: CreateContributionInput): Promise<Contribution>;
  
  // Get contribution
  getContribution(id: string): Promise<Contribution>;
  
  // List contributions for branch
  listContributions(branchId: string, filters?: ContributionFilters): Promise<Contribution[]>;
  
  // Endorse contribution
  endorseContribution(id: string, userId: string): Promise<Contribution>;
  
  // Remove endorsement
  removeEndorsement(id: string, userId: string): Promise<Contribution>;
  
  // Reply to contribution
  createReply(parentId: string, input: CreateContributionInput): Promise<Contribution>;
}
```

### 2.4 Credibility Service

**Responsibilities:**
- Calculate credibility scores
- Manage tier progression
- Handle scoring events
- Apply temporal decay

**Public Interface:**
```typescript
interface CredibilityService {
  // Get user credibility
  getUserCredibility(userId: string): Promise<Credibility>;
  
  // Get credibility history
  getCredibilityHistory(userId: string): Promise<CredibilityEvent[]>;
  
  // Calculate score (internal)
  calculateScore(userId: string): Promise<number>;
  
  // Apply contribution score
  applyContributionScore(userId: string, contributionId: string, weight: number): Promise<void>;
  
  // Apply endorsement score
  applyEndorsementScore(userId: string, contributionId: string): Promise<void>;
  
  // Apply slash (penalty)
  applySlash(userId: string, reason: string, amount: number): Promise<void>;
  
  // Get tier from score
  getTierFromScore(score: number): TrustTier;
}
```

### 2.5 Governance Service

**Responsibilities:**
- Manage proposal lifecycle
- Handle voting (quadratic)
- Calculate vote weights
- Execute passed proposals

**Public Interface:**
```typescript
interface GovernanceService {
  // Create proposal
  createProposal(input: CreateProposalInput): Promise<Proposal>;
  
  // Get proposal
  getProposal(id: string): Promise<Proposal>;
  
  // List proposals
  listProposals(filters: ProposalFilters): Promise<Proposal[]>;
  
  // Cast vote (quadratic)
  castVote(proposalId: string, userId: string, support: boolean, tokens: number): Promise<Vote>;
  
  // Calculate quadratic votes
  calculateQuadraticVotes(votes: RawVote[]): QuadraticResult;
  
  // Execute proposal (if passed)
  executeProposal(proposalId: string): Promise<void>;
  
  // Get vote results
  getVoteResults(proposalId: string): Promise<VoteResult>;
}
```

### 2.6 Moderation Service

**Responsibilities:**
- Handle reports
- Manage moderation queue
- Apply sanctions
- Handle appeals

**Public Interface:**
```typescript
interface ModerationService {
  // Report content
  createReport(input: ReportInput): Promise<Report>;
  
  // Get report queue
  getReportQueue(moderatorId: string): Promise<Report[]>;
  
  // Review report
  reviewReport(reportId: string, decision: ModerationDecision): Promise<void>;
  
  // Appeal decision
  appealDecision(reportId: string, userId: string): Promise<Appeal>;
  
  // Get user warnings
  getUserWarnings(userId: string): Promise<Warning[]>;
}
```

---

# 3. Frontend Specification

## 3.1 Page Structure

```
/                           # Landing (public)
/explore                    # Branch exploration (public)
/branch/:id                 # Branch view (public)
/branch/:id/contribute      # Contribution form (auth required)
/branch/:id/proposals       # Branch governance (auth required)
/profile/:id                # User profile (public, anonymous)
/profile/settings           # User settings (auth required)
/governance                 # Platform governance (auth required)
/moderation                 # Moderation queue (moderator only)
```

## 3.2 Component Library

### Navigation
- **NavBar**: Logo, search, user menu, notifications
- **SideBar**: Branch tree, quick links
- **Breadcrumb**: Branch hierarchy path

### Branch Components
- **BranchCard**: Branch preview (title, description, stats)
- **BranchTree**: Hierarchical branch visualization
- **BranchHeader**: Branch info, actions, governance

### Contribution Components
- **ContributionCard**: Contribution preview
- **ContributionThread**: Nested discussion
- **ContributionEditor**: Rich text editor
- **EndorseButton**: Endorse with animation

### Credibility Components
- **CredibilityMeter**: Visual score display
- **TierBadge**: Trust tier indicator
- **ContributionHistory**: Timeline of contributions

### Governance Components
- **ProposalCard**: Proposal preview
- **ProposalDetail**: Full proposal with votes
- **VoteSlider**: Quadratic voting interface
- **ResultsChart**: Vote visualization

### Synthetic Components
- **SyntheticProfile**: AI-mediated representation
- **MediationToggle**: Enable/disable mediation
- **SyntheticSummary**: AI-generated position summary

## 3.3 State Management

### Global State (Zustand)
```typescript
interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  
  // Current branch
  currentBranch: Branch | null;
  branches: Branch[];
  
  // Contributions
  contributions: Map<string, Contribution[]>;
  
  // UI
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}
```

### Server State (React Query)
```typescript
// Branch queries
useBranch(id: string): Branch
useBranches(filters: BranchFilters): Branch[]
useBranchHistory(id: string): BranchEvent[]

// Contribution queries
useContributions(branchId: string): Contribution[]
useContribution(id: string): Contribution

// Governance queries
useProposals(branchId: string): Proposal[]
useVoteResults(proposalId: string): VoteResult

// Credibility queries
useUserCredibility(userId: string): Credibility
useCredibilityHistory(userId: string): CredibilityEvent[]
```

---

# 4. Backend Specification

## 4.1 API Design

### REST Endpoints

```
Authentication:
POST   /api/auth/anonymous     # Create anonymous user
POST   /api/auth/wallet       # Connect wallet
DELETE /api/auth              # Logout

Users:
GET    /api/users/:id         # Get user profile
PATCH  /api/users/:id         # Update user

Branches:
GET    /api/branches          # List branches
POST   /api/branches          # Create branch
GET    /api/branches/:id      # Get branch
PATCH  /api/branches/:id      # Update branch
DELETE /api/branches/:id      # Archive branch
POST   /api/branches/:id/fork # Fork branch
POST   /api/branches/:id/merge # Merge branch

Contributions:
GET    /api/contributions     # List contributions
POST   /api/contributions     # Create contribution
GET    /api/contributions/:id # Get contribution
POST   /api/contributions/:id/endorse   # Endorse
DELETE /api/contributions/:id/endorse  # Remove endorse
POST   /api/contributions/:id/reply     # Reply

Credibility:
GET    /api/credibility/:userId  # Get credibility
GET    /api/credibility/:userId/history # Get history

Governance:
GET    /api/proposals         # List proposals
POST   /api/proposals        # Create proposal
GET    /api/proposals/:id    # Get proposal
POST   /api/proposals/:id/vote  # Cast vote
POST   /api/proposals/:id/execute  # Execute (if passed)

Moderation:
POST   /api/reports          # Report content
GET    /api/reports/queue   # Get queue (mod)
PATCH  /api/reports/:id     # Review report
POST   /api/reports/:id/appeal  # Appeal
```

### GraphQL Schema

```graphql
# Scalars
scalar DateTime
scalar JSON

# Enums
enum TrustTier {
  NEWCOMER
  CONTRIBUTOR
  TRUSTED
  ELDER
}

enum BranchStatus {
  ACTIVE
  ARCHIVED
  MERGED
}

enum ContributionType {
  RESEARCH
  COMMENT
  REVIEW
  SYNTHESIS
}

enum ProposalType {
  BRANCH_DIRECTION
  PARAMETER_CHANGE
  SLASHING
  MERGE
  META
}

enum ProposalStatus {
  DRAFT
  VOTING
  PASSED
  REJECTED
  EXECUTED
}

enum VoteType {
  FOR
  AGAINST
}

# Types
type User {
  id: ID!
  anonymousId: String!
  displayName: String
  avatarSeed: String!
  trustTier: TrustTier!
  credibilityScore: Int!
  createdAt: DateTime!
}

type Branch {
  id: ID!
  title: String!
  description: String
  parent: Branch
  children: [Branch!]!
  creator: User!
  status: BranchStatus!
  contributionCount: Int!
  contributorCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Contribution {
  id: ID!
  branch: Branch!
  author: User!
  type: ContributionType!
  content: String!
  parent: Contribution
  children: [Contribution!]!
  endorsementCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Credibility {
  user: User!
  score: Int!
  tier: TrustTier!
  events: [CredibilityEvent!]!
}

type Proposal {
  id: ID!
  branch: Branch!
  author: User!
  type: ProposalType!
  title: String!
  content: String!
  status: ProposalStatus!
  votesFor: Int!
  votesAgainst: Int!
  votingEndsAt: DateTime
  createdAt: DateTime!
}

type Vote {
  id: ID!
  proposal: Proposal!
  voter: User!
  support: Boolean!
  tokens: Int!
  quadraticWeight: Int!
  createdAt: DateTime!
}

# Queries
type Query {
  # User
  currentUser: User
  user(id: ID!): User
  
  # Branches
  branch(id: ID!): Branch
  branches(status: BranchStatus, limit: Int, offset: Int): [Branch!]!
  myBranches: [Branch!]!
  
  # Contributions
  contribution(id: ID!): Contribution
  branchContributions(branchId: ID!, type: ContributionType, limit: Int): [Contribution!]!
  
  # Governance
  proposal(id: ID!): Proposal
  branchProposals(branchId: ID!, status: ProposalStatus): [Proposal!]!
  platformProposals(status: ProposalStatus): [Proposal!]!
  
  # Credibility
  userCredibility(userId: ID!): Credibility
}

# Mutations
type Mutation {
  # Auth
  createAnonymousUser: User!
  connectWallet(address: String!): User!
  
  # User
  updateDisplayName(name: String!): User!
  
  # Branches
  createBranch(input: CreateBranchInput!): Branch!
  updateBranch(id: ID!, input: UpdateBranchInput!): Branch!
  archiveBranch(id: ID!): Branch!
  forkBranch(id: ID!): Branch!
  mergeBranches(sourceId: ID!, targetId: ID!): Branch!
  
  # Contributions
  createContribution(input: CreateContributionInput!): Contribution!
  endorseContribution(id: ID!): Contribution!
  removeEndorsement(id: ID!): Contribution!
  replyToContribution(parentId: ID!, input: CreateContributionInput!): Contribution!
  
  # Governance
  createProposal(input: CreateProposalInput!): Proposal!
  castVote(proposalId: ID!, support: Boolean!, tokens: Int!): Vote!
  executeProposal(id: ID!): Proposal!
  
  # Moderation
  createReport(input: CreateReportInput!): Report!
  reviewReport(id: ID!, decision: ReviewDecision!): Report!
}

# Inputs
input CreateBranchInput {
  title: String!
  description: String
  parentId: ID
}

input UpdateBranchInput {
  title: String
  description: String
}

input CreateContributionInput {
  branchId: ID!
  type: ContributionType!
  content: String!
  parentId: ID
}

input CreateProposalInput {
  branchId: ID!
  type: ProposalType!
  title: String!
  content: String!
  votingPeriod: Int  # hours
}

input CreateReportInput {
  contentId: ID!
  reason: String!
  evidence: String
}

input ReviewDecision {
  action: String!
  reason: String
}
```

---

# 5. Security Specification

## 5.1 Authentication

### Anonymous Auth (MVP)
```
1. User visits site
2. Client generates random UUID
3. UUID stored in localStorage
4. Server creates session with UUID
5. Session token in HTTP-only cookie
```

### Wallet Auth (Phase 2)
```
1. User clicks "Connect Wallet"
2. WalletConnect/ RainbowKit popup
3. User signs message
4. Server verifies signature
5. Links wallet address to anonymous ID
```

## 5.2 ZK Proof Integration (Phase 3)

### Semaphore Implementation
```typescript
// Registration (Phase 3)
1. User generates Semaphore identity (client-side)
2. Identity commitment stored in Merkle tree
3. Merkle root stored on-chain
4. User receives "verified member" status

// Proof Generation (for voting/posting)
1. User generates proof using identity
2. Proof includes: merkle proof, external nullifier, signal
3. Verifier contract checks proof
4. If valid, action proceeds
5. External nullifier prevents double-signaling
```

## 5.3 Rate Limiting

| Action | Limit |
|--------|-------|
| Create branch | 5/hour |
| Create contribution | 20/hour |
| Endorse | 50/hour |
| Vote | 10/hour |
| Report | 5/hour |

---

# 6. Acceptance Criteria

## MVP (v0.1.0)

### Tier Thresholds

| Tier | Credibility Score | Description |
|------|-------------------|-------------|
| newcomer | 0–99 | Fresh user, no track record |
| contributor | 100–499 | Active participant |
| trusted | 500–1999 | Established contributor |
| elder | 2000+ | Highly credible, senior standing |

> These thresholds are implemented in `SCHEMA.md get_tier()` and `identity.ts calculateTrustTier()`.
> Changes must be reflected in both files.

### Contribution Weight by Type

| Type | Weight | Rationale |
|------|--------|-----------|
| synthesis | 5 | Deep integration of multiple ideas |
| idea | 3 | Novel proposal |
| resource | 3 | Valuable reference |
| question | 2 | Thoughtful inquiry |
| comment | 1 | Basic participation |

> Author earns `weight` credibility each time their contribution receives an endorsement.
> See `getContributionWeight()` in `services/contribution.ts`.

### Endorsement Formula

When user U endorses contribution C authored by user A:
- **A (author) earns:** `C.weight` credibility (change_type: `endorsement_received`)
- **U (endorser) earns:** 1 credibility (change_type: `endorsement_given`) — encourages curation
- Self-endorsement is prohibited

Example: A `synthesis` (weight=5) receiving an endorsement → author earns +5, endorser earns +1.

### Authentication
- [ ] Anonymous user can be created
- [ ] User session persists across page loads
- [ ] User can set display name
- [ ] User can generate avatar

### Branches
- [ ] User can create branch
- [ ] Branch appears in list
- [ ] Branch can be viewed
- [ ] Branch has parent/child hierarchy
- [ ] Branch can be archived

### Contributions
- [ ] User can create contribution in branch
- [ ] Contribution appears in branch
- [ ] User can endorse contribution
- [ ] User can reply to contribution
- [ ] Contributions show endorsement count

### Credibility
- [ ] Credibility score calculates correctly
- [ ] Tier displays based on score
- [ ] Endorsements add to author credibility

### Governance
- [ ] User can create proposal
- [ ] Proposal appears in list
- [ ] User can vote on proposal
- [ ] Quadratic voting calculates correctly
- [ ] Passed proposals execute

### Moderation
- [ ] User can report content
- [ ] Moderators can review reports
- [ ] Warnings appear on user profile

---

# 7. Technical Constraints

## MVP Constraints
- No real-time (polling acceptable)
- No ZK proofs (simple anonymous)
- No wallet connection (anonymous only)
- No IPFS (Supabase storage)
- No mobile (responsive web only)

## Phase 2 Additions
- Real-time via WebSocket
- Wallet connection (optional)
- Quadratic voting

## Phase 3 Additions
- ZK proofs (Semaphore)
- IPFS storage
- Mobile PWA

---

# 8. Dependencies

## Production Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/auth-helpers-nextjs": "^0.8.0",
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^5.0.0",
  "graphql": "^16.8.0",
  "@apollo/client": "^3.8.0",
  "tailwindcss": "^3.3.0",
  "framer-motion": "^10.16.0",
  "date-fns": "^2.30.0"
}
```

## Development Dependencies
```json
{
  "typescript": "^5.2.0",
  "@types/node": "^20.8.0",
  "eslint": "^8.50.0",
  "prettier": "^3.0.0"
}
```

---

# 9. File Structure

```
collaboration-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing
│   │   ├── explore/            # Branch exploration
│   │   ├── branch/[id]/       # Branch views
│   │   ├── profile/[id]/      # User profiles
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                 # Base components
│   │   ├── branches/           # Branch components
│   │   ├── contributions/      # Contribution components
│   │   ├── credibility/        # Credibility components
│   │   ├── governance/         # Governance components
│   │   └── synthetic/          # Synthetic mediator components
│   ├── lib/
│   │   ├── services/           # Business logic
│   │   ├── supabase/          # Supabase client
│   │   └── utils/             # Utilities
│   ├── hooks/                  # Custom hooks
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript types
├── public/
│   └── assets/
├── supabase/
│   └── migrations/             # Database migrations
├── tests/
├── SPEC.md                     # This document
├── README.md
└── package.json
```

---

*End of Specification*
