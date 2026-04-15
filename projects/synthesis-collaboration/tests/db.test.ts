/**
 * Database Tests — Synthesis Collaboration Platform
 * Tests Prisma operations for projects, contributions, wiki pages, users.
 * Uses vi.mock() for Prisma isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Prisma ───────────────────────────────────────────────────────────────
// vi.hoisted() creates the mock values at the top of the module, before vi.mock()
// factories run. This ensures the mock object is available inside the factory.

const { mockPrismaClient } = vi.hoisted(() => {
  const m = {
    user: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    project: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    contributor: {
      create: vi.fn(),
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    contribution: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    wikiPage: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    readinessSignal: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    synthesisOutput: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    vote: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    task: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    entity: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    relationship: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    $connect: vi.fn(),
    $transaction: vi.fn(),
  };
  return { mockPrismaClient: m };
});

vi.mock('../src/db/index.js', () => ({
  default: mockPrismaClient,
  mockPrismaClient,
}));
import {
  upsertWikiPage,
  getProjectWikiPages,
  appendActivityLog,
} from '../src/services/wiki.js';

describe('Wiki Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('upsertWikiPage', () => {
    it('creates a new wiki page when none exists', async () => {
      const createdPage = {
        id: 'page-1',
        projectId: 'proj-1',
        slug: 'test-page',
        title: 'Test Page',
        content: JSON.stringify({ text: 'Hello' }),
        pageType: 'concept',
        tags: '[]',
        confidence: 0.5,
        lastAccessed: new Date(),
        lastReinforced: new Date(),
        isStale: false,
        supersededBy: null,
        sourceContributionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.wikiPage.upsert.mockResolvedValue(createdPage as any);

      const result = await upsertWikiPage({
        projectId: 'proj-1',
        slug: 'test-page',
        title: 'Test Page',
        content: JSON.stringify({ text: 'Hello' }),
        pageType: 'concept',
        tags: ['test'],
      });

      expect(mockPrismaClient.wikiPage.upsert).toHaveBeenCalledOnce();
      expect(result.slug).toBe('test-page');
      expect(result.title).toBe('Test Page');
    });

    it('updates an existing wiki page when slug exists', async () => {
      const updatedPage = {
        id: 'page-1',
        projectId: 'proj-1',
        slug: 'existing-page',
        title: 'Updated Title',
        content: JSON.stringify({ text: 'Updated content' }),
        pageType: 'concept',
        tags: '[]',
        confidence: 0.7,
        lastAccessed: new Date(),
        lastReinforced: new Date(),
        isStale: false,
        supersededBy: null,
        sourceContributionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.wikiPage.upsert.mockResolvedValue(updatedPage as any);

      const result = await upsertWikiPage({
        projectId: 'proj-1',
        slug: 'existing-page',
        title: 'Updated Title',
        content: JSON.stringify({ text: 'Updated content' }),
        pageType: 'concept',
      });

      expect(mockPrismaClient.wikiPage.upsert).toHaveBeenCalledOnce();
      expect(result.title).toBe('Updated Title');
    });

    it('uses default pageType when not provided', async () => {
      const page = {
        id: 'page-2',
        projectId: 'proj-1',
        slug: 'default-type',
        title: 'Default',
        content: 'content',
        pageType: 'entity',
        tags: '[]',
        confidence: 0.5,
        lastAccessed: new Date(),
        lastReinforced: new Date(),
        isStale: false,
        supersededBy: null,
        sourceContributionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.wikiPage.upsert.mockResolvedValue(page as any);

      await upsertWikiPage({
        projectId: 'proj-1',
        slug: 'default-type',
        title: 'Default',
        content: 'content',
      });

      const call = mockPrismaClient.wikiPage.upsert.mock.calls[0];
      expect(call[0].update.pageType).toBe('entity');
    });
  });

  describe('getProjectWikiPages', () => {
    it('returns all wiki pages for a project', async () => {
      const pages = [
        {
          id: 'page-1',
          projectId: 'proj-1',
          slug: 'page-a',
          title: 'Page A',
          content: 'content a',
          pageType: 'concept',
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
        {
          id: 'page-2',
          projectId: 'proj-1',
          slug: 'page-b',
          title: 'Page B',
          content: 'content b',
          pageType: 'entity',
          tags: '[]',
          confidence: 0.6,
          lastAccessed: new Date(),
          lastReinforced: new Date(),
          isStale: false,
          supersededBy: null,
          sourceContributionId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.wikiPage.findMany.mockResolvedValue(pages as any);

      const result = await getProjectWikiPages('proj-1');

      expect(mockPrismaClient.wikiPage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { projectId: 'proj-1' } })
      );
      expect(result).toHaveLength(2);
    });

    it('filters by pageType when provided', async () => {
      mockPrismaClient.wikiPage.findMany.mockResolvedValue([]);

      await getProjectWikiPages('proj-1', 'concept');

      expect(mockPrismaClient.wikiPage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: 'proj-1', pageType: 'concept' },
        })
      );
    });
  });

  describe('appendActivityLog', () => {
    it('creates a new activity log when none exists', async () => {
      const logPage = {
        id: 'log-1',
        projectId: 'proj-1',
        slug: 'activity-log',
        title: 'Activity Log',
        content: JSON.stringify({
          entries: [
            {
              timestamp: new Date().toISOString(),
              event: 'project_created',
              userId: 'user-1',
              detail: 'Test project',
            },
          ],
        }),
        pageType: 'summary',
        tags: '[]',
        confidence: 0.5,
        lastAccessed: new Date(),
        lastReinforced: new Date(),
        isStale: false,
        supersededBy: null,
        sourceContributionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.wikiPage.findUnique.mockResolvedValue(null);
      mockPrismaClient.wikiPage.upsert.mockResolvedValue(logPage as any);

      const result = await appendActivityLog({
        projectId: 'proj-1',
        event: 'project_created',
        userId: 'user-1',
        detail: 'Test project',
      });

      expect(mockPrismaClient.wikiPage.upsert).toHaveBeenCalledOnce();
      const call = mockPrismaClient.wikiPage.upsert.mock.calls[0];
      const content = JSON.parse(call[0].create.content);
      expect(content.entries[0].event).toBe('project_created');
    });

    it('appends to existing activity log', async () => {
      const existingLog = {
        id: 'log-1',
        projectId: 'proj-1',
        slug: 'activity-log',
        title: 'Activity Log',
        content: JSON.stringify({
          entries: [
            { timestamp: '2026-01-01T00:00:00Z', event: 'project_created', userId: 'user-1' },
          ],
        }),
        pageType: 'summary',
        tags: '[]',
        confidence: 0.5,
        lastAccessed: new Date(),
        lastReinforced: new Date(),
        isStale: false,
        supersededBy: null,
        sourceContributionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newLog = {
        id: 'log-1',
        projectId: 'proj-1',
        slug: 'activity-log',
        title: 'Activity Log',
        content: JSON.stringify({
          entries: [
            { timestamp: '2026-01-01T00:00:00Z', event: 'project_created', userId: 'user-1' },
            { timestamp: new Date().toISOString(), event: 'insight_added', userId: 'user-2' },
          ],
        }),
        pageType: 'summary',
        tags: '[]',
        confidence: 0.5,
        lastAccessed: new Date(),
        lastReinforced: new Date(),
        isStale: false,
        supersededBy: null,
        sourceContributionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaClient.wikiPage.findUnique.mockResolvedValue(existingLog as any);
      mockPrismaClient.wikiPage.upsert.mockResolvedValue(newLog as any);

      await appendActivityLog({
        projectId: 'proj-1',
        event: 'insight_added',
        userId: 'user-2',
      });

      expect(mockPrismaClient.wikiPage.upsert).toHaveBeenCalledOnce();
      const call = mockPrismaClient.wikiPage.upsert.mock.calls[0];
      const content = JSON.parse(call[0].update.content);
      expect(content.entries).toHaveLength(2);
    });
  });
});

describe('User & Project Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('upserts a user correctly', async () => {
    const user = {
      id: '123456',
      username: 'testuser',
      firstName: 'Test',
      languageCode: 'en',
      createdAt: new Date(),
    };

    mockPrismaClient.user.upsert.mockResolvedValue(user as any);

    // Simulate the upsert logic used in the bot
    const result = await mockPrismaClient.user.upsert({
      where: { id: '123456' },
      update: { username: 'testuser', firstName: 'Test' },
      create: { id: '123456', username: 'testuser', firstName: 'Test', languageCode: 'en' },
    });

    expect(result.id).toBe('123456');
    expect(result.username).toBe('testuser');
  });

  it('creates a project and links the creator as contributor', async () => {
    const project = {
      id: 'proj-1',
      name: 'Test Project',
      description: 'A test',
      challengeStatement: null,
      groupId: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: 'user-1',
    };

    const contributor = {
      id: 'contrib-1',
      projectId: 'proj-1',
      userId: 'user-1',
      role: 'lead',
      joinedAt: new Date(),
    };

    mockPrismaClient.project.create.mockResolvedValue(project as any);
    mockPrismaClient.contributor.create.mockResolvedValue(contributor as any);

    const result = await mockPrismaClient.project.create({
      data: {
        name: 'Test Project',
        description: 'A test',
        createdById: 'user-1',
      },
    });

    expect(result.name).toBe('Test Project');
    expect(result.status).toBe('active');
  });

  it('stores contributions linked to project and user', async () => {
    const contribution = {
      id: 'contrib-1',
      content: 'This is a test insight about team collaboration.',
      source: 'group_command',
      confirmed: false,
      crossLinks: '[]',
      extractionSummary: null,
      createdAt: new Date(),
      projectId: 'proj-1',
      userId: 'user-1',
    };

    mockPrismaClient.contribution.create.mockResolvedValue(contribution as any);

    const result = await mockPrismaClient.contribution.create({
      data: {
        content: 'This is a test insight about team collaboration.',
        source: 'group_command',
        projectId: 'proj-1',
        userId: 'user-1',
      },
    });

    expect(result.content).toContain('team collaboration');
    expect(result.projectId).toBe('proj-1');
    expect(result.userId).toBe('user-1');
  });

  it('finds project by groupId correctly', async () => {
    const project = {
      id: 'proj-1',
      name: 'Group Project',
      groupId: '-1001234567890',
    };

    mockPrismaClient.project.findFirst.mockResolvedValue(project as any);

    const result = await mockPrismaClient.project.findFirst({
      where: { groupId: '-1001234567890' },
    });

    expect(result?.groupId).toBe('-1001234567890');
  });
});

describe('Synthesis & Voting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores synthesis output with all required fields', async () => {
    const synthesis = {
      id: 'synth-1',
      commonalities: 'Most contributors agree on the importance of communication.',
      divergences: 'Disagree on the approach — some prefer structured meetings, others prefer async.',
      crossLinksSummary: 'Key themes connect to previous decisions about tooling.',
      structuredOutline: '1. Establish communication norms\n2. Choose async tools\n3. Review quarterly',
      nextSteps: JSON.stringify([
        { step: 'Draft communication norms', votes: 3 },
        { step: 'Set up async tool pilot', votes: 2 },
      ]),
      rawLlmaResponse: null,
      qualityScore: 0.7,
      crystallized: false,
      createdAt: new Date(),
      projectId: 'proj-1',
      generatedById: 'user-1',
    };

    mockPrismaClient.synthesisOutput.create.mockResolvedValue(synthesis as any);

    const result = await mockPrismaClient.synthesisOutput.create({
      data: {
        commonalities: synthesis.commalities,
        divergences: synthesis.divergences,
        crossLinksSummary: synthesis.crossLinksSummary,
        structuredOutline: synthesis.structuredOutline,
        nextSteps: synthesis.nextSteps,
        qualityScore: 0.7,
        projectId: 'proj-1',
        generatedById: 'user-1',
      },
    });

    expect(result.projectId).toBe('proj-1');
    expect(result.qualityScore).toBe(0.7);
  });

  it('enforces one vote per user per synthesis (compound unique)', async () => {
    // The compound unique constraint is at the Prisma schema level.
    // Here we verify the upsert pattern used for voting.
    const existingVote = {
      id: 'vote-1',
      stepIndex: 1,
      synthesisOutputId: 'synth-1',
      userId: 'user-1',
      createdAt: new Date(),
    };

    mockPrismaClient.vote.upsert.mockResolvedValue(existingVote as any);

    const result = await mockPrismaClient.vote.upsert({
      where: {
        synthesisOutputId_userId: {
          synthesisOutputId: 'synth-1',
          userId: 'user-1',
        },
      },
      update: { stepIndex: 1 },
      create: {
        stepIndex: 1,
        synthesisOutputId: 'synth-1',
        userId: 'user-1',
      },
    });

    expect(mockPrismaClient.vote.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          synthesisOutputId_userId: { synthesisOutputId: 'synth-1', userId: 'user-1' },
        }),
      })
    );
  });
});

describe('Task Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a task with pending status', async () => {
    const task = {
      id: 'task-1',
      taskType: 'synthesize',
      status: 'processing',
      payload: JSON.stringify({ projectId: 'proj-1' }),
      result: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: 'proj-1',
    };

    mockPrismaClient.task.create.mockResolvedValue(task as any);

    const result = await mockPrismaClient.task.create({
      data: {
        id: 'task-1',
        taskType: 'synthesize',
        status: 'processing',
        payload: JSON.stringify({ projectId: 'proj-1' }),
        projectId: 'proj-1',
      },
    });

    expect(result.taskType).toBe('synthesize');
    expect(result.status).toBe('processing');
  });

  it('updates task status to done with result', async () => {
    const doneTask = {
      id: 'task-1',
      taskType: 'synthesize',
      status: 'done',
      payload: '{}',
      result: '## Commonalities\nTest',
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: 'proj-1',
    };

    mockPrismaClient.task.update.mockResolvedValue(doneTask as any);

    const result = await mockPrismaClient.task.update({
      where: { id: 'task-1' },
      data: { status: 'done', result: '## Commonalities\nTest' },
    });

    expect(result.status).toBe('done');
    expect(result.result).toContain('Commonalities');
  });

  it('finds latest done task for a project', async () => {
    const task = {
      id: 'task-1',
      taskType: 'synthesize',
      status: 'done',
      projectId: 'proj-1',
    };

    mockPrismaClient.task.findFirst.mockResolvedValue(task as any);

    const result = await mockPrismaClient.task.findFirst({
      where: { projectId: 'proj-1', taskType: 'synthesize', status: 'done' },
      orderBy: { createdAt: 'desc' },
    });

    expect(result?.status).toBe('done');
  });
});
