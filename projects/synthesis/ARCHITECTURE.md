# ARCHITECTURE.md - Synthesis Platform

## Overview

**Synthesis** = Audio Tool + Credo + Synthetic Characters

## Design Principles

1. **Modular** — Each component independently deployable
2. **Interconnectable** — Shared data layer connects all modules
3. **Egoless** — Contributions attributed to value, not identity
4. **Extensible** — New protocols/agents can be added without rewriting

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SYNTHESIS PLATFORM                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  Router │───▶│Specialist│───▶│ Knowledge│◀───│ Credibility│     │
│  │  Agent  │    │  Agents  │    │  Graph   │    │  Engine   │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │               │               │               │             │
│       └───────────────┴───────────────┴───────────────┘             │
│                              │                                      │
│                    ┌─────────▼─────────┐                          │
│                    │   Data Layer     │                          │
│                    │  (Supabase)      │                          │
│                    └───────────────────┘                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module Specifications

### 1. Router Agent
- **Purpose:** Triage user input, route to appropriate specialist
- **Input:** User voice/text + context
- **Output:** Protocol selection + context package

### 2. Specialist Agents
| Agent | Protocol |
|-------|----------|
| SE-Agent | Somatic Experiencing |
| IFS-Agent | Internal Family Systems |
| WOOP-Agent | Mental Contrasting |
| ACT-Agent | Acceptance & Commitment |
| NVC-Agent | Nonviolent Communication |

### 3. Knowledge Graph
- Store structured information connecting all modules
- Node types: protocol, technique, concept, user_state, session, contribution, gap

### 4. Credibility Engine
- Track contributions egolessly
- Calculate reputation based on value provided

### 5. Synthetic Mediator
- AI agent represents users in collaborative contexts

---

## Extension Protocol

### Adding New Protocols
1. Create file in knowledge/protocols/
2. Define YAML frontmatter with connections
3. Implement Specialist Agent class
4. Register in Router Agent

### Adding New Concepts
1. Add to knowledge/neurobiology/ or knowledge/gaps/
2. Tag with relevant categories
3. Link to existing nodes

---

## Status

| Component | Status |
|-----------|--------|
| Router Agent | Partial |
| Specialist Agents | Not Built |
| Knowledge Graph | Design |
| Credibility Engine | Research Complete |
| Synthetic Mediator | Future |

---

*Last updated: 2026-03-04*
