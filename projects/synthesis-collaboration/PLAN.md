# PLAN.md — Synthesis Collaboration Platform
**Version:** 0.1  
**Date:** 2026-04-12  
**Author:** Aton (architectural decisions made, no hedging)

---

## DECISIONS MADE

| Decision | Choice | Rationale |
|---|---|---|
| Agent backend | OpenClaw `sessions_spawn` (ACP) | OpenClaw has no HTTP API — it's a messaging gateway. The bot talks to OpenClaw via session spawning (ACP protocol). Clean, native, no middleware needed. |
| Child bot approach | **Skip managed bots for now** | Managed Bots API needs 2+ bot tokens + BotFather config + parent bot token management. MVP tester = single bot, 1v1 via DM commands. Add managed bots in v0.3. |
| Wiki storage | SQLite + JSON columns | No filesystem ops for MVP. Wiki pages as JSON blobs in SQLite. Move to markdown files in v0.2+ when needed. |
| Webhook vs polling | **Long polling (grammY default)** | Zero config, no HTTPS cert needed, works on Kristaps' local machine. grammY handles it automatically. |
| Bot model | **Single bot, group + DM commands** | One bot token, context-aware commands (group vs DM). Personal space is `/my-insights` in DM, not a separate bot. |
| Synthesis trigger | **Manual only (`/generate`)** | Auto-trigger adds complexity (state machine, timers). MVP = explicit `/generate` when project lead calls it. |
| Attribution | **Anonymize by default** | Simpler. Contributors are "User A, B, C" in synthesis. Real names only if contributor explicitly approves. |
| OpenClaw integration | Task file → memory/ | Bot writes synthesis task to `memory/03-projects/<id>/TASK.md`. OpenClaw session processes it on next heartbeat or via explicit trigger. ACP harness for deeper calls. |
| Production readiness | SQLite + PM2 + grammY webhook | Single `start.sh`. Tester gets: 1 bot token + `npm start`. PM2 keeps it alive. |
| Test handoff | 3-step | (1) Kristaps creates bot token, (2) runs `start.sh`, (3) shares bot username with tester |

---

## 1. What Kristaps Needs to Provide

### Required (before I can write any code)
- [ ] **Telegram BotFather token** — Go to https://t.me/BotFather, send `/newbot`, follow prompts, copy token
  - Format: `7xxxxxxxxxx:AAFxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - This is the ONLY token needed for MVP (single bot)
- [ ] **OpenClaw running** — `openclaw gateway` running on Kristaps' machine (local or VPS)
  - Verify: `openclaw health` returns OK
- [ ] **Model configured in OpenClaw** — Which model does OpenClaw use? (Claude, GPT-4o, Gemini?)
  - Check: `openclaw models list` or look at `~/.openclaw/openclaw.json`

### Optional (can proceed without these)
- [ ] Test group — Create a Telegram group, add the bot, send `/new-project test` to it
- [ ] OpenRouter API key — Only if OpenClaw doesn't have credits and Kristaps wants local synthesis

---

## 2. Minimal Architecture

```
                    ┌─────────────────────────────────────────┐
                    │           OpenClaw (Gateway)             │
                    │  • Already running on Kristaps' machine  │
                    │  • Has model (Claude/GPT/etc.)          │
                    │  • Sessions + memory system             │
                    │  • ACP protocol for spawning agents     │
                    └──────────────┬──────────────────────────┘
                                 sessions_spawn / memory
                    ┌──────────────┴──────────────────────────┐
                    │        grammY Telegram Bot               │
                    │  • Single bot (group + DM)               │
                    │  • Long polling (grammY default)         │
                    │  • Port: 3008 (or any free port)         │
                    └──────────────┬──────────────────────────┘
                    ┌──────────────┴──────────────────────────┐
                    │            SQLite DB                     │
                    │  • projects, contributions, users        │
                    │  • syntheses, follow_up_questions       │
                    │  • wiki_pages (JSON)                    │
                    └─────────────────────────────────────────┘
```

### Data Flow (on each command)

```
/insight <text> (group)
  → Bot stores contribution in SQLite (contributions table)
  → Bot writes ingest task to memory/03-projects/<project-id>/TASKS/
  → Bot confirms to group: "Added ✓ — #N"
  → (OpenClaw processes task on next heartbeat or explicit /process)

/generate (group)
  → Bot reads all contributions + wiki_pages for project from SQLite
  → Bot spawns OpenClaw session: "synthesize this project" (ACP sessions_spawn)
  → OpenClaw returns structured synthesis markdown
  → Bot formats and posts to group

/my-insights (DM)
  → Bot reads user's contributions from SQLite
  → Bot sends private message with user's input list + confirmations
