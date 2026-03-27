# Credo Database Schema

## Overview

This document defines the complete database schema for the Credo collaboration platform. The schema is designed for PostgreSQL (via Supabase) and implements all core platform functionality.

---

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   branches   │       │contributions │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ creator_id   │◄──────│ author_id    │
│ anonymous_id │       │ id (PK)      │       │ branch_id    │
│ display_name │       │ parent_id    │       │ id (PK)      │
│ avatar_seed  │       │ title        │       │ parent_id    │
│ trust_tier   │       │ description  │       │ type         │
│ credibility  │       │ status       │       │ content      │
│ created_at   │       │ created_at   │       │ endorsements │
└──────────────┘       └──────────────┘       │ created_at   │
                              │              └──────────────┘
                              │                     │
                              │                     ▼
                              │              ┌──────────────┐
                              │              │ endorsements │
                              │              ├──────────────┤
                              │              │ user_id (PK) │
                              │              │ contribution_│
                              │              │ id (PK)      │
                              │              │ created_at   │
                              │              └──────────────┘
                              │
                              ▼
                       ┌──────────────┐       ┌──────────────┐
                       │  proposals   │       │    votes     │
                       ├──────────────┤       ├──────────────┤
                       │ id (PK)      │◄──────│ proposal_id  │
                       │ branch_id    │       │ voter_id     │
                       │ author_id    │       │ support      │
                       │ type         │       │ tokens       │
                       │ title        │       │ created_at   │
                       │ content      │       └──────────────┘
                       │ status       │
                       │ votes_for    │
                       │ votes_against│
                       │ created_at   │
                       └──────────────┘
                              │
                              ▼
                       ┌──────────────┐       ┌──────────────┐
                       │ credibility_ │       │   reports    │
                       │    log      │       ├──────────────┤
                       ├──────────────┤       │ id (PK)      │
                       │ id (PK)      │       │ reporter_id  │
                       │ user_id      │       │ content_id   │
                       │ change_type  │       │ reason       │
                       │ change_amount│       │ status       │
                       │ created_at   │       │ created_at   │
                       └──────────────┘       └──────────────┘
```

---

## Tables

### 1. Users Table

```sql
-- Anonymous user profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anonymous_id TEXT UNIQUE NOT NULL,  -- Hashed random ID, not reversible
    display_name TEXT,                   -- User-chosen pseudonym
    avatar_seed TEXT NOT NULL DEFAULT gen_random_uuid()::text,  -- For procedural avatars
    trust_tier TEXT NOT NULL DEFAULT 'newcomer' 
        CHECK (trust_tier IN ('newcomer', 'contributor', 'trusted', 'elder')),
    credibility_score INTEGER NOT NULL DEFAULT 0,
    wallet_address TEXT,                 -- Optional wallet connection
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT display_name_length CHECK (
        display_name IS NULL OR 
        (LENGTH(display_name) >= 2 AND LENGTH(display_name) <= 30)
    )
);

-- Index for lookups
CREATE INDEX idx_users_anonymous_id ON users(anonymous_id);
CREATE INDEX idx_users_wallet ON users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_credibility ON users(credibility_score DESC);

-- Updated trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 2. Branches Table

```sql
-- Research branches (like git repos)
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived', 'merged')),
    
    -- Statistics (cached for performance)
    contribution_count INTEGER NOT NULL DEFAULT 0,
    contributor_count INTEGER NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT title_length CHECK (
        LENGTH(title) >= 3 AND LENGTH(title) <= 200
    )
);

-- Indexes
CREATE INDEX idx_branches_parent ON branches(parent_id);
CREATE INDEX idx_branches_creator ON branches(creator_id);
CREATE INDEX idx_branches_status ON branches(status);
CREATE INDEX idx_branches_last_activity ON branches(last_activity_at DESC);

-- Recursive CTEs helper
CREATE INDEX idx_branches_created ON branches(created_at DESC);

-- Updated trigger
CREATE TRIGGER branches_updated_at
    BEFORE UPDATE ON branches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 3. Contributions Table

```sql
-- Contributions within branches
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES contributions(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL
        CHECK (type IN ('research', 'comment', 'review', 'synthesis')),
    content TEXT NOT NULL,
    
    -- Cached counts
    endorsement_count INTEGER NOT NULL DEFAULT 0,
    reply_count INTEGER NOT NULL DEFAULT 0,
    
    -- Credibility weight (set at creation based on type via get_weight_for_type())
    -- Author earns this many credibility points per endorsement received
    weight INTEGER NOT NULL DEFAULT 1,
    
    -- Moderation
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    flag_reason TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT content_length CHECK (
        LENGTH(content) >= 1 AND LENGTH(content) <= 50000
    )
);

