# Backlog

## Open Source Web Scraping
- **Status:** Research Complete
- **Findings:**
  - **Trafilatura** - Python tool for extracting text/metadata from web pages (no JS)
  - **Firecrawl** - AI-powered web scraping (has cloud, self-hosted option)
  - **Scrapy** - Classic Python crawling framework
  - **Crawlee** - Node.js web scraping (Playwright/Puppeteer)
  - **curl_cffi** - Python curl-impersonate for bypassing bot detection
- **Note:** OpenClaw already has browser automation + web_fetch built-in
- **Completed:** 2026-02-28

## Free Web Search (Research Complete)
- **Status:** Done
- **Findings:**
  - **SearXNG** - Self-hosted metasearch engine (aggregates Bing, Google, DuckDuckGo, etc). No API key needed. Requires self-hosting.
  - **DuckDuckGo** - Has instant answer API (unofficial, rate limited)
  - **Brave Search** - $5 free credits/month (recommended)
  - **Existing tools** - curl/wget available for basic scraping
- **Recommendation:** Brave Search ($5/mo free) or self-hosted SearXNG
- **Completed:** 2026-02-28

## 2026-02-28 (Evening) - Wakeup Assessment

### Completed This Session
1. ✅ Committed pending changes (TOOLS.md, CONTEXT.md, BACKLOG.md, Perplexica, memory file, whisper-transcribe)
2. ✅ Verified Audio Transformation Tool running at http://localhost:3000
3. ✅ Verified Ollama running with qwen2.5 models available
4. ✅ Health checks pass (9/9)
5. ✅ Git repository clean

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Audio Tool (Insight) | 🟡 Running but incomplete | Running on port 3000, missing API keys |
| Perplexica | 🟡 Cloned, not running | Image pulled but port 3000 busy |
| Ollama | ✅ Running | qwen2.5:1.5b, qwen2.5:0.5b available |
| Health Check | ✅ Passing | 9/9 checks OK |
| Git | ✅ Clean | All changes committed |

### What's Working
- ✅ Insight app builds and serves
- ✅ 8 clinical protocols implemented
- ✅ Audio system (TTS, binaural, soundscapes)
- ✅ Conversational check-in flow
- ✅ Session management

### What's Blocked / Remaining
1. **API Keys Needed** - For full functionality:
   - `VITE_GOOGLE_API_KEY` - Required for Gemini TTS
   - User needs to provide from https://aistudio.google.com/app/apikey
2. **Perplexica Setup** - Port 3000 occupied by Insight; needs alternative port or stopping Insight
3. **Testing** - Happy path verification pending API key

### What's Next (Priority Order)
1. **Get Google API key** from user to enable Gemini TTS
2. **Test happy path** - complete a stabilization session with audio
3. **Implement iCOVER/NSDR** as primary MVP flow
4. **Build WOOP specialist** (lower complexity)
5. **Set up Perplexica** on alternative port if needed

---
*Previous entries archived above*
