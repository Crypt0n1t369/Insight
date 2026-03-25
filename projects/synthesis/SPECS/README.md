# SPECS — Synthesis Platform Module Specifications

This directory contains detailed interface specifications for each module of the Synthesis platform.

## Files

| File | Status | Description |
|------|--------|-------------|
| `router-agent.md` | ✅ Implemented | Entry point, routes to specialists (61 tests) |
| `specialist-agents.md` | ✅ Implemented | WOOP/IFS/NSDR/BREATHWORK/SE/ACT (172 tests) |
| `knowledge-graph.md` | ✅ Implemented | Structured memory layer (36 tests) |
| `credibility-engine.md` | ✅ Implemented | Egoless reputation system (71 tests) |

## Module Status Overview

```
SPECS/
├── router-agent.md        ✅ Implemented — 61 tests
├── specialist-agents.md  ✅ Implemented — WOOP/IFS/NSDR/BREATHWORK/SE/ACT, 172 tests
├── knowledge-graph.md    ✅ Implemented — 36 tests
└── credibility-engine.md ✅ Implemented — 71 tests
```

## Implementation Order

1. **Router Agent** — ✅ Implemented (61 tests)
2. **Knowledge Graph** — ✅ Implemented (36 tests)
3. **Specialist Agents** — ✅ All 6 implemented (172 tests): WOOP, IFS, NSDR, BREATHWORK, SE, ACT
4. **Credibility Engine** — ✅ Implemented (71 tests)

## References

- Architecture: `../ARCHITECTURE.md`
- Strategy: `../PLATFORM.md`
- Research: `../RESEARCH_REPORT.md`
