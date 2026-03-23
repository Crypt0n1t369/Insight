# PROGRESS.md - Audio Transformation Tool
*Consolidated — 2026-03-23*

## Current Status (2026-03-23)

### ✅ Running Services
| Component | Port | Status | Details |
|-----------|------|--------|---------|
| Audio Tool Backend | 3001 | ✅ Running | `node tsx server/index.ts`, health OK |
| Audio Tool Frontend | 5173 | ✅ Running | `npx serve dist` (static build) |

### ✅ Test Suite
- **32 vitest tests** in `code/server/` — all passing (as of 2026-03-23)
- `server.test.ts`: unit tests for /health, /api/protocols, /api/chat, /api/director, /api/meditation/generate
- `integration.test.ts`: Phase 2 integration tests
- `protocols.test.ts`: 13 protocol definition tests
- `userHistory.test.ts`: 14 user history tests
- ⚠️ Integration tests hit real OpenRouter API — will 500 when credits exhausted

### ⚠️ BLOCKED — User Action Required
1. **Deploy to Vercel** → vercel.com → import Crypt0n1t369/Insight → Deploy (needed for public URL)
2. **Add OpenRouter API Key** → credits exhausted; LLM endpoints (/api/director, /api/meditation/generate) return 402

### ✅ What's Working
- Demo Mode: Web Speech API fallback for audio generation (no API key needed)
- All 5 core endpoints respond: /health, /api/protocols, /api/chat, /api/director (fallback), /api/meditation/generate (fallback)
- 9 protocols: NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE

---

## Architecture

```
Audio Tool Frontend (5173)  ──→  Audio Tool Backend (3001)
  React PWA (Vite build)          Node/tsx + Express
  Web Speech API (demo mode)      OpenRouter API (production)
                                   Google Gemini (production)
```

### Key Files
- `code/server/index.ts` — Express server, all API endpoints
- `code/server/protocols.ts` — 9 clinical protocol definitions
- `code/server/types.ts` — TypeScript types
- `code/src/` — React PWA frontend

### Environment Variables
```bash
OPENROUTER_API_KEY=   # Optional — demo mode works without
GOOGLE_API_KEY=        # Optional — Gemini fallback
PORT=3001              # Default
```

---

## History (Condensed)

### March 2026 — MVP Complete, Demo Mode Active
- **Mar 23**: Audio Backend restarted, 32 vitest tests passing, PROGRESS.md consolidated (was 4706 lines)
- **Mar 11**: Added vitest framework, 13 protocol tests, 14 userHistory tests; test count jumped to 32
- **Mar 4–10**: Wakeup sessions ran daily; all services kept running; OpenRouter keys exhausted early in this period
- **Mar 4**: Demo mode implemented (Web Speech API fallback); 11 protocol definitions active
- **Feb–Mar**: Fork created from Claude Code (Insight), local modifications for demo mode and protocol system

### Earlier History
- **Feb 2026**: Project created from Anthropic Claude Code fork; audio transformation platform adapted for wellness/military/enterprise markets

---

## What's Next (Prioritized)

### P0 — User Action Needed
1. **Deploy to Vercel** — public URL needed for Telegram bot integration
2. **Add OpenRouter credits** — restores LLM features (director, meditation generation)

### P1 — Can Do Now
1. **Fix integration tests** — mock OpenRouter calls so tests pass without real API key
2. **Add more protocols** — 9 active, could expand to 12 (GENERAL, TRAUMA_SAFE, BREATHWORK mentioned in docs)
3. **Phase 2 integration tests** — end-to-end flows with real browser automation

### P2 — Future
1. **Manual upstream merge** — upstream commit 8562fd2 improves duration calc, error handling, progress UX, voice mapping
2. **Test in production** — verify demo mode audio plays in real browser

---

## Project Notes
- **Fork**: https://github.com/Crypt0n1t369/Insight
- **Upstream**: https://github.com/anthropics/claude-code (Insight)
- **Upstream commit 8562fd2**: improves duration calc, error handling, progress UX, voice mapping — merge deferred due to demo mode conflicts
- All local commits pushed to fork

---

*Last updated: 2026-03-23 09:58 UTC*
