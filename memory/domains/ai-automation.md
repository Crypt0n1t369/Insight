# AI & Automation Domain

## Overview
OpenClaw agent framework, automation patterns, model routing, second brain architecture, agentic autonomy systems.

## Key References
- `AGENTS.md` - Model tier policy and task classification
- `SOUL.md` - Persona and behavior directives
- `skills/` - OpenClaw skill directory

## Active Focus Areas

### Model Tier Routing (Current)
- Elite → Sophisticated tasks (strategize, architect, novel problems)
- Balanced → Standard development, synthesis
- Efficient → Routine checks, formatting, basic tasks
- Ultralight → Heartbeats, trivial triage

### Context Management
- Token budget: $10/day cap
- Target: <50K tokens/session routine
- Elite tasks: up to 200K
- Pruning: 1h TTL, critical context preserved

### Second Brain Architecture
- Domain organization: `memory/domains/`
- Semantic recall: memory_search
- Cross-linking between domains
- Research tracking: `memory/research/`

## Patterns & Learnings

### Effective Task Routing
- Health checks → Tier 3/4
- Code reviews → Tier 2
- Strategic planning → Tier 1
- Research discovery → Tier 3 → Tier 2 → Tier 1

### Escalation Protocol
```
Tier 3 → Tier 2 → Tier 1 → human
```

## Open Questions
- How to auto-classify task complexity at input?
- Best practices for context injection from memory?

## Related Domains
- `productivity.md` - Second brain, knowledge management
- `projects/audio-transformation-tool/` - Application domain- 2026-02-19 23:28: Test note: backbone build complete
