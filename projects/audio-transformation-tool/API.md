# Audio Transformation Tool — API Reference

**Base URL:** `http://localhost:3001`  
**Frontend:** `http://localhost:3005` (static build)  
**Demo Mode:** Active when `OPENROUTER_API_KEY` is absent or credits are exhausted.

---

## Endpoints

### `GET /health`

Health check.

```json
{ "status": "ok", "openRouterLinked": true }
```

---

### `GET /api/protocols`

Returns all 10 supported clinical protocols.

**Response:**
```json
{
  "protocols": [
    {
      "id": "NSDR",
      "name": "Non-Sleep Deep Rest",
      "description": "Physiological downregulation...",
      "variables": [...],
      "sonicCues": { "startFreq": 14, "endFreq": 4, "atmosphere": "rain" }
    },
    ...
  ]
}
```

**Protocols (10):** NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE, GENERAL

---

### `POST /api/chat`

Conversational triage — routes user to a methodology.

**Request:**
```json
{
  "history": [{ "role": "user", "text": "I feel anxious" }],
  "latestInput": "I'm overwhelmed",
  "userVariables": {}
}
```

**Response (demo mode):**
```json
{
  "reply": "I hear you. Tell me more about what you're experiencing — in demo mode, every word matters.",
  "shouldOfferMeditation": true,
  "meditationData": {
    "focus": "Demo Session",
    "feeling": "Open",
    "duration": 10,
    "methodology": "NSDR"
  }
}
```

---

### `POST /api/director`

Selects optimal protocol based on user state.

**Request:**
```json
{
  "input": "I'm feeling overwhelmed",
  "triage": { "valence": -0.5, "arousal": 0.8 },
  "growthHistory": []
}
```

**Response (demo mode):**
```json
{
  "methodology": "NSDR",
  "focus": "Grounding",
  "targetFeeling": "Calm",
  "intensity": "MODERATE",
  "rationale": "Fallback: no API key available"
}
```

---

### `POST /api/meditation/generate`

Generates a meditation session with protocol-specific scripts.

**Request:**
```json
{
  "methodology": "NSDR",
  "focus": "Deep Rest",
  "targetFeeling": "Calm",
  "durationMinutes": 10,
  "variables": {},
  "contextInsights": []
}
```

**Response (demo mode):**
```json
{
  "error": "Demo mode — AI generation requires OPENROUTER_API_KEY with credits.",
  "batches": [
    {
      "text": "Welcome to your NSDR session. Find a comfortable position...",
      "instructions": [{ "action": "FADE_VOL", "layer": "atmosphere", "targetValue": 0.6, "duration": 5 }]
    }
  ],
  "title": "Demo: NSDR"
}
```

**Demo Batches per Protocol:**
| Protocol | Batches |
|----------|---------|
| NSDR | 6 |
| IFS | 6 |
| SOMATIC_AGENCY | 5 |
| ACT | 5 |
| FUTURE_SELF | 5 |
| WOOP | 5 |
| NVC | 5 |
| IDENTITY | 5 |
| NARRATIVE | 5 |
| GENERAL | 6 |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | No | — | LLM API key. Omitting activates demo mode. |
| `GOOGLE_API_KEY` | No | — | Gemini API key (optional) |
| `PORT` | No | 3001 | Server port |

---

## Demo Mode

When `OPENROUTER_API_KEY` is absent or returns a 402 (credits exhausted):

- `/api/chat` → Returns empathetic fallback + NSDR suggestion
- `/api/director` → Returns NSDR grounding protocol
- `/api/meditation/generate` → Returns 5-6 batches of clinically-grounded script text with `FADE_VOL` sonic cues

**Demo scripts are fully playable** via Web Speech API (browser TTS) — no API key required.

---

## Audio Playback

The frontend uses **Web Speech API** to speak batch text. Binaural beats and soundscapes are layered via **Web Audio API**. Sonic cues (`FADE_VOL`) modulate atmosphere layer volume at specified intervals.

---

## Architecture

```
Browser (React PWA, port 3005)
    ↓ fetch /api/*
Backend (Express + tsx, port 3001)
    ↓ callOpenRouter()
OpenRouter API → Gemini 3 Flash
    ↓ (fallback)
DEMO_BATCHES (protocol scripts, always available)
```
