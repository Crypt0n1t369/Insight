# Dunbar's Number & Community Sizing for Credo

## The Question
How big can a "branch" get before it breaks?

## Dunbar's Number

Robin Dunbar (1992) proposed ~150 stable social relationships as the human cognitive limit.

### Applications in Online Communities

| Platform | Community Size | Observation |
|----------|---------------|-------------|
| USENET groups | 100-1500 | Active cores ~150 |
| GitHub teams | ~50-200 | Most effective |
| Effective military units | ~150 |
| Companies (typical) | 150-200 before restructuring |

### Credo Implication

Branches should:
- **Soft cap around 150** for active collaboration
- **Auto-split or federate** above 200
- **Sub-branches** for sub-topics

## Recommendation

**Dynamic Branch Sizing:**

```
< 50 members:     Full collaboration
50-150 members:  Sub-groups form
150-300 members: Auto-suggest sub-branch
300+ members:    Federate or split
```

---

*Part of alternatives-deep-dive.md*