-- Indexes
CREATE INDEX idx_contributions_branch ON contributions(branch_id);
CREATE INDEX idx_contributions_author ON contributions(author_id);
CREATE INDEX idx_contributions_parent ON contributions(parent_id);
CREATE INDEX idx_contributions_type ON contributions(type);
CREATE INDEX idx_contributions_created ON contributions(created_at DESC);
CREATE INDEX idx_contributions_endorsements ON contributions(endorsement_count DESC);

-- Updated trigger
CREATE TRIGGER contributions_updated_at
    BEFORE UPDATE ON contributions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 4. Endorsements Table

```sql
-- User endorsements of contributions
CREATE TABLE endorsements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contribution_id UUID NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Each user can only endorse once per contribution
    UNIQUE(user_id, contribution_id)
);

-- Indexes
CREATE INDEX idx_endorsements_user ON endorsements(user_id);
CREATE INDEX idx_endorsements_contribution ON endorsements(contribution_id);
```

### 5. Proposals Table

```sql
-- Governance proposals
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL
        CHECK (type IN ('branch_direction', 'parameter_change', 'slashing', 'merge', 'meta')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'voting', 'passed', 'rejected', 'executed')),
    
    -- Vote counts (quadratic, stored for display)
    votes_for INTEGER NOT NULL DEFAULT 0,
    votes_against INTEGER NOT NULL DEFAULT 0,
    
    -- Timing
    voting_starts_at TIMESTAMPTZ,
    voting_ends_at TIMESTAMPTZ,
    
    -- Execution
    executed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT title_length CHECK (
        LENGTH(title) >= 5 AND LENGTH(title) <= 200
    ),
    CONSTRAINT content_length CHECK (
        LENGTH(content) >= 10 AND LENGTH(content) <= 50000
    )
);

-- Indexes
CREATE INDEX idx_proposals_branch ON proposals(branch_id);
CREATE INDEX idx_proposals_author ON proposals(author_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_voting_ends ON proposals(voting_ends_at);

-- Updated trigger
CREATE TRIGGER proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
```

### 6. Votes Table

```sql
-- Proposal votes (quadratic voting)
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    support BOOLEAN NOT NULL,
    tokens INTEGER NOT NULL,          -- Raw tokens spent
    quadratic_weight INTEGER NOT NULL, -- √(tokens)
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Each user can only vote once per proposal
    UNIQUE(proposal_id, voter_id),
    
    -- Constraints
    CONSTRAINT tokens_positive CHECK (tokens > 0)
);

-- Indexes
CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_votes_voter ON votes(voter_id);
```

### 7. Credibility Log Table

```sql
-- Credibility score history
CREATE TABLE credibility_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    change_type TEXT NOT NULL
        CHECK (change_type IN (
            'contribution', 'endorsement_received', 
            'endorsement_given', 'slash', 'bonus'
        )),
    change_amount INTEGER NOT NULL,  -- Can be negative for slashing
    
    related_contribution_id UUID REFERENCES contributions(id) ON DELETE SET NULL,
    related_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
    
    reason TEXT,
    
    -- Snapshot of score after change (for auditing)
    score_after INTEGER NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credibility_log_user ON credibility_log(user_id);
CREATE INDEX idx_credibility_log_created ON credibility_log(created_at DESC);
CREATE INDEX idx_credibility_log_type ON credibility_log(change_type);
```

