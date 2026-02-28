# CHANGELOG

## 2026-02-28 (Evening) - Recall System Fix

### Fixed
- `scripts/recall.sh` - Fixed hardcoded /workspace path → now uses /home/drg/.openclaw/workspace
- `scripts/memory_vector.sh` - Fixed hardcoded /workspace path → now uses /home/drg/.openclaw/workspace
- Vector search now returns relevant results for semantic queries

### Verified
- Health checks: 9/9 passing ✓
- Test runner: 5/5 passing ✓
- Budget: $0.03/$10 (well within) ✓
- Recall system: Working ✓

## 2026-02-28 - Night Shift - Phase 1.1 Evolution

### Evolved
- **Memory Vector Search** - Added `scripts/memory_vector.sh` for TF-IDF-style keyword relevance scoring across memory files
- **Recall System** - Updated `scripts/recall.sh` to use vector search + context display for semantic-ish queries
- **Test Runner** - Fixed to work in both sandbox (/workspace) and host environments
- **Memory Index** - Built `memory/vector-index.json` with embeddings for 6 memory files (92KB)

### Fixed
- `scripts/health_check.sh` - Workspace path detection now supports both sandbox and host
- H6 Git branch check now handles detached HEAD state gracefully

### Added
- H7: Memory freshness check - warns if no updates in 3+ days
- H8: Git cleanup suggestion - shows pending commit command if uncommitted changes
- H9: Cron health check - verifies cron/openclaw processes are running

### Status
- Health check now has 9 automated checks
- Script works in both sandbox (/workspace) and host (/home/drg/.openclaw/workspace) environments
- Memory embeddings index ready but not yet wired into prompt context injection
- 5 core tests defined but not automated in cron yet

- Phase 0 MVP foundations drafted (security hygiene, memory backbone skeleton)
- Phase 1 MVP backbone outlined (identity, memory, model-tier policy, heartbeat)
- Telegram milestone notifier wired; morning digest scheduler configured for 06:51 Cairo
- Git repository scaffold established (main, develop, feature/*)
- MVP test harness planned (5 core tests)

## 2026-02-19 - Night Shift Improvements

### Added
- `scripts/health_check.sh` - Automated daily health checks (repo, secrets, memory, tests, budget, git branch)
- `scripts/security_gate.sh` - Input sanitization and injection detection
- Updated `HEARTBEAT.md` with full implementation details

### Fixed
- Removed duplicate `IDENTIY.md` typo file

### Infrastructure
- Health checks can run via cron or manual execution
- Security gate provides basic input validation for external prompts

## 2026-02-19 (Backbone Build) - Model Routing + Second Brain

### Added
- Enhanced `AGENTS.md` - Sophisticated 4-tier model routing system
  - Tier 1 (Elite): Opus for strategic/high-stakes
  - Tier 2 (Balanced): Sonnet/Gemini Pro for standard tasks
  - Tier 3 (Efficient): Flash/Haiku/MiniMax for routine
  - Tier 4 (Ultralight): Free models for heartbeats/trivial
  - Automatic task classification triggers
  - Escalation protocol: 3→2→1→human
  - Learning loop for task→tier optimization

- Second Brain Domain Files
  - `memory/domains/ai-automation.md` - OpenClaw, automation, model routing
  - `memory/domains/productivity.md` - Second brain, knowledge management
  - `memory/domains/index.md` - Domain organization master

- Research System
  - `memory/research/index.md` - Research tracker with protocol
  - Workflow: Tier 3 discovery → Tier 2 synthesis → Tier 1 insight

- Domain Tools
  - `scripts/domain_capture.sh` - Quick knowledge entry
  - `scripts/recall.sh` - Fast topic retrieval

### Status
- Model routing: ✓ Functional with task classification
- Domain memory: ✓ 2 domains + index + research
- Recall system: ✓ Scripts tested and working

## Future Priorities
- Implement actual test harness execution ✅ DONE
- Wire security gate into message processing
- Add budget tracking dashboard
- Implement KB/ingestion pipeline
- Explore automation examples from OpenClaw gists

## 2026-02-19 (Late Night) - Test Runner + Domain Index

### Added
- `scripts/test_runner.sh` - Automated test execution (5/5 tests passing)
- `memory/domains/index.md` - Second brain domain organization system
- Updated `.gitignore` to exclude runtime logs

## 2026-02-19 (Night Shift 3) - Budget Tracker

### Added
- `scripts/budget_tracker.sh` - Daily budget tracking with $10 cap
- Updated HEARTBEAT.md to reference budget tracker

### Status
- All systems operational ✓
- Health checks passing ✓
- Test runner: 5/5 ✓
- Budget tracker: Functional ✓

## 2026-02-20 (Night Shift 4) - KB Ingestion + Morning Digest

### Added
- `scripts/kb_ingest.sh` - URL/content ingestion for knowledge base
- `scripts/morning_digest.sh` - Daily status summary script
- `memory/2026-02-20.md` - Today's memory entry

### Infrastructure Complete
- Health checks ✓
- Test runner ✓
- Security gate ✓
- Budget tracking ✓
- KB ingestion ✓
- Morning digest ✓

## 2026-02-20 (Night Shift 5) - Daily Wrap-Up + Research

### Added
- `scripts/daily_wrapup.sh` - End of day summary script

### Completed
- Vector DB research (LanceDB recommended for MVP)
- Updated research queue with findings

## 2026-02-20 (Night Shift 6) - Research Complete

### Research Completed
- Chrome extension/browser automation (use OpenClaw native tool)
- Vector DB options documented
- Domain files updated with findings

### Status
- Research queue: 1 item remaining (audio transformation)

## 2026-02-20 (Night Shift 7) - Quick Capture + README

### Added
- `scripts/quick_note.sh` - Rapid idea capture
- `README.md` - Project documentation
- Updated today's memory via quick note

### Scripts Available: 10 total
