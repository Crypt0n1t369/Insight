# HEARTBEAT.md

# Phase 0 MVP Health Checks (skeleton)

- Health checks for: repo health, secrets hygiene, memory growth, backups, test results, model usage consistency
- Cadence: 1x per day check (can batch with other heartbeats later)
- When to escalate: if any check fails or drift detected, report and pause execution until reviewed