### 8. Reports Table

```sql
-- Content moderation reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    content_type TEXT NOT NULL,  -- 'contribution', 'comment', 'branch'
    content_id UUID NOT NULL,
    
    reason TEXT NOT NULL,
    evidence TEXT,  -- Optional evidence
    
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    review_note TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_content ON reports(content_type, content_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
```

### 9. User Warnings Table

```sql
-- Moderation warnings
CREATE TABLE user_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    reason TEXT NOT NULL,
    severity TEXT NOT NULL
        CHECK (severity IN ('warning', 'suspension', 'ban')),
    
    report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    
    expires_at TIMESTAMPTZ,  -- NULL for permanent
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_warnings_user ON user_warnings(user_id);
CREATE INDEX idx_user_warnings_expires ON user_warnings(expires_at) 
    WHERE expires_at IS NOT NULL;
```

---

## Functions

### Credibility Calculation

```sql
-- Calculate user credibility from log
CREATE OR REPLACE FUNCTION calculate_credibility(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COALESCE(SUM(change_amount), 0)
    INTO total
    FROM credibility_log
    WHERE user_id = user_id;
    
    -- Floor at 0
    RETURN GREATEST(total, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Tier Calculation

```sql
-- Get tier from credibility score
-- IMPORTANT: keep in sync with identity.ts calculateTrustTier()
-- Thresholds: elder=2000, trusted=500, contributor=100, newcomer=0
CREATE OR REPLACE FUNCTION get_tier(score INTEGER)
RETURNS TEXT AS $$
BEGIN
    CASE
        WHEN score >= 2000 THEN RETURN 'elder';
        WHEN score >= 500  THEN RETURN 'trusted';
        WHEN score >= 100  THEN RETURN 'contributor';
        ELSE RETURN 'newcomer';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get contribution weight by type
-- Must match SPEC.md contribution weight table
CREATE OR REPLACE FUNCTION get_weight_for_type(type TEXT)
RETURNS INTEGER AS $$
BEGIN
    CASE type
        WHEN 'synthesis'  THEN RETURN 5;
        WHEN 'idea'        THEN RETURN 3;
        WHEN 'resource'    THEN RETURN 3;
        WHEN 'question'    THEN RETURN 2;
        WHEN 'comment'     THEN RETURN 1;
        ELSE RETURN 1;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Quadratic Vote Calculation

```sql
-- Calculate quadratic weight
CREATE OR REPLACE FUNCTION quadratic_weight(tokens INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(tokens));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## Triggers

### Update Branch Stats on Contribution

```sql
-- Update branch contribution count after insert/delete
CREATE OR REPLACE FUNCTION update_branch_stats()
RETURNS TRIGGER AS $$
DECLARE
    branch_uuid UUID;
BEGIN
    -- Get branch_id from either new or old record
    IF TG_OP = 'INSERT' THEN
        branch_uuid := NEW.branch_id;
    ELSE
        branch_uuid := OLD.branch_id;
    END IF;
    
    -- Update counts
    UPDATE branches
    SET 
        contribution_count = (
            SELECT COUNT(*) FROM contributions 
            WHERE branch_id = branch_uuid
        ),
        contributor_count = (
            SELECT COUNT(DISTINCT author_id) FROM contributions 
            WHERE branch_id = branch_uuid
        ),
        last_activity_at = NOW()
    WHERE id = branch_uuid;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contribution_branch_stats
    AFTER INSERT OR DELETE ON contributions
    FOR EACH ROW
    EXECUTE FUNCTION update_branch_stats();
