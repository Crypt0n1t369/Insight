# Implementation Technology Stack

## Current Audio Tool Stack

```
Frontend:
- React 18
- TypeScript
- Vite (build)
- PWA (service worker)

Audio:
- Web Speech API (fallback)
- Gemini TTS (when API key added)
- Resemble (optional)

State:
- React Context
- LocalStorage

Backend (optional):
- Supabase
```

## Synthesis Platform Stack (Proposed)

```
Presentation:
- React + Next.js (SSR)
- PWA for offline
- Mobile-first design

AI/ML:
- Router: Lightweight model (Haiku/Sonnet)
- Specialists: GPT-4 class for complexity
- TTS: Gemini or ElevenLabs
- STT: Whisper

Data:
- Supabase (PostgreSQL)
- Redis (sessions, cache)
- IPFS (content, future)

Identity:
- Wallet connect (optional)
- Anonymous IDs (default)
- ZK proofs (future)

Infrastructure:
- Vercel (frontend)
- Cloudflare Workers (edge)
- Supabase (backend)
```

## Key Technical Decisions

### 1. Single App vs Microservices
- Start: Monolithic Next.js
- Scale: Extract AI to separate services

### 2. Real-time vs Async
- Audio: Real-time streaming
- Collaboration: Async-first
- Mediation: Event-driven

### 3. Data Location
- User data: Supabase
- Audio: CDN (Cloudflare R2)
- Knowledge: Graph database

---

*Status: Developing*
