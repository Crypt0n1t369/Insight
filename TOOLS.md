# TOOLS.md - Updated Tools Inventory

---

## OpenClaw Built-in Tools (Available Now)

### web_fetch
- **Capabilities:** HTTP GET → extract readable content (HTML → markdown/text)
- **Limitation:** No JavaScript execution
- **Use:** Lightweight page scraping, text extraction

### web_search
- **Capabilities:** Web search via configured provider (Brave/Perplexity/Gemini)
- **Requirement:** API key (Brave $5/mo)
- **Status:** Currently not configured (no API key)

### browser
- **Capabilities:** Full browser automation (Chrome/Chromium via CDP)
- **Use:** JS-heavy sites, complex interactions, form filling, full-page extraction

---

## In-House Research Tools

### scripts/research/fetch.py
- **Deep extraction** using trafilatura (local, free)
- **Usage:** `python3 scripts/research/fetch.py <url>`
- **Requires:** `~/.venv/research` (already set up)

### scripts/memory/capture.py
- **Quick capture** to second brain inbox
- **Usage:** `python3 scripts/memory/capture.py "note content" --tag=research`

### Browser Tool (Recommended)
- **Full capabilities:** Navigate, extract, interact
- **Best for:** JS-heavy sites, login-required pages, dynamic content

---

## Research Workflow

### Option 1: Quick (web_fetch)
```
web_fetch url="https://example.com"
```

### Option 2: Deep (trafilatura)
```
python3 scripts/research/fetch.py https://example.com
```

### Option 3: Full Browser
```
browser action=navigate targetUrl="https://example.com"
```

### Option 4: Interactive Search
```
browser action=navigate targetUrl="https://duckduckgo.com"
# Then type in search box
```

---

## Free Search Alternatives

### Public SearXNG Instances (Rate Limited)
- searxng.site
- searxng.website
- searx.tiekoetter.com

### Self-Hosted (Recommended for Privacy)
- **SearXNG** - Docker install, full control
- **Perplexica** - AI-powered (needs resources)

### Browser-Based
- DuckDuckGo (lite: html.duckduckgo.com)
- Google (via browser tool)

---

## Installed Packages

### ~/.venv/research/
- trafilatura (2.0.0) - Content extraction
- beautifulsoup4 (4.14.3) - HTML parsing
- lxml (6.0.2) - XML/HTML processing
- requests (2.32.5) - HTTP client

### ~/.venv/whisper/
- faster-whisper (1.2.1) - Local speech-to-text

---

## Cost Analysis

| Method | Cost | Quality | Speed |
|--------|------|---------|-------|
| web_fetch | Free | Good (text) | Fast |
| browser | Free | Best (full) | Slow |
| trafilatura | Free | Best (text) | Medium |
| Brave Search | $5/mo | Good | Fast |
| Perplexity API | $$$ | Best | Fast |

---

*Updated: 2026-03-01*