```

### OpenClaw Integration Points

**1. Spawning synthesis session (ACP)**
```typescript
// Bot calls this via sessions_spawn
const synthesisSession = await openClaw.spawnSession({
  agentId: 'synthesis', // or use default agent
  context: {
    task: 'synthesize',
    project_id: projectId,
    challenge: challengeStatement,
    contributions: contributions,
    wiki_pages: wikiPages,
  },
  runtime: 'acp'
});
```

**2. Task file approach (backup if ACP spawning is complex)**
```typescript
// Write task to memory
await writeFile('memory/03-projects/<id>/TASKS/synthesize-<timestamp>.md', `
# Task: Synthesize project <id>
Challenge: <challenge>
Contributions:
<contributions.map(c => `- ${c.content}`).join('\n')}
Wiki:
<wikiPages.map(p => p.content).join('\n')}
`);
// OpenClaw's cron or task processor picks this up
```

---

## 3. Implementation Sequence

### Step 1: Project Bootstrap (DO NOW)
```bash
cd projects/synthesis-collaboration
npm init -y
npm install gram gram-y @prisma/client better-sqlite3 dotenv zod uuid tsx
npm install -D prisma typescript vitest @types/node
npx prisma init --datasource-provider sqlite
```

### Step 2: Database Schema
```bash
npx prisma init --datasource-provider sqlite
```
Define tables: `User`, `Project`, `Contribution`, `SynthesisOutput`, `FollowUpQuestion`, `WikiPage`

### Step 3: Bot Core (`src/bot/index.ts`)
- grammY bot initialization
- `/start` command
- `/new-project` command  
- `/define-challenge` command
- `/insight` command
- `/generate` command
- `/my-insights` DM command
- `/status` command

### Step 4: OpenClaw Integration (`src/services/openclaw.ts`)
- ACP session spawning for synthesis
- Task file writer for incremental wiki updates
- Memory structure: `memory/03-projects/<project-id>/`

### Step 5: Synthesis Service (`src/services/synthesis.ts`)
- Formats contributions for OpenClaw
- Parses OpenClaw response
- Stores synthesis in DB

### Step 6: Personal Space (`src/bot/handlers/personal.ts`)
- `/my-insights` — user's contributions
- `/confirm` — confirm an insight
- `/followup` — answer a follow-up question

### Step 7: Startup + Production
- `start.sh` script
- `.env.example`
- PM2 config for process manager

---

## 4. Startup Script (`start.sh`)

```bash
#!/bin/bash
set -e

# Config
export TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-$(cat .telegram_token 2>/dev/null)}"
export DATABASE_URL="file:./data/synthesis.db"
export OPENCLAW_URL="${OPENCLAW_URL:-http://localhost:18789}"
export PORT="${PORT:-3008}"

# Ensure data directory
mkdir -p data

# Start grammY bot
echo "Starting Synthesis Bot on port $PORT..."
npm run bot &

# Start OpenClaw gateway (if not already running)
openclaw gateway &

echo "✅ All services running"
echo "   Bot: http://localhost:$PORT"
echo "   OpenClaw: http://localhost:18789"
```

---

## 5. Managed Bots: Exact Setup (For When We Add It)

**NOT MVP — but documented here so we don't forget**

Managed Bots API (Bot API 9.6) flow:

1. **BotFather setup:**
   ```
   /newbot → name: Synthesis Deep Dive Bot → username: synthesis_dive_xxx_bot
   /setprivacy → disable (to read all messages)
   /joingroups → allow
   ```

2. **Parent bot config:**
   ```typescript
   const keyboard = {
     keyboard: [[{
       text: "Start 1v1 deep dive →",
       request_managed_bot: {
         name: "Deep Dive",
         username: "synthesis_dive_001_bot",
       }
     }]]
   };
   ```

3. **When user clicks button:**
   - Telegram sends `ManagedBotCreated` update to parent bot
   - Parent calls `getManagedBotToken()` to get permanent token
   - Parent launches child bot process with that token
   - Child bot conducts 1v1 with user
   - Parent receives answers, stores in shared DB

**MVP decision:** Skip this complexity. Use DM commands (`/my-insights`, `/confirm`) for personal space. Add Managed Bots in v0.3.

---

## 6. Testing Strategy

### Unit Tests
```bash
npm test  # vitest
```
Test: DB operations, contribution storage, synthesis formatting

### Manual Test Script
```bash
# Test project creation
curl -X POST http://localhost:3008/api/projects -d '{"name":"Test"}'

