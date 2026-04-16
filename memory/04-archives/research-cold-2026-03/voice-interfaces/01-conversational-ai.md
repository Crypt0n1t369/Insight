# Voice Interfaces & Conversational AI

## Current State

### Web Speech API (Used in Demo Mode)
- Browser-native TTS and STT
- No API key required
- Limited voice options
- Quality varies by browser

### Cloud TTS Services
| Service | Quality | Cost | Custom Voices |
|---------|---------|------|---------------|
| Google Cloud TTS | Excellent | $4-16/M chars | Yes |
| ElevenLabs | Excellent | $1-11/M chars | Yes (voice cloning) |
| Resemble | Good | $0.60-1.50/min | Yes |
| OpenAI TTS | Good | $15-30/M chars | Limited |

### Real-Time Considerations
- Latency requirements for conversation
- Chunked streaming vs full generation
- Fallback strategies

## Voice Input (STT)

### Options
- Web Speech API (free, in-browser)
- Whisper API (OpenAI) - high quality
- Google Cloud STT - enterprise grade

### Processing Pipeline
```
User Voice → STT → Text → LLM → TTS → User Audio
```

## Personalization

### Voice Cloning
- Record 30s-10min of audio
- Generate consistent voice
- Ethical considerations

### Emotional Modulation
- Match tone to content
- Adjust pace for comprehension
- Emphasis on key points

---

*Status: Sketch - connected to Audio Tool*
