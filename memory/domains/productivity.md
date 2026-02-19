# Productivity Systems Domain

## Overview
Second brain architecture, knowledge management, context management, note-taking systems, personal knowledge bases, RAG implementations.

## Key References
- `memory/domains/index.md` - Domain organization master
- `MEMORY.md` - Long-term memory system
- `HEARTBEAT.md` - Health check automation

## Focus Areas

### Second Brain Architecture
- **Storage:** Topic/domain organized in `memory/`
- **Recall:** Semantic search via memory_search
- **Embedding:** Key decisions, patterns, learnings
- **Context injection:** Pull relevant memory into active sessions

### Memory Hierarchy
1. **Working memory** - Active session context (<50K tokens)
2. **Short-term** - Today's notes (`memory/YYYY-MM-DD.md`)
3. **Long-term** - Domain files (`memory/domains/*.md`)
4. **Archive** - Completed projects, old research

### Knowledge Capture Protocol
1. Identify domain → check `domains/index.md`
2. Load relevant domain context
3. Update domain file with new learnings
4. Cross-link related domains

## Tools & Techniques
- `memory_search` - Semantic recall across all memory
- `memory_get` - Precise snippet retrieval
- Domain index - Navigation and organization

## Patterns & Learnings

### Effective Memory Usage
- Summarize at milestones to control token budget
- Store decisions, not just data
- Link related concepts across domains
-定期回顾 and consolidate

### Research Workflow
1. Tier 3: Initial discovery (web search, quick fetch)
2. Tier 2: Synthesis and analysis  
3. Tier 1: Strategic insight

## Open Questions
- Optimal memory file size?
- Embedding strategy for long-term storage?

## Related Domains
- `ai-automation.md` - Agent frameworks, automation
- `projects/audio-transformation-tool/` - Application