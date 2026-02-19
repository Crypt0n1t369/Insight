# Audio Transformation Tool

## Overview

AI-powered audio platform for psychological transformation, self-regulation, and human performance. Uses personalized audio (guided scripts, binaural beats, soundscapes) to guide users through cognitive and emotional processes.

## Current Codebase

**Repo:** https://github.com/cryptonighter/Insight

**Tech Stack:**
- **Frontend:** React + TypeScript + Vite + Tailwind
- **Backend:** Node.js server (Express)
- **LLM:** Gemini API
- **Database:** Supabase
- **Audio:** Web Audio API (custom AudioService)

---

## Implemented Features

### Clinical Protocols (9 Total)

| Protocol | Description |
|----------|-------------|
| **NSDR** | Non-Sleep Deep Rest — physiological downregulation |
| **IFS** | Internal Family Systems — unblending parts |
| **Somatic Agency** | Embodied leadership — shift from conditioning |
| **ACT** | Cognitive Defusion — distance from sticky thoughts |
| **Future Self** | Continuity with future self — motivation |
| **WOOP** | Mental Contrasting — wish/outcome/obstacle/plan |
| **NVC** | Self-Empathy — convert judgments to needs |
| **Identity** | Signature Strengths — leverage character strengths |
| **Narrative** | Externalization — separate person from problem |

### Audio System

- **TTS:** Gemini voices (Kore, Fenrir, Puck, Charon, Aoede)
- **Soundscapes:** Deep space, rain, stream, silence
- **Binaural Beats:** Frequency modulation (4-16Hz)
- **Progressive Playback:** Segments generated and queued in real-time
- **Sonic Director:** Layered audio (voice, atmosphere, binaural)

### User Flow

1. **Triage** → Valence/Arousal assessment
2. **Context** → Select methodology + fill variables
3. **Experience** → Progressive audio playback
4. **Reflection** → Post-session insight capture

---

## MVP Scope

Current working version exists. Need to identify bugs and fix them.

## Technical Architecture

```
Client (React) → Express Server → Gemini API → Audio Generation
                        ↓
                 Supabase (storage)
```

---

## Status

- MVP exists (web app)
- Need to identify and fix bugs
- Research phase complete

## Next Steps

- Get the app running locally
- Identify bugs
- Prioritize fixes