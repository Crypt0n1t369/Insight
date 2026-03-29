# OpenClaw Cron Jobs System

## Overview
This directory contains the OpenClaw cron job configuration and related scripts.

## Files
- `jobs.json` - Main cron job configuration
- `jobs_backup.json` - Backup of the original configuration
- `scripts/` - Cron job execution scripts
- `logs/` - Execution logs and state files

## Current Cron Jobs (as of 2026-03-29)

| Job | Schedule | Session | Purpose |
|-----|----------|---------|---------|
| **Wakeup** | 30 min | `current` | Verify systems, update PROGRESS.md |
| **Worker-1** | 5 hours | `isolated` | Pick highest-priority BACKLOG.md task |
| **Worker-3** | 5 hours | `isolated` | OpenClaw health, memory cleanup |

### ⚠️ Worker-2 — DISABLED (2026-03-28)
- Worker-2 was disabled after it failed trying to edit a submodule (solar-scout/PROGRESS.md)
- Isolated sessions cannot write to submodule files
- Worker-2 had 1 consecutive error before disable

### Note on Session Modes
- `sessionTarget: current` = runs in the cron-initiating session, CAN edit workspace files
- `sessionTarget: isolated` = ephemeral isolated session, CANNOT edit workspace files

The Wakeup job runs in `current` mode so it can update PROGRESS.md and MEMORY_CONTEXT.md.
Worker-1 and Worker-3 run in `isolated` mode — they only read and report.

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
- **Isolated sessions cannot edit workspace files** — use `sessionTarget: current` for edit-dependent jobs
- **Isolated sessions cannot edit submodules** — solar-scout/ and projects/*/ require main session

## Backup Strategy
The system automatically:
- Backs up configurations daily
- Archives logs weekly
- Creates snapshots before major changes
- Maintains 30-day retention policy

## Auto Memory
- `scripts/auto_memory_inject.py` — runs on cron, generates `.memory_context`
- Output: `/home/drg/.openclaw/workspace/.memory_context` (auto-loaded as project context)
- Memory search: TF-IDF based, queries 5 active topics
