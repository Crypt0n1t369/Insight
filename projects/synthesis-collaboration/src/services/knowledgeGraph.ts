/**
 * Knowledge Graph Service
 * Implements LLM Wiki v2 patterns for the synthesis platform:
 * - Entity extraction from contributions
 * - Typed relationships with confidence scoring
 * - Supersession: new info can mark old claims as stale
 * - Confidence decay + reinforcement
 * - Graph traversal for context injection
 *
 * Follows the consolidation tiers:
 *   Raw contribution → Entity/Relationship extraction → Wiki page (crystallized)
 */

import prisma from '../db/index.js';
import type { Contribution } from '@prisma/client';

// ─── Types ───────────────────────────────────────────────────────────────────

export type EntityType = 'person' | 'concept' | 'tool' | 'project' | 'file' | 'decision' | 'event' | 'unknown';

export interface ExtractedEntity {
  name: string;
  entityType: EntityType;
  description?: string;
  attributes?: Record<string, string>;
}

export interface ExtractedRelationship {
  sourceName: string;
  targetName: string;
  relationType: 'uses' | 'depends_on' | 'caused' | 'contradicts' | 'implements' | 'supersedes' | 'related_to' | 'part_of';
  note?: string;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  relationships: ExtractedRelationship[];
  summary: string;
}

// ─── Entity Extraction ────────────────────────────────────────────────────────
// Uses MiniMax LLM to extract structured entities + relationships from raw text.

