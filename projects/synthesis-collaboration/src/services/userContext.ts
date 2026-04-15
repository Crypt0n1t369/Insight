/**
 * User Context Service
 * Builds a rich context string about a user's contributions, readiness,
 * and activity within a project — injected into LLM system prompts.
 */

import prisma from '../db/index.js';
import { getProjectKnowledgeGraph, applyConfidenceDecay } from './knowledgeGraph.js';

export interface UserContext {
  userId: string;
  username?: string;
  firstName?: string;
  projectId: string;
  projectName: string;
  challenge?: string;
  role: string;
  insightsCount: number;
  readinessStatus: string;
  lastActivity: Date | null;
  recentContributions: Array<{
    content: string;
    createdAt: Date;
    confirmed: boolean;
  }>;
  wikiPagesCount: number;
  groupId?: string;
}

/**
 * Get full user contribution context for a project.
 */
export async function getUserContext(params: {
  userId: string;
  projectId: string;
}): Promise<UserContext | null> {
  const contributor = await prisma.contributor.findUnique({
    where: { projectId_userId: { projectId: params.projectId, userId: params.userId } },
    include: {
      user: true,
      readinessSignal: true,
      project: {
        include: {
          _count: { select: { contributions: true, wikiPages: true } },
          contributions: {
            where: { userId: params.userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { content: true, createdAt: true, confirmed: true },
          },
        },
      },
    },
  });

  if (!contributor) return null;

  // Defensive: user relation may not exist if DB is inconsistent
  if (!contributor.user) return null;

  return {
    userId: params.userId,
    username: contributor.user.username ?? undefined,
    firstName: contributor.user.firstName,
    projectId: params.projectId,
    projectName: contributor.project.name,
    challenge: contributor.project.challengeStatement ?? undefined,
    role: contributor.role,
    insightsCount: contributor.readinessSignal?.insightsCount ?? 0,
    readinessStatus: contributor.readinessSignal?.status ?? 'contributing',
    lastActivity: contributor.readinessSignal?.lastActivity ?? null,
    recentContributions: contributor.project.contributions.map((c) => ({
      content: c.content,
      createdAt: c.createdAt,
      confirmed: c.confirmed,
    })),
    wikiPagesCount: contributor.project._count.wikiPages,
    groupId: contributor.project.groupId ?? undefined,
  };
}

/**
 * Build a contribution summary string for the LLM system prompt.
 * This gives the LLM full context about who it's talking to.
 */
export function formatUserContextForLLM(ctx: UserContext): string {
  const lines: string[] = [];
  lines.push(`Project: ${ctx.projectName}`);
  if (ctx.challenge) lines.push(`Challenge: ${ctx.challenge}`);
  lines.push(`Your role: ${ctx.role}`);
  lines.push(`Your insights shared: ${ctx.insightsCount}`);
  lines.push(`Readiness: ${ctx.readinessStatus}`);

  if (ctx.recentContributions.length > 0) {
    lines.push(`\nYour recent contributions:`);
    ctx.recentContributions.forEach((c, i) => {
      const preview = c.content.length > 100 ? c.content.slice(0, 100) + '…' : c.content;
      lines.push(`  ${i + 1}. [${c.confirmed ? '✓' : '○'}] ${preview}`);
    });
  }

  return lines.join('\n');
}

/**
 * Build a project-wide summary for the LLM (used in group chats).
 * Now includes knowledge graph: entities, relationships, and recent wiki pages.
 */
export async function getProjectSummaryForLLM(projectId: string): Promise<string> {
  // Apply light confidence decay on access (keeps knowledge fresh)
  await applyConfidenceDecay(projectId, 0.005, 0.15).catch(() => {});

  const [project, graph] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: { select: { contributions: true, contributors: true, wikiPages: true } },
        contributors: {
          include: { readinessSignal: true },
          orderBy: { joinedAt: 'asc' },
        },
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, content: true, userId: true, createdAt: true, confirmed: true },
        },
      },
    }),
    getProjectKnowledgeGraph(projectId, 15, 20),
  ]);

  if (!project) return 'No project context available.';

  const lines: string[] = [];
  lines.push(`Project: ${project.name}`);
  if (project.challengeStatement) lines.push(`Challenge: ${project.challengeStatement}`);
  lines.push(`Contributors: ${project._count.contributors}`);
  lines.push(`Total insights: ${project._count.contributions}`);
  lines.push(`Wiki pages: ${project._count.wikiPages}`);

  // Knowledge graph section
  if (graph.entities.length > 0) {
    lines.push(`\n--- Knowledge Graph ---`);
    lines.push(`Key entities:`);
    graph.entities.slice(0, 8).forEach((e) => {
      lines.push(`  • ${e.name} (${e.entityType}) @ ${Math.round(e.confidence * 100)}%`);
    });
  }

  if (graph.relationships.length > 0) {
    lines.push(`Key relationships:`);
    graph.relationships.slice(0, 6).forEach((r) => {
      lines.push(`  • ${r.source} --[${r.type}]--> ${r.target}`);
    });
  }

  lines.push(`\nContributor readiness:`);
  for (const c of project.contributors) {
    const status = c.readinessSignal?.status ?? 'contributing';
    const count = c.readinessSignal?.insightsCount ?? 0;
    const name = c.user.firstName + (c.user.username ? ` (@${c.user.username})` : '');
    lines.push(`  • ${name}: ${status} (${count} insights)`);
  }

  if (project.contributions.length > 0) {
    lines.push(`\nRecent contributions:`);
    project.contributions.slice(0, 5).forEach((c) => {
      const preview = c.content.length > 80 ? c.content.slice(0, 80) + '…' : c.content;
      lines.push(`  [${c.confirmed ? '✓' : '○'}] ${preview}`);
    });
  }

  return lines.join('\n');
}
