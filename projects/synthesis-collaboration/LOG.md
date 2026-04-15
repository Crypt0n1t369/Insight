# Research Log — Synthesis Collaboration Platform
**Date:** 2026-04-12
**Agent:** subagent c0f78786

---

## Research Sources & Findings

### 1. Telegram Bot API — Bot API 9.6 (April 3, 2026) ✅ CRITICAL

**Managed Bots** — Official Telegram feature for parent→child bot chains!

Key APIs:
- `KeyboardButtonRequestManagedBot` — Keyboard button that triggers managed bot creation
- `ManagedBotCreated` — Update when user creates a managed bot
- `ManagedBotUpdated` — Update when managed bot token changes
- `getManagedBotToken` / `replaceManagedBotToken` — token management
- `can_manage_bots` field on `User`
- Link: `https://t.me/newbot/{manager_bot_username}/{suggested_bot_username}`

**Implication:** Child bot spawning is NOW officially supported.

### 2. Node.js Telegram Bot Frameworks

| Framework | Verdict |
|---|---|
| **Telegraf v4** | Most popular, battle-tested, full Bot API support, extensive integrations |
| **grammY v1** | Modern async-first, TypeScript-native, plugin ecosystem, cleaner for synthesis flows |
| **node-telegram-bot-api** | Older, callback-based, not recommended for new projects |

**Recommendation:** grammY — cleaner async model, better for complex multi-step workflows like synthesis.

### 3. Karpathy Persistent Wiki Pattern
**Source:** https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

Core insight: **Not RAG** — a persistent, compounding wiki maintained by LLM between queries.
- Raw sources = immutable inputs (user contributions)
- Wiki = LLM-generated markdown pages, updated incrementally
- Schema = instructions telling LLM how to maintain the wiki
- **Ingest:** LLM reads source, updates wiki, adds cross-links, appends log
- **Query:** LLM reads wiki pages, synthesizes answer with citations
- **Lint:** Periodic health check for contradictions, orphans, stale claims
- **index.md:** Catalog of all pages (replaces RAG at moderate scale)
- **log.md:** Append-only chronological record

**Applied to this project:** Every `/insight` is an ingest event. Every `/generate` is a query. Every `/audit` is a lint. The wiki is the persistent artifact.

### 4. Database Options
- **SQLite** (MVP) — zero-config, embedded, portable
- **PostgreSQL** (prod) — via Prisma ORM
- **Recommendation:** SQLite for MVP, PostgreSQL for production

### 5. OpenClaw Integration
Kristaps already has OpenClaw running. Key integration points:
1. **Synthesis engine:** Bot calls OpenClaw agent with project context + contributions → structured markdown output
2. **Wiki maintenance:** OpenClaw agent incrementally updates wiki after each `/insight`
3. **Follow-up generation:** OpenClaw detects gaps/conflicts → spawns 1v1 child bot questions
4. **Memory system:** `memory/01-areas/` (projects), `memory/03-projects/<id>/` (per-project wiki)
5. **Subagent spawning:** Each 1v1 follow-up = OpenClaw subagent with project context

### 6. Similar Open Source Projects
- **Telegram group bots** (Combot, GroupButler) — admin/management, NOT synthesis
- **Polling bots** — voting, not insight synthesis
- **Notion AI / CircleCI** — not Telegram-native
- **Delphi Method tools** — structured consensus, but offline/not Telegram

**Gap:** No Telegram-native persistent collaborative wiki with synthesis exists. This is novel.

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | grammY | Async-first, TypeScript-native, clean for synthesis flows |
| Database | SQLite (MVP) → PostgreSQL (prod) | Zero-config for MVP, Prisma handles migration |
| Child bots | Managed Bots API (Bot API 9.6) | Officially supported as of April 2026 |
| Brain | **OpenClaw** | Kristaps already has it — agents do synthesis, wiki maintenance, lint |
| Wiki storage | Markdown files + DB | Karpathy pattern: git repos of .md files |
| LLM | Via OpenClaw | No separate LLM API needed — use OpenClaw's configured models |

---

## Process Flow (from Kristaps)

1. **Login** — User authenticates via Telegram
2. **Create a project** — `/new-project`
3. **"Is there a problem?"** — `/define-challenge`
4. **Shared space** — All inputs visible to all (`/insight`)
5. **Individual follow-up questions** — Generated with cross-linking (child bots / 1v1 DMs)
6. **Personal space** — Confirmations of inputs per user (`/confirm`)
7. **All arrive at "Generate" step** — `/generate`
8. **Output** — Combination of perspectives synthesized
9. **Next step suggestions** — Generated + group voting (`/vote`)

**Bot commands mapping:**
- Steps 1-3: `/start`, `/new-project`, `/define-challenge`
- Step 4: `/insight` (+ OpenClaw ingest)
- Step 5: Child bot DMs (Managed Bots), `/followup`
- Step 6: `/my-insights`, `/confirm`
- Steps 7-8: `/generate` (OpenClaw synthesis + wiki query)
- Step 9: `/vote <1-3>`, `/audit`

---

## Open Questions (for Kristaps)

See SPEC.md Section 9 — 10 items.

---

## Next Steps

1. ✅ SPEC.md updated with process flow + OpenClaw integration
2. ✅ LOG.md updated
3. ✅ CHANGELOG.md updated
4. Awaiting Kristaps answers to 10 open questions
5. Begin Phase 1 implementation after Kristaps sign-off
