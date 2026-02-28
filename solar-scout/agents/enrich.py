"""
Phase 5: Decision Maker Enrichment
Finds contact info for high-level decision makers at target companies
"""

import json
import re
import os
import time
import asyncio
import urllib.request
import urllib.parse
import ssl

# Common Latvian decision maker titles
DECISION_MAKER_TITLES = [
    "ceo", "managing director", "general manager", "owner",
    "operations director", "facilities manager", "technical director",
    "valdes priekssedetajs", "generaldirektors", "razosanas direktors"
]


async def search_web(query: str) -> list:
    """
    Perform web search using DuckDuckGo HTML
    """
    url = f"https://duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    results = []
    
    try:
        req = urllib.request.Request(url, headers=headers)
        ctx = ssl.create_default_context()
        
        with urllib.request.urlopen(req, timeout=15, context=ctx) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            pattern = r'<a class="result__a" href="([^"]+)"[^>]*>([^<]+)</a>.*?<a class="result__snippet"[^>]*>([^<]+)</a>'
            matches = re.findall(pattern, html, re.DOTALL)
            
            for url, title, snippet in matches[:5]:
                title = re.sub(r'<[^>]+>', '', title).strip()
                snippet = re.sub(r'<[^>]+>', '', snippet).strip()
                
                results.append({
                    "title": title,
                    "url": url,
                    "snippet": snippet
                })
                
    except Exception as e:
        print(f"Search error: {e}")
    
    return results


async def fetch_url(url: str, max_chars: int = 5000) -> str:
    """
    Fetch content from URL
    """
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        })
        
        with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
            html = response.read().decode('utf-8', errors='ignore')
            return html[:max_chars]
            
    except Exception as e:
        return ""


async def search_company_website(company_name: str) -> dict:
    """
    Search for company website and try to find contact info
    """
    # Search for company website
    print(f"   Searching for company website...")
    
    results = await search_web(f'"{company_name}" Latvia company website')
    
    if not results:
        return {}
    
    # Try first result
    url = results[0].get("url", "")
    
    if not url or "wikipedia" in url.lower():
        return {}
    
    print(f"   Checking: {url[:50]}...")
    
    # Fetch website content
    html = await fetch_url(url, max_chars=8000)
    
    if not html:
        return {}
    
    # Extract contact info
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', html)
    email = email_match.group(0) if email_match else ""
    
    phone_match = re.search(r'\+?371[\s\-]?\d{8}', html)
    phone = phone_match.group(0) if phone_match else ""
    
    # Try to find name + title
    # Look for about/team pages
    about_urls = [
        url.rstrip('/') + '/par-mums',
        url.rstrip('/') + '/about',
        url.rstrip('/') + '/team',
        url.rstrip('/') + '/kontakti',
        url.rstrip('/') + '/contact'
    ]
    
    name = ""
    title = ""
    
    for about_url in about_urls:
        html = await fetch_url(about_url, max_chars=8000)
        
        if not html:
            continue
            
        # Look for name patterns near title keywords
        lines = html.split('\n')
        for i, line in enumerate(lines):
            line_lower = line.lower()
            
            if any(t in line_lower for t in ["direktors", "vaditajs", "ceo", "owner", "manager"]):
                # Extract potential name
                # Look for capitalized words near title
                name_match = re.search(r'>([A-ZĒŪĪĀŽČŠ][a-zēūīāžčš]+ [A-ZĒŪĪĀŽČŠ][a-zēūīāžčš]+)<', html[max(0, i*100):i*100+500])
                if name_match:
                    name = name_match.group(1)
                    title = line.strip()[:60]
                    break
        
        if name:
            break
    
    if name or email or phone:
        return {
            "name": name or f"{company_name} Management",
            "title": title or "Management",
            "phone": phone,
            "email": email,
            "url": url
        }
    
    return {}


async def search_linkedin(company_name: str) -> dict:
    """
    Search LinkedIn for company decision makers
    """
    results = await search_web(f'site:linkedin.com "{company_name}" CEO director')
    
    for r in results:
        title = r.get("title", "")
        
        if any(t in title.lower() for t in ["ceo", "owner", "director", "manager"]):
            # Extract name
            name = title.split("|")[0].split("-")[0].strip()
            
            return {
                "name": name,
                "title": title,
                "source": "linkedin"
            }
    
    return {}


async def find_decision_maker(company: dict) -> dict:
    """
    Find decision maker for a company
    """
    name = company.get("name", "")
    
    print(f"\n👤 Finding decision maker for: {name[:40]}")
    
    decision_maker = {
        "name": None,
        "title": None,
        "phone": None,
        "email": None,
        "source": None
    }
    
    # Method 1: Search company website
    dm = await search_company_website(name)
    if dm.get("name") or dm.get("email") or dm.get("phone"):
        decision_maker.update(dm)
        decision_maker["source"] = "company_website"
        print(f"   ✅ Found: {dm.get('name', 'Contact info only')}")
        return decision_maker
    
    # Method 2: Search LinkedIn
    dm = await search_linkedin(name)
    if dm.get("name"):
        decision_maker.update(dm)
        decision_maker["source"] = "linkedin"
        print(f"   ✅ Found on LinkedIn: {dm['name']}")
        return decision_maker
    
    # Method 3: General search
    results = await search_web(f'"{name}" contact email phone')
    
    for r in results:
        snippet = r.get("snippet", "")
        
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', snippet)
        phone_match = re.search(r'\+?371[\s\-]?\d{8}', snippet)
        
        if email_match or phone_match:
            decision_maker.update({
                "name": f"{name} Contact",
                "title": "Management",
                "phone": phone_match.group(0) if phone_match else None,
                "email": email_match.group(0) if email_match else None,
                "source": "web_search"
            })
            print(f"   ✅ Found contact info")
            return decision_maker
    
    print(f"   ❌ No decision maker found")
    decision_maker["source"] = "not_found"
    return decision_maker


async def run_enrichment(companies: list) -> list:
    """
    Enrich all companies with decision maker info
    """
    print("\n" + "="*60)
    print("PHASE 5: DECISION MAKER ENRICHMENT")
    print("="*60)
    
    enriched = []
    
    for company in companies:
        # Only enrich companies WITHOUT solar
        solar = company.get("solar_analysis", {})
        if solar.get("detected") == True:
            enriched.append(company)
            continue
        
        # Skip if no validated address
        if not company.get("validation", {}).get("verified"):
            enriched.append(company)
            continue
        
        # Find decision maker
        dm = await find_decision_maker(company)
        company["decision_maker"] = dm
        
        enriched.append(company)
        
        # Rate limiting
        time.sleep(1.5)
    
    # Save results
    output_file = "/home/drg/.openclaw/workspace/solar-scout/data/companies_enriched.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)
    
    with_dm = len([c for c in enriched if c.get("decision_maker", {}).get("name")])
    
    print(f"\n💾 Enriched companies: {len(enriched)}")
    print(f"   👤 With decision maker: {with_dm}")
    
    return enriched


if __name__ == "__main__":
    async def test():
        company = {"name": "Test Company"}
        result = await find_decision_maker(company)
        print(json.dumps(result, indent=2))
    
    asyncio.run(test())
