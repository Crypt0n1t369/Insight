# OpenClaw Cron Jobs System

## Overview
This directory contains the OpenClaw cron job configuration and related scripts.

## Files
- `jobs.json` - Main cron job configuration
- `jobs_backup.json` - Backup of the original configuration
- `scripts/` - Cron job execution scripts
- `logs/` - Execution logs and state files

## Current Cron Jobs

### Active Jobs
1. **Wakeup** - Runs every 30 minutes, verifies systems, updates PROGRESS.md
2. **Worker-1** - Runs every 5 hours, picks highest-priority BACKLOG.md task and executes
3. **Worker-3** - Runs every 5 hours, checks OpenClaw system tasks, health, memory cleanup

### Note on Isolated Sessions
Wakeup cron runs in `sessionTarget: current` mode (updated 2026-03-28). This allows it
to edit workspace files (PROGRESS.md, MEMORY_CONTEXT.md, etc.) without the isolated-session
edit limitation. Worker-1 and Worker-3 run in `isolated` mode — they do NOT edit files,
only read and report.

## Rate Limiter System
- `rate_limiter.py` - Advanced rate limiting with resume capability
- State persistence for interrupted operations
- Exponential backoff for retries
- Automatic pause/resume functionality

## Troubleshooting
- Check file permissions in `/home/drg/.openclaw/workspace/`
- Verify workspace write access
- Review error logs in `logs/` directory
- Test scripts individually before adding to cron
- Isolated sessions cannot edit workspace files — use `sessionTarget: current` for edit-dependent jobs

## Backup Strategy
The system automatically:
- Backs up configurations daily
- Archives logs weekly
- Creates snapshots before major changes
- Maintains 30-day retention policy
