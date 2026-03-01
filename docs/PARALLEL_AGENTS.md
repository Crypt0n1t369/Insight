# PARALLEL AGENT SYSTEM DESIGN

## Overview
Continuous agent operation with project separation and automatic task distribution.

## Architecture

### 1. Task Queue (Backlog)
- `BACKLOG.md` - Main task repository
- Auto-parsed from unstructured input
- Priority-tagged: P0-P3

### 2. Project Buckets
Each project gets dedicated task file:
- `projects/audio-transformation-tool/TASKS.md`
- `projects/solar-scout/TASKS.md`
- `projects/openclaw/TASKS.md`

### 3. Agent Pools (5-hour cycles)

| Agent | Focus | Hours |
|-------|-------|-------|
| Wakeup | Orchestrator - reviews backlog, spawns workers | Every 30min |
| Worker-1 | Audio Transformation Tool | Continuous |
| Worker-2 | Lead Gen / Solar | Continuous |
| Worker-3 | OpenClaw / System | Continuous |

### 4. 5-Hour Reset Cycle
- Agent state reset every 5 hours
- New session spawned with fresh context
- Previous state archived to memory

---

## Implementation

### Task Format
```markdown
## TASKS.md - Project Name

### P0 (Critical)
- [ ] Task description | Assignee: worker-1 | Due: 2026-03-01

### P1 (High)
- [ ] Task description | Assignee: any | Due: 

### P2 (Medium)
- [ ] Task description

### P3 (Low)
- [ ] Backlog items
```

### Unstructured Input Parser
Any message to agent → auto-added to BACKLOG:
```
you should look into making the audio tool work offline
```
→ Added to BACKLOG.md under "Incoming"

---

## Cron Jobs

### 1. Wakeup (Orchestrator)
- Every 30 min
- Reviews BACKLOG.md
- Spawns workers for P0/P1 tasks
- Archives completed tasks

### 2. Worker Agents (5-hour cycle)
- Run continuously
- Pick tasks from project bucket
- Report progress to BACKLOG
- Reset every 5 hours

---

## Separation Rules

1. Each project has isolated task file
2. Worker agents assigned to specific projects
3. Context NOT shared between workers
4. Results aggregated in BACKLOG

---

## Success Metrics
- [ ] Tasks auto-distributed to workers
- [ ] 5-hour reset working
- [ ] Unstructured input → backlog
- [ ] Project isolation maintained
