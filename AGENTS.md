# AGENTS.md - Phase 0 MVP Foundation Model Policy

- Primary model pool: OpenRouter auto (OpenRouter default) for routine tasks
- Elite tier: Opus-4.6 reserved for high-signal, rare market-shaping analyses
- Tier 2: Cost-effective fast models (e.g., Gemini 3 Pro/Flash previews, Claude Sonnet 4.6 if accessible)
- Tier 3: Lightweight, ultra-cheap or free models for orchestration and basic tasks
- Budget cap: $10/day; tier-switching logic will be enforced by the harness
- Task mapping (initial):
  - Planning and architectural decisions: Tier 1
  - Ingestion, summarization, classification: Tier 2/3
  - Routine orchestration, health checks: Tier 3
- Escalation: if Tier 3 fails to meet acceptance, escalate to Tier 2, then Tier 1 as needed
- Context pruning: keep memory index lean; 1h TTL for non-critical embeddings
