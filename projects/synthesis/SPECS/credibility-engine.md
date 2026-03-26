# SPEC: Credibility Engine

## Overview

The **Credibility Engine** implements egoless reputation tracking. Contributions are attributed to value provided, not identity. Identity is pseudonymous (wallet or anonymous profile), and credibility scores reflect actual impact.

## Core Principle

> A user's reputation is determined by what they contributed — not who they are.

## Pseudonymous Identity

```typescript
interface AnonymousProfile {
  anonId: string;               // e.g. 'synthesis-a7f3bc21'
  createdAt: string;
  totalContributions: number;
  credibilityScore: number;      // 0.0–100.0
  // NO: name, email, IP, photo, social links
}
```

Users connect via:
- **Wallet address** (preferred) — cryptographic, no PII
- **Anonymous email** (future) — no verification required

## Credibility Score Algorithm

### Base Score

Each contribution type has a base score:

| Contribution Type | Base Score |
|-------------------|------------|
| Protocol document | 30 |
| Research summary | 20 |
| Concept clarification | 15 |
| Gap identification | 15 |
| Correcting error | 20 |
| Peer review | 10 |
| Vote cast | 1 |

### Weighting Factors

```typescript
interface CredibilityWeights {
  expertise_match: 1.5;     // Contribution in user's demonstrated area
  citation_count: 0.1;      // Per citation (capped at 2x)
  recency: 0.8;             // Exponential decay over 6 months
  peer_approval: 1.2;       // Positive votes received
  constructive: 1.5;        // Flagged as constructive by mediators
}
```

### Final Score Calculation

```
credibility = base_score
  × expertise_match(expertise_match)
  × min(1 + citation_count × 0.1, 2.0)
  × recency_decay(age_in_days)
  × peer_approval(approval_rate)
  × (constructive ? 1.5 : 1.0)
```

### Score Bounds

- **Minimum:** 0 (can go negative for quality violations)
- **Maximum:** No hard cap, but display as percentile
- **Display:** Shown as percentile rank (top X%) not absolute

## Contribution Tracking

```typescript
interface Contribution {
  id: string;
  anonId: string;
  type: ContributionType;
  contentId: string;              // What was contributed
  contentVersion: string;         // Version of the content
  score: number;                  // Calculated at time of contribution
  metrics: ContributionMetrics;
  timestamp: string;
}

interface ContributionMetrics {
  votes_received: number;
  approvals: number;
  rejections: number;
  citations: number;
  reports: number;                // Flagged violations
}
```

### Contribution Types

```typescript
type ContributionType =
  | 'protocol_draft'      // New protocol document
  | 'protocol_edit'      // Improvement to existing
  | 'concept_explanation'
  | 'gap_identification'
  | 'peer_review'
  | 'vote'
  | 'correction';        // Error correction
```

## Quadratic Voting Integration

Using Credo's quadratic voting for decisions:

- **One-person-one-vote** is NOT used (enables Sybil)
- **Credibility-weighted votes** — vote cost = √(credibility_spent)
- **Total vote pool** limited per user per period

```typescript
interface Vote {
  voterAnonId: string;
  targetId: string;               // What is being voted on
  weight: number;                 // Credibility units spent
  cost: number;                   // √(weight) — what voter actually pays
  direction: 'support' | 'oppose';
}
```

**Why quadratic?** Limits rich-get-richer effect. A user with 100× more credibility can spend 10× more (√100 = 10), not 100× more.

## Credibility Leases

Scores decay over time to encourage ongoing contributions:

```typescript
function applyDecay(score: number, lastActivity: Date): number {
  const monthsInactive = monthsBetween(lastActivity, now());
  const decayFactor = Math.pow(0.95, monthsInactive);  // 5% monthly decay
  return score * decayFactor;
}
```

## Anonymous Attribution

**What is shown publicly:**
- "synthesis-a7f3" contributed to IFS protocol
- Top contributors this month: "synthesis-b2c9", "synthesis-d4e1"
- 47 anonymous contributors collaborated

**What is NOT shown:**
- Full anonId (only first 8 chars = 3 bytes of entropy, ~280k combinations)
- Any PII
- Real-world identity

## Privacy Guarantees

1. **No PII stored** — wallet address never linked to pseudonym
2. **No IP logging** — requests proxied through Vercel Edge
3. **No browser fingerprinting** — no tracking scripts
4. **ZK-proof future** — zero-knowledge proofs for credibility claims (Phase 5)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/cred/profile/:anonId | Get public profile |
| GET | /api/cred/score/:anonId | Get credibility score |
| POST | /api/cred/contribution | Log contribution |
| GET | /api/cred/contributions | List contributions (paginated) |
| POST | /api/cred/vote | Cast vote (quadratic) |
| GET | /api/cred/leaderboard | Top contributors |

## Storage (Supabase)

```sql
CREATE TABLE anon_profiles (
  anon_id TEXT PRIMARY KEY,
  wallet_address TEXT UNIQUE,     -- nullable, for wallet users
  credibility_score REAL DEFAULT 0,
  total_contributions INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id TEXT REFERENCES anon_profiles(anon_id),
  type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  score REAL DEFAULT 0,
  votes_received INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_anon_id TEXT REFERENCES anon_profiles(anon_id),
  target_id TEXT NOT NULL,
  weight INT NOT NULL,           -- credibility units spent
  direction TEXT NOT NULL,       -- 'support' or 'oppose'
  cost INT GENERATED ALWAYS AS (floor(sqrt(weight))) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Status

- [x] Design complete — ✅ `src/credibility-engine/credibility-engine.ts`
- [x] Quadratic voting math verified — ✅ 71 tests in `src/credibility-engine/__tests__/`
- [x] Anonymous attribution model defined — ✅ AnonId prefix + score calculation
- [ ] Supabase schema defined — future
- [ ] Integration with Credo platform — future
- [ ] ZK-proof upgrade path documented — future
