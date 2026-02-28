# Tools Inventory

A comprehensive list of all installed tools, their capabilities, and use cases.

---

## System Tools (Pre-installed)

### ffmpeg
- **Type:** System utility
- **Capabilities:** Audio/video encoding, conversion, streaming
- **Use case:** Audio processing, media conversion

### git
- **Type:** Version control
- **Capabilities:** Source code management, versioning
- **Use case:** Code repository management

### curl / wget
- **Type:** HTTP clients
- **Capabilities:** Download files, make HTTP requests, API calls
- **Use case:** Web scraping, API testing, file downloads

### python3
- **Type:** Runtime
- **Capabilities:** Python scripting, automation
- **Use case:** General automation, custom scripts

### node / npm
- **Type:** JavaScript runtime
- **Capabilities:** Node.js execution, package management
- **Use case:** Running OpenClaw, JavaScript automation

---

## OpenClaw Built-in Tools

### web_search
- **Type:** OpenClaw tool
- **Capabilities:** Web search via configured provider (Brave/Perplexity/Gemini)
- **Requirements:** API key (Brave has $5/mo free tier)
- **Use case:** General web research

### web_fetch
- **Type:** OpenClaw tool
- **Capabilities:** HTTP GET + extract readable content (HTML → markdown/text)
- **Limitation:** No JavaScript execution
- **Use case:** Lightweight page scraping

### browser
- **Type:** OpenClaw tool
- **Capabilities:** Full browser automation (Chrome/Chromium via CDP)
- **Use case:** JS-heavy sites, complex interactions, form filling

### message
- **Type:** OpenClaw tool
- **Capabilities:** Send messages via Telegram/Discord/Signal/etc
- **Use case:** Cross-channel messaging, notifications

### exec
- **Type:** OpenClaw tool
- **Capabilities:** Run shell commands
- **Security:** Configurable (gateway/sandbox/full)

### image
- **Type:** OpenClaw tool
- **Capabilities:** Analyze images with vision models
- **Use case:** Image understanding, OCR

### tts
- **Type:** OpenClaw tool
- **Capabilities:** Text-to-speech output
- **Provider:** OpenAI or ElevenLabs

### nodes
- **Type:** OpenClaw tool
- **Capabilities:** Control paired mobile devices
- **Use case:** Camera, location, notifications, screen capture

---

## Installed Python Packages

### faster-whisper
- **Type:** Local STT (Speech-to-Text)
- **Version:** 1.2.1
- **Model:** tiny (int8, CPU)
- **Capabilities:** Transcribe audio to text locally
- **Use case:** Voice note transcription (no API key needed)
- **Path:** `~/.venv/whisper/bin/python`
- **Setup date:** 2026-02-28

---

## Open Source Alternatives (Not Installed)

### Web Search (Installed)

#### Public SearXNG Instances (Free, Rate-Limited)
- **URLs:** searxng.site, searxng.website, searx.tiekoetter.com, searxng.canine.tools
- **Cost:** Free
- **Limitations:** Heavy rate-limiting, may be blocked
- **Use:** Quick tests only

#### Perplexica (Not Working)
- **Type:** AI-powered search engine
- **Status:** Docker pull keeps terminating (resource constraints)
- **Alternative:** Could try non-Docker install later

#### Brave Search API (Recommended)
- **Cost:** $5/month (2000+ searches)
- **URL:** brave.com/search/api
- **Setup:** Get API key, configure in OpenClaw

### Web Scraping

#### Trafilatura
- **Type:** Python library
- **Cost:** Free
- **Capabilities:** Extract main text, metadata, comments from web pages
- **Use case:** Clean text extraction without JS

#### Firecrawl
- **Type:** AI web scraper
- **Cost:** Cloud + self-hosted options
- **Capabilities:** Turn websites into LLM-ready markdown
- **Use case:** AI data extraction

#### Scrapy
- **Type:** Python framework
- **Cost:** Free
- **Capabilities:** Full-featured web crawler
- **Use case:** Large-scale crawling

---

## Recommendations

### For Free Search:
1. **Use public SearXNG instance** - searx.space (no setup)
2. **Self-host SearXNG** - If you want privacy/control
3. **Brave Search** - $5/mo for reliable API

### For Free Scraping:
1. **Use OpenClaw browser tool** - Already available, handles JS
2. **Use web_fetch** - Lightweight, no JS needed

### For Voice Transcription:
1. **Use faster-whisper** - Already installed, free, local

---

## Configuration Notes

### Audio Transcription (faster-whisper)
```bash
# Test manually:
~/.venv/whisper/bin/python -c "from faster_whisper import WhisperModel; ..."
# Or use wrapper script:
/home/drg/.openclaw/workspace/scripts/whisper-transcribe <audio_file>
```

### OpenClaw Config Location
```
~/.openclaw/openclaw.json
```

### Backup Location
```
~/.openclaw/openclaw.json.bak
```

---

*Last updated: 2026-02-28*
