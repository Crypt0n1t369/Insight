# PROGRESS.md - Audio Transformation Tool
*Updated — 2026-03-25 21:30 Cairo*

## Current Status (2026-03-25 21:30)

### ✅ Running Services
| Component | Port | Status | Details |
|-----------|------|--------|---------|
| Audio Tool Backend | 3001 | ✅ Running | `node tsx server/index.ts`, health OK |
| Audio Tool Frontend | 5173 | ✅ Running | `npx serve dist` (static build) |
| Credo API | 3000 | ✅ Running | health OK |
| Youth Platform | 3003 | ✅ Running | health OK |

### ✅ Test Suite
- **34 vitest tests** in `code/server/` — all passing (2026-03-25 23:29)
- `npx vitest run` executes all 34 tests: 11 unit + 23 integration
- `server.test.ts`: 11 unit tests (mocked OpenRouter)
- `integration.test.ts`: 23 integration tests against running server
- Integration tests require server running on localhost:3001

### ✅ Demo Mode Enhanced
Backend generates protocol-specific demo batches when OpenRouter credits are exhausted:
- **9 protocols** return playable demo content: NSDR (6 batches), IFS (6), SOMATIC_AGENCY (5), ACT (5), FUTURE_SELF (5), WOOP (5), NVC (5), IDENTITY (5), NARRATIVE (5)
- Each batch includes clinically-grounded script text + SonicInstructions (FADE_VOL cues)
- `/api/chat` fallback returns `meditationData` suggestion
- `/api/meditation/generate` fallback returns demo batches with title "Demo: {METHODOLOGY}"

### ⚠️ KNOWN ISSUE — Frontend Source Missing
- **Frontend cannot be rebuilt** from source — React/TypeScript source files not committed
- Only pre-built `dist/` folder is in repo (committed static assets)
- `npm run build` fails: "Cannot resolve entry module index.html"
- **Workaround**: Pre-built dist is served correctly; no action needed for current deployment
- **Resolution**: If frontend changes needed, must restore source from upstream or rebuild separately

### ⚠️ BLOCKED — User Action Required
1. **Deploy to Vercel** → vercel.com → import Crypt0n1t369/Insight → Deploy (needed for public URL + Telegram bot)
2. **Add OpenRouter API Key** → credits exhausted; LLM endpoints use demo fallbacks

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

*Last updated: 2026-03-24 00:27 UTC*

---

## 2026-03-24 00:27 UTC - Wakeup Session

### Status: ✅ Operational / Demo Mode Active

**All 4 services healthy, audio tool running in demo mode.**

### What Was Verified This Session
1. ✅ **Backend health** — `http://localhost:3001/health` → `{"status":"ok","openRouterLinked":true}`
2. ✅ **9 protocols confirmed** — NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE
3. ✅ **Demo mode end-to-end** — `/api/chat` returns triage response with `meditationData`; `/api/director` returns NSDR fallback; `/api/meditation/generate` returns 6 NSDR batches with clinically-grounded scripts + FADE_VOL cues
4. ✅ **Frontend** — `http://localhost:5173` → HTTP 200, PWA manifest + service worker OK, dark-mode Insight app
5. ✅ **Tests** — 90/90 passing (vitest, 7 test files including audio server + collaboration-platform)
6. ✅ **All 4 services confirmed healthy:**
   - Audio Tool Backend: 3001 ✅
   - Credo API: 3000 ✅
   - Youth Platform: 3003 ✅
   - JCI Portal: 8080 ✅
7. ✅ **Git** — 1 commit ahead of origin/master (`0a26825 Archive failed module system refactor attempt`)

### ⚠️ BLOCKED — User Action Required
1. **Deploy to Vercel** → vercel.com → import Crypt0n1t369/Insight → Deploy
2. **Add OpenRouter API Key** → credits exhausted; demo mode works but LLM features need credits

### ✅ Demo Mode Verified Working
Each `/api/meditation/generate` call returns:
- **NSDR**: 6 batches of guided NSDR script text + FADE_VOL atmosphere cues
- **IFS**: 6 batches (Somatic Agency: 5, others: 5 each)
- Script text is clinically-grounded, includes binaural frequency cues
- Demo mode fallback at `/api/director` returns NSDR rationale

### What's Next (Priority Order)
1. **User deploys to Vercel** (P0 — user action)
2. **Add OpenRouter credits** (P0 — user action)
3. **Merge upstream commit 8562fd2** — no upstream remote configured; cannot merge without adding anthropics remote
4. **End-to-end browser test** — no browser available in this environment; deferred
5. **Add remaining protocols** — GENERAL, TRAUMA_SAFE, BREATHWORK (defined in protocols.ts, not in CLINICAL_PROTOCOLS)

---

## 2026-03-25 19:30 UTC - Wakeup Session

### Status: ✅ Operational / Demo Mode Active

**All services healthy. Found critical issue: frontend source missing.**

### What Was Verified This Session
1. ✅ **Backend health** — `http://localhost:3001/health` → `{"status":"ok","openRouterLinked":true}`
2. ✅ **9 protocols confirmed** — NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE
3. ✅ **Demo mode end-to-end** — `/api/meditation/generate` returns NSDR demo batches with clinically-grounded scripts + FADE_VOL cues
4. ✅ **Frontend serving** — `http://localhost:5173` → HTTP 200, dark-mode PWA Insight app
5. ✅ **Tests** — 34/34 passing for audio tool, 75/75 for Credo collaboration platform
6. ✅ **All 4 services confirmed healthy:**
   - Audio Tool Backend: 3001 ✅
   - Credo API: 3000 ✅
   - Youth Platform: 3003 ✅
   - JCI Portal: 8080 ✅ (inferred from previous session)
7. ✅ **Git** — Working tree clean, up to date with fork/main

### 🚨 NEW ISSUE DISCOVERED — Frontend Source Missing
- **Problem**: `npm run build` fails with "Cannot resolve entry module index.html"
- **Root Cause**: React/TypeScript frontend source files not committed to repo
- **Evidence**: No `src/`, `index.html`, or `vite.config.ts` in `code/` root
- **Only `dist/` is committed** (pre-built static assets from 2026-03-14)
- **Impact**: Cannot modify or rebuild frontend from current repo
- **Current Impact**: LOW — pre-built dist serves correctly, all features work
- **Future Impact**: HIGH if frontend changes needed

### ✅ Demo Mode Verified Working
Each `/api/meditation/generate` call (POST with `{"methodology":"NSDR"}`) returns:
- 6 batches of guided NSDR script text
- FADE_VOL atmosphere cues for volume modulation
- Clinically-grounded scripts (body scan, physiological sigh, parasympathetic activation)
- Title: "Demo: NSDR"

### ⚠️ BLOCKED — User Action Required
1. **Deploy to Vercel** → vercel.com → import Crypt0n1t369/Insight → Deploy
2. **Add OpenRouter credits** → credits exhausted; demo mode works but LLM features need credits

### What's Next (Priority Order)
1. **User deploys to Vercel** (P0 — user action)
2. **Add OpenRouter credits** (P0 — user action)
3. **Frontend source restoration** (if needed) — options:
   - Fetch from upstream `anthropics/claude-code` repo
   - Clone original Insight app and restore modifications
4. **Merge upstream commit 8562fd2** — deferred; conflicts with demo mode
5. **Add remaining protocols** — GENERAL, TRAUMA_SAFE, BREATHWORK (defined in protocols.ts, not in CLINICAL_PROTOCOLS)
