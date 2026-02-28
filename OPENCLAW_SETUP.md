# OpenClaw Setup & Use Cases - Research File

A comprehensive guide to OpenClaw capabilities, setups, and real-world use cases.

---

## What is OpenClaw?

**OpenClaw** is a self-hosted AI gateway that connects your favorite chat apps to AI coding agents. Think of it as a personal AI assistant that lives on your hardware, answers on your channels, and stays running 24/7.

- **License:** MIT Open Source
- **Runtime:** Node.js 22+
- **Platforms:** macOS, Linux, Windows (WSL2 recommended)

---

## Core Capabilities

### Multi-Channel Gateway
Connect multiple messaging platforms to a single Gateway:
- **WhatsApp, Telegram, Discord, iMessage**
- **Signal, Slack, Google Chat**
- **Microsoft Teams, BlueBubbles, Matrix, Zalo**

### Built-in Tools

| Tool | Capability |
|------|------------|
| `browser` | Full browser automation (Chrome/Chromium via CDP) |
| `web_fetch` | Lightweight HTTP GET + content extraction |
| `web_search` | Web search (requires API: Brave/Perplexity/Gemini) |
| `exec` / `process` | Run shell commands |
| `read` / `write` / `edit` | File operations |
| `message` | Send messages via any connected channel |
| `image` | Analyze images with vision models |
| `tts` | Text-to-speech output |
| `nodes` | Control paired mobile devices (camera, location, notifications) |
| `canvas` | Render interactive UI canvases |
| `memory_search` / `memory_get` | Semantic memory/recall system |

### Tool Profiles (Security)

Configure what tools agents can access:

```json
{
  "tools": {
    "profile": "coding",  // minimal | coding | messaging | full
    "deny": ["group:runtime"]  // Block dangerous tools
  }
}
```

**Profile Options:**
- `minimal` — session_status only
- `coding` — fs, runtime, sessions, memory, image
- `messaging` — message, sessions tools
- `full` — no restrictions

### Tool Groups

| Group | Tools Included |
|-------|----------------|
| `group:runtime` | exec, bash, process |
| `group:fs` | read, write, edit, apply_patch |
| `group:sessions` | sessions_list, sessions_history, sessions_send, sessions_spawn, session_status |
| `group:memory` | memory_search, memory_get |
| `group:web` | web_search, web_fetch |
| `group:ui` | browser, canvas |
| `group:automation` | cron, gateway |
| `group:messaging` | message |
| `group:nodes` | nodes |

---

## Your Current Setup

### Config Location
```
~/.openclaw/openclaw.json
```

### Active Components

| Component | Status | Notes |
|-----------|--------|-------|
| Gateway | ✅ Running | port 18789, local loopback |
| Telegram | ✅ Connected | chat ID 551447474 |
| Model | MiniMax M2.5 | Default (~$0.30/day) |
| faster-whisper | ✅ Installed | Local STT (tiny model) |
| Browser tool | ⚠️ Available | Not configured |
| Ollama | ✅ Running | qwen2.5:1.5b, qwen2.5:0.5b |

### Installed Tools

1. **faster-whisper** — Local speech-to-text
   - Model: tiny (int8, CPU)
   - Location: `~/.venv/whisper/bin/python`
   - No API key needed

2. **espeak** — Text-to-speech (system)
   - Quality: Robotic, but free/offline

3. **Insight App** — Audio transformation tool
   - Running on port 3000
   - Needs Google API key for TTS

---

## Real-World Use Cases (From Community)

### 1. PR Review → Telegram Feedback
**User:** @bangnokia
**Stack:** GitHub + OpenCode + OpenClaw + Telegram

OpenCode finishes a change → opens PR → OpenClaw reviews the diff and replies in Telegram with suggestions and merge verdict.

### 2. Voice-Controlled Home Automation
**Platform:** iOS/Android nodes paired to Gateway

Use voice notes → OpenClaw transcribes → executes commands → responds via Telegram/Signal

