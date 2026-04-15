/**
 * Synthesis Parse & Format Tests — CORRECTED
 * Tests parseOpenClawResponse and formatSynthesisForTelegram with the correct
 * property name: "commonalities" (2 m's, 2 a's).
 * Previously both synthesis.test.ts and this file had persistent typos
 * (commmmonalities / 3 m's) — all corrected 2026-04-13 05:16 UTC.
 * This file validates the correct implementation.
 */

import { describe, it, expect } from 'vitest';
import {
  parseOpenClawResponse,
  formatSynthesisForTelegram,
} from '../src/services/synthesis.js';

describe('parseOpenClawResponse — commonalities (correct spelling: 2 m\'s, 2 a\'s)', () => {
  it('returns object with commonalities property (2 m\'s, 2 a\'s)', () => {
    const result = parseOpenClawResponse('## Commonalities\nTeam agrees on goals.\n\n## Divergences\nSome prefer A.\n\n## Next Steps\n1. Do it');
    // The result object must have the correct property name matching SynthesisResult type
    expect(result).toHaveProperty('commonalities');
    expect(result).toHaveProperty('divergences');
    expect(result).toHaveProperty('crossLinksSummary');
    expect(result).toHaveProperty('structuredOutline');
    expect(result).toHaveProperty('nextSteps');
  });

  it('extracts commonalities content correctly', () => {
    const raw = `## Commonalities
Most team members agree that communication is the top priority.

## Divergences
Some prefer daily standups, others prefer weekly syncs.

## Cross-links
The discussion connects to the earlier decision about choosing a chat tool.

## Structured Outline
1. Establish communication norms
2. Define response time expectations

## Next Steps
1. Draft communication guidelines`;
    const result = parseOpenClawResponse(raw);
    expect(result.commonalities).toContain('communication is the top priority');
    expect(result.divergences).toContain('daily standups');
    expect(result.crossLinksSummary).toContain('chat tool');
    expect(result.structuredOutline).toContain('Establish communication norms');
    expect(result.nextSteps).toHaveLength(1);
  });

  it('handles partial responses — commonalities present, others empty', () => {
    const raw = `## Commonalities
Everyone agrees on the main objective.

## Divergences

## Cross-links

## Structured Outline

## Next Steps`;
    const result = parseOpenClawResponse(raw);
    expect(result.commonalities).toContain('main objective');
    expect(result.divergences).toBe('');
    expect(result.crossLinksSummary).toBe('');
    expect(result.structuredOutline).toBe('');
    expect(result.nextSteps).toHaveLength(0);
  });

  it('handles empty input gracefully', () => {
    const result = parseOpenClawResponse('');
    expect(result.commonalities).toBe('');
    expect(result.divergences).toBe('');
    expect(result.crossLinksSummary).toBe('');
    expect(result.structuredOutline).toBe('');
    expect(result.nextSteps).toHaveLength(0);
  });

  it('parses bold-style headings **Commonalities**', () => {
    const raw = `**Commonalities**
Alignment on core values and mission.

**Divergences**
Different views on priorities.

**Next Steps**
1. Finalize value statement`;
    const result = parseOpenClawResponse(raw);
    expect(result.commonalities).toContain('Alignment on core values');
    expect(result.divergences).toContain('Different views');
    expect(result.nextSteps).toHaveLength(1);
  });

  it('limits next steps to 3 items', () => {
    const raw = `## Commonalities\nOK.\n\n## Next Steps\n1. First\n2. Second\n3. Third\n4. Fourth\n5. Fifth`;
    const result = parseOpenClawResponse(raw);
    expect(result.nextSteps).toHaveLength(3);
  });

  it('round-trip: parse then format does not crash', () => {
    const raw = `## Commonalities
Team agrees: deployment speed matters most.

## Divergences
Some want rolling deploys, others want blue-green.

## Cross-links
Related to infra decisions from March.

## Structured Outline
1. Choose deploy strategy
2. Implement in staging

## Next Steps
1. Research tools
2. Propose option`;
    const parsed = parseOpenClawResponse(raw);
    // Must not throw — formatSynthesisForTelegram accesses result.commonalities
    const formatted = formatSynthesisForTelegram(parsed);
    expect(formatted).toContain('📌');
    expect(formatted).toContain('⚡');
    expect(formatted).toContain('deployment speed');
  });
});
