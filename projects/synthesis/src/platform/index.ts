/**
 * Platform Integration Layer — Public API
 *
 * Wires together: Router → Specialist Agents → Knowledge Graph → Credibility Engine
 */

export { SessionOrchestrator, getOrchestrator, runSynthesisSession } from './session-orchestrator.js';
export type {
  SessionResult,
  SessionStartInput,
  KGSessionSummary,
  SynthesisStats,
  OrchestratorConfig,
} from './types.js';
