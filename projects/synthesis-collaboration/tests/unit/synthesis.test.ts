import { describe, it, expect } from 'vitest';
import {
  parseOpenClawResponse,
  formatSynthesisForTelegram,
  formatContributionForOpenClaw,
} from '../../src/services/synthesis.js';
import type { Contribution } from '@prisma/client';

describe('Synthesis Formatting', () => {
  describe('parseOpenClawResponse', () => {
    it('parses standard markdown synthesis response', () => {
      const raw = `## Commonalities

Repeated theme of interpretability as key to AI safety.

## Divergences

Researchers disagree on whether interpretability should be white-box or black-box.

## Cross-links

Interpretability connects to alignment via mechanistic understanding.

## Structured Outline

1. Background on interpretability
2. Current methods
3. Proposed research agenda

## Next Steps

1. Survey existing interpretability tools
2. Design novel visualization approach
3. Publish findings in 6 months`;

      const result = parseOpenClawResponse(raw);

      expect(result.commonalities).toContain('interpretability');
      expect(result.divergences).toContain('disagree');
      expect(result.crossLinksSummary).toContain('alignment');
      expect(result.structuredOutline).toContain('Background');
      expect(result.nextSteps.length).toBeGreaterThanOrEqual(3);
    });

    it('handles bold heading format', () => {
      const raw = `**Commonalities**

Shared focus on robust agents.

**Divergences**

Approach differs: RL vs symbolic.

**Cross-links Summary**

Robustness ties to domain randomization.

**Structured Outline**

- Phase 1: Research
- Phase 2: Implementation

**Next Steps**

- Finalize architecture
- Begin experiments`;

      const result = parseOpenClawResponse(raw);

      expect(result.commonalities).toContain('robust agents');
      expect(result.divergences).toContain('symbolic');
    });

    it('handles heading without space after ##', () => {
      const raw = `##Commonalities

Repeated theme of interpretability as key to AI safety.

##Divergences

Researchers disagree on whether interpretability should be white-box or black-box.

##Cross-links

Interpretability connects to alignment via mechanistic understanding.

##Structured Outline

1. Background on interpretability
2. Current methods
3. Proposed research agenda

##Next Steps

1. Survey existing interpretability tools
2. Design novel visualization approach
3. Publish findings in 6 months`;

      const result = parseOpenClawResponse(raw);

      expect(result.commonalities).toContain('interpretability');
      expect(result.divergences).toContain('disagree');
      expect(result.crossLinksSummary).toContain('alignment');
      expect(result.structuredOutline).toContain('Background');
      expect(result.nextSteps.length).toBeGreaterThanOrEqual(3);
    });

    it('returns empty strings for missing sections', () => {
      const raw = `## Commonalities

Only this section.`;

      const result = parseOpenClawResponse(raw);

      expect(result.commonalities).toContain('Only this section');
      expect(result.divergences).toBe('');
      expect(result.nextSteps).toEqual([]);
    });
  });

  describe('formatSynthesisForTelegram', () => {
    it('formats a full synthesis result for Telegram MarkdownV2', () => {
      const result = {
        commonalities: 'All contributors emphasize safety.',
        divergences: 'Disagree on approach: formal vs empirical.',
        crossLinksSummary: 'Safety connects to interpretability.',
        structuredOutline: '1. Safety overview\n2. Analysis\n3. Recommendations',
        nextSteps: [
          { step: 'Conduct user study', votes: 3 },
          { step: 'Write technical report', votes: 2 },
        ],
      };

      const output = formatSynthesisForTelegram(result);

      expect(output).toContain('📌');
      expect(output).toContain('⚡');
      expect(output).toContain('🔗');
      expect(output).toContain('📋');
      expect(output).toContain('➡️');
      expect(output).toContain('All contributors emphasize safety');
      expect(output).toContain('1\\. Conduct user study');
    });

    it('handles missing optional sections gracefully', () => {
      const result = {
        commonalities: 'Theme A',
        divergences: '',
        crossLinksSummary: '',
        structuredOutline: '',
        nextSteps: [],
      };

      const output = formatSynthesisForTelegram(result);

      expect(output).toContain('📌');
      expect(output).not.toContain('⚡');
      expect(output).not.toContain('🔗');
    });

    it('escapes special markdown characters', () => {
      const result = {
        commonalities: 'Test with _underscores_ and *asterisks*',
        divergences: 'Disagree on (parentheses)',
        crossLinksSummary: 'Links: [brackets]',
        structuredOutline: 'Outline with | pipes',
        nextSteps: [{ step: 'Step with _special_ chars', votes: 0 }],
      };

      const output = formatSynthesisForTelegram(result);

      // Should not throw and should contain escaped versions
      expect(output).toBeTruthy();
      expect(output).not.toContain('_[_underscores_]_');
    });
  });

  describe('formatContributionForOpenClaw', () => {
    it('formats a contribution as a task file string', () => {
      const contribution: Contribution = {
        id: 'test-uuid-1234567890123456',
        projectId: 'proj-uuid',
        userId: 'user-123',
        content: 'This is a test contribution about AI.',
        source: 'group_command',
        confirmed: false,
        crossLinks: '[]',
        extractionSummary: null,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
      };

      const output = formatContributionForOpenClaw({
        contribution,
        projectId: 'proj-uuid',
      });

      expect(output).toContain('# Contribution Ingest');
      expect(output).toContain('proj-uuid');
      expect(output).toContain('This is a test contribution about AI');
      expect(output).toContain('test-uuid-1234567890123456');
      expect(output).toContain('user-123');
    });

    it('includes wiki context when provided', () => {
      const contribution: Contribution = {
        id: 'contrib-uuid',
        projectId: 'proj-uuid',
        userId: 'user-123',
        content: 'Insight about interpretability.',
        source: 'group_command',
        confirmed: false,
        crossLinks: '[]',
        extractionSummary: null,
        createdAt: new Date(),
      };

      const output = formatContributionForOpenClaw({
        contribution,
        projectId: 'proj-uuid',
        wikiContext: [
          {
            id: 'wiki-1',
            projectId: 'proj-uuid',
            slug: 'interpretability',
            title: 'Interpretability',
            content: 'Research on understanding neural networks.',
            pageType: 'concept',
            tags: '[]',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      expect(output).toContain('## Wiki Context');
      expect(output).toContain('Interpretability');
      expect(output).toContain('interpretability');
    });
  });
});
