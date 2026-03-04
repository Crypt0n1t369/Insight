# PROJECTS.md - Project Index

## Active Projects

### 1. Audio Transformation Tool
- **Status:** Running (Demo Mode works without API key)
- **Summary:** Audio-based transformation platform (wellness → military → enterprise → individual development)
- **Path:** `projects/audio-transformation-tool/code/` (Vite + React)
- **Runtime:** Port 3001 (HTTP 200 verified Mar 3, 10:26 PM)
- **Demo Mode:** ✅ Works without API key (Web Speech API fallback)
- **Protocol-Specific Demo Content:** ✅ NSDR, IFS, ACT, WOOP, NVC, SOMATIC_AGENCY + DEFAULT
- **Git:** ✅ Fork synced (current HEAD 9338e02)
- **Build:** ✅ Clean (16.82s), PWA v1.2.0
- **PWA:** ✅ Offline support enabled (service worker, 11 precache entries)
- **Deploy:** ✅ Vercel config ready - user needs to connect repo in Vercel dashboard
- **Next:** Vercel deploy (user action: go to vercel.com → import Crypt0n1t369/Insight)

### 2. Solar Scout (Lead Generator) - COMPLETED ✅
- **Status:** Fully Operational (No pending tasks)
- **Summary:** Latvia manufacturing company lead generator with solar detection
- **Path:** `solar-scout/` (not projects/)
- **Results:** 70 total leads (51 qualified companies WITHOUT solar)
- **Top Leads:** 
  - Grindeks: 2,615 kW potential - Juris Bundulis (Chairman)
  - Valmieras Stikla Skiedra: 3,038 kW - Janis Siliņš (Production Director)
  - Alutech: 2,721 kW - Maris Krastins (Director)
- **Output:** companies_final.json + 120 annotated images

---

## Adding New Projects

1. Create folder under `projects/`
2. Add README.md with overview
3. Add CONTEXT.md with current status
4. Add DECISIONS.md to track choices
5. Update this file
