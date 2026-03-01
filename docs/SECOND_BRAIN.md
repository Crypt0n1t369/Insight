# SECOND BRAIN ARCHITECTURE

## Overview
Local-first, AI-optimized second brain using PARA + Zettelkasten methods.

## Folder Structure

```
memory/
├── 00-inbox/          # Unprocessed captures (daily auto-created)
├── 01-areas/          # High-level responsibility areas
│   ├── ai-automation.md
│   ├── productivity.md
│   ├── health.md
│   └── finances.md
├── 02-resources/     # Reference materials (evergreen)
│   ├── technical/
│   ├── concepts/
│   └── tutorials/
├── 03-projects/       # Active projects (time-limited)
│   ├── audio-transformation-tool/
│   ├── solar-scout/
│   └── openclaw-ops/
├── 04-archives/       # Completed/inactive
├── index.md           # Master index with tags
└── graph.json         # Link relationships
```

## Key Principles

### PARA (Projects, Areas, Resources, Archives)
- **Projects**: Active work with defined outcomes (3-6 months)
- **Areas**: Ongoing responsibilities (no end date)
- **Resources**: Evergreen reference material
- **Archives**: Completed/inactive

### Zettelkasten (Atomic Notes)
- One idea per note
- Unique ID (timestamp-based)
- Links to related notes
- Tags for discovery

## AI Optimization

### Context Layers
| Layer | TTL | Use |
|-------|-----|-----|
| Hot | Current session | Immediate context |
| Warm | <24 hours | Recent projects |
| Cold | >24 hours | Archives, reference |

### Automation
- Daily: Inbox → triage to appropriate folder
- Weekly: Review areas, archive old projects
- Auto-tag: Based on content keywords
- Cross-link: Find related notes

## Scripts

### memory/capture.py
Quick capture to inbox:
```bash
python3 scripts/memory/capture.py "note content here"
```

### memory/triage.py
Daily triage:
```bash
python3 scripts/memory/triage.py
```

### memory/link.py
Auto-link related:
```bash
python3 scripts/memory/link.py
```

## Search

### Semantic (TF-IDF)
```bash
python3 scripts/memory/recall.py "topic"
```

### Graph-based
```bash
python3 scripts/memory/graph.py "note-id"
```

## Tag System

Tags prefix with `#`:
- `#ai` - AI/ML related
- `#project` - Active project
- `#decision` - Key decision
- `#todo` - Action item
- `#learned` - Lessons learned

## Usage

1. **Capture**: Anything goes to inbox
2. **Triage**: Daily, sort inbox → areas/projects/resources
3. **Link**: Connect related ideas
4. **Review**: Weekly review of areas

## Index

The `index.md` maintains:
- All tags with note counts
- Project list (active)
- Area list with status
- Recent updates

---

_Updated: 2026-03-01_
