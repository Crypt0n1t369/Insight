# Research Tracker

## Active Research

### Synthesis Platform Architecture
- **Started:** 2026-03-04
- **Status:** Strategic Planning
- **Goal:** Unified platform for personal development + distributed collaboration + synthetic characters
- **Output:** PLATFORM.md, ARCHITECTURE.md in projects/synthesis/

### Audio Transformation Tool
- **Started:** 2026-02-28
- **Status:** MVP Ready (Demo Mode)
- **Goal:** Ship functional audio protocol tool

### Credibility Platform (Credo)
- **Started:** 2026-02-20
- **Status:** Research Complete
- **Goal:** Awaiting pilot validation

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

## Research Queue (Backlog)
- [ ] Explore Chatterbox/Resemble AI for audio transformation
- [ ] Synthetic characters - deep dive on persona synthesis
- [ ] Knowledge graph implementations (Neo4j vs Supabase)
- [ ] Voice interface latency optimization
- [ ] Zero-knowledge proof integration
- [ ] Quadratic voting implementation
- [ ] Real-time audio streaming protocols

## Completed Research
### Synthesis Platform (2026-03-04)
Research areas created:
- synthetic-characters/ - AI representation of users
- distributed-collaboration/ - Mechanisms for egoless work
- knowledge-systems/ - Knowledge graph design
- identity-systems/ - Anonymous identity with ZK proofs
- voice-interfaces/ - TTS/STT options
- neurobiology/ - Advanced topics beyond current protocols
- engagement/ - Gamification principles
- governance/ - Decision-making systems
- technical/ - Implementation stack

### OpenClaw Examples (2026-02-19)