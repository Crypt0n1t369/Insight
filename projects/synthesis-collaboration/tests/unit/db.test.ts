import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('DB Operations', () => {
  const testUserId = '1234567890';
  const testUserId2 = '9876543210';

  beforeAll(async () => {
    // Clean up test data
    await prisma.contribution.deleteMany({ where: { userId: { in: [testUserId, testUserId2] } } });
    await prisma.synthesisOutput.deleteMany({
      where: { generatedById: { in: [testUserId, testUserId2] } },
    });
    await prisma.project.deleteMany({ where: { createdById: { in: [testUserId, testUserId2] } } });
    await prisma.user.deleteMany({ where: { id: { in: [testUserId, testUserId2] } } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a user', async () => {
    const user = await prisma.user.create({
      data: {
        id: testUserId,
        username: 'testuser',
        firstName: 'Test',
        languageCode: 'en',
      },
    });

    expect(user.id).toBe(testUserId);
    expect(user.firstName).toBe('Test');
  });

  it('creates a project', async () => {
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'A test project',
        challengeStatement: 'How do we test things?',
        createdById: testUserId,
      },
    });

    expect(project.name).toBe('Test Project');
    expect(project.challengeStatement).toBe('How do we test things?');
    expect(project.status).toBe('active');
  });

  it('stores a contribution', async () => {
    const project = await prisma.project.findFirst({
      where: { createdById: testUserId },
    });

    if (!project) throw new Error('No project found');

    const contribution = await prisma.contribution.create({
      data: {
        projectId: project.id,
        userId: testUserId,
        content: 'This is a test contribution about AI safety.',
        source: 'group_command',
        confirmed: false,
        crossLinks: '[]',
      },
    });

    expect(contribution.content).toContain('test contribution');
    expect(contribution.confirmed).toBe(false);
  });

  it('stores a synthesis output', async () => {
    const project = await prisma.project.findFirst({
      where: { createdById: testUserId },
    });

    if (!project) throw new Error('No project found');

    const synthesis = await prisma.synthesisOutput.create({
      data: {
        projectId: project.id,
        commonalities: 'Recurring theme: alignment',
        divergences: 'Disagree on methodology',
        crossLinksSummary: 'AI safety connects to interpretability',
        structuredOutline: '1. Background\n2. Analysis\n3. Recommendations',
        nextSteps: JSON.stringify([{ step: 'Write paper', votes: 5 }]),
        generatedById: testUserId,
      },
    });

    expect((synthesis as any).commonalities ?? (synthesis as any).commonalities).toContain('alignment');
    expect(synthesis.projectId).toBe(project.id);
  });

  it('retrieves user by id', async () => {
    const user = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(user).not.toBeNull();
    expect(user?.firstName).toBe('Test');
  });

  it('updates contribution confirmed status', async () => {
    const contribution = await prisma.contribution.findFirst({
      where: { userId: testUserId },
    });

    if (!contribution) throw new Error('No contribution found');

    const updated = await prisma.contribution.update({
      where: { id: contribution.id },
      data: { confirmed: true },
    });

    expect(updated.confirmed).toBe(true);
  });

  it('adds contributor to project', async () => {
    const project = await prisma.project.findFirst({
      where: { createdById: testUserId },
    });

    if (!project) throw new Error('No project found');

    // Create second user
    await prisma.user.create({
      data: {
        id: testUserId2,
        firstName: 'Second',
      },
    });

    const contributor = await prisma.contributor.create({
      data: {
        projectId: project.id,
        userId: testUserId2,
        role: 'contributor',
      },
    });

    expect(contributor.role).toBe('contributor');
  });
});
