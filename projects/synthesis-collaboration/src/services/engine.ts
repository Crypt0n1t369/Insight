import prisma from '../db/index.js';
import { getProjectWikiPages } from './wiki.js';
import type { WikiPage } from '@prisma/client';

export type ContextStatus = 'saturated' | 'growing' | 'stale';

export interface ContextHealthResult {
  status: ContextStatus;
  insightsCount: number;
  contributorsCount: number;
  wikiPagesCount: number;
  gaps: string[];
  contradictions: string[];
  readyCount: number;
  totalContributors: number;
  suggestion: string;
}

/**
 * Evaluates the current context health for a project.
 * Called on every Nth insight (configurable via INSIGHT_CHECK_THRESHOLD env)
 * and via OpenClaw cron task files.
 */
export async function evaluateContextHealth(projectId: string): Promise<ContextHealthResult> {
  const checkThreshold = parseInt(process.env.INSIGHT_CHECK_THRESHOLD ?? '5', 10);

  const [contributions, contributors, wikiPages, readinessSignals] = await Promise.all([
    prisma.contribution.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } }),
    prisma.contributor.findMany({ where: { projectId } }),
    getProjectWikiPages(projectId),
    prisma.readinessSignal.findMany({ where: { projectId } }),
  ]);

  const insightsCount = contributions.length;
  const contributorsCount = contributors.length;
  const wikiPagesCount = wikiPages.length;
  const readySignals = readinessSignals.filter(r => r.status === 'ready');
  const readyCount = readySignals.length;

  const gaps = detectGaps(contributions, wikiPages);
  const contradictions = detectContradictions(wikiPages);

  const status = determineStatus({
    insightsCount,
    wikiPagesCount,
    readyCount,
    totalContributors: contributorsCount,
    gaps,
    contradictions,
    checkThreshold,
  });

  const suggestion = buildSuggestion(status, {
    insightsCount,
    readyCount,
    totalContributors: contributorsCount,
    gaps,
    contradictions,
  });

  return {
    status,
    insightsCount,
    contributorsCount,
    wikiPagesCount,
    gaps,
    contradictions,
    readyCount,
    totalContributors: contributorsCount,
    suggestion,
  };
}

function detectGaps(contributions: { content: string }[], wikiPages: WikiPage[]): string[] {
  const gaps: string[] = [];
  const wikiTitles = wikiPages.map(p => p.title.toLowerCase());

  const contributionTexts = contributions.map(c => c.content.toLowerCase());

  const topicCounts = new Map<string, number>();
  for (const text of contributionTexts) {
    const words = text.split(/\s+/).filter(w => w.length > 5);
    const unique = [...new Set(words)];
    unique.forEach(w => topicCounts.set(w, (topicCounts.get(w) ?? 0) + 1));
  }

  const threshold = contributions.length * 0.5;
  for (const [topic, count] of topicCounts) {
    if (count >= threshold && !wikiTitles.some(t => t.includes(topic))) {
      gaps.push(`Topic "${topic}" mentioned ${count}x but no wiki page`);
    }
  }

  return gaps.slice(0, 5);
}

function detectContradictions(wikiPages: WikiPage[]): string[] {
  const contradictions: string[] = [];

  const byType = new Map<string, WikiPage[]>();
  for (const page of wikiPages) {
    const list = byType.get(page.pageType) ?? [];
    list.push(page);
    byType.set(page.pageType, list);
  }

  for (const [type, pages] of byType) {
    for (let i = 0; i < pages.length; i++) {
      for (let j = i + 1; j < pages.length; j++) {
        const titleA = pages[i].title.toLowerCase();
        const titleB = pages[j].title.toLowerCase();
        if (titleA.includes(titleB) || titleB.includes(titleA)) {
          const contentA = pages[i].content.slice(0, 200);
          const contentB = pages[j].content.slice(0, 200);
          if (contentA !== contentB) {
            contradictions.push(`"${pages[i].title}" and "${pages[j].title}" may have conflicting content`);
          }
        }
      }
    }
  }

  return contradictions.slice(0, 3);
}

