Roadmap: Upgrade Phase 0 MVP to a more stable, evolved Phase 1

Goals:
- Expand model-tier routing with smarter cost controls
- Harden security and input sanitization across prompts
- Build a persistent, queryable memory layer with lightweight embeddings (LanceDB)
- Automate health checks, test harness, and logging into a CI-like loop
- Establish automated Telegram/messaging for milestones and alerts
- Document decisions and reasoning for auditable traces

Proposed 3 Options (default: 2 – Incremental Evolution):
1) Incremental Evolution (Recommended)
- Short iterations: 2-week sprints
- Implement: connect memory recall to input prompts, auto-triage prompts via tier routing, auto-run tests, auto-notify milestones
- Risks: integration complexity; Mitigations: feature flags, staged rollout

2) Moderate Overhaul
- Longer cycles (4 weeks)
- Implement: LanceDB vector store, richer domain recall, stronger security gate, basic CI
- Risks: scope creep; Mitigations: strict scope guardrails, weekly demos

3) Radical Re-architecture
- Rebuild core flow around event-sourced architecture, microservices adapters
- Risks: high; Mitigations: spike prototype before full adoption

Milestones (example 6 weeks):
- Week 1-2: Hardened inputs, improved AGENTS routing, basic memory embeddings
- Week 3-4: LanceDB-based memory index, recall improvements, tests integration
- Week 5-6: CI-like automation, Telegram milestone notifier, improved docs

Success criteria:
- Automated health checks pass deterministically
- Tests cover critical paths and run reliably
- Memory holds long-running context with recall accuracy
- Clear auditable trail of decisions and changes
