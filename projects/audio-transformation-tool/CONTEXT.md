# CONTEXT.md - Current Status

## Where We Are

- **Phase:** Research & Vision Alignment
- **Input Received:** 
  1. Consciousness Engineering System PDF (Neurobiology)
  2. Dan Koe "Identity Flip" methodology (Top-down identity)
  3. Psycho-Adaptive Resonance System PDF (Architecture)

---

## Synthesis: Three Docs = Complete Picture

| Document | Focus | Key Insight |
|----------|-------|-------------|
| **Doc 1** | Bottom-up physiology | Polyvagal, iCOVER, stabilization |
| **Doc 2** | Top-down identity | First-Order Change, Identity Flip |
| **Doc 3** | System Architecture | HOW to build it |

---

### Document 4: Architecture of Volition (Neurobiology Deep Dive)

| Concept | What It Means |
|---------|---------------|
| **Predictive Processing** | Brain = prediction machine. Agency = successful "active inference" (acting to make reality match prediction) |
| **Entropy Reduction** | Overwhelmed brain can't predict → defaults to passivity. Audio = "borrowed certainty" |
| **SCAN System** | Somato-Cognitive Action Network — doing and feeling are inseparable. Audio cues combining movement + emotion recruit SCAN |
| **Insula** | Seat of interoception (body awareness). Interoceptive training = agency building |
| **Locus of Control** | Internal (I control outcomes) vs External (fate/chance). Audio must match user state — high agency user needs challenge, low agency needs safety |
| **State vs Trait** | Agency fluctuates. "Precision agency" approach needed — match intervention to current neuro-affective capacity |

---

## Key Insights from All Research

### Document 1: Neurobiological Foundation

| Concept | What It Means |
|---------|---------------|
| Dorsal Vagal Shutdown | When overwhelmed, PFC goes offline — must fix physiology first |
| iCOVER Protocol | 60-90s stabilization: Anchor → Verify → Breath → Action |
| Effectuation (ABCD) | Start with what you HAVE, not what you WANT |
| Game Framing | Reframe crisis as "game" → amygdala → PFC |

### Document 2: Identity Transformation

- **First-Order Change:** Identity shift BEFORE behavior change
- **3-Phase Identity Flip:** Dissonance → Uncertainty → Discovery
- **Cybernetic Model:** Act → Sense → Compare → Iterate

### Document 3: Architecture Blueprint (CRITICAL)

**Neuro-Symbolic Architecture:**
- **Router-Specialist Model:** Single triage agent routes to specialized agents
- NOT one monolithic LLM — modular, safe, scalable

**Clinical Frameworks Mapped to Techniques:**

| Method Acting Technique | Clinical Equivalent | Target State | Agent Role |
|------------------------|---------------------|--------------|------------|
| Sense Memory | Somatic Experiencing (SE) | Panic, dissociation | Grounding Anchor |
| Character Embodiment | IFS | Internal conflict | Mediator |
| Magic If / Rehearsal | WOOP | Low motivation | Coach |
| Empty Chair | Psychodrama | Grief, conflict | Director |

**Hero's Journey (Macro-Narrative):**
1. Call to Adventure (Intention/WOOP)
2. Crossing the Threshold (Induction/Grounding)
3. The Ordeal (Shadow work/IFS)
4. The Reward (Insight)
5. The Return (Integration/Tiny Habits)

**Key Features:**
- **Local-First:** Minimize costs, maximize privacy
- **Generative Audio Engine:** Real-time affect modulation
- **Contextual Resonance:** AI remembers, evolves with user
- **Mic On:** Record user voice, play back for objective feedback

---

## Technical Feasibility: What We Need

Based on Doc 3, the MVP requires:

1. **Router Agent** — Triage input (lightweight model)
2. **Specialist Agents** — SE, IFS, WOOP, Psychodrama
3. **TTS Integration audio output** — For
4. **State Machine** — Track user journey, session history
5. **Generative Soundscapes** — Binaural/music (optional for MVP)

---

## Open Questions

- MVP: Which specialist(s) first?
- Input mechanism: Chat / Questionnaire / Voice?
- Platform: PWA or Mobile?
- First market: Consumer vs Military?

---

## Decisions Made

_(See DECISIONS.md)_

---

## Current Status (2026-02-28 Evening)

### Runtime Status
- ✅ Code builds successfully (`npm run build` passes - verified Feb 28)
- ✅ App runs on port 3001 (`npm run preview`)
- ✅ Original "Insight" app still running on port 3000
- ⚠️ Requires API keys to function fully

### What's Implemented
- 8 clinical protocols (NSDR, IFS, ACT, WOOP, NVC, Identity, Narrative, Somatic Agency)
- Audio system (TTS via Gemini/Resemble, soundscapes, binaural beats)
- Conversational check-in flow with 4 themes (SAFETY → NSDR, SPARK → WOOP, POWER → ACT, FLOW → NVC)
- Session management and reflection system
- Supabase schema and edge functions (chat, director, generate-meditation, audit-reflection)

### What's Missing / Blocked
1. **API Keys** - User needs to provide in `.env.local`:
   - `VITE_GOOGLE_API_KEY` - Required. Get from https://aistudio.google.com/app/apikey
   - `VITE_RESEMBLE_API_KEY` - Optional, for custom voices
   - `VITE_RESEMBLE_VOICE_UUID` - Optional
   - `VITE_SUPABASE_URL/KEY` - Optional for local dev
2. **Testing** - Happy path needs API key to verify
3. **WOOP Specialist** - Lower priority per DECISIONS.md

### Action Required
User must add Google API key to enable TTS and AI features. Without it, app UI loads but sessions cannot be generated.

### Architecture Notes
- Theme-to-Protocol mapping: SAFETY→NSDR (stabilization), SPARK→WOOP (motivation), POWER→ACT (boundary), FLOW→NVC (connection)
- iCOVER/NSDR implemented as NSDR protocol, mapped to SAFETY theme (overwhelmed state)
- Router-Specialist model: CheckIn → Triage → Protocol Selection → Session

---

## Progress Update (2026-02-28 20:56)

### ✅ Completed
1. Full frontend codebase builds without errors
2. App serves on port 3000 (npm run dev) and port 3001 (npm run preview)
3. 10 clinical protocols implemented (NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE, GENERAL)
4. Conversational check-in flow working
5. Audio infrastructure (TTS via Gemini, binaural, soundscapes)
6. Session state management
7. Supabase backend structure
8. Created .env.local template in code/ folder
9. App verified running on port 3001 (HTTP 200)

### 🔄 In Progress
- Awaiting API key integration for end-to-end testing

### ⏳ Next Steps (Priority Order)
1. **User Action Required:** Add `VITE_GOOGLE_API_KEY` to `projects/audio-transformation-tool/code/.env.local`
   - Get key: https://aistudio.google.com/app/apikey
   - Template already exists at: `projects/audio-transformation-tool/code/.env.local`
2. **Test:** Verify happy path - start session, receive audio
3. **Iterate:** Fix any issues discovered during testing
4. **Deploy:** Push to production (Vercel/Netlify)
5. **Validate:** User acceptance testing

---

_Last updated: 2026-02-28 (20:56)_