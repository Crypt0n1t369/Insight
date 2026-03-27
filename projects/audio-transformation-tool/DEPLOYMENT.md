# Deployment Guide — Audio Transformation Tool

## Prerequisites (User Action Required)
1. **OpenRouter account** — https://openrouter.ai → add $5–10 credits
2. **Supabase project** — https://supabase.com → new project → run schema.sql
3. **Vercel account** — https://vercel.com → import GitHub repo `Crypt0n1t369/Insight`

---

## Step 1 — Supabase Setup

1. Create project at https://app.supabase.com
2. Go to **SQL Editor** → run `/home/drg/.openclaw/workspace/projects/audio-transformation-tool/code/supabase/schema.sql`
3. Go to **Settings → API** → copy:
   - `VITE_SUPABASE_URL` = Project URL (e.g. `https://xxxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` = `anon public` key

---

## Step 2 — Vercel Deployment

1. Import: https://github.com/Crypt0n1t369/Insight → **Import**
2. **Framework Preset:** Vite
3. **Root Directory:** `./code`
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`

### Environment Variables (Vercel → Settings → Environment Variables)

| Name | Value | Notes |
|------|-------|-------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | From Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | anon public key |
| `OPENROUTER_API_KEY` | `sk-or-...` | Optional — demo mode works without |
| `GOOGLE_API_KEY` | `AIza...` | Optional — Gemini voices |

### Without Supabase
If you skip Supabase, the app runs in **demo mode** — sessions are not persisted but all 9 protocols work via Web Speech API. No crashes, no errors.

---

## Step 3 — Telegram Bot (Optional, Phase 2)

After Vercel deploy, set `TELEGRAM_BOT_TOKEN` env var to enable the CG Telegram bot.

---

## What Works Without Any Keys
- All 9 protocols in demo mode (Web Speech API TTS)
- NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE
- `/api/protocols`, `/api/chat`, `/api/director`, `/api/meditation/generate`
- Frontend PWA (dark mode, soundscapes, binaural beats via Web Audio API)

## What Requires Keys
| Feature | Key Needed |
|---------|-----------|
| AI triage + routing | `OPENROUTER_API_KEY` |
| AI-generated meditation scripts | `OPENROUTER_API_KEY` |
| Session persistence | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` |
| Gemini voices | `GOOGLE_API_KEY` |

---

## Local Development

```bash
cd /home/drg/.openclaw/workspace/projects/audio-transformation-tool

# Backend (port 3001)
cd code && npm run dev:backend
# or: PORT=3001 npx tsx server/index.ts

# Frontend dev (port 5173)
npm run dev

# Or use start.sh
./start.sh all      # both backend + frontend
./start.sh test     # run 34 vitest tests
./start.sh backend  # backend only
```

## Supabase Schema Summary

```
Core tables: profiles, insights, parts_ledger, somatic_anchors, values_inventory, session_logs, patterns
Resolution engine: user_economy, resolutions, daily_entries  
Memory: memories (with vector embeddings)
```

All tables have RLS policies — users can only access their own data.

---

*Last updated: 2026-03-28*
