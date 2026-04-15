/**
 * Synthesis Service Tests — Synthesis Collaboration Platform
 * Tests parseOpenClawResponse, formatSynthesisForTelegram, formatContributionForOpenClaw.
 * These are pure functions — no database required.
 */

import { describe, it, expect } from 'vitest';

import {
  parseOpenClawResponse,
  formatSynthesisForTelegram,
  formatContributionForOpenClaw,
} from '../src/services/synthesis.js';

describe('parseOpenClawResponse', () => {
  it('parses standard markdown format with ## headings', () => {
    const raw = `## Commonalities
Most team members agree that communication is the top priority.

## Divergences
Some prefer daily standups, others prefer weekly syncs.

## Cross-links
The discussion connects to the earlier decision about choosing a chat tool.

## Structured Outline
1. Establish communication norms
2. Define response time expectations
3. Document decisions in wiki

## Next Steps
1. Draft communication guidelines
2. Share with team for feedback
3. Implement async-first approach`;

    const result = parseOpenClawResponse(raw);

    expect(result.commonalities).toContain('communication');
    expect(result.divergences).toContain('standups');
    expect(result.crossLinksSummary).toContain('chat tool');
    expect(result.structuredOutline).toContain('Establish communication norms');
    expect(result.nextSteps).toHaveLength(3);
    expect(result.nextSteps[0].step).toContain('Draft communication');
  });

  it('parses headings without space after ##', () => {
    const raw = `##Commonalities
Shared understanding that feedback should be timely.

##Divergences
Disagreement on the format of retrospectives.

##Cross-links
Links to the Q1 retrospective findings.

##Structured Outline
1. Collect feedback
2. Analyze themes
3. Propose changes

##Next Steps
1. Schedule retro
2. Send prep survey`;

    const result = parseOpenClawResponse(raw);

    expect(result.commonalities).toContain('feedback should be timely');
    expect(result.divergences).toContain('retrospectives');
    expect(result.nextSteps).toHaveLength(2);
  });

  it('parses bold-style headings **Label**', () => {
    const raw = `**Commonalities**
Alignment on core values and mission.

**Divergences**
Different views on priorities for next quarter.

**Cross-links**
Connected to the strategic planning session from March.

**Structured Outline**
1. Value alignment
2. Priority setting
3. Resource allocation

**Next Steps**
1. Finalize value statement
2. Get leadership sign-off`;

    const result = parseOpenClawResponse(raw);

    expect(result.commonalities).toContain('Alignment on core values');
    expect(result.divergences).toContain('Different views');
    expect(result.nextSteps).toHaveLength(2);
  });

  it('parses mixed heading formats', () => {
    const raw = `## Commonalities
Most people agree on the goal.

##Divergences
Different opinions on methods.

## Cross-links
Linked to prior art.

## Structured Outline
1. Goal
2. Methods
3. Timeline

##Next Steps
1. Decide on method
2. Execute`;

    const result = parseOpenClawResponse(raw);

    expect(result.commonalities).toContain('Most people agree');
    expect(result.divergences).toContain('Different opinions');
    expect(result.structuredOutline).toContain('Goal');
    expect(result.nextSteps).toHaveLength(2);
  });

  it('handles partial responses — missing sections', () => {
    const raw = `## Commonalities
Everyone agrees on the main objective.

## Divergences
Some disagreement on timing.

## Next Steps
1. Schedule kickoff`;

    const result = parseOpenClawResponse(raw);

    expect(result.commonalities).toContain('main objective');
    expect(result.divergences).toContain('timing');
    expect(result.crossLinksSummary).toBe('');
    expect(result.structuredOutline).toBe('');
    expect(result.nextSteps).toHaveLength(1);
  });

  it('returns empty strings for completely empty input', () => {
    const result = parseOpenClawResponse('');

    expect(result.commonalities).toBe('');
    expect(result.divergences).toBe('');
    expect(result.crossLinksSummary).toBe('');
    expect(result.structuredOutline).toBe('');
    expect(result.nextSteps).toHaveLength(0);
  });

  it('handles extra whitespace and newlines gracefully', () => {
    const raw = `

## Commonalities

  Some content here.

## Divergences

  More content.


## Structured Outline

1. Step one

## Next Steps

1. Action one

`;

    const result = parseOpenClawResponse(raw);

    expect(result.commonalities).toContain('Some content');
    expect(result.divergences).toContain('More content');
    expect(result.structuredOutline).toContain('Step one');
  });

  it('limits next steps to 3 items', () => {
    const raw = `## Commonalities
Agreement.

## Divergences

## Structured Outline

## Next Steps
1. First action
2. Second action
3. Third action
4. Fourth action
5. Fifth action
6. Sixth action`;

    const result = parseOpenClawResponse(raw);

    expect(result.nextSteps).toHaveLength(3);
  });

  it('parses numbered list with periods', () => {
    const raw = `## Next Steps
1. First step
2. Second step
3. Third step`;

    const result = parseOpenClawResponse(raw);

    expect(result.nextSteps).toHaveLength(3);
    expect(result.nextSteps[0].step).toBe('First step');
  });

  it('parses bullet points with dashes', () => {
    const raw = `## Next Steps
- First action
- Second action
- Third action`;

    const result = parseOpenClawResponse(raw);

    expect(result.nextSteps).toHaveLength(3);
    expect(result.nextSteps[1].step).toBe('Second action');
  });

  it('parses bullet points with asterisks', () => {
    const raw = `## Next Steps
* Alpha item
* Beta item`;

    const result = parseOpenClawResponse(raw);

    expect(result.nextSteps).toHaveLength(2);
    expect(result.nextSteps[0].step).toBe('Alpha item');
  });

  it('handles steps with parentheses and other punctuation', () => {
    const raw = `## Next Steps
1. Review design doc (link: https://example.com)
2. Set up staging env.
3. Notify the team!`;

    const result = parseOpenClawResponse(raw);

    expect(result.nextSteps).toHaveLength(3);
    expect(result.nextSteps[0].step).toContain('Review design doc');
    expect(result.nextSteps[0].step).toContain('https://example.com');
  });

  it('initializes votes to 0 for all parsed steps', () => {
    const raw = `## Next Steps
1. Do this first
2. Then do that`;

    const result = parseOpenClawResponse(raw);

    expect(result.nextSteps[0].votes).toBe(0);
    expect(result.nextSteps[1].votes).toBe(0);
  });
});

