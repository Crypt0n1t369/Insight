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
1. ✅ Verified Audio Tool running on port 3001 (HTTP 200)
2. ✅ Build verified working (npm run build passes)
3. ✅ Frontend serves correctly
4. ✅ Progress documentation updated
5. ✅ Checked .env.local template (API key pending user action)

### Current State (2026-02-28 21:56)

| Component | Status | Notes |
|-----------|--------|-------|
| Audio Tool (Insight) | 🟡 Running but needs API key | Port 3001 responding (HTTP 200), build OK |
| Solar Scout | ✅ Completed | 51 leads, dashboard ready |
| Health Check | ✅ Passing | 9/9 checks OK |
| Git | ✅ Clean | Previously committed |

### What's Working
- ✅ Frontend builds successfully
- ✅ 10 clinical protocols implemented (NSDR, IFS, SOMATIC_AGENCY, ACT, FUTURE_SELF, WOOP, NVC, IDENTITY, NARRATIVE, GENERAL)
- ✅ Audio system (TTS via Gemini, binaural beats, soundscapes)
- ✅ Conversational check-in flow with 4 themes (SAFETY→NSDR, SPARK→WOOP, POWER→ACT, FLOW→NVC)
- ✅ Session management and reflection system
- ✅ App serves on port 3001
- ✅ .env.local template in place

### What's Blocked / Remaining
1. **API Key Required** - User must provide:
   - `VITE_GOOGLE_API_KEY` from https://aistudio.google.com/app/apikey
   - Add to: `projects/audio-transformation-tool/code/.env.local`
2. **Testing** - Happy path verification pending API key

### What's Next (Priority Order)
1. **User provides Google API key** - Enables Gemini TTS and AI features
2. **Test happy path** - Complete a full stabilization session with audio
3. **Fix any issues** discovered during testing
4. **Deploy** to production (Vercel/Netlify)

---
*Previous entries archived above*
