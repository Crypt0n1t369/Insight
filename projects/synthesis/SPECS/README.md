# SPECS — Synthesis Platform Module Specifications

This directory contains detailed interface specifications for each module of the Synthesis platform.

## Files

| File | Status | Description |
|------|--------|-------------|
| `router-agent.md` | Ready for impl | Entry point, routes to specialists |
| `specialist-agents.md` | Partial | Therapeutic protocol agents |
| `knowledge-graph.md` | Ready for impl | Structured memory layer |
| `credibility-engine.md` | Design complete | Egoless reputation system |

## Module Status Overview

```
SPECS/
├── router-agent.md        ✅ Spec complete — ready for implementation
├── specialist-agents.md  🔶 Partial — core agents defined, ACT/NVC/SE future
├── knowledge-graph.md    ✅ Spec complete — ready for implementation
└── credibility-engine.md ✅ Design complete — integration with Credo platform
```

## Implementation Order

1. **Router Agent** — Simplest, no external dependencies
2. **Knowledge Graph** — Required by other modules
3. **Specialist Agents** — WOOP first (simplest), then NSDR, IFS
4. **Credibility Engine** — Integrate with Credo platform later

## References

- Architecture: `../ARCHITECTURE.md`
- Strategy: `../PLATFORM.md`
- Research: `../RESEARCH_REPORT.md`
