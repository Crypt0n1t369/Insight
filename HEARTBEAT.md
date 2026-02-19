# HEARTBEAT.md - Phase 0 MVP Health Checks

## Overview
Daily health check system to ensure the workspace, memory, and operational guardrails are functioning properly.

## Health Checks

### H1: Repository Health
```bash
cd /home/drg/.openclaw/workspace && git status
```
- **Pass:** Clean working tree or only expected uncommitted changes
- **Fail:** Untracked secrets, broken files, or merge conflicts

### H2: Secrets Hygiene
```bash
grep -r "password\|secret\|api_key\|token" /home/drg/.openclaw/workspace --include="*.js" --include="*.md" 2>/dev/null | grep -v ".git" | head -5
```
- **Pass:** No hardcoded secrets in code
- **Fail:** Secrets found (requires immediate remediation)

### H3: Memory Growth
```bash
ls -la /home/drg/.openclaw/workspace/memory/
```
- **Pass:** Daily memory files being created
- **Fail:** No files in >2 days

### H4: Test Results
```bash
ls -la /home/drg/.openclaw/workspace/tests/
```
- **Pass:** Test files exist and were recently modified
- **Fail:** Tests missing or stale (>7 days)

### H5: Model Usage Consistency
- **Check:** Review recent session costs via `session_status`
- **Pass:** Daily spend <$10 (budget cap)
- **Fail:** Budget exceeded

### H6: Git Branch Hygiene
```bash
cd /home/drg/.openclaw/workspace && git branch --show-current
```
- **Pass:** On `main` or feature branch (not detached)
- **Fail:** Detached HEAD or on unexpected branch

## Execution

### Manual Run
```bash
/home/drg/.openclaw/workspace/scripts/health_check.sh
```

### Cron Schedule
Run daily at 06:00 Cairo (04:00 UTC)

## Escalation
If any check fails:
1. Log failure to MEMORY.md with timestamp
2. Alert via Telegram if critical (H2, H5)
3. Pause non-critical execution until reviewed

## Recent Runs
- 2026-02-19: Initial heartbeat scaffold implemented
