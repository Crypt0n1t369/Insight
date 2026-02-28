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

## Free Web Search
- **Status:** Research done, setup blocked
- **Findings:**
  - Public SearXNG instances: rate-limited, unreliable
  - Perplexica: Docker pull keeps terminating (resource issue)
  - Brave Search: $5/mo, reliable (recommended)
  - Browser tool: Already available in OpenClaw, works for scraping
- **Recommendation:** Use Brave Search ($5/mo) or existing browser tool
- **Added:** 2026-02-28

## 2026-02-28 (Evening) - Wakeup Assessment

### Completed This Session
1. ✅ Verified Audio Tool build passes (npm run build - 15.23s)
2. ✅ Verified app running on port 3001 (HTTP 200)
3. ✅ Health checks pass (9/9 after commit)
4. ✅ Git repository clean
5. ✅ Committed pending changes

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Audio Tool (Insight) | 🟡 Running but needs API key | Port 3001 responding, build OK |
| Ollama | ✅ Running | Available if needed |
| Health Check | ✅ Passing | 9/9 checks OK |
| Git | ✅ Clean | Just committed |

### What's Working
- ✅ Frontend builds successfully (832KB bundle)
- ✅ 8 clinical protocols implemented
- ✅ Audio system (TTS, binaural, soundscapes)
- ✅ Conversational check-in flow
- ✅ Session management

### What's Blocked / Remaining
1. **API Key Needed** - User must provide:
   - `VITE_GOOGLE_API_KEY` from https://aistudio.google.com/app/apikey
2. **Testing** - Happy path verification pending API key
3. **Perplexica** - On hold (port conflict resolved - now on 3001)

### What's Next (Priority Order)
1. **User provides Google API key** - Enables Gemini TTS
2. **Test happy path** - Complete a stabilization session with audio
3. **Implement iCOVER/NSDR** as primary MVP flow
4. **Build WOOP specialist** (lower complexity)

---
*Previous entries archived above*
