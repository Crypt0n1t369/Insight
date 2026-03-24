// Specialist Agents — Public API

import type { SpecialistAgent } from './types.js';
import { WOOPAgent } from './woop.js';

// ----------------------------------------------------------------
// Agent Registry
// ----------------------------------------------------------------

export const AGENT_REGISTRY: Record<string, SpecialistAgent> = {
  woop: WOOPAgent,
  // nsdr: NSDRAgent,    // future
  // ifs: IFSAgent,      // future
  // breathwork: BREATHWORKAgent, // future
  // act: ACTAgent,      // future
  // se: SEAgent,        // future
  // nvc: NVCAgent,      // future
};

/**
 * Get a specialist agent by protocol ID.
 * Returns undefined if the protocol is not yet implemented.
 */
export function getAgent(protocolId: string): SpecialistAgent | undefined {
  return AGENT_REGISTRY[protocolId];
}

/**
 * List all registered (implemented) protocol IDs.
 */
export function listImplementedProtocols(): string[] {
  return Object.keys(AGENT_REGISTRY);
}

// Re-export types
export type { SessionEvent, ValidationResult } from './types.js';