function determineStatus(params: {
  insightsCount: number;
  wikiPagesCount: number;
  readyCount: number;
  totalContributors: number;
  gaps: string[];
  contradictions: string[];
  checkThreshold: number;
}): ContextStatus {
  const { insightsCount, wikiPagesCount, readyCount, totalContributors, gaps, contradictions, checkThreshold } = params;

  if (insightsCount === 0) return 'growing';

  const coverageRatio = wikiPagesCount / Math.max(insightsCount, 1);
  const readinessRatio = totalContributors > 0 ? readyCount / totalContributors : 0;

  if (coverageRatio >= 0.3 && readinessRatio >= 0.5 && gaps.length <= 2 && contradictions.length <= 1) {
    return 'saturated';
  }

  if (insightsCount < checkThreshold || readinessRatio < 0.3) {
    return 'growing';
  }

  return 'stale';
}

function buildSuggestion(status: ContextStatus, params: {
  insightsCount: number;
  readyCount: number;
  totalContributors: number;
  gaps: string[];
  contradictions: string[];
}): string {
  const { insightsCount, readyCount, totalContributors, gaps, contradictions } = params;

  switch (status) {
    case 'saturated':
      return `Context is rich — ${insightsCount} insights across ${totalContributors} contributors. Ready to synthesize. Trigger /generate or wait for consensus.`;
    case 'growing':
      if (gaps.length > 0) {
        return `${insightsCount} insights collected. Consider exploring: ${gaps.slice(0, 2).map(g => g.split('"')[1] ?? g).join(', ') || 'additional topics'}.`;
      }
      return `${insightsCount} insights building. More contributions welcome — /generate when ready, or /ready to signal done.`;
    case 'stale':
      if (contradictions.length > 0) {
        return `Context may have contradictions: ${contradictions[0].split('"')[1] ?? 'review needed'}. Consider /audit to resolve.`;
      }
      return `No recent activity. Either synthesize (/generate) or prompt contributors to continue (/insight).`;
    default:
      return `${insightsCount} insights collected.`;
  }
}

/**
 * Increments the readiness signal for a contributor.
 * Looks up the Contributor record by (projectId, userId) then uses its id.
 */
export async function markContributorReady(projectId: string, userId: string): Promise<{
  isConsensus: boolean;
  readyCount: number;
  totalContributors: number;
  message: string;
}> {
  const threshold = parseFloat(process.env.CONSENSUS_THRESHOLD ?? '1.0');

  // Find the Contributor record for this user in this project
  const contributor = await prisma.contributor.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!contributor) {
    throw new Error('You are not a contributor to this project.');
  }

  const signal = await prisma.readinessSignal.upsert({
    where: { projectId_contributorId: { projectId, contributorId: contributor.id } },
    update: { status: 'ready', lastActivity: new Date() },
    create: {
      projectId,
      contributorId: contributor.id,
      status: 'ready',
      insightsCount: await prisma.contribution.count({ where: { projectId, userId } }),
    },
  });

  const readyCount = await prisma.readinessSignal.count({
    where: { projectId, status: 'ready' },
  });

  const totalContributors = await prisma.contributor.count({ where: { projectId } });

  const consensusRatio = totalContributors > 0 ? readyCount / totalContributors : 0;
  const isConsensus = consensusRatio >= threshold;

  const message = isConsensus
    ? `✅ *Consensus reached!*\n${readyCount}/${totalContributors} contributors ready.`
    : `👍 Marked as ready.\n${readyCount}/${totalContributors} contributors ready — waiting for others.`;

  return { isConsensus, readyCount, totalContributors, message };
}

/**
 * Resets readiness signals when new contributions come in.
 * A contributor who was "ready" becomes "contributing" again if they add more insights.
 */
export async function resetReadinessOnNewInsight(projectId: string, userId: string): Promise<void> {
  const contributor = await prisma.contributor.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!contributor) return;

  const existing = await prisma.readinessSignal.findUnique({
    where: { projectId_contributorId: { projectId, contributorId: contributor.id } },
  });

  if (existing?.status === 'ready') {
    await prisma.readinessSignal.update({
      where: { projectId_contributorId: { projectId, contributorId: contributor.id } },
      data: { status: 'contributing', lastActivity: new Date() },
    });
  }
}
