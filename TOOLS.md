# TOOLS.md - Updated Tools Inventory

---

## OpenClaw Built-in Tools

### web_fetch
- **Capabilities:** HTTP GET → extract readable content
- **Limitation:** No JavaScript
- **Use:** Quick text extraction

### browser  
- **Capabilities:** Full browser automation (Chrome/Chromium)
- **Use:** JS-heavy sites, interactive pages

---

## Advanced Scraping (In-House)

### 1. browser (Recommended for JS sites)
```bash
browser action=navigate targetUrl="https://example.com"
browser action=snapshot
```

### 2. Scrapy (Full framework)
```bash
# Install: already in ~/.venv/research/
source ~/.venv/research/bin/activate

# Quick fetch
scrapy fetch https://example.com

# Interactive shell
scrapy shell https://example.com

# Run spider
scrapy runspider spider.py
```

### 3. Custom Spiders

```bash
# Basic spider
python3 scripts/scraper/spider.py run https://example.com

# Multi-page crawl
python3 scripts/scraper/crawl.py --url "https://example.com" --depth 2

# Save to memory
python3 scripts/scraper/spider.py run https://example.com --save
```

---

## Research Tools

### web_fetch (lightweight)
```bash
web_fetch url="https://example.com"
```

### trafilatura (deep text extraction)
```bash
~/.venv/research/bin/python -c "
import trafilatura
print(trafilatura.extract(trafilatura.fetch_url('https://example.com')))
"
```

---

## Memory Integration

### Capture scraped content
```bash
python3 scripts/memory/capture.py "insights from..." --tag=scraped
```

---

## Cost: FREE

| Tool | Cost | Best For |
|------|------|----------|
| browser | Free | JS sites, interactive |
| web_fetch | Free | Static text |
| Scrapy | Free | Large-scale crawl |
| trafilatura | Free | Clean text extraction |

---

*Updated: 2026-03-01*
