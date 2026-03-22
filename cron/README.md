# OpenClaw Cron Jobs System

## Overview
This directory contains the OpenClaw cron job configuration and related scripts.

## Files
- `jobs.json` - Main cron job configuration
- `jobs_backup.json` - Backup of the original configuration
- `scripts/` - Cron job execution scripts
- `logs/` - Execution logs and state files
- `backups/` - Automated backup files

## Current Cron Jobs

### System Health Jobs
1. **Wakeup** - Runs every 30 minutes, updates progress
2. **Worker-3** - Runs every 5 hours, system health checks

### Failed Jobs (Need Fixing)
1. **Worker-1** - 2 consecutive errors (file edit failures)
2. **Worker-2** - 2 consecutive errors (file edit failures)

## Rate Limiter System
- `rate_limiter.py` - Advanced rate limiting with resume capability
- State persistence for interrupted operations
- Exponential backoff for retries
- Automatic pause/resume functionality

## Next Development Items

### P0 (Immediate)
- Fix file permission issues in cron jobs
- Test rate limiter with actual API calls
- Implement backup automation

### P1 (This Week)
- Enhanced segmentation system
- Context-aware task routing
- Proactive error recovery

### P2 (Next Week)
- Advanced monitoring dashboard
- Performance optimization
- Security hardening

## Troubleshooting
- Check file permissions in `/home/drg/.openclaw/workspace/`
- Verify workspace write access
- Review error logs in `logs/` directory
- Test scripts individually before adding to cron

## Backup Strategy
The system automatically:
- Backs up configurations daily
- Archives logs weekly
- Creates snapshots before major changes
- Maintains 30-day retention policy
