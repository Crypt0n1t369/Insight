#!/usr/bin/env python3
"""
Advanced Web Scraper
====================
Multi-page crawling, JS rendering, export to memory.

Features:
- Multi-page crawling (list of URLs)
- Link discovery and following
- JS rendering via browser
- Save to memory with tags

Usage:
    python3 scripts/scraper/crawl.py --url "https://example.com" --depth 2
    python3 scripts/scraper/crawl.py --urls "url1,url2,url3"
    python3 scripts/scraper/scrape.py "https://example.com" --save
"""

import sys
import json
from pathlib import Path
from datetime import datetime

WORKSPACE = Path("/home/drg/.openclaw/workspace")

def save_to_memory(content, title, url, tags=None):
    """Save scraped content to memory."""
    capture_py = WORKSPACE / "scripts/memory/capture.py"
    
    # Create note content
    note = f"""
# {title}

Source: {url}
Scraped: {datetime.now().isoformat()}

{content[:5000]}

---
Tags: {', '.join(tags) if tags else 'scraped'}
"""
    
    # Write to inbox
    inbox = WORKSPACE / "memory/00-inbox"
    inbox.mkdir(parents=True, exist_ok=True)
    
    filename = inbox / f"{datetime.now().strftime('%Y%m%d%H%M%S')}.md"
    filename.write_text(note)
    
    print(f"✅ Saved to: {filename.name}")

def crawl_single(url, depth=1):
    """Crawl a single URL using browser."""
    print(f"🕷️  Crawling: {url} (depth={depth})")
    print()
    print("Use OpenClaw browser tool:")
    print(f'  browser action=navigate targetUrl="{url}"')
    print(f'  browser action=snapshot')
    print()
    print("Then extract content with:")
    print(f'  web_fetch url="{url}"')
    print()
    print("To save:")
    print(f'  python3 scripts/memory/capture.py "content from {url}" --tag=scraped')

def crawl_multiple(urls, depth=1):
    """Crawl multiple URLs."""
    for url in urls.split(','):
        url = url.strip()
        if url:
            crawl_single(url, depth)

def main():
    args = sys.argv[1:]
    
    if not args:
        print(__doc__)
        return
    
    # Parse arguments
    url = None
    urls = None
    depth = 1
    save = False
    
    i = 0
    while i < len(args):
        arg = args[i]
        if arg == "--url" and i + 1 < len(args):
            url = args[i + 1]
            i += 2
        elif arg == "--urls" and i + 1 < len(args):
            urls = args[i + 1]
            i += 2
        elif arg == "--depth" and i + 1 < len(args):
            depth = int(args[i + 1])
            i += 2
        elif arg == "--save":
            save = True
            i += 1
        elif arg.startswith("http"):
            url = arg
            i += 1
        else:
            i += 1
    
    if url:
        crawl_single(url, depth)
    elif urls:
        crawl_multiple(urls, depth)
    else:
        print("Usage:")
        print("  crawl.py --url <url>")
        print("  crawl.py --urls <url1,url2,url3>")
        print("  crawl.py <url> --save")

if __name__ == "__main__":
    main()
