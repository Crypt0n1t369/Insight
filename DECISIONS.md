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

_Last updated: 2026-03-01_
