#!/usr/bin/env python3
"""
Research Helper
===============
Simplified research using OpenClaw's built-in tools.

Usage:
    # This script documents available options - just use OpenClaw tools directly:
    
    # 1. Lightweight fetch (no JS)
    web_fetch url="https://example.com"
    
    # 2. Full browser (JS OK) 
    browser action=navigate targetUrl="https://example.com"
    browser action=snapshot
    
    # 3. Search (via browser to duckduckgo)
    browser action=navigate targetUrl="https://duckduckgo.com"
"""

import sys

def main():
    print("""
🔬 Research Tools (Use These Directly)
=======================================

📄 web_fetch - Quick text extraction
-------------------------------------
web_fetch url="https://example.com"

✅ Fast, no JS
⚠️ Limited to static content

🌐 browser - Full browser automation
--------------------------------------
browser action=navigate targetUrl="https://example.com"
browser action=snapshot
browser action=console

✅ Full JS support
✅ Interactive
⚠️ Slower

🔍 Search
---------
Use browser to navigate to:
- https://duckduckgo.com
- https://searx.org
- https://html.duckduckgo.com (lite)

💾 Save to Memory
------------------
python3 scripts/memory/capture.py "insights..." --tag=research
""")

if __name__ == "__main__":
    main()