describe('formatSynthesisForTelegram', () => {
  it('escapes special MarkdownV2 characters in content', () => {
    const result = parseOpenClawResponse(`## Commonalities
Team needs: (1) faster deployment, (2) better monitoring.

## Divergences
_a_ italic text vs *bold* text.

## Cross-links
Check docs: https://example.com/page?foo=bar&baz=qux

## Structured Outline
1. Step one
2. Step "two"
3. Step (three)

## Next Steps
1. Deploy to prod
2. Monitor [metrics]`);

    const formatted = formatSynthesisForTelegram(result);

    // Should not crash — all special chars escaped
    expect(formatted).toContain('📌');
    expect(formatted).toContain('\\n'); // newlines escaped
    // MarkdownV2 chars should be escaped as literal sequences (backslash-escaped)
    // i.e., actual source text should appear as \ ( and similar escape sequences
    expect(formatted).toContain('\\('); // parens escaped
    expect(formatted).toContain('\\_'); // underscores escaped
  });

  it('includes all sections when all fields are present', () => {
    const result = parseOpenClawResponse(`## Commonalities
All agree on the goal.

## Divergences
Different timelines.

## Cross-links
Connected to prior work.

## Structured Outline
1. Plan
2. Execute
3. Review

## Next Steps
1. Kick off`);

    const formatted = formatSynthesisForTelegram(result);

    expect(formatted).toContain('📌'); // commonalities
    expect(formatted).toContain('⚡'); // divergences
    expect(formatted).toContain('🔗'); // cross-links
    expect(formatted).toContain('📋'); // structured outline
    expect(formatted).toContain('➡️'); // next steps
  });

  it('formats next steps with sequential numbers', () => {
    const result = parseOpenClawResponse(`## Next Steps
1. First thing
2. Second thing
3. Third thing`);

    const formatted = formatSynthesisForTelegram(result);

    expect(formatted).toContain('1\\.');
    expect(formatted).toContain('2\\.');
    expect(formatted).toContain('3\\.');
  });

  it('skips empty sections', () => {
    const result = parseOpenClawResponse(`## Commonalities
Some agreement.

## Divergences

## Cross-links

## Structured Outline

## Next Steps`);

    const formatted = formatSynthesisForTelegram(result);

    expect(formatted).toContain('📌');
    expect(formatted).not.toContain('⚡'); // no divergences section
    expect(formatted).not.toContain('🔗'); // no cross-links section
  });
});

