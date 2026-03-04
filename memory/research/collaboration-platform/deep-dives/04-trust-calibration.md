# Trust Calibration - Deep Dive

## The Problem

How fast should trust build? Too fast = Sybil attacks. Too slow = new users leave.

## Trust Curves

### Linear (Too Slow)
```
Score:  0    25    50    75   100
Time:   ────────────────────────────
```
- Safe but discouraging
- Example: Reddit cake day

### Exponential (Too Fast)
```
Score:  0 ████████████████ 100
Time:   ──────────────────
```
- Easy to abuse
- Example: Some DAOs

### S-Curve (Recommended)
```
Score:  0 ████────────████ 100
Time:   ─────────────────────
```
- Slow start → fast middle → slow end
- Mirrors real relationships

## Credibility Weighting

### By Tier

| Tier | Trust Multiplier | Max Daily Contributions |
|------|------------------|------------------------|
| Newcomer | 1x | 5 |
| Contributor | 1.5x | 10 |
| Trusted | 2x | 20 |
| Elder | 3x | 50 |

### By Activity Type

| Activity | Base Weight | With Endorsement |
|----------|-------------|------------------|
| Comment | 1 | +0.5 |
| Research | 3 | +1 |
| Review | 2 | +0.5 |
| Synthesis | 4 | +2 |

### Temporal Decay

```
Formula: effective_weight = base_weight * decay_factor

decay_factor = 1 / (1 + days_since * 0.01)

Example:
- Today: 1.0
- 30 days: 0.77
- 100 days: 0.5
- 365 days: 0.26
```

## Trust Signals

### Visible
- Tier badge
- Credibility score
- Contribution count
- Endorsement count

### Hidden (for user only)
- Detailed score breakdown
- History of changes
- Comparison to peers

## Anti-Gaming

### Measures
1. **Rate limiting** - Max actions per day
2. **Time weighting** - Older contributions worth more
3. **Cross-validation** - Multiple sources confirm
4. **Graph analysis** - Detect coordinated behavior
5. **Endorsement caps** - Can't endorse too many

### Detection
```
Anomaly Detection:
- Sudden endorsement spike → Investigate
- Circular endorsement patterns → Slash
- Single topic dominance → Flag for review
```

---

*Status: Developing - Needs simulation testing*
