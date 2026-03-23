=== ATON CONTEXT ===
Generated: 2026-03-23 10:58 UTC

## Active Projects
- audio-transformation-tool: Running on port 3001, 32 vitest tests, 9 protocols active, Demo Mode functional
- collaboration-platform / Credo: Running on ports 3000 (API) + 3002 (frontend), 56 vitest tests
- jci-org-manager: Web portal running on port 8080, 33 pytest tests; Telegram bot NOT started (token in .env, needs MINIMAX_API_KEY for LLM mode)
- festival-coordinator: Complete, 49 pytest tests, Phase 2 pending bot token
- youth-empowerment-platform: Running on port 3003, 24 pytest tests, Telegram bot code ready

## Test Summary (194 tests, all passing)
| Project | Tests | Type |
|---------|-------|------|
| Audio Backend | 32 | vitest |
| Festival Coordinator | 49 | pytest |
| JCI Org Manager | 33 | pytest |
| Youth Platform | 24 | pytest |
| Credo Platform | 56 | vitest |
| **Total** | **194** | |

## Quick Status
- Services: 6/6 running (ports 3000,3001,3002,3003,5173,8080)
- Git: Clean, synced (a68db73)
- Health: All checks nominal

## Blocked (User Action Required)
1. Deploy Audio Tool to Vercel
2. Add TELEGRAM_BOT_TOKEN to Youth Platform (.env)
3. Add TELEGRAM_BOT_TOKEN to Festival Coordinator (.env)
4. Add MINIMAX_API_KEY to JCI Bot (optional; works rule-based without)
5. Boss review Credo SPEC.md/SCHEMA.md/PILOT.md — needed before Credo MVP build starts

## What's Next (Aton Can Do)
1. Credo MVP Build — ready when boss reviews and approves SPEC.md
2. Festival Coordinator Phase 2 — code complete, needs bot token + participants
3. Youth Platform Telegram bot — code ready, needs bot token
4. JCI Telegram bot — token present, works in rule-based mode; LLM features need MINIMAX_API_KEY
