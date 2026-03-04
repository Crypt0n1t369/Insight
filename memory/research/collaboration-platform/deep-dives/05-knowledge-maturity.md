# Knowledge Maturity Model

## Overview

How ideas progress from vague mention to established knowledge.

## Maturity Stages

```
┌─────────────────────────────────────────────────────────────────────┐
│                     KNOWLEDGE MATURITY                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │  SKETCH  │───▶│DEVELOPING│───▶│  MATURE  │───▶│ CANONICAL │   │
│  │  (10%)   │    │  (30%)   │    │  (50%)   │    │  (10%)   │   │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘   │
│       ▲                                                        │   │
│       │                                                        │   │
│       └────────────────────────────────────────────────────────┘   │
│                     (reverts if disproven)                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Stage 1: Sketch (10%)
- Single mention in contribution
- No supporting evidence
- No community validation
- **Status:** Hypothesis

### Stage 2: Developing (30%)
- Multiple mentions across contributions
- Some supporting evidence
- 2+ contributors interested
- **Status:** Emerging consensus

### Stage 3: Mature (50%)
- Synthesized document created
- Multiple supporting sources
- Community validated
- **Status:** Established knowledge

### Stage 4: Canonical (10%)
- Referenced as source
- No significant challenges
- Time-tested
- **Status:** Reference knowledge

## Detection Algorithm

```typescript
function calculateMaturity(nodeId: string): Maturity {
  const mentions = countMentions(nodeId);
  const contributors = countContributors(nodeId);
  const syntheses = countSyntheses(nodeId);
  const endorsements = sumEndorsements(nodeId);
  
  const score = 
    (mentions * 1) +
    (contributors * 3) +
    (syntheses * 5) +
    (endorsements * 2);
    
  if (score >= 100) return 'canonical';
  if (score >= 50) return 'mature';
  if (score >= 20) return 'developing';
  return 'sketch';
}
```

## Extension Protocol

### For Vaguely Touched Subjects

1. **Auto-detection**
   - AI flags new topics
   - Adds to "Gaps" node
   - Notifies interested contributors

2. **Manual Expansion**
   - Contributors add content
   - Link to related nodes
   - Request synthesis

3. **Community Validation**
   - Endorsements confirm quality
   - Multiple contributors validate
   - Status upgrades automatically

4. **Reference Usage**
   - Other branches cite mature knowledge
   - Becomes foundation for new research
   - Canonical status considered

## Integration with Branches

```
Branch Creation:
  - Auto-creates root node for branch topic
  - Initial status: sketch
  
Contributions:
  - Add content to branch node
  - Link to related knowledge
  - Can create new knowledge nodes

Synthesis:
  - Creates new knowledge from contributions
  - Links to existing knowledge
  - Triggers maturity calculation

Endorsements:
  - Advance maturity
  - Can trigger downgrade if challenged
```

---

*Status: Developing*
