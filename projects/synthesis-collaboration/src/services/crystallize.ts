/**
 * Crystallization Service
 * Implements the "crystallization" pattern from LLM Wiki v2:
 * Completed synthesis sessions are distilled into structured wiki pages.
 *
 * When /generate produces a synthesis, this service files the results
 * back into the knowledge base as typed wiki pages with high confidence.
 */

import prisma from '../db/index.js';
import { supersedePage } from './knowledgeGraph.js';
import type { SynthesisResult } from '../types/index.js';

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
      title: `Divergences (${timestamp})`,
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
