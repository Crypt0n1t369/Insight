# PROGRESS.md - Audio Transformation Tool
*Updated — 2026-03-23 15:03 Cairo*

## Current Status (2026-03-23)

### ✅ Running Services
| Component | Port | Status | Details |
|-----------|------|--------|---------|
| Audio Tool Backend | 3001 | ✅ Running | `node tsx server/index.ts`, health OK |
| Audio Tool Frontend | 5173 | ✅ Running | `npx serve dist` (static build) |

### ✅ Test Suite
- **34 vitest tests** in `code/server/` — all passing (2026-03-23 15:02)
- `npx vitest run` executes all 34 tests: 11 unit + 23 integration
- `server.test.ts`: 11 unit tests (mocked OpenRouter)
- `integration.test.ts`: 23 integration tests against running server
- Integration tests require server running on localhost:3001

### ✅ Demo Mode Enhanced (2026-03-23)
Backend now generates protocol-specific demo batches when OpenRouter credits are exhausted:
- **9 protocols** all return playable demo content: NSDR (6 batches), IFS (6), SOMATIC_AGENCY (5), ACT (5), FUTURE_SELF (5), WOOP (5), NVC (5), IDENTITY (5), NARRATIVE (5)
- Each batch includes clinically-grounded script text + SonicInstructions (FADE_VOL cues)
- `/api/chat` fallback now returns `meditationData` suggestion
- `/api/meditation/generate` fallback returns demo batches with title "Demo: {METHODOLOGY}"

### ⚠️ BLOCKED — User Action Required
1. **Deploy to Vercel** → vercel.com → import Crypt0n1t369/Insight → Deploy (needed for public URL + Telegram bot)
2. **Add OpenRouter API Key** → credits exhausted; LLM endpoints (/api/director, /api/meditation/generate) use demo fallbacks

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
   - Fork: https://github.com/Crypt0n1t369/Insight
   - Go to: https://vercel.com/new → Import repo
   - (Optional) Add `VITE_GOOGLE_API_KEY` in Vercel env vars for AI features
2. **Add OpenRouter credits** — restores LLM features; demo mode works without but is scripted

### P1 — Can Do Now
1. **Browser test demo mode** — open http://localhost:5173, start a session, verify audio plays
2. **Test all 9 protocols** — verify each protocol's demo content loads and plays correctly
3. **Merge upstream commit 8562fd2** — improves duration calc, error handling, progress UX, voice mapping
   - Conflict zone: `useMeditationGenerator.ts` (demo mode vs upstream)
   - Strategy: keep demo check at top, incorporate upstream improvements

### P2 — Future
1. **End-to-end browser automation tests** — verify full player flow in real browser
2. **Add remaining protocols** — GENERAL, TRAUMA_SAFE, BREATHWORK (in protocols.ts but not in CLINICAL_PROTOCOLS)
3. **Telegram bot integration** — connect to deployed Vercel URL for audio sessions via chat

---

## Project Notes
- **Fork**: https://github.com/Crypt0n1t369/Insight
- **Upstream**: https://github.com/anthropics/claude-code (Insight)
- **Upstream commit 8562fd2**: improves duration calc, error handling, progress UX, voice mapping — merge deferred due to demo mode conflicts
- All local commits pushed to fork

---

*Last updated: 2026-03-23 09:58 UTC*
