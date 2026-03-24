// Knowledge Graph — Type Definitions

export type NodeType =
  | 'protocol'
  | 'technique'
  | 'concept'
  | 'user'
  | 'session'
  | 'contribution'
  | 'gap'
  | 'resource';

export type EdgeType =
  | 'uses_technique'
  | 'based_on_concept'
  | 'requires_resource'
  | 'related_to'
  | 'contributed_by'
  | 'succeeded_in'
  | 'struggled_in'
  | 'gap_in';

export type NodeStatus = 'sketch' | 'developing' | 'mature';

export interface KGNode {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  tags: string[];
  status: NodeStatus;
  metadata: Record<string, unknown>;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface KGEdge {
  id: string;
  from: string; // Node ID
  to: string;   // Node ID
  type: EdgeType;
  weight: number; // 0.0–1.0
  metadata?: Record<string, unknown>;
}

export interface KGQuery {
  filters?: {
    type?: NodeType | NodeType[];
    tags?: string[];
    status?: NodeStatus;
    ids?: string[];
  };
  traverse?: {
    from: string;
    edgeTypes?: EdgeType[];
    depth?: number; // default 2
    direction?: 'outbound' | 'inbound' | 'both'; // default 'both'
  };
  fullText?: string;
}

export interface KGResult {
  nodes: KGNode[];
  edges: KGEdge[];
  scores?: number[]; // relevance scores for fullText search
}

// --- Document format (for knowledge/ markdown files) ---

export interface KGDocument {
  id: string;
  title: string;
  status: NodeStatus;
  connections: string[];
  tags: string[];
  contributors: string[];
  nextActions: string[];
  body: string;
}

// --- Storage snapshot (JSON file format) ---

export interface KGStorageSnapshot {
  version: 1;
  nodes: KGNode[];
  edges: KGEdge[];
  savedAt: string;
}

// --- Agent-facing helpers ---

export interface SessionSummary {
  sessionId: string;
  userId: string;
  protocol: string;
  startedAt: string;
  completedAt?: string;
  outcome?: 'completed' | 'abandoned' | 'interrupted';
  userRating?: number; // 1–5
  notes?: string;
}

export interface UserProfile {
  id: string;
  anonymousId: string;
  createdAt: string;
  sessionHistory: string[]; // session IDs
  preferences: {
    avoidProtocols?: string[];
    preferredDuration?: number;
  };
  lastActiveAt: string;
}
