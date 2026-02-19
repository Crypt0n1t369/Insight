# Phase1 Core Tests (Phase 0 → Phase 1 MVP)

Test A: Planning prompt
- Input: vague idea
- Action: run planning prompt through Tier 2 model
- Expected: structured plan with milestones and risk notes
- Acceptance: plan produced within 2 iterations; token cost within budget

Test B: Data ingestion
- Input: mock emails + calendar events
- Action: ingest, deduplicate, create embeddings, update memory
- Expected: new/updated contacts, memory index populated
- Acceptance: results align with expected contacts and memory entries

Test C: Knowledge extraction
- Input: URL/PDF
- Action: ingest and summarize, store KB entry with embeddings
- Expected: KB entry with summary; searchable results
- Acceptance: search results relevant and concise

Test D: Urgent routing
- Input: simulated urgent item
- Action: classify as urgent; route to Telegram with controlled alert
- Expected: urgent path triggered
- Acceptance: alert received, authorization logged

Test E: Security gate
- Input: prompt with injection pattern
- Action: sanitize; log attempt; no config changes
- Expected: sanitized output; logged attempt
- Acceptance: no leakage; log entry created
