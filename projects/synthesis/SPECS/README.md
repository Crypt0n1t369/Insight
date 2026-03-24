# SPECS — Synthesis Platform Module Specifications

This directory contains detailed interface specifications for each module of the Synthesis platform.

## Files

| File | Status | Description |
|------|--------|-------------|
| `router-agent.md` | ✅ Implemented | Entry point, routes to specialists (61 tests) |
| `specialist-agents.md` | ✅ Implemented | NSDR/IFS/WOOP/BREATHWORK (121 tests) |
| `knowledge-graph.md` | ✅ Implemented | Structured memory layer (36 tests) |
| `credibility-engine.md` | ✅ Implemented | Egoless reputation system (71 tests) |

## Module Status Overview

```
SPECS/
├── router-agent.md        ✅ Implemented — 61 tests, committed
├── specialist-agents.md  ✅ Implemented — NSDR/IFS/WOOP/BREATHWORK, 121 tests
├── knowledge-graph.md    ✅ Implemented — 36 tests, committed
└── credibility-engine.md ✅ Implemented — 71 tests, committed
```

## Implementation Order

1. **Router Agent** — ✅ Implemented (61 tests)
2. **Knowledge Graph** — ✅ Implemented (36 tests)
3. **Specialist Agents** — ✅ All 4 implemented (121 tests): WOOP, IFS, NSDR, BREATHWORK
4. **Credibility Engine** — ✅ Implemented (71 tests), committed `0f67db9`

## References

- Architecture: `../ARCHITECTURE.md`
- Strategy: `../PLATFORM.md`
- Research: `../RESEARCH_REPORT.md`
