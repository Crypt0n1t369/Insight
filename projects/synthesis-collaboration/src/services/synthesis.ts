import prisma from '../db/index.js';
import type { Contribution, SynthesisOutput, WikiPage } from '@prisma/client';
import type { SynthesisResult } from '../types/index.js';
import { supersedePage } from './knowledgeGraph.js';

/**
 * Formats a contribution for OpenClaw ingestion.
 * Returns a structured markdown string ready to write to a task file.
 */
export function formatContributionForOpenClaw(params: {
  contribution: Contribution;
  projectId: string;
  wikiContext?: WikiPage[];
}): string {
  const { contribution, projectId, wikiContext = [] } = params;

  const wikiSection =
    wikiContext.length > 0
      ? `## Wiki Context\n${wikiContext
          .map(
            (p) => {
              const truncated = p.content.slice(0, 300);
              const suffix = p.content.length > 300 ? '...' : '';
              return `- **${p.title}** (${p.slug}): ${truncated}${suffix}`;
            }
          )
          .join('\n')}\n`
      : '';

  return `## Contribution Ingest

## Project
${projectId}

## Contribution Details
- **ID:** ${contribution.id}
- **Author:** ${contribution.userId}
- **Source:** ${contribution.source}
- **Timestamp:** ${contribution.createdAt.toISOString()}
- Confirmed: ${contribution.confirmed}

## Content
${contribution.content}

${wikiSection}## Task
Extract structured insights, identify cross-links to existing wiki pages, and update project memory.
`;
}

/**
 * Parses an OpenClaw synthesis response into a structured SynthesisResult.
 * Handles various markdown formats that OpenClaw might return.
 * Supports: "## Commonalities", "##Commonalities", "**Commonalities**"
 */
export function parseOpenClawResponse(rawResponse: string): SynthesisResult {
  const extractSection = (label: string): string => {
    // Match a markdown heading followed by content until the next heading or end.
    // Handles: "## Commonalities", "##Commonalities", "**Commonalities**"
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      // "## Commonalities" or "##Commonalities" (space after ## optional)
      // NOTE: +? (lazy, min 1 char) not *? to avoid matching empty when \n\n follows heading
      new RegExp(`##\\s*${escaped}[\\s\\S]+?(?=\\n##|\\n\\n[^\\-]|$)`, 'i'),
      // "**Commonalities**" (bold heading)
      new RegExp(`\\*\\*${escaped}\\*\\*[\\s\\S]+?(?=\\*\\*|\\n\\n|$)`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = rawResponse.match(pattern);
      if (match) {
        // Strip the heading itself and trim.
        // For "## Commonalities" or "**Commonalities**" — remove the first line.
        const firstNewline = match[0].indexOf('\n');
        return firstNewline !== -1 ? match[0].slice(firstNewline + 1).trim() : match[0];
      }
    }
    return '';
  };

  const parseNextSteps = (section: string): { step: string; votes: number }[] => {
    const steps: { step: string; votes: number }[] = [];
    // Match numbered lists or bullet points
    const lines = section.split('\n').filter((l) => l.trim());
    for (const line of lines) {
      const cleaned = line.replace(/^[\d.)\-\*•]+\s*/, '').trim();
      if (cleaned) {
        steps.push({ step: cleaned, votes: 0 });
      }
    }
    return steps.slice(0, 3);
  };

  return {
    commonalities: extractSection('Commonalities') || extractSection('commonalities'),
    divergences: extractSection('Divergences') || extractSection('divergences'),
    crossLinksSummary: extractSection('Cross-links') || extractSection('Cross-links Summary'),
    structuredOutline: extractSection('Structured Outline') || extractSection('Outline'),
    nextSteps: parseNextSteps(extractSection('Next Steps') || extractSection('next steps')),
  };
}

/**
 * Formats a SynthesisResult for Telegram display using proper MarkdownV2.
 */
