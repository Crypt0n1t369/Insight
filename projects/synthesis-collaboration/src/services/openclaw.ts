import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import type { Contribution, WikiPage } from '@prisma/client';
import type { SynthesisResult } from '../types/index.js';
import { OPENCLAW_WORKSPACE, BOT_TOKEN } from '../config.js';
import { parseOpenClawResponse } from './synthesis.js';

interface OpenClawWorkspace {
  projectId: string;
  taskType: 'ingest' | 'synthesize';
  content: string;
}

/**
 * Writes a task file to the OpenClaw workspace memory structure.
 * OpenClaw agents monitor the TASKS directory and process files there.
 * This is the primary integration point between the bot and OpenClaw.
 */
async function writeTaskFile(params: OpenClawWorkspace): Promise<string> {
  const workspace = OPENCLAW_WORKSPACE;
  const taskDir = join(workspace, 'memory/03-projects', params.projectId, 'TASKS');
  await mkdir(taskDir, { recursive: true });

  const timestamp = Date.now();
  const taskFile = join(taskDir, `${params.taskType}-${timestamp}.md`);
  await writeFile(taskFile, params.content);
  return taskFile;
}

/**
 * Creates a structured contribution ingest task for OpenClaw.
 * The task file is written to memory/03-projects/<projectId>/TASKS/.
 * OpenClaw agents pick up these files on their next heartbeat/cron cycle.
 */
export async function ingestContribution(params: {
  projectId: string;
  contribution: Contribution;
  wikiPages: WikiPage[];
}): Promise<string> {
  const content = `# Ingest Contribution

## Project ID
${params.projectId}

## Contribution
- **ID:** ${params.contribution.id}
- **Author:** ${params.contribution.userId}
- **Source:** ${params.contribution.source}
- **Content:**
${params.contribution.content}

## Existing Wiki Pages
${params.wikiPages
  .map(
    (p) => `- **${p.title}** (${p.slug}): ${p.content.slice(0, 200)}`
  )
  .join('\n')}

## Task
Extract key insights, link to existing concepts, and update relevant wiki pages.
Store any synthesis in memory/03-projects/${params.projectId}/.

---
*Ingest task created at ${new Date().toISOString()}*
`;
  return writeTaskFile({ projectId: params.projectId, taskType: 'ingest', content });
}

/**
 * Creates a synthesis task for OpenClaw, triggering full intelligence synthesis.
 * The task file is written to memory/03-projects/<projectId>/TASKS/.
 * OpenClaw reads it, runs the synthesis prompt, and writes the result to
 * memory/03-projects/<projectId>/synthesis-latest.md (which bot polls for).
 */
export async function triggerSynthesis(params: {
  projectId: string;
  challenge: string;
  contributions: Contribution[];
}): Promise<{ taskId: string; taskFile: string }> {
  const timestamp = Date.now();
  const taskId = `synthesize-${timestamp}`;

  const contributionsMd = params.contributions
    .map(
      (c) =>
        `### ${c.id} (${c.source}, ${c.createdAt.toISOString()})\n${c.content}`
    )
    .join('\n\n');

  const content = `# Synthesize Project Intelligence

## Task ID
${taskId}

## Project ID
${params.projectId}

## Challenge Statement
${params.challenge}

## Contributions (${params.contributions.length})
${contributionsMd}

## Task
Analyze all contributions above and produce a structured synthesis:

1. **Commonalities** — recurring themes, shared framings
2. **Divergences** — conflicting views, open questions
3. **Cross-links** — connections between ideas, contributors, or external references
4. **Structured Outline** — a hierarchical plan or framework emerging from the synthesis
5. **Next Steps** — top 3 proposed actions ranked by support

Format your response in markdown. When done, write the synthesis to:
\`memory/03-projects/${params.projectId}/synthesis-latest.md\`

---
*Synthesis task created at ${new Date().toISOString()}*
`;

  const taskFile = await writeTaskFile({ projectId: params.projectId, taskType: 'synthesize', content });
  return { taskId, taskFile };
}

