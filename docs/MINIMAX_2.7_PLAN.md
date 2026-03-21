# MiniMax 2.7 Integration Plan

## What's New in M2.7

| Feature | M2.5 | M2.7 |
|---------|------|------|
| Context | 200K | 204.8K |
| Max Tokens | 8K | 16K |
| Reasoning | ✅ | ✅ |
| Cost | $0.30/$1.20 | $0.30/$1.20 |

---

## Phase 1: Immediate (Done ✅)

- [x] Added MiniMax-M2.7 to config
- [x] Updated AGENTS.md model routing

---

## Phase 2: Optimization Opportunities

### 2x Output Capacity
- **Change:** `maxTokens: 8192` → `16384`
- **Benefit:** Longer responses without truncation
- **Action:** Already configured in openclaw.json

### Tiered Usage Strategy
| Tier | Current | Suggested |
|------|---------|-----------|
| Tier 3 (Routine) | M2.5 | M2.7 |
| Tier 2 (Standard) | Sonnet | Keep as-is |
| Tier 1 (Complex) | Opus | Keep as-is |

---

## Phase 3: System Improvements

### Priority 1: Context Handling
1. **Larger context → better memory**
   - Can load more project context into single prompt
   - Reduce need for context pruning

2. **Long-form content**
   - Better for document synthesis
   - Code reviews across larger files

### Priority 2: Cost Optimization
- M2.7 = same price as M2.5
- Better context utilization = less wasted tokens
- Consider as default for Tier 3 (replaces M2.5)

### Priority 3: Testing
- [ ] Run benchmark tasks comparing M2.5 vs M2.7
- [ ] Test reasoning quality
- [ ] Verify 16K output works correctly

---

## Recommendations

1. **Make M2.7 the default Tier 3 model** - same cost, better specs
2. **Test extensively** before heavy production use
3. **Monitor token usage** - larger outputs may increase spend
4. **Consider M2.7 for Tier 2** - could replace Gemini 3 Pro for some tasks

---

*Plan created: 2026-03-21*
