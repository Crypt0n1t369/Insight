# Engine — Cyclical Intelligence System

The engine transforms the bot from a reactive command handler into a **living collaborative intelligence system** that continuously evaluates, prompts, and synthesizes.

---

## Core Principle

> `/insight` never auto-fires synthesis. Explicit `/generate` always works. The engine informs when it's worth triggering.

---

## Two Modes

### Small Teams (≤5 contributors)

**Consensus model:**
1. Contributors add insights with `/insight`
2. Each signals done with `/ready`
3. When all (or threshold) ready → bot prompts synthesis
4. Consensus auto-triggers unless someone objects within 60s

```
Contributor A: /insight X
Contributor B: /insight Y  
Contributor B: /ready → Bot: "1/3 ready"
Contributor A: /ready → Bot: "2/3 ready"  
Contributor C: /ready → Bot: "✅ Consensus — synthesis triggered in 60s"
```

### Large / Decentralized (open membership)

**Cyclical engine:**
1. Bot batches contributions and evaluates context health
2. OpenClaw runs periodic health checks (via cron task files)
3. Bot identifies gaps, contradictions, stale claims
4. Bot generates targeted follow-up questions per contributor
5. Contributors answer in DM
6. Cycle repeats until bot says "context saturated — ready"
7. Any contributor can `/generate` at any time

---

## Context Health Evaluation

Triggered on every Nth insight (`INSIGHT_CHECK_THRESHOLD`, default 5) and via OpenClaw cron.

**Returns one of three statuses:**

| Status | Meaning | Bot Response |
|---|---|---|
| `growing` | Still accumulating context | "X insights building. More welcome." |
| `saturated` | Rich context, ready to synthesize | "Context is rich — /generate when ready, or /ready to signal done." |
| `stale` | No recent activity | "No recent activity. Synthesize or prompt contributors." |

**Health factors:**
- Insight count vs wiki coverage ratio
- Contributor readiness ratio
- Gap count (topics mentioned but not wiki-captured)
- Contradiction count (conflicting wiki pages)

---

## Consensus System

**`CONSENSUS_THRESHOLD`** (env, default `1.0`):
- `1.0` = all contributors must `/ready`
- `0.5` = majority (50%+1)
- `0.33` = one third (useful for large groups)

**Flow:**
```
/ready → markContributorReady(projectId, userId)
  → check ready/total ratio vs threshold
  → if threshold met: isConsensus = true
  → if groupId: post consensus message
  → auto-trigger synthesis prompt
```

**Reset:** If a "ready" contributor sends `/insight`, their signal resets to `contributing`. This prevents stale readiness from blocking synthesis.

---

## OpenClaw Integration Pattern

The engine uses task files for async OpenClaw processing. This decouples the bot from OpenClaw's availability.

### On contribution (ingest task):
```
memory/03-projects/<id>/TASKS/ingest-<timestamp>.md
→ OpenClaw reads, extracts claims, updates wiki, adds cross-links
```

### Periodic health evaluation (cron task):
```
memory/03-projects/<id>/TASKS/evaluate-context-<timestamp>.md
→ OpenClaw reads all wiki pages, identifies gaps/contradictions,
  generates follow-up questions for low-activity contributors
```

### On synthesis trigger:
```
memory/03-projects/<id>/TASKS/synthesize-<timestamp>.md
→ OpenClaw reads full wiki + contributions, produces structured synthesis
→ Writes to synthesis-latest.md
→ Bot reads result and posts to group
```

---

## Bot Commands Reference

| Command | Scope | Purpose |
|---|---|---|
| `/newproject <name>` | DM | Create project |
| `/definechallenge <text>` | DM | Set challenge statement |
| `/insight <text>` | Group | Add contribution |
| `/ready` | DM | Signal done contributing |
| `/myinsights` | DM | View your contributions |
| `/confirm <id>` | DM | Confirm contribution for synthesis |
| `/generate` | Group | Trigger synthesis (always works) |
| `/generateResult` | DM | Fetch synthesis results |
| `/status` | Both | Project status + readiness + context health |

---

## Environment Variables

```bash
TELEGRAM_BOT_TOKEN=           # BotFather token
DATABASE_URL=file:./data/synthesis.db
OPENCLAW_WORKSPACE=           # /home/drg/.openclaw/workspace

# Engine config
INSIGHT_CHECK_THRESHOLD=5      # Check health every N insights
CONSENSUS_THRESHOLD=1.0        # 1.0=all, 0.5=majority, etc.
```

---

## Future Enhancements (v0.3+)

- [ ] Auto-synthesis: trigger automatically when consensus reached (60s countdown)
- [ ] Follow-up question generator: OpenClaw generates targeted Qs for each contributor
- [ ] Periodic nudge cron: OpenClaw task file every 6h for stale projects
- [ ] `/audit` command: manual wiki health check
- [ ] Managed Bots: 1v1 child bots for deep follow-up conversations
- [ ] Weighted synthesis: some contributors' insights count more (configurable)