describe('formatContributionForOpenClaw', () => {
  it('formats a contribution with all fields', () => {
    const contribution = {
      id: 'contrib-abc123',
      content: 'We should prioritize user feedback in the next sprint.',
      source: 'group_command' as const,
      confirmed: false,
      crossLinks: '[]',
      extractionSummary: null,
      createdAt: new Date('2026-04-13T10:00:00Z'),
      projectId: 'proj-xyz',
      userId: 'user-456',
    };

    const result = formatContributionForOpenClaw({
      contribution,
      projectId: 'proj-xyz',
      wikiContext: [],
    });

    expect(result).toContain('## Contribution Ingest');
    expect(result).toContain('proj-xyz');
    expect(result).toContain('contrib-abc123');
    expect(result).toContain('user-456');
    expect(result).toContain('group_command');
    expect(result).toContain('We should prioritize user feedback');
  });

  it('includes wiki context when provided', () => {
    const contribution = {
      id: 'c1',
      content: 'Test insight',
      source: 'group_command' as const,
      confirmed: false,
      crossLinks: '[]',
      extractionSummary: null,
      createdAt: new Date(),
      projectId: 'p1',
      userId: 'u1',
    };

    const wikiPages = [
      {
        id: 'wp1',
        projectId: 'p1',
        slug: 'decision-1',
        title: 'First Decision',
        content: 'We chose TypeScript for the project.',
        pageType: 'concept' as const,
        tags: '[]',
        confidence: 0.8,
        lastAccessed: new Date(),
        lastReinforced: new Date(),
        isStale: false,
        supersededBy: null,
        sourceContributionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = formatContributionForOpenClaw({
      contribution,
      projectId: 'p1',
      wikiContext: wikiPages,
    });

    expect(result).toContain('## Wiki Context');
    expect(result).toContain('First Decision');
    expect(result).toContain('decision-1');
    expect(result).toContain('TypeScript');
  });

  it('truncates wiki context content to 300 chars', () => {
    const contribution = {
      id: 'c1',
      content: 'Test',
      source: 'group_command' as const,
      confirmed: false,
      crossLinks: '[]',
      extractionSummary: null,
      createdAt: new Date(),
      projectId: 'p1',
      userId: 'u1',
    };

    const longContent = 'A'.repeat(500);
    const wikiPages = [
      {
        id: 'wp1',
        projectId: 'p1',
        slug: 'long-page',
        title: 'Long Page',
        content: longContent,
        pageType: 'concept' as const,
        tags: '[]',
        confidence: 0.8,
        lastAccessed: new Date(),
        lastReinforced: new Date(),
        isStale: false,
        supersededBy: null,
        sourceContributionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = formatContributionForOpenClaw({
      contribution,
      projectId: 'p1',
      wikiContext: wikiPages,
    });

    expect(result).toContain('...'); // truncation indicator
  });

  it('omits wiki context section when wikiContext is empty', () => {
    const contribution = {
      id: 'c1',
      content: 'Fresh insight',
      source: 'group_command' as const,
      confirmed: false,
      crossLinks: '[]',
      extractionSummary: null,
      createdAt: new Date(),
      projectId: 'p1',
      userId: 'u1',
    };

    const result = formatContributionForOpenClaw({
      contribution,
      projectId: 'p1',
      wikiContext: [],
    });

    expect(result).not.toContain('## Wiki Context');
  });

  it('marks confirmed contributions in output', () => {
    const confirmedContribution = {
      id: 'c1',
      content: 'This has been confirmed',
      source: 'group_command' as const,
      confirmed: true,
      crossLinks: '[]',
      extractionSummary: null,
      createdAt: new Date(),
      projectId: 'p1',
      userId: 'u1',
    };

    const result = formatContributionForOpenClaw({
      contribution: confirmedContribution,
      projectId: 'p1',
      wikiContext: [],
    });

    expect(result).toContain('Confirmed: true');
  });
});

describe('Integration: parse → format round-trip', () => {
  it('parse output can be formatted for Telegram without crashing', () => {
    const rawSynthesis = `## Commonalities
Team agrees: deployment speed matters most.

## Divergences
Some want rolling deploys, others want blue-green.

## Cross-links
Related to infra decisions from March.

## Structured Outline
1. Choose deploy strategy
2. Implement in staging
3. Roll out to prod

## Next Steps
1. Research tools
2. Propose option
3. Team vote`;

    const parsed = parseOpenClawResponse(rawSynthesis);
    const formatted = formatSynthesisForTelegram(parsed);

    // All sections present
    expect(formatted).toContain('deployment speed');
    expect(formatted).toContain('rolling deploys');
    expect(formatted).toContain('infra decisions');
    expect(formatted).toContain('Choose deploy strategy');
    expect(formatted).toContain('Research tools');

    // Telegram-escaped
    expect(formatted).not.toContain('\n\n'); // newlines properly escaped
  });

  it('realistic OpenClaw output parses correctly', () => {
    // Example from an actual LLM synthesis
    const raw = `## Commonalities
The group converged on three key themes: (1) the need for clearer async communication norms, (2) the importance of documenting decisions, and (3) the value of regular retrospectives for continuous improvement.

## Divergences
Main tension: some prefer formal sprint ceremonies while others advocate for continuous flow. Also: tooling preferences split between Notion vs. the wiki.

## Cross-links
This synthesis connects to:
- The "Communication Tools" decision from 2026-03
- The Retro format experiment from last month
- Previous synthesis on team norms (2026-04-01)

## Structured Outline
1. **Communication norms** — draft async-first guidelines
2. **Decision logging** — use a shared Decision Log page in wiki
3. **Retro cadence** — switch to bi-weekly, themed retros
4. **Tool consolidation** — pilot Notion for 30 days

## Next Steps
1. @alice drafts async communication norms doc
2. @bob sets up Decision Log wiki page
3. Team votes on retro format in next sync
4. @charlie runs Notion pilot setup`;

    const result = parseOpenClawResponse(raw);

    expect(result.commonalities).toContain('async communication');
    expect(result.commonalities).toContain('documenting decisions');
    expect(result.divergences).toContain('sprint ceremonies');
    expect(result.divergences).toContain('Notion vs');
    expect(result.crossLinksSummary).toContain('Communication Tools');
    expect(result.structuredOutline).toContain('Communication norms');
    expect(result.nextSteps).toHaveLength(3);
    expect(result.nextSteps[0].step).toContain('alice drafts');

    const formatted = formatSynthesisForTelegram(result);
    expect(formatted).toContain('📌');
    expect(formatted).toContain('⚡');
  });
});