/**
 * Signals that a synthesis task file has been written and is ready for processing.
 *
 * The task file is written by triggerSynthesis() to:
 *   memory/03-projects/<projectId>/TASKS/synthesize-<timestamp>.md
 *
 * This function writes a marker so the TASKS Monitor knows which project
 * has a pending task. The TASKS Monitor cron (c24d7d68-293c-42c7-aed0-d55fa2eae867)
 * fires every 60s in an isolated session and:
 *   1. Reads the project index to get all project IDs
 *   2. For each project, reads .task-trigger.json → checks if status === "pending"
 *   3. Only if pending: reads task file, runs LLM synthesis, writes synthesis-latest.md + sidecar
 *   4. Updates trigger to status: "processed"
 *
 * This function writes the trigger marker with status: "pending" to signal work.
 */
export async function spawnOpenClawAgent(params: {
  projectId: string;
  taskFile: string;
}): Promise<{ success: boolean; output: string }> {
  const workspace = OPENCLAW_WORKSPACE;
  const projectDir = join(workspace, 'memory/03-projects', params.projectId);

  // Extract task ID from filename: synthesize-<timestamp>.md
  const taskFileBasename = params.taskFile.split('/').pop() ?? '';
  const taskId = taskFileBasename.replace(/\.md$/, '');

  console.log(`[OpenClaw] Task file written: ${params.taskFile}`);
  console.log(`[OpenClaw] TASKS Monitor will process on next 60s heartbeat`);

  // Write a trigger marker so the TASKS Monitor knows this project needs processing
  // The marker contains the task file path — TASKS Monitor reads it and processes
  const markerPath = join(projectDir, '.task-trigger.json');
  try {
    await writeFile(markerPath, JSON.stringify({
      taskId,
      taskFile: params.taskFile,
      projectId: params.projectId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }));
    console.log(`[OpenClaw] Trigger marker written: ${markerPath}`);
  } catch (err) {
    // Non-fatal — TASKS Monitor will still find the task file on its next scan
    console.error(`[OpenClaw] Could not write trigger marker: ${err}`);
  }

  return {
    success: true,
    output: `Task file written. TASKS Monitor cron (every 60s) will process it using read/write tools.`,
  };
}

/**
 * Result from polling synthesis file. Returns parsed result plus raw markdown
 * when available (from sidecar file written by TASKS Monitor).
 */
export interface SynthesisPollResult {
  /** Parsed structured result (same as SynthesisResult) */
  parsed: SynthesisResult;
  /** Raw markdown content — available when TASKS Monitor wrote sidecar */
  rawContent: string;
  /** Task ID extracted from synthesis header, if found */
  taskId: string | null;
}

/**
 * Polls for synthesis results by checking the synthesis output file.
 * Called after triggerSynthesis() writes the task file.
 * Polls for up to timeoutMs (default: 2 minutes).
 *
 * Returns parsed synthesis plus raw content when available.
 * The raw content is used by the bot handler to update task.result in DB.
 */
export async function pollForSynthesis(params: {
  projectId: string;
  timeoutMs?: number;
}): Promise<SynthesisPollResult | null> {
  const workspace = OPENCLAW_WORKSPACE;
  const projectDir = join(workspace, 'memory/03-projects', params.projectId);
  const synthesisFile = join(projectDir, 'synthesis-latest.md');

  const timeout = params.timeoutMs ?? 120000;
  const interval = 10000;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    try {
      const content = await readFile(synthesisFile, 'utf-8');
      if (content && content.trim().length > 0) {
        // Extract task ID from the ## Task ID header if present
        const taskIdMatch = content.match(/^##\s*Task ID\s*\n([^\n]+)/m);
        const taskId = taskIdMatch ? taskIdMatch[1].trim() : null;

        // Try to read sidecar file for raw content (written by TASKS Monitor)
        let rawContent = content;
        if (taskId) {
          const sidecarFile = join(projectDir, `task-result-${taskId}.txt`);
          try {
            rawContent = await readFile(sidecarFile, 'utf-8');
          } catch {
            // No sidecar — use synthesis-latest.md content
            rawContent = content;
          }
        }

        // Use the robust parser from synthesis.ts (handles ## Label, ##Label, **Label**)
        const parsed = parseOpenClawResponse(content);
        return { parsed, rawContent, taskId };
      }
    } catch {
      // File not yet available
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  return null;
}
