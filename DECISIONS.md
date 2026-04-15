# DECISIONS.md - Structured Decision Log

## Purpose
Centralized, searchable record of all key decisions made during project work.

## Format
Each decision follows: DATE | DECISION | RATIONALE | STATUS

---

## 2026-03-01

### Memory System Architecture
- **Decision:** Use hybrid approach (TF-IDF now, vector embeddings later)
- **Rationale:** No external API dependency, works offline, sufficient for keyword search
- **Status:** ✅ Implemented

### Context Management Approach
- **Decision:** File-based context with auto-generation, not Mem0 cloud
- **Rationale:** Free, local, no API key needed, good enough for Phase 0
- **Status:** ✅ Implemented

---

## 2026-02-28

### Audio Tool Demo Mode
- **Decision:** Add Web Speech API fallback for demo without API key
- **Rationale:** Users can test immediately without signup
- **Status:** ✅ Implemented

### Solar Lead Strategy
- **Decision:** Verify via satellite imagery before enrichment
- **Rationale:** Focus on qualified leads (no existing solar)
- **Status:** ✅ Complete (18 eligible leads)

### Audio Tool Protocol Selection
- **Decision:** Start with NSDR, IFS, ACT, WOOP, NVC, SOMATIC_AGENCY
- **Rationale:** Cover core use cases: stabilization, inner conflict, motivation, connection, agency
- **Status:** ✅ Implemented

### Git Strategy
- **Decision:** Single workspace repo, multiple project directories
- **Rationale:** Simpler than monorepo, all context in one place
- **Status:** ✅ Implemented

---

## 2026-02-24

### Solar CRM Platform
- **Decision:** Google Sheets + Apps Script (not custom backend)
- **Rationale:** Secure, free, familiar, no hosting needed
- **Status:** ⚠️ Paused (focus shifted to lead generation)

---

## 2026-02-20

### Model Tier Routing
- **Decision:** 4-tier system (Elite/Balanced/Efficient/Ultralight)
- **Rationale:** Cost control + appropriate model selection per task
- **Status:** ✅ Implemented in AGENTS.md

---

## 2026-02-19

### Health Check Implementation
- **Decision:** 9-check system with automation
- **Rationale:** Proactive monitoring, self-healing
- **Status:** ✅ Implemented (now 11 checks)

---

---

## 2026-03-28

### KGStorage JSON Persistence Path
- **Decision:** Fix KGStorage DATA_DIR path (was 5 levels up, correct to 3 levels up from storage.ts)
- **Rationale:** Sessions were never persisting to disk — in-memory only, lost on restart
- **Status:** ✅ Fixed (commit 6e67677)

### KGStorage forceSave Dirty-Flag
- **Decision:** Set `dirty=true` before `saveSync()` in forceSave()
- **Rationale:** forceSave() called saveSync() without dirty flag, sessions not persisted when dirty=false
- **Status:** ✅ Fixed (commit a4bd2bc)

### KGStorage Autosave
- **Decision:** Add 60-second autosave interval to KGStorage
- **Rationale:** Debounce timer was unreliable; autosave ensures sessions persist every 60s
- **Status:** ✅ Fixed (commit 4f82fbd)

### Solar Scout Validated List
- **Decision:** Expand validated outreach from 15→36 companies (82.6 MW total)
- **Rationale:** 21 additional companies had valid MX + decision-maker emails but were excluded
- **Status:** ✅ Complete. Tier 1: 15 companies (33.4 MW) ready to email. Tier 2: 10 companies (~22 MW) need manual verification.

### Solar Scout SMTP Check Flag
- **Decision:** Add --smtp-check flag to send_emails.py
- **Rationale:** Pre-flight SMTP validation before attempting real sends
- **Status:** ✅ Implemented (commit de47334)

### Audio GENERAL Protocol
- **Decision:** Add GENERAL protocol to backend CLINICAL_PROTOCOLS + DEMO_BATCHES
- **Rationale:** Frontend had GENERAL but backend was missing it — fell back to DEFAULT
- **Status:** ✅ Fixed (commit 9743637)

### KGDatabaseAdapter Phase 1
- **Decision:** Implement KGDatabaseAdapter interface with SupabaseKGStorage stub
- **Rationale:** Enables storage swap without changing KGStorage API; activates when DATABASE_ADAPTER=supabase
- **Status:** ✅ Implemented (commit 6ca0e2a) — Phase 2 activation pending Supabase project

### KGDatabaseAdapter Orchestrator Wiring
- **Decision:** Wire KGDatabaseAdapter into session orchestrator (saveSession called on runSession)
- **Rationale:** Adapter existed but was never called — sessions only landed as KG nodes
- **Status:** ✅ Implemented (commit dd223cc)

### health_check.sh Service Count
- **Decision:** Update H14 service count from 6→8, add Synthesis API (3004), CG Web (3006), Synthesis UI (3007)
- **Rationale:** Credo Frontend (3002) removed, three new services added
- **Status:** ✅ Fixed (commit 7a10b62)

### health_check.sh H17 Label
- **Decision:** Correct H18→H17 Gateway label echo line
- **Rationale:** Comment was updated but echo line still showed H18
- **Status:** ✅ Fixed (commit 0c4c440)

---

## 2026-03-27

### Credo RLS Deferral
- **Decision:** Defer RLS policies to Phase 2; use application-level auth middleware for MVP
- **Rationale:** auth.uid() returns NULL for anonymous UUID-in-localStorage users; MVP acceptable risk (anonymous read-heavy, content is public)
- **Status:** ✅ Decided — SCHEMA.md updated

