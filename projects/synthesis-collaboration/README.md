# Synthesis Collaboration Platform

Telegram-native collaborative intelligence platform powered by OpenClaw.

## Quick Start

```bash
cd /home/drg/.openclaw/workspace/projects/synthesis-collaboration

# Install dependencies (use mirror if npm install fails)
npm install --registry=https://registry.npmmirror.com

# Setup database
npx prisma generate && npx prisma db push

# Run tests
npm test

# Run bot
npm run bot
```

For persistent background operation:
```bash
npm install -g pm2
pm2 start npm --name "synthesis-bot" -- start && pm2 save
```

## Bot Commands

### In DMs with the bot
| Command | Description |
|---|---|
| `/start` | Welcome + help |
| `/newproject <name>` | Create new project |
| `/definechallenge <text>` | Set challenge statement |
| `/link` | Link a Telegram group to your project |
| `/ready` | Signal you are done contributing |
| `/myinsights` | View your contributions |
| `/confirm <id>` | Confirm a contribution |
| `/status` | Project status + readiness + context health |
| `/stats` | Your contribution profile |

### In Telegram Groups
| Command | Description |
|---|---|
| `/insight <text>` | Share a contribution |
| `/generate` | Trigger synthesis |
| `/generate-result` | Poll for and retrieve synthesis results |
| `/status` | Project status |
| `/vote <1-3>` | Vote on next step proposals |

## Natural Language

The bot understands free-form text too. Instead of commands, you can just say:
- "let's start a project about AI ethics"
- "here's my thought: interpretability matters"
- "generate the synthesis"
- "what's the status"

## How Synthesis Works

```
1. DM bot → /newproject <name>
2. DM bot → /definechallenge <problem statement>
3. Add bot to group → /link
4. In group → /insight <contribution> (repeat for each contributor)
5. Contributors signal done → /ready
6. In group → /generate fires → task file written to memory/03-projects/<id>/TASKS/
7. TASKS Monitor cron (every 60s) reads task file → MiniMax LLM synthesizes
8. TASKS Monitor writes synthesis-latest.md + task-result-<taskId>.txt sidecar
9. In DM → /generate-result polls results → posts structured synthesis to group
10. /vote <1-3> in group to vote on next step proposals
```

## Engine — Context Health & Consensus

**Small teams (consensus):**
- Contributors `/ready` when done
- When all (or threshold) ready → synthesis auto-triggers
- `CONSENSUS_THRESHOLD=1.0` means all contributors ready = consensus

**Large/decentralized (cyclical):**
- Every `INSIGHT_CHECK_THRESHOLD` insights (default: 5) → context health evaluation
- Bot posts: "🧠 Context building — X insights, gaps identified"
- Any contributor can `/generate` at any time

**Auto-reset:** A contributor who was `/ready` but sends a new `/insight` → status resets to "contributing"

## Environment Variables

```env
TELEGRAM_BOT_TOKEN=8xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0   # from BotFather
DATABASE_URL=file:./data/synthesis.db
OPENCLAW_WORKSPACE=/home/drg/.openclaw/workspace
OPENCLAW_URL=http://localhost:18789
MINIMAX_API_KEY=                      # for LLM chat + knowledge graph
MINIMAX_GROUP_ID=                     # for MiniMax group
MINIMAX_BASE_URL=https://api.minimax.chat/v1
INSIGHT_CHECK_THRESHOLD=5
CONSENSUS_THRESHOLD=1.0
PORT=3008
```

## Architecture

- **grammY** — Telegram bot framework (long polling)
- **Prisma + SQLite** — Database (15 models)
- **OpenClaw TASKS Monitor** — Cron job (every 60s) that reads task files, calls MiniMax LLM, writes synthesis output
- **Karpathy wiki pattern** — Persistent compounding knowledge base
- **LLM Wiki v2** — Typed knowledge graph with entity extraction, confidence scoring, supersession
- **Cyclical engine** — Readiness tracking, context health, consensus detection

## File Structure

```
src/
├── bot/
│   ├── index.ts            # grammY entry, all commands, NL fallback
│   ├── naturalLanguage.ts   # 12-intent keyword parser + menu builder
│   └── handlers/
│       ├── project.ts      # /newproject, /definechallenge, /link
│       ├── insight.ts       # /insight + async KG ingest
│       ├── generate.ts      # /generate + /generate-result
│       ├── personal.ts      # /myinsights, /confirm, /ready, /status
│       ├── status.ts        # /status (project health)
│       └── vote.ts          # /vote <1-3>
├── services/
│   ├── engine.ts           # Context health, readiness, consensus
│   ├── openclaw.ts         # Task file writer + result poller
│   ├── synthesis.ts        # parseOpenClawResponse + formatSynthesisForTelegram
│   ├── crystallize.ts      # Synthesis → wiki pages (LLM Wiki v2 crystallization)
│   ├── knowledgeGraph.ts   # Entity extraction + typed relationships
│   ├── chat.ts             # MiniMax LLM conversational chat
│   ├── userContext.ts     # Per-user contribution tracking
│   └── wiki.ts            # Wiki page CRUD + project index
├── db/
│   └── index.ts           # Prisma client + dotenv init
├── types/
│   └── index.ts           # Shared types (SynthesisResult, etc.)
└── config.ts              # Centralized env var loading + validation

prisma/
└── schema.prisma          # 15 models (User, Project, Contributor, ... Task)

tests/
├── db.test.ts              # DB CRUD tests
├── synthesis.test.ts       # parseOpenClawResponse + format tests
└── synthesis-parse.test.ts # parseOpenClawResponse correctness tests
```

## Tests

```bash
npm test
```

## Pipeline (Verified 2026-04-13)

The synthesis pipeline is verified end-to-end:
1. `/generate` → writes `TASKS/synthesize-<ts>.md` + `.task-trigger.json`
2. TASKS Monitor cron (every 60s, isolated session) → reads task → MiniMax LLM → writes `synthesis-latest.md` + `task-result-<taskId>.txt`
3. `/generate-result` → polls `synthesis-latest.md` → stores in DB → crystallizes to 4 wiki pages → posts to Telegram

## What's Implemented

- ✅ Single grammY bot with long polling (no HTTPS cert needed)
- ✅ 15 bot commands registered, 14 effective (`handleStatus` in `status.ts` is defined but not wired — dead code; `/status` routes to `handleStatusWithReadiness`)
- ✅ Natural language fallback with 12 intents
- ✅ Prisma/SQLite with 15 models
- ✅ TASKS Monitor cron (every 60s) for OpenClaw synthesis
- ✅ LLM Wiki v2 knowledge graph (entity extraction, typed relationships, confidence scoring)
- ✅ Crystallization (synthesis → typed wiki pages)
- ✅ Cyclical engine (context health, readiness, consensus)
- ✅ `/vote` next-step voting with compound unique constraint
- ✅ Natural language intent parser (keyword-based, no external API)
- ✅ MiniMax LLM chat (when credentials configured)
- ✅ Knowledge graph ingestion (every `/insight` fires entity extraction)

## What's Deferred (v0.2+)

- Child bot / 1v1 follow-up DMs (Managed Bots API)
- `/audit` wiki health check
- Auto-trigger synthesis on consensus
- Markdown file wiki storage
- PostgreSQL migration (SQLite → PostgreSQL for production)
- Quality score LLM assessment (currently hardcoded 0.7)

---

*Aton ☀️🦞 | Fixed: generate.ts commonalities typo, README counts/structure*