```

### Update User Credibility After Endorsement

```sql
-- Add credibility when contribution is endorsed.
-- Formula (per SPEC.md endorsement formula):
--   - Author earns: contribution.weight credibility (endorsement_received)
--   - Endorser earns: 1 credibility (endorsement_given)
-- Self-endorsement should be prevented at the application layer.
CREATE OR REPLACE FUNCTION on_endorsement()
RETURNS TRIGGER AS $$
DECLARE
    contribution_author UUID;
    contribution_weight INTEGER;
    endorser_score INTEGER;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Get contribution author and weight
        SELECT author_id, weight INTO contribution_author, contribution_weight
        FROM contributions
        WHERE id = NEW.contribution_id;

        -- Log credibility for author (endorsement_received = contribution.weight)
        INSERT INTO credibility_log (user_id, change_type, change_amount, related_contribution_id, score_after)
        VALUES (
            contribution_author,
            'endorsement_received',
            contribution_weight,
            NEW.contribution_id,
            calculate_credibility(contribution_author) + contribution_weight
        );

        -- Log credibility for endorser (endorsement_given = 1)
        -- Using GREATEST to floor at 0
        endorser_score := calculate_credibility(NEW.user_id);
        INSERT INTO credibility_log (user_id, change_type, change_amount, related_contribution_id, score_after)
        VALUES (
            NEW.user_id,
            'endorsement_given',
            1,
            NEW.contribution_id,
            endorser_score + 1
        );

        -- Update contribution endorsement count
        UPDATE contributions
        SET endorsement_count = endorsement_count + 1
        WHERE id = NEW.contribution_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER endorsement_credibility
    AFTER INSERT ON endorsements
    FOR EACH ROW
    EXECUTE FUNCTION on_endorsement();
```

### Auto-update Tier

```sql
-- Update user tier when credibility changes
CREATE OR REPLACE FUNCTION update_user_tier()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET trust_tier = get_tier(NEW.score_after)
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER credibility_tier_update
    AFTER INSERT ON credibility_log
    FOR EACH ROW
    EXECUTE FUNCTION update_user_tier();
```

---

## Row Level Security

> ⚠️ **DEFERRED to Phase 2 (2026-03-27)** — Anonymous users (UUID in localStorage) have no Supabase auth session, so `auth.uid()` returns NULL. RLS policies referencing `auth.uid()` will NOT work as intended. MVP uses application-level auth middleware instead. RLS to be re-implemented when proper auth (email/OAuth) is added.

### Enable RLS on All Tables (Phase 2)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credibility_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;
```

### User Policies

```sql
-- Users can read all users (anonymous data)
CREATE POLICY users_read ON users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Anyone can read branches
CREATE POLICY branches_read ON branches
    FOR SELECT USING (true);

-- Authenticated users can create branches
CREATE POLICY branches_create ON branches
    FOR INSERT WITH CHECK (true);

-- Branch creator can update
CREATE POLICY branches_update_own ON branches
    FOR UPDATE USING (creator_id = auth.uid());

-- Anyone can read contributions
CREATE POLICY contributions_read ON contributions
    FOR SELECT USING (true);

-- Authenticated users can create
CREATE POLICY contributions_create ON contributions
    FOR INSERT WITH CHECK (true);

-- Anyone can read endorsements
CREATE POLICY endorsements_read ON endorsements
    FOR SELECT USING (true);

-- Authenticated users can endorse
CREATE POLICY endorsements_create ON endorsements
    FOR INSERT WITH CHECK (true);
```

---

## Seed Data

### Initial User (System)

```sql
-- System user for system actions
INSERT INTO users (id, anonymous_id, display_name, avatar_seed, trust_tier, credibility_score)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'system',
    'System',
    'system',
    'elder',
    0
);
```

### Sample Branch

```sql
-- Welcome branch
INSERT INTO branches (id, title, description, status, creator_id)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Welcome to Credo',
    'This is the main branch for platform discussions and governance.',
    'active',
    '00000000-0000-0000-0000-000000000001'
);
```

---

## Migrations

### Version 001 - Initial Schema

```sql
-- Run all tables, functions, triggers in order
-- See above definitions
```

### Version 002 - Add Indexes (if needed)

```sql
-- Add any missing indexes based on query patterns
```

---

## Backup & Recovery

### Supabase Point-in-Time Recovery

Supabase Enterprise enables point-in-time recovery. For MVP, standard backup is sufficient.

### Export

```bash
# Export all data
supabase db dump --db-url $DATABASE_URL > backup.sql
```

---

*End of Schema*
