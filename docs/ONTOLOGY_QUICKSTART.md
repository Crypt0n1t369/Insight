# OpenClaw Ontology - Quick Start Guide

## Overview

The OpenClaw Ontology is a semantic layer that provides structured governance for agent operations. It defines:
- **Entities** (what exists)
- **Relationships** (how entities connect)
- **Rules** (what's allowed)
- **Diagnostics** (troubleshooting)

---

## Quick Usage

### From Python

```python
from pathlib import Path
import sys
sys.path.insert(0, '/home/drg/.openclaw/workspace/ontology')

from ontology import ProjectRegistry, TaskTracker, OntologyDiagnostics

workspace = Path('/home/drg/.openclaw/workspace')

# Check system health
diag = OntologyDiagnostics(workspace)
print(diag.system_health())

# List projects
registry = ProjectRegistry(workspace)
for p in registry.list_projects():
    print(f"{p.id}: {p.name}")

# Track tasks
tracker = TaskTracker(workspace)
for t in tracker.get_active_tasks():
    print(f"{t.id}: {t.title}")
```

### From CLI

```bash
# System health
python3 scripts/ontology_agent.py health

# List projects
python3 scripts/ontology_agent.py projects

# List tasks
python3 scripts/ontology_agent.py tasks

# Diagnose project
python3 scripts/ontology_agent.py diagnose-project youth-platform

# Diagnose task
python3 scripts/ontology_agent.py diagnose-task task-1

# Validate tool access
python3 scripts/ontology_agent.py validate-tool "read,write,exec" exec

# Check subagent limit
python3 scripts/ontology_agent.py can-spawn 3
```

---

## File Structure

```
ontology/
├── __init__.py          # Module exports
├── entities.py          # Entity schemas (Project, Task, Agent, etc.)
├── relationships.py     # Valid relationships
├── rules.py            # Rules engine (constraints)
├── registry.py         # Project registry
├── task_tracker.py    # Task tracking
├── diagnostics.py     # Troubleshooting
├── ai_constraints.py  # AI system prompts
└── test_ontology.py   # Test suite
```

---

## Entities

| Entity | Description |
|--------|-------------|
| **Project** | A distinct workstream |
| **Agent** | An AI agent |
| **Task** | A unit of work |
| **Tool** | A capability |
| **ContextDocument** | Context source |

---

## Rules

The rules engine enforces constraints:

```python
from ontology import OpenClawRules

# Max sub-agents
valid, msg = OpenClawRules.can_spawn_subagent("parent", 5)
# valid = False, msg = "Max sub-agents (5) reached"

# Tool access
valid, msg = OpenClawRules.validate_tool_access(["read", "write"], "delete")
# valid = False

# Task assignment
valid, msg = OpenClawRules.can_assign_task("agent", 3, 5)
# valid = False (at capacity)
```

---

## Diagnostics

```python
from ontology import OntologyDiagnostics

diag = OntologyDiagnostics(workspace)

# System health
health = diag.system_health()
# {'projects': {...}, 'tasks': {...}}

# Diagnose task failure
result = diag.diagnose_failure("task-1")
# {'task': {...}, 'constraints': [...], 'recommendations': [...]}

# Diagnose project stall
result = diag.diagnose_project_stall("project-id")
# {'project': {...}, 'stalled_reasons': [...], 'recommendations': [...]}
```

---

## Data Storage

Ontology data is stored in:
- `~/.openclaw/projects.json` - Project registry
- `~/.openclaw/tasks.json` - Task tracker

---

## Tests

Run tests:
```bash
cd /home/drg/.openclaw/workspace
python3 -m pytest ontology/test_ontology.py -v
```

**Result: 29 tests passing**

---

*Updated: 2026-03-14*
