# Research Tracker

## Active Research

### OpenClaw Backbone Architecture
- **Started:** 2026-02-19
- **Status:** In Progress
- **Goal:** Build sophisticated model routing, context management, and second brain system
- **References:**
  - Gist: OpenClaw Prompts (10 automation examples)
  - Gist: OpenClaw Soul (persona system)
  - Gist: OpenClaw Identity (lobster energy)
  - Gist: OpenClaw PRD (architecture)
  - forwardfuture.ai: 25+ Use Cases

### Model Tier Optimization
- **Started:** 2026-02-19
- **Status:** Architecture Defined
- **Goal:** Efficient token spend with appropriate model selection
- **Approach:** Task classification → tier routing → escalation protocol

## Completed Research

### OpenClaw Examples (2026-02-19)
- Personal CRM with vector embeddings
- Meeting action items pipeline
- Urgent email detection
- Knowledge Base (RAG)
- Business Advisory Council (8 parallel agents)
- Security Council (nightly review)
- Social media tracking
- Video idea pipeline
- Earnings reports
- Food journal/health tracking

**Key Patterns Identified:**
- Parallel agent architectures for diverse perspectives
- Cron-triggered jobs with Telegram delivery
- Learning/feedback loops for improvement
- SQLite + vector embeddings for storage

### Vector DB Options (2026-02-20)
**Options researched:**
- **LanceDB**: Rust-based, embedded, zero-config, Python-native, fast
- **pgvector**: PostgreSQL extension, mature, good for existing PG users
- **Chroma**: Simple, Python-first, good for prototyping
- **Qdrant**: Rust-based, API server, production-ready
- **Milvus**: Enterprise scale, complex setup

**Recommendation for MVP:** LanceDB - simplest, embedded, no server needed

### Chrome Extension for Browser Automation (2026-02-20)
**Options:**
- **OpenClaw Browser Relay** - Native integration, toolbar button to attach tabs
- **Selenium** - WebDriver-based, full browser control
- **Puppeteer/Playwright** - Headless, API-first, good for CI/CD
- **BrowserForge** - AI-friendly browser automation

**OpenClaw integration:** Already built-in via `browser` tool with profile="chrome" option. User clicks OpenClaw Browser Relay toolbar icon to attach tab. Works with `browser` tool actions: snapshot, act, navigate, etc.

**Recommendation:** Use OpenClaw's native browser tool - no extension needed beyond relay

## Research Protocol

### For New Research
1. Create entry with: topic, started date, goal, status
2. Use Tier 3 for initial discovery
3. Escalate to Tier 2 for synthesis
4. Tier 1 for strategic insights
5. Document findings in relevant domain file

### Research Output
- Findings → relevant domain file
- Code/scripts → appropriate directory
- Decisions → DECISIONS.md or domain file

## Queue (Backlog)
- [ ] Explore Chatterbox/Resemble AI for audio transformation
- [x] Investigate Chrome extension for browser automation ✅ DONE
- [x] Research vector db options (LanceDB, pgvector) ✅ DONE