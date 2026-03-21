# AGENTS.md - Phase 0 MVP Foundation Model Policy

## Model Tiers

### Tier 1: Elite (Sophisticated)
- **Model:** Claude Opus 4.6 (Anthropic)
- **Context:** 200K (1M via API)
- **Use when:** Strategic planning, architectural decisions, complex reasoning, novel problems, market analysis, high-stakes decisions
- **Cost:** Higher but justified for complex tasks

### Tier 2: Balanced (Capable)
- **Model:** Claude Sonnet 4.6 or Gemini 3 Pro
- **Context:** 200K-2M
- **Use when:** Standard development, content synthesis, analysis requiring depth but not elite tier
- **Cost:** Moderate

### Tier 3: Efficient (Fast/Cheap)
- **Model:** Gemini 3 Flash, Haiku, or MiniMax M2.7
- **Context:** 128K-1M
- **Use when:** Routine orchestration, health checks, simple summarization, formatting, basic tasks
- **Cost:** Minimal

### Tier 4: Ultralight (Minimal)
- **Model:** Free tier models or lightweight alternatives
- **Use when:** Trivial tasks, initial triage, heartbeat checks
- **Cost:** Near zero

## Task Classification Logic

### Automatic Tier Routing

**Tier 1 (Elite) triggers:**
- "strategize", "plan", "architect", "design system"
- "analyze market", "competitive analysis", "research deep"
- "write strategy", "roadmap", "architectural decision"
- Complex multi-step reasoning required
- Novel problem never seen before
- High-stakes decision with significant consequences

**Tier 2 (Balanced) triggers:**
- Standard development tasks
- Content synthesis from multiple sources
- Analysis requiring good reasoning but not elite
- Implementation of known patterns
- Code reviews, refactoring

**Tier 3 (Efficient) triggers:**
- "check", "verify", "list", "find", "get status"
- Simple summarization, formatting
- Health checks, routine automation
- Known patterns applied to new contexts
- File operations, basic orchestration

**Tier 4 (Ultralight) triggers:**
- "ping", "heartbeat", "is running"
- Simple boolean checks
- Initial triage before routing

## Context Management

### Pruning Strategy
- **Critical context:** Keep full (user preferences, active project state, recent decisions)
- **Working context:** 1-hour TTL, refresh on active use
- **Archive context:** Store in memory files, retrieve via search
- **Embeddings:** Use for semantic recall (not full storage)

### Context Budget
- Target: <50K tokens per session for routine tasks
- Elite tasks: Up to 200K for complex analysis
- Automatic truncation with summary replacement for old context

## Budget Enforcement

- **Daily cap:** $10/day
- **Alert threshold:** $7.50 (75%)
- **Auto-escalation:** If budget risk, default to Tier 3
- **Manual override:** Always available via explicit model= directive

## Execution Model

### Sequential Tasks (Within Projects)
1. Classify task complexity → select tier
2. Execute with chosen model
3. If results unsatisfactory → escalate one tier
4. Log token usage for learning

### Research Workflows
1. Tier 3: Initial discovery (web search, quick fetch)
2. Tier 2: Synthesis and analysis
3. Tier 1: Strategic insight and recommendations

### Second Brain Operations
- **Storage:** Topic/domain organized in memory/
- **Recall:** Semantic search via memory_search
- **Embedding:** Key decisions, learned patterns
- **Context injection:** Pull relevant memory into active context

## Model Selection Examples

| Task | Tier | Model |
|------|------|-------|
| "Plan my week" | 1 | Opus |
| "Summarize this article" | 3 | Flash |
| "Debug this error" | 2 | Sonnet |
| "Check if server is running" | 4 | Haiku |
| "Research competitor AI agents" | 1 | Opus |
| "Write meeting notes" | 3 | Flash |
| "Design new feature architecture" | 1 | Opus |
| "Fix typo in README" | 4 | Haiku |

## Escalation Protocol

```
tier_3_output.acceptable? → yes → done
                           no  → tier_2.retry()
                           
tier_2_output.acceptable? → yes → done  
                           no  → tier_1.retry()

tier_1_output.acceptable? → yes → done
                           no  → escalate to human
```

## Learning Loop

Track task type → tier mapping. Over time, learn which tasks perform best at which tier. Update this file with proven mappings.