export async function extractEntitiesFromText(
  text: string,
  projectId: string
): Promise<ExtractionResult> {
  const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY ?? '';
  const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID ?? '';
  const MINIMAX_BASE_URL = process.env.MINIMAX_BASE_URL ?? 'https://api.minimax.chat/v1';

  if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
    // Fallback: simple keyword-based extraction without LLM
    return simpleKeywordExtraction(text);
  }

  const prompt = `You are an entity extraction system. Given a piece of text, extract:
1. Named entities (people, tools, projects, concepts, files, decisions, events)
2. Typed relationships between them

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "entities": [
    {"name": "Entity Name", "entityType": "person|concept|tool|project|file|decision|event|unknown", "description": "optional description", "attributes": {"key": "value"}}
  ],
  "relationships": [
    {"sourceName": "Source", "targetName": "Target", "relationType": "uses|depends_on|caused|contradicts|implements|supersedes|related_to|part_of", "note": "optional"}
  ],
  "summary": "2-3 sentence summary of the key points"
}

Text to analyze:
${text.slice(0, 2000)}`;

  try {
    const url = `${MINIMAX_BASE_URL}/text/chatcompletion_pro?GroupId=${MINIMAX_GROUP_ID}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        tokens_to_generate: 600,
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      console.error(`[KnowledgeGraph] Extraction LLM error ${res.status}`);
      return simpleKeywordExtraction(text);
    }

    const data = await res.json() as {
      choices?: Array<{ messages?: Array<{ text?: string }> }>;
    };

    const raw = data.choices?.[0]?.messages?.[0]?.text ?? '';
    const cleaned = raw.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');

    const parsed = JSON.parse(cleaned) as {
      entities?: Array<{
        name?: string;
        entityType?: string;
        description?: string;
        attributes?: Record<string, string>;
      }>;
      relationships?: Array<{
        sourceName?: string;
        targetName?: string;
        relationType?: string;
        note?: string;
      }>;
      summary?: string;
    };

    return {
      entities: (parsed.entities ?? []).map((e) => ({
        name: e.name ?? 'Unknown',
        entityType: (e.entityType ?? 'unknown') as EntityType,
        description: e.description,
        attributes: e.attributes ?? {},
      })),
      relationships: (parsed.relationships ?? []).map((r) => ({
        sourceName: r.sourceName ?? '',
        targetName: r.targetName ?? '',
        relationType: (r.relationType ?? 'related_to') as ExtractedRelationship['relationType'],
        note: r.note,
      })),
      summary: parsed.summary ?? '',
    };
  } catch (err) {
    console.error(`[KnowledgeGraph] Extraction failed: ${err}`);
    return simpleKeywordExtraction(text);
  }
}

/**
 * Simple fallback extraction without LLM — keyword + pattern matching.
 */
function simpleKeywordExtraction(text: string): ExtractionResult {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const summary = sentences.slice(0, 2).join('. ').trim();

  // Very basic entity detection
  const entityNames = [
    ...text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) ?? [],
    ...text.match(/\b(?:Redis|PostgreSQL|GitHub|Telegram|MiniMax|OpenAI|Claude)\b/g) ?? [],
  ];

  const entities = [...new Set(entityNames)].map((name) => ({
    name,
    entityType: guessEntityType(name) as EntityType,
  }));

  return { entities, relationships: [], summary };
}

function guessEntityType(name: string): string {
  const toolKeywords = ['Redis', 'PostgreSQL', 'GitHub', 'Telegram', 'API', 'SDK', 'DB'];
  if (toolKeywords.some((k) => name.includes(k))) return 'tool';
  const projectKeywords = ['Project', 'System', 'Platform', 'App'];
  if (projectKeywords.some((k) => name.includes(k))) return 'project';
  return 'unknown';
}

// ─── Upsert Entities ─────────────────────────────────────────────────────────

/**
 * Upsert entities from a contribution, incrementing sourceCount if they already exist.
 * Also marks existing entities with higher sourceCount as more confident.
 */
export async function upsertEntities(
  entities: ExtractedEntity[],
  contributionId: string,
  projectId: string
): Promise<void> {
  for (const entity of entities) {
    const existing = await prisma.entity.findUnique({
      where: { projectId_name: { projectId, name: entity.name } },
    });

    if (existing) {
      // Reinforce: increment source count, slightly boost confidence
      const newConfidence = Math.min(0.99, existing.confidence + 0.05);
      const newSourceCount = existing.sourceCount + 1;
      await prisma.entity.update({
        where: { id: existing.id },
        data: {
          sourceCount: newSourceCount,
          confidence: newConfidence,
          lastReinforced: new Date(),
          isStale: false,
          description: entity.description ?? existing.description,
        },
      });
    } else {
      await prisma.entity.create({
        data: {
          name: entity.name,
          entityType: entity.entityType,
          description: entity.description,
          attributes: JSON.stringify(entity.attributes ?? {}),
          confidence: 0.5,
          sourceCount: 1,
          projectId,
        },
      });
    }
  }
}

// ─── Upsert Relationships ────────────────────────────────────────────────────

/**
 * Upsert relationships, reinforcing confidence if the same relationship is seen again.
 */
export async function upsertRelationships(
  relationships: ExtractedRelationship[],
  contributionId: string,
  projectId: string
): Promise<void> {
  for (const rel of relationships) {
    // Resolve entity names to IDs
    const sourceEntity = await prisma.entity.findUnique({
      where: { projectId_name: { projectId, name: rel.sourceName } },
    });
    const targetEntity = await prisma.entity.findUnique({
      where: { projectId_name: { projectId, name: rel.targetName } },
    });

    if (!sourceEntity || !targetEntity) continue; // Can't create relationship without both ends

    const existing = await prisma.relationship.findUnique({
      where: {
        projectId_sourceId_targetId_relationType: {
          projectId,
          sourceId: sourceEntity.id,
          targetId: targetEntity.id,
          relationType: rel.relationType,
        },
      },
    });

    if (existing) {
      // Reinforce confidence
      await prisma.relationship.update({
        where: { id: existing.id },
        data: {
          confidence: Math.min(0.99, existing.confidence + 0.1),
          lastReinforced: new Date(),
          isStale: false,
        },
      });
    } else {
      await prisma.relationship.create({
        data: {
          sourceId: sourceEntity.id,
          targetId: targetEntity.id,
          relationType: rel.relationType,
          confidence: 0.6,
          sourceContributionId: contributionId,
          note: rel.note,
          projectId,
        },
      });
    }
  }
}

// ─── Confidence Decay ─────────────────────────────────────────────────────────

/**
 * Apply confidence decay to entities and wiki pages.
 * Facts that haven't been reinforced in `maxAgeDays` get their confidence reduced.
 * This is the "forgetting curve" from LLM Wiki v2.
 *
 * Call this periodically (e.g., on project load or via cron).
 */
export async function applyConfidenceDecay(
  projectId: string,
  decayRate: number = 0.02, // 2% decay per call
  staleThreshold: number = 0.2
): Promise<{ entitiesDecayed: number; pagesDecayed: number }> {
  const now = new Date();

  // Decay entities
  const staleCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days
  const entities = await prisma.entity.findMany({
    where: {
      projectId,
      isStale: false,
      updatedAt: { lt: staleCutoff },
    },
  });

  let entitiesDecayed = 0;
  for (const entity of entities) {
    const newConfidence = entity.confidence - decayRate;
    if (newConfidence <= staleThreshold) {
      await prisma.entity.update({
        where: { id: entity.id },
        data: { confidence: newConfidence, isStale: true },
      });
    } else {
      await prisma.entity.update({
        where: { id: entity.id },
        data: { confidence: newConfidence },
      });
    }
    entitiesDecayed++;
  }

  // Decay wiki pages
  const pages = await prisma.wikiPage.findMany({
    where: {
      projectId,
      isStale: false,
      lastReinforced: { lt: staleCutoff },
    },
  });

  let pagesDecayed = 0;
  for (const page of pages) {
    const newConfidence = page.confidence - decayRate;
    if (newConfidence <= staleThreshold) {
      await prisma.wikiPage.update({
        where: { id: page.id },
        data: { confidence: newConfidence, isStale: true },
      });
    } else {
      await prisma.wikiPage.update({
        where: { id: page.id },
        data: { confidence: newConfidence },
      });
    }
    pagesDecayed++;
  }

  return { entitiesDecayed, pagesDecayed };
}

// ─── Supersession ────────────────────────────────────────────────────────────

/**
 * When new information supersedes an existing wiki page, mark the old one stale.
 * The new page's sourceContributionId references what superseded it.
 */
export async function supersedePage(
  oldPageId: string,
  newPageId: string,
  reason?: string
): Promise<void> {
  await prisma.wikiPage.update({
    where: { id: oldPageId },
    data: {
      isStale: true,
      supersededBy: newPageId,
      content: JSON.stringify({
        ...JSON.parse((await prisma.wikiPage.findUnique({ where: { id: oldPageId } }))?.content ?? '{}'),
        supersessionReason: reason ?? 'Superseded by newer contribution',
        supersededAt: new Date().toISOString(),
      }),
    },
  });
}

// ─── Graph Query ─────────────────────────────────────────────────────────────

/**
 * Get project context for LLM injection.
 * Fetches entities, relationships, and recent wiki pages.
 * This is the "graph traversal for queries" pattern from LLM Wiki v2.
 */
export async function getProjectKnowledgeGraph(
  projectId: string,
  maxEntities: number = 20,
  maxRelationships: number = 30
): Promise<{
  entities: Array<{ name: string; entityType: string; confidence: number; isStale: boolean }>;
  relationships: Array<{ source: string; target: string; type: string; confidence: number }>;
  recentPages: Array<{ title: string; pageType: string; confidence: number; content: string }>;
  summary: string;
}> {
  const [entities, relationships, recentPages] = await Promise.all([
    prisma.entity.findMany({
      where: { projectId, isStale: false },
      orderBy: [{ confidence: 'desc' }, { sourceCount: 'desc' }],
      take: maxEntities,
      select: { name: true, entityType: true, confidence: true, isStale: true },
    }),
    prisma.relationship.findMany({
      where: { projectId, isStale: false },
      orderBy: { confidence: 'desc' },
      take: maxRelationships,
      select: {
        source: { select: { name: true } },
        target: { select: { name: true } },
        relationType: true,
        confidence: true,
      },
    }),
    prisma.wikiPage.findMany({
      where: { projectId, isStale: false },
      orderBy: [{ confidence: 'desc' }, { updatedAt: 'desc' }],
      take: 10,
      select: { title: true, pageType: true, confidence: true, content: true },
    }),
  ]);

  // Build summary text
  const entitySummary = entities
    .slice(0, 10)
    .map((e) => `• ${e.name} (${e.entityType}) @ ${Math.round(e.confidence * 100)}%`)
    .join('\n');

  const relSummary = relationships
    .slice(0, 10)
    .map((r) => `• ${r.source.name} --[${r.relationType}]--> ${r.target.name}`)
    .join('\n');

  const summary = `Entities (${entities.length} total, top confidence):\n${entitySummary || '  (none yet)'}\n\nRelationships:\n${relSummary || '  (none yet)'}`;

  return {
    entities: entities.map((e) => ({
      name: e.name,
      entityType: e.entityType,
      confidence: e.confidence,
      isStale: e.isStale,
    })),
    relationships: relationships.map((r) => ({
      source: r.source.name,
      target: r.target.name,
      type: r.relationType,
      confidence: r.confidence,
    })),
    recentPages: recentPages.map((p) => ({
      title: p.title,
      pageType: p.pageType,
      confidence: p.confidence,
      content: p.content,
    })),
    summary,
  };
}

// ─── Page Access (reinforces confidence) ─────────────────────────────────────

/**
 * Mark a wiki page as accessed — reinforces its confidence slightly.
 * Called when a page is served to an LLM or displayed to a user.
 */
export async function accessPage(pageId: string): Promise<void> {
  await prisma.wikiPage.update({
    where: { id: pageId },
    data: {
      lastAccessed: new Date(),
      lastReinforced: new Date(),
      confidence: { increment: 0.02 }, // small boost on access
    },
  }).catch(() => {}); // Ignore if page not found
}

// ─── Full Ingestion Pipeline ─────────────────────────────────────────────────

/**
 * Run the full ingestion pipeline on a contribution:
 * 1. Extract entities + relationships (LLM or keyword fallback)
 * 2. Upsert them to the knowledge graph
 * 3. Reinforce confidence on existing related entities
 * 4. Update contribution summary
 */
export async function ingestContributionToGraph(
  contribution: Contribution,
  projectId: string
): Promise<void> {
  console.log(`[KnowledgeGraph] Ingesting contribution ${contribution.id}`);

  // Extract structured knowledge
  const extraction = await extractEntitiesFromText(contribution.content, projectId);

  console.log(`[KnowledgeGraph] Extracted ${extraction.entities.length} entities, ${extraction.relationships.length} relationships`);

  // Upsert entities and relationships
  await upsertEntities(extraction.entities, contribution.id, projectId);
  await upsertRelationships(extraction.relationships, contribution.id, projectId);

  // Update contribution with extraction summary
  await prisma.contribution.update({
    where: { id: contribution.id },
    data: { extractionSummary: extraction.summary },
  }).catch(() => {});

  console.log(`[KnowledgeGraph] Done ingesting ${contribution.id}`);
}
