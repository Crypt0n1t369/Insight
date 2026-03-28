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

_Last updated: 2026-03-28_
