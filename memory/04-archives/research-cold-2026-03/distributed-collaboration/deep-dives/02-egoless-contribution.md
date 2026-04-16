# Egoless Contribution Systems

## Core Concept

Egoless contribution means:
1. Attribution to value, not identity
2. Ideas evaluated on merit, not author
3. Reputation based on impact, not tenure
4. Decisions driven by consensus, not authority

## Mechanisms

### 1. Anonymous Contribution
- Random or pseudonymous IDs
- No profile photos or names
- Content judged on quality

### 2. Value-Based Attribution
```
Instead of: "Alice's idea"
Use: "Idea #4523 - validated by 5 contributors"
```

### 3. Reputation Tiers
| Tier | Criteria | Privileges |
|------|----------|------------|
| Newcomer | Just joined | Submit proposals |
| Contributor | 5+ validated contributions | Comment, review |
| Trusted | Consistent quality | Merge rights |
| Elder | Long-term + high impact | Governance weight |

### 4. Transparent Scoring
- All contribution weights visible
- Endorsement systems
- Appeal mechanisms

## Implementation

### Contribution Types & Weights
```typescript
const WEIGHTS = {
  protocol_implementation: 10,  // Building new features
  research_contribution: 8,    // Adding knowledge
  review: 5,                   // Quality assurance
  discussion: 3,                // Participation
  mediation: 7,                // Synthesis
  bug_report: 4               // Improvements
};
```

### Quality Signals
- Peer endorsements
- Usage metrics
- Citation/connection count
- Time-tested persistence

## Anti-Patterns

1. **Pet the Author** - Judging by reputation
2. **First-Mover Advantage** - Ideas get credit regardless of quality
3. **Visibility Bias** - Popular topics dominate
4. **In-Group Dynamics** - Familiar contributors favored

---

*Status: Sketch*