export function formatSynthesisForTelegram(result: SynthesisResult): string {
  const escape = (text: string): string => {
    // MarkdownV2 special chars: _ * [ ] ( ) ~ ` > # + - = | { } . ! \
    // Escape all special chars with backslash, including backslash itself.
    return text.replace(/[_\[\]()~`>#+\-=|{}.!\\]/g, '\\$&').replace(/\*/g, '\\*');
  };

  const sections: string[] = [];

  if (result.commonalities) {
    sections.push(`📌 *Commonalities*\\n${escape(result.commonalities)}`);
  }
  if (result.divergences) {
    sections.push(`⚡ *Divergences*\\n${escape(result.divergences)}`);
  }
  if (result.crossLinksSummary) {
    sections.push(`🔗 *Cross-links*\\n${escape(result.crossLinksSummary)}`);
  }
  if (result.structuredOutline) {
    sections.push(`📋 *Structured Outline*\\n${escape(result.structuredOutline)}`);
  }
  if (result.nextSteps.length > 0) {
    const stepsText = result.nextSteps
      .map((s, i) => `${i + 1}\\. ${escape(s.step)}`)
      .join('\\n');
    sections.push(`➡️ *Next Steps*\\n${stepsText}`);
  }

  return sections.join('\\n\\n');
}

/**
 * Formats a single contribution for Telegram display.
 */
export function formatContributionForTelegram(contribution: Contribution): string {
  const escape = (text: string): string => {
    // Escape MarkdownV2 special chars. Asterisks must be escaped to prevent bold.
    return text.replace(/[_\[\]()~`>#+\-=|{}.!\\]/g, '\\$&').replace(/\*/g, '\\*');
  };

  const confirmed = contribution.confirmed ? '✅' : '⏳';
  return [
    `${confirmed} *Contribution*`,
    `ID: \`${contribution.id.slice(0, 8)}\\...`,
    escape(contribution.content.slice(0, 500)),
    contribution.content.length > 500 ? '\\.\\.\\.' : '',
  ].join('\\n');
}

/**
 * Formats a short project summary for Telegram status display.
 */
export function formatProjectSummary(params: {
  name: string;
  challenge: string;
  contributions: number;
  contributors: number;
  latestSynthesis?: SynthesisOutput;
}): string {
  const escape = (text: string): string => {
    // MarkdownV2 special chars. Asterisks escaped to prevent unintended bold markers.
    return text.replace(/[_\[\]()~`>#+\-=|{}.!\\]/g, '\\$&').replace(/\*/g, '\\*');
  };

  const lines = [
    `🎯 *${escape(params.name)}*`,
    `📝 Challenge: ${escape(params.challenge.slice(0, 100))}`,
    `💬 ${params.contributions} contributions · ${params.contributors} contributors`,
  ];

  if (params.latestSynthesis) {
    lines.push(`🧠 Last synthesis: ${params.latestSynthesis.createdAt.toLocaleDateString()}`);
  }

  return lines.join('\\n');
}

/**
 * Crystallization Service
 * Implements the "crystallization" pattern from LLM Wiki v2:
 * Completed synthesis sessions are distilled into structured wiki pages.
 *
 * When /generate produces a synthesis, this service files the results
 * back into the knowledge base as typed wiki pages with high confidence.
 */

export interface CrystallizeOptions {
  synthesisId: string;
  projectId: string;
  generatedById?: string;
}

/**
 * Crystallize a synthesis output into wiki pages.
 * Each section of the synthesis becomes its own wiki page.
 * Called automatically after /generate completes.
 */
export async function crystallizeSynthesis(opts: CrystallizeOptions): Promise<{
  pagesCreated: number;
  pageIds: string[];
}> {
  const { synthesisId, projectId } = opts;

  const synthesis = await prisma.synthesisOutput.findUnique({
    where: { id: synthesisId },
    include: {
      project: {
        include: {
          wikiPages: {
            where: { pageType: 'crystallized' },
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
      },
    },
  });

  if (!synthesis) {
    throw new Error(`Synthesis ${synthesisId} not found`);
  }

  const pagesCreated: string[] = [];
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Helper to create a wiki page, superseding any existing crystallized page with the same slug
  async function createCrystallizedPage(params: {
    slug: string;
    title: string;
    pageType: 'concept' | 'summary' | 'source';
    content: string;
    tags?: string[];
    confidence?: number;
  }) {
    const { slug, title, pageType, content, tags = [], confidence = 0.85 } = params;

    // Check for existing crystallized page with this slug
    const existing = await prisma.wikiPage.findUnique({
      where: { projectId_slug: { projectId, slug } },
    });

    let pageId: string;

    if (existing) {
      // Supersede the old version
      const newPage = await prisma.wikiPage.create({
        data: {
          slug,
          title,
          content,
          pageType,
          tags: JSON.stringify(['crystallized', 'synthesis', ...tags]),
          confidence,
          sourceContributionId: synthesisId,
          projectId,
        },
      });
      pageId = newPage.id;

      await supersedePage(existing.id, newPage.id, 'Crystallized from new synthesis');
    } else {
      const newPage = await prisma.wikiPage.create({
        data: {
          slug,
          title,
          content,
          pageType,
          tags: JSON.stringify(['crystallized', 'synthesis', ...tags]),
          confidence,
          sourceContributionId: synthesisId,
          projectId,
        },
      });
      pageId = newPage.id;
    }

    pagesCreated.push(pageId);
  }

  // 1. Common Ground page
  if (synthesis.commonalities.trim()) {
    await createCrystallizedPage({
      slug: `common-ground-${timestamp}`,
      title: `Common Ground (${timestamp})`,
      pageType: 'concept',
      content: synthesis.commonalities,
      tags: ['common-ground', 'consensus'],
      confidence: 0.9,
    });
  }

  // 2. Divergences page
  if (synthesis.divergences.trim()) {
    await createCrystallizedPage({
      slug: `divergences-${timestamp}`,
      title: `Divergies (${timestamp})`,
      pageType: 'concept',
      content: synthesis.divergences,
      tags: ['divergence', 'tension'],
      confidence: 0.8,
    });
  }

  // 3. Cross-links page
  if (synthesis.crossLinksSummary.trim()) {
    await createCrystallizedPage({
      slug: `cross-links-${timestamp}`,
      title: `Cross-Links (${timestamp})`,
      pageType: 'concept',
      content: synthesis.crossLinksSummary,
      tags: ['cross-links', 'connections'],
      confidence: 0.75,
    });
  }

  // 4. Structured Outline / Next Steps page
  if (synthesis.structuredOutline.trim()) {
    let nextStepsContent = synthesis.structuredOutline;
    try {
      const parsed = JSON.parse(synthesis.nextSteps) as Array<{ step: string; votes?: number }>;
      if (parsed.length > 0) {
        nextStepsContent += '\n\n## Voted Next Steps\n';
        parsed.forEach((step, i) => {
          nextStepsContent += `\n${i + 1}. ${step.step}${step.votes ? ` (${step.votes} votes)` : ''}`;
        });
      }
    } catch {
      // nextSteps wasn't JSON, just use raw content
    }

    await createCrystallizedPage({
      slug: `next-steps-${timestamp}`,
      title: `Next Steps (${timestamp})`,
      pageType: 'summary',
      content: nextStepsContent,
      tags: ['next-steps', 'action-items'],
      confidence: 0.85,
    });
  }

  // Mark synthesis as crystallized
  await prisma.synthesisOutput.update({
    where: { id: synthesisId },
    data: { crystallized: true },
  });

  console.log(`[Crystallization] Created ${pagesCreated.length} pages for synthesis ${synthesisId}`);

  return { pagesCreated: pagesCreated.length, pageIds: pagesCreated };
}

/**
 * Get all crystallized synthesis pages for a project, ordered by recency.
 */
export async function getCrystallizedHistory(
  projectId: string,
  limit: number = 10
): Promise<
  Array<{
    id: string;
    title: string;
    pageType: string;
    confidence: number;
    createdAt: Date;
    content: string;
  }>
> {
  const pages = await prisma.wikiPage.findMany({
    where: {
      projectId,
      pageType: 'crystallized',
      isStale: false,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      pageType: true,
      confidence: true,
      createdAt: true,
      content: true,
    },
  });

  return pages.map((p) => {
    // Backward-compat: old entries stored content as JSON {text, synthesisId, crystallizedAt}.
    // New entries store content as plain text. Handle both.
    let content = p.content;
    if (content.startsWith('{')) {
      try {
        const parsed = JSON.parse(content) as { text?: string };
        if (parsed.text) content = parsed.text;
      } catch {
        // Not JSON — keep as-is
      }
    }
    return { ...p, content };
  });
}
