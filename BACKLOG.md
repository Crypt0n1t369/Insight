# Backlog

## Solar Scout - COMPLETED ✅
- **Status:** Fully Operational
- **Results:** 51 qualified leads (companies WITHOUT solar panels)
- **Top Leads:** Grindeks (2615 kW), Valmieras Stikla Skiedra (3038 kW), Alutech (2721 kW)
- **Data:** companies_final.json with decision maker enrichment
- **Output:** 120 annotated satellite images in output/images/
- **Dashboard:** dashboard.html ready (uses hardcoded demo data)
- **Completed:** 2026-02-28

## Audio Transformation Tool
- **Status:** Running but blocked by API key
- **Location:** projects/audio-transformation-tool/code/ (port 3001)
- **Requires:** VITE_GOOGLE_API_KEY in .env.local
- **Completed:** Build verified, 8 clinical protocols implemented
- **Next:** Test happy path once API key provided

---

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
4. ✅ Git repository clean (committed 527 files)
5. ✅ Updated progress documentation

### Current State (2026-02-28 21:26)

| Component | Status | Notes |
|-----------|--------|-------|
| Audio Tool (Insight) | 🟡 Running but needs API key | Port 3001 responding, build OK |
| Solar Scout | ✅ Completed | 51 leads, dashboard ready |
| Ollama | ✅ Running | Available if needed |
| Health Check | ✅ Passing | 9/9 checks OK |
| Git | ✅ Clean | Just committed |

### What's Working
- ✅ Frontend builds successfully (832KB bundle)
- ✅ 10 clinical protocols implemented
- ✅ Audio system (TTS, binaural, soundscapes)
- ✅ Conversational check-in flow
- ✅ Session management
- ✅ App serves on port 3001
- ✅ Solar Scout dashboard complete

### What's Blocked / Remaining
1. **API Key Needed** - User must provide:
   - `VITE_GOOGLE_API_KEY` from https://aistudio.google.com/app/apikey
   - Template already at: `projects/audio-transformation-tool/code/.env.local`
2. **Testing** - Happy path verification pending API key

### What's Next (Priority Order)
1. **User provides Google API key** - Enables Gemini TTS
2. **Test happy path** - Complete a stabilization session with audio
3. **Implement iCOVER/NSDR** as primary MVP flow
4. **Build WOOP specialist** (lower complexity)

---
*Previous entries archived above*