### 3. Automated Research Assistant
**Tools:** web_search + browser + memory

- Research topics via web search
- Browse pages for detailed info
- Store findings in semantic memory
- Summarize and deliver via Telegram

### 4. Code Review & Debugging
**Tools:** exec, read, browser, message

- Pull code from repos
- Run tests, analyze errors
- Browse documentation
- Post reviews to Discord/Slack

### 5. Personal Knowledge Base
**Tools:** memory_search, web_fetch, message

- Ingest articles via web_fetch
- Store in semantic memory
- Answer questions from stored knowledge
- Deliver via any channel

### 6. Multi-Agent Orchestration
**Tools:** sessions_spawn, subagents

- Spawn specialized sub-agents for different tasks
- Coordinate research + coding + messaging
- Aggregate results and deliver

---

## Setup Variations

### Minimal Setup (Free)
```
- Model: MiniMax (free tier available)
- STT: faster-whisper (local)
- Search: Public SearXNG (rate-limited) or browser tool
- TTS: espeak (system) or wait for Google key
```

### Recommended Production Setup
```
- Model: Anthropic Claude Opus (Pro/Max)
- STT: Faster-Whisper (local) or Deepgram
- Search: Brave Search API ($5/mo)
- TTS: Google Gemini TTS or Resemble AI
- Storage: Supabase for persistence
```

### Advanced / Power User
```
- Multiple agents (coding, research, support)
- Custom tool profiles per agent
- Paired mobile nodes for camera/location
- Canvas for interactive UI
- Cron jobs for automation
```

---

## Configuration Examples

### Enable Audio Transcription
```json
{
  "tools": {
    "media": {
      "audio": {
        "enabled": true,
        "models": [{
          "type": "cli",
          "command": "/home/drg/.openclaw/workspace/scripts/whisper-transcribe",
          "args": ["{{MediaPath}}"]
        }]
      }
    }
  }
}
```

### Tool Security Profile
```json
{
  "tools": {
    "profile": "coding",
    "deny": ["exec", "process"]
  }
}
```

### Multi-Channel Config
```json
{
  "channels": {
    "telegram": { "enabled": true },
    "discord": { "enabled": true, "guilds": [...] }
  }
}
```

---

## Skills System

OpenClaw supports **AgentSkills** — packaged prompts with scripts and assets for specialized tasks.

**Available Skills (via ClawHub):**
- `clawhub` — Search, install, publish skills
- `healthcheck` — Security hardening
- `mcporter` — MCP server integration
- `oracle` — Prompt + file bundling
- `skill-creator` — Create new skills
- `tmux` — Remote terminal control
- `video-frames` — FFmpeg extraction
- `weather` — Weather forecasts

**Install a skill:**
```bash
clawhub install <skill-name>
```

---

## Recommended Next Steps

### For Your Setup (Priority Order)

1. **Get Google API key** → Enable Gemini TTS in Insight app
2. **Configure Brave Search** → Reliable web search ($5/mo)
3. **Set up tool profiles** → Secure multi-agent config
4. **Add cron jobs** → Morning digests, health checks
5. **Pair mobile nodes** → Camera/location automation

### Exploration Ideas

1. **Voice automation pipeline:** Voice note → faster-whisper → LLM → TTS → response
2. **Research agent:** Spawn sub-agent for deep research, store in memory
3. **Home automation hub:** Receive commands via Telegram, control via exec/nodes
4. **Code review bot:** GitHub webhook → OpenClaw → Discord review

---

## Resources

| Resource | URL |
|----------|-----|
| Docs | https://docs.openclaw.ai |
| GitHub | https://github.com/openclaw/openclaw |
| Discord | https://discord.gg/clawd |
| ClawHub | https://clawhub.com |
| Showcase | https://docs.openclaw.ai/start/showcase |

---

*Last updated: 2026-02-28*
*Compiled from official docs and community showcase*