# Test contribution
curl -X POST http://localhost:3008/api/contributions -d '{"project_id":"...","content":"test"}'
```

### Bot Manual Test
1. Add bot to Telegram group
2. `/new-project test-project`
3. `/define-challenge What should we work on?`
4. `/insight My first idea is X`
5. `/insight Another thought about Y`
6. `/generate`
7. Check synthesis output in group

### Giving to a Tester (3 Steps)
1. **Kristaps runs:** `start.sh` (bot starts, OpenClaw gateway running)
2. **Kristaps shares:** Bot username (e.g., `@SynthesisCollabBot`) with tester
3. **Tester joins:** Creates Telegram group, adds bot, runs `/new-project` + `/define-challenge` + `/insight` + `/generate`

---

## 7. OpenClaw Tool Integration — The Cleanest Approach

**The problem:** OpenClaw is a messaging gateway, NOT an HTTP API server. There's no `POST /api/synthesize` endpoint.

**The solution:** ACP (Agent Communication Protocol) via `sessions_spawn`

```typescript
// src/services/openclaw.ts

import { sessions_spawn } from 'openclaw';

export async function synthesizeWithOpenClaw(params: {
  projectId: string;
  challenge: string;
  contributions: Contribution[];
  wikiPages: WikiPage[];
}): Promise<SynthesisOutput> {
  // Spawn a synthesis subagent session
  const session = await sessions_spawn({
    agentId: 'synthesis-agent', // configured in OpenClaw
    mode: 'session',
    runtime: 'acp',
    task: `SYNTHESIZE PROJECT

Challenge: ${params.challenge}

Contributions:
${params.contributions.map((c, i) => `${i+1}. [${c.user_id}] ${c.content}`).join('\n')}

Wiki context:
${params.wikiPages.map(p => p.content).join('\n')}

Task: Read all contributions above. Produce a structured synthesis:
- Commonalities (what most agree on)
- Divergences (contradictions or different framings)  
- Structured outline
- 2-3 next step proposals

Output format: Markdown. Return ONLY the synthesis, no preamble.`
  });

  // Wait for result
  const result = await session.waitForCompletion();
  return parseAndStoreSynthesis(result);
}
```

**Alternative (if ACP spawning is complex from external Node process):**
Write to task file → OpenClaw's built-in task/cron processor handles it:
```typescript
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function writeSynthesisTask(params: SynthesisParams): Promise<string> {
  const taskDir = join(process.env.OPENCLAW_WORKSPACE!, 'memory/03-projects', params.projectId, 'TASKS');
  await mkdir(taskDir, { recursive: true });
  const taskFile = join(taskDir, `synthesize-${Date.now()}.md`);
  await writeFile(taskFile, formatTask(params));
  return taskFile;
}
```

---

## 8. Production Checklist Before Tester Handoff

- [ ] Telegram bot token from BotFather
- [ ] `npm install` dependencies
- [ ] `npx prisma db push` — create SQLite tables
- [ ] `.env` file with `TELEGRAM_BOT_TOKEN`
- [ ] `openclaw gateway` running (background)
- [ ] `npm run bot` — grammY bot running (PM2)
- [ ] Test `/new-project`, `/insight`, `/generate` in group
- [ ] Verify synthesis output appears in group
- [ ] Share bot username with tester
- [ ] Give tester 3-step onboarding instructions

---

## 9. Project Folder Structure

```
synthesis-collaboration/
├── src/
│   ├── bot/
│   │   ├── index.ts          # grammY entry, commands
│   │   └── handlers/
│   │       ├── project.ts    # /new-project, /define-challenge
│   │       ├── insight.ts    # /insight
│   │       ├── generate.ts  # /generate
│   │       ├── personal.ts  # /my-insights, /confirm
│   │       └── status.ts    # /status
│   ├── services/
│   │   ├── openclaw.ts      # OpenClaw integration (ACP/tasks)
│   │   ├── synthesis.ts     # Synthesis formatting + storage
│   │   └── wiki.ts          # Wiki page management
│   ├── db/
│   │   ├── index.ts         # Prisma client
│   │   └── schema.prisma    # All tables
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── data/                    # SQLite DB (gitignored)
├── memory/                  # OpenClaw memory (wiki per project)
│   └── 03-projects/
├── tests/
│   ├── unit/
│   └── integration/
├── start.sh                 # Production startup script
├── .env.example
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── SPEC.md
├── PLAN.md
├── LOG.md
└── CHANGELOG.md
```

---

## 10. Priority Order for Kristaps' Answers

I need ONE thing from Kristaps to proceed:

> **"Here's my Telegram bot token: `xxx:xxx`"**

Everything else I can figure out or default. Once token is in hand:
1. Write Prisma schema
2. Implement bot commands
3. Wire OpenClaw integration
4. Ship to tester

**The plan is executable. The dependencies are minimal. The path is clear.**

🦞☀️
