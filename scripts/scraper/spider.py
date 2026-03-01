#!/usr/bin/env python3
"""
Scrapy Spider Template
======================
Run with: scrapy runspider scripts/scraper/spider.py -a url=URL

Or use the wrapper:
    python3 scripts/scraper/spider.py run URL
    python3 scripts/scraper/spider.py crawl URL
"""

import sys
import subprocess
from pathlib import Path

SCRAPY = Path(sys.executable).parent / "scrapy"
RESEARCH_PY = Path.home() / ".venv/research/bin/python"

WORKSPACE = Path("/home/drg/.openclaw/workspace")

def run_spider(url, output="scraped.json"):
    """Run a basic Scrapy spider."""
    
    spider_code = f'''
import scrapy
import json

class BasicSpider(scrapy.Spider):
    name = "basic"
    start_urls = ["{url}"]
    
    def parse(self, response):
        self.logger.info(f"Scraped: {{response.url}}")
        
        yield {{
            "url": response.url,
            "title": response.css("title::text").get(),
            "headlines": response.css("h1::text, h2::text").getall()[:10],
            "links": response.css("a::attr(href)").getall()[:20],
            "text": response.css("p::text").getall()[:50],
        }}
'''
    
    # Write spider
    spider_file = WORKSPACE / "temp_spider.py"
    spider_file.write_text(spider_code)
    
    # Run scrapy
    result = subprocess.run(
        ["scrapy", "runspider", str(spider_file), "-o", output, "--nolog"],
        capture_output=True,
        text=True,
        cwd=str(WORKSPACE)
    )
    
    if result.returncode == 0:
        # Read output
        if Path(output).exists():
            data = json.loads(Path(output).read_text())
            print(f"✅ Scraped: {url}")
            print(f"   Title: {data[0].get('title', 'N/A')}")
            print(f"   Links found: {len(data[0].get('links', []))}")
            
            # Save to memory
            inbox = WORKSPACE / "memory/00-inbox"
            inbox.mkdir(parents=True, exist_ok=True)
            
            from datetime import datetime
            filename = inbox / f"scraped_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
            
            # Save as markdown
            md = f"""# Scraped: {data[0].get('title', url)}
Source: {url}

## Links Found
"""
            for link in data[0].get('links', [])[:10]:
                md += f"- {link}\n"
            
            md += f"""
## Text Preview
"""
            for text in data[0].get('text', [])[:10]:
                if text.strip():
                    md += f"- {text.strip()}\n"
            
            (inbox / filename.with_suffix(".md")).write_text(md)
            print(f"   Saved to memory")
        else:
            print("⚠️ No output")
    else:
        print(f"Error: {result.stderr[:500]}")

def main():
    args = sys.argv[1:]
    
    if len(args) < 2:
        print(__doc__)
        print("\nUsage:")
        print("  python3 scripts/scraper/spider.py run https://example.com")
        return
    
    command = args[0]
    url = args[1]
    
    if command == "run":
        run_spider(url)
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
