"""
Phase 1: Company Discovery Module
Finds small to mid-size manufacturing companies with factories in Latvia
Uses direct HTTP requests instead of OpenClaw tools
"""

import json
import asyncio
import urllib.request
import urllib.parse
import re
from datetime import datetime
import ssl

# Latvian company data sources
DATA_SOURCES = [
    "https://www.lursoft.lv/lv/kompānijas",
    "https://www.lvportals.lv/",
]

# Search queries for discovery
QUERIES = [
    "manufacturing company Latvia factory",
    "industrial factory Latvia manufacturing",
    "metalworking company Latvia",
    "Latvia manufacturing companies list",
]

# Known industrial cities in Latvia
INDUSTRIAL_AREAS = [
    "Riga", "Liepaja", "Daugavpils", "Jelgava", "Ventspils", 
    "Rezekne", "Jekabpils", "Ogre", "Salaspils", "Marupe"
]


async def search_web(query: str) -> list:
    """
    Perform web search using a public search API
    Uses DuckDuckGo HTML (no API key needed)
    """
    url = f"https://duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    results = []
    
    try:
        req = urllib.request.Request(url, headers=headers)
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(req, timeout=15, context=ctx) as response:
            html = response.read().decode('utf-8')
            
            # Parse results (simple regex approach)
            # Look for result blocks
            import re
            
            # Match result blocks
            pattern = r'<a class="result__a" href="([^"]+)"[^>]*>([^<]+)</a>.*?<a class="result__snippet"[^>]*>([^<]+)</a>'
            matches = re.findall(pattern, html, re.DOTALL)
            
            for url, title, snippet in matches[:10]:
                # Clean up
                title = re.sub(r'<[^>]+>', '', title)
                snippet = re.sub(r'<[^>]+>', '', snippet)
                
                results.append({
                    "title": title.strip(),
                    "url": url.strip(),
                    "snippet": snippet.strip()[:200]
                })
                
    except Exception as e:
        print(f"Search error for '{query}': {e}")
    
    return results


async def discover_companies(max_results=30):
    """
    Discover manufacturing companies in Latvia through web search
    """
    discovered = []
    seen_names = set()
    
    print(f"🔍 Starting company discovery (target: {max_results})...")
    
    # Also try to fetch from business directories
    print("  Fetching business directories...")
    
    # Try Lursoft company list
    try:
        url = "https://www.lursoft.lv/lv/kompānijas?page=1"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        with urllib.request.urlopen(req, timeout=15, context=ctx) as response:
            html = response.read().decode('utf-8')
            print(f"  Got {len(html)} bytes from Lursoft")
            
    except Exception as e:
        print(f"  Lursoft fetch error: {e}")
    
    # Search queries
    for query in QUERIES:
        print(f"  Searching: {query}")
        
        results = await search_web(query)
        
        for result in results:
            title = result.get("title", "")
            url = result.get("url", "")
            snippet = result.get("snippet", "")
            
            # Skip duplicates
            if title in seen_names:
                continue
            seen_names.add(title)
            
            # Clean company name
            company_name = clean_company_name(title)
            
            if company_name and len(company_name) > 3:
                discovered.append({
                    "name": company_name,
                    "source_url": url,
                    "snippet": snippet,
                    "discovered_at": datetime.now().isoformat(),
                    "search_query": query
                })
        
        print(f"    Found {len(results)} results")
        
        # Limit
        if len(discovered) >= max_results:
            break
    
    # Deduplicate
    unique = {}
    for c in discovered:
        key = c["name"].lower().strip()
        if key not in unique:
            unique[key] = c
    
    final = list(unique.values())
    print(f"✅ Discovery complete: {len(final)} unique companies")
    
    return final[:max_results]


def clean_company_name(title: str) -> str:
    """Clean up company name from search result"""
    # Remove common suffixes
    title = re.sub(r'\s*[-|–]\s*Wikipedia.*$', '', title, flags=re.I)
    title = re.sub(r'\s*[-|–]\s*.*(Latvia|LV).*$', '', title, flags=re.I)
    title = re.sub(r'\s*\|\s*.*$', '', title)
    
    return title.strip()[:60]


async def fetch_company_details(url: str) -> dict:
    """
    Fetch additional details from company website
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
            
            # Extract email
            email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', html)
            email = email_match.group(0) if email_match else ""
            
            # Extract phone
            phone_match = re.search(r'\+?371[\s\-]?\d{8}', html)
            phone = phone_match.group(0) if phone_match else ""
            
            # Extract address (rough)
            addr_match = re.search(r'(?:Adrese|Address)[:\s]+([^<\n]{10,80})', html, re.I)
            address = addr_match.group(1).strip() if addr_match else ""
            
            return {"email": email, "phone": phone, "address": address}
            
    except Exception as e:
        return {}


async def enrich_from_company_pages(companies):
    """
    Enrich company data from their websites
    """
    enriched = []
    
    for company in companies[:10]:  # Limit to avoid too many requests
        url = company.get("source_url", "")
        
        if not url or "wikipedia" in url.lower():
            enriched.append(company)
            continue
        
        print(f"  Fetching: {company['name'][:30]}...")
        
        details = await fetch_company_details(url)
        
        company.update({
            "address": details.get("address", ""),
            "phone": details.get("phone", ""),
            "email": details.get("email", ""),
            "website": url
        })
        
        enriched.append(company)
        
        await asyncio.sleep(0.5)  # Rate limit
    
    return enriched


async def run_discovery():
    """Main execution for discovery phase"""
    print("\n" + "="*60)
    print("PHASE 1: COMPANY DISCOVERY")
    print("="*60)
    
    # Step 1: Search for companies
    companies = await discover_companies(max_results=25)
    
    # Step 2: Enrich from websites
    print("\n🌐 Enriching company data...")
    enriched = await enrich_from_company_pages(companies)
    
    # Save raw results
    output_file = "/home/drg/.openclaw/workspace/solar-scout/data/companies_raw.json"
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Saved {len(enriched)} companies")
    
    return enriched


if __name__ == "__main__":
    asyncio.run(run_discovery())