### Credo App-Level Auth Middleware
- **Decision:** Add authenticate(), optionalAuth(), requireTier() middleware to Credo API
- **Rationale:** All 10 protected routes had manual header checks; proper middleware is cleaner and more maintainable
- **Status:** ✅ Implemented (commit cb5a2f2) — 137 tests passing

### Credo Credibility Bugs (3 fixed)
- **Decision:** Fix endorsement weight formula, trust tier thresholds, self-endorsement block
- **Rationale:** Elder tier was at wrong threshold (1000 vs 2000), endorsement gave flat +1, self-endorsement was allowed
- **Status:** ✅ Fixed (commit dca8dfe)

### JCI LLM Enhancement
- **Decision:** Add OpenRouter LLM service + LLM-powered engagement agent to JCI org manager
- **Rationale:** Personalized check-ins, contextual motivation, engagement risk alerts, AI weekly summaries
- **Status:** ✅ Implemented (commit 25a1e40) — 21 new tests added, 62 total passing

### CG Test 0.1 Conditional GO
- **Decision:** CG Phase 0 validation sprint approved as CONDITIONAL GO
- **Rationale:** Concept is strong, architecture is sound, but Q6/Q7/Q8 must be answered before Phase 1 build
- **Status:** ⏳ Pending user action — needs Test 0.1 recruitment + interviews

_Last updated: 2026-03-31 02:26 UTC_

## 2026-04-13

### Audio Tool NVC Chinese Character Bug
- **Decision:** Fix NVC demo batch encoding corruption in `server/index.ts`
- **Problem:** `without评价` — Chinese chars embedded in English NVC demo script
- **Fix:** `without评价` → `without evaluating`
- **Status:** ✅ Fixed (commit needed — non-cron session)

### Audio Tool Demo Fallback Chain
- **Decision:** Fix frontend `generateMeditationScript` final catch block fallback
- **Problem:** `DEMO_BATCHES['DEFAULT']` — `'DEFAULT'` key doesn't exist in frontend DEMO_BATCHES
- **Fix:** `DEMO_BATCHES['GENERAL'] || DEMO_BATCHES['NSDR']` (matches existing backend fallback logic)
- **Status:** ✅ Fixed (commit needed — non-cron session)

_Last updated: 2026-04-13 22:46 UTC_

## 2026-03-31

### gen-e.eu Homepage Now Live — Window Tightening ⚠️
- **Finding (01:56 UTC):** gen-e.eu homepage now shows "Gen-E 2026 – Europe's Largest Entrepreneurship Festival" ✅
- **gen-e.eu/gen-e-2026:** Still 404 — specific event details not yet published
- **Implication:** JA Europe is actively building Gen-E 2026 web presence RIGHT NOW. The homepage going live suggests detail pages (partner info, schedule, etc.) are coming soon. The pre-announcement partnership window is still OPEN but tightening.
- **Action urgency:** April 7 outreach deadline is more critical now — 7 days away. JA Europe LinkedIn DM should go out ASAP.
- **Status:** ✅ OUTREACH_DRAFT.md header updated (01:57 UTC)

---

## 2026-03-29

### Gen-E 2026 Web Presence — Status Update
- **19:27 UTC:** gen-e.eu homepage is now LIVE with "Gen-E 2026" branding (previously only newsletter signup)
- **gen-e.eu/gen-e-2026:** Still 404 — event details not yet published
- **Implication:** JA Europe is actively building Gen-E 2026 web presence now. Optimal outreach window confirmed — they're in planning mode before public launch.
- **Status:** ✅ OUTREACH_DRAFT.md updated with new timing insight

### CG Phase 0 Open Questions — Draft Answers
- **Q6 (Onboarding hook):** The personal map takeaway IS the hook. User leaves with a named "operating wavelength" + behavioral evidence in 5 minutes. Validation: ≥5/10 would screenshot and share.
- **Q7 (16-25 perk):** Verifiable contribution record (evidence work mattered) + priority access to opportunities + skills mapped to specific gaps. NOT money, badges, or abstract career advice.
- **Q8 (Test 0.2 event):** JCI Latvia Innovators' meeting (immediate) → Gen-E 2026 July (outreach NOW). Gen-E is JA Europe program; JA Europe is primary partnership contact.
- **Status:** ⏳ Draft — needs user review before sending outreach

### JA Europe vs JA Latvia — Clarification
- **JA Europe** (jaeurope.org): Primary decision-maker for Gen-E 2026. Coordinates 40+ national JA organizations. Partnership discussions go here.
- **JA Latvia** (jalatvia.lv): Site unreachable. Local JA chapter and Gen-E 2026 local host. Secondary contact via JCI Latvia.
- **JCI Latvia** (jci.lv): Separate org (Junior Chamber International Latvia). Confirmed active. Good for Test 0.2 venue (monthly Innovators' meetings).
- **Status:** ✅ Clarified — OUTREACH_DRAFT.md updated with correct contacts

### Security Fixes Verified Applied
- **Decision:** Confirm exec.security=allowlist, groupPolicy=allowlist are active in gateway config
- **Verification:** Gateway config retrieved via `gateway` tool — both settings confirmed at `"allowlist"`
- **Config touched:** 2026-03-29T14:36:52.412Z — applied by prior session
- **Status:** ✅ VERIFIED (14:56 UTC) — no further action needed

### Audio Submodule — Cron Context Limitation
- **Finding:** `projects/audio-transformation-tool/code` is a git submodule (ca1ae15)
- **Impact:** Submodule updates require exec access — cannot be modified in cron sessions
- **Status:** ℹ️ Informational — requires non-cron session to push submodule changes
