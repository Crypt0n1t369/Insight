import type { WikiPage } from '@prisma/client';
import prisma from '../db/index.js';

interface WikiPageInput {
  projectId: string;
  slug: string;
  title: string;
  content: string;
  pageType?: 'entity' | 'concept' | 'summary' | 'source' | 'index';
  tags?: string[];
}

/**
 * Creates or updates a wiki page within a project.
 * Uses upsert to handle both creation and updates atomically.
 */
export async function upsertWikiPage(input: WikiPageInput): Promise<WikiPage> {
  return prisma.wikiPage.upsert({
    where: {
      projectId_slug: {
        projectId: input.projectId,
        slug: input.slug,
      },
    },
    update: {
      title: input.title,
      content: input.content,
      pageType: input.pageType ?? 'entity',
      tags: JSON.stringify(input.tags ?? []),
      updatedAt: new Date(),
    },
    create: {
      projectId: input.projectId,
      slug: input.slug,
      title: input.title,
      content: input.content,
      pageType: input.pageType ?? 'entity',
      tags: JSON.stringify(input.tags ?? []),
    },
  });
}

/**
 * Gets all wiki pages for a project, optionally filtered by type.
 */
export async function getProjectWikiPages(
  projectId: string,
  pageType?: WikiPage['pageType']
): Promise<WikiPage[]> {
  return prisma.wikiPage.findMany({
    where: {
      projectId,
      ...(pageType ? { pageType } : {}),
    },
    orderBy: { updatedAt: 'desc' },
  });
}

/**
 * Builds or updates the project index wiki page.
 * This is the equivalent of index.md — lists all entities and concepts.
 */
export async function updateProjectIndex(projectId: string): Promise<WikiPage> {
  const pages = await prisma.wikiPage.findMany({
    where: { projectId },
    orderBy: [{ pageType: 'asc' }, { updatedAt: 'desc' }],
  });

  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { _count: { select: { contributions: true, contributors: true } } },
  });

  const indexContent = {
    overview: {
      name: project.name,
      description: project.description,
      challenge: project.challengeStatement,
      stats: {
        contributions: project._count.contributions,
        contributors: project._count.contributors,
      },
    },
    pagesByType: {} as Record<string, { slug: string; title: string; updatedAt: string }[]>,
  };

  for (const page of pages) {
    const type = page.pageType as string;
    if (!indexContent.pagesByType[type]) {
      indexContent.pagesByType[type] = [];
    }
    indexContent.pagesByType[type].push({
      slug: page.slug,
      title: page.title,
      updatedAt: page.updatedAt.toISOString(),
    });
  }

  return upsertWikiPage({
    projectId,
    slug: 'index',
    title: `${project.name} — Index`,
    content: JSON.stringify(indexContent, null, 2),
    pageType: 'index',
  });
}

/**
 * Appends an activity log entry to the project's log wiki page.
 * This is the equivalent of log.md — tracks all activity.
 */
export async function appendActivityLog(params: {
  projectId: string;
  event: string;
  userId: string;
  detail?: string;
}): Promise<WikiPage> {
  const logSlug = 'activity-log';
  const existing = await prisma.wikiPage.findUnique({
    where: { projectId_slug: { projectId: params.projectId, slug: logSlug } },
  });

  const entry = {
    timestamp: new Date().toISOString(),
    event: params.event,
    userId: params.userId,
    detail: params.detail,
  };

  let contentObj: { entries: Record<string, unknown>[] };
  if (existing?.content) {
    try {
      contentObj = JSON.parse(existing.content);
      contentObj.entries.push(entry);
    } catch {
      contentObj = { entries: [entry] };
    }
  } else {
    contentObj = { entries: [entry] };
  }

  return upsertWikiPage({
    projectId: params.projectId,
    slug: logSlug,
    title: 'Activity Log',
    content: JSON.stringify(contentObj, null, 2),
    pageType: 'summary',
  });
}

/**
 * Deletes a wiki page by slug within a project.
 */
export async function deleteWikiPage(projectId: string, slug: string): Promise<void> {
  await prisma.wikiPage.delete({
    where: { projectId_slug: { projectId, slug } },
  });
}
