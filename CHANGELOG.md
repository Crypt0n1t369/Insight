# CHANGELOG

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

## Future Priorities
- Implement actual test harness execution
- Wire security gate into message processing
- Add budget tracking dashboard
- Implement KB/ingestion pipeline
