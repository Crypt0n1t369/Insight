# SPEC: Router Agent

## Overview

The **Router Agent** is the entry point for all user interactions. It receives raw user input (voice transcript, text, or detected emotional state) and routes to the most appropriate Specialist Agent.

## Interface Contract

### Input

```typescript
interface RouterInput {
  userId: string;                    // Anonymous user identifier
  sessionId: string;                 // Current session ID
  rawInput: string;                  // Raw text or transcript
  modality: 'voice' | 'text';        // How input was received
  detectedEmotion?: EmotionTag;      // Optional emotion detection
  recentProtocols?: string[];        // Protocols used in last 3 sessions
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}
```

### Output

```typescript
interface RouterOutput {
  selectedProtocol: ProtocolId;     // e.g. 'nsdr', 'ifs', 'woop'
  confidence: number;               // 0.0–1.0
  contextPackage: ContextPackage;    // Data forwarded to specialist
  fallbackProtocol?: ProtocolId;    // If confidence low
  reasoning: string;                // Why this protocol was chosen
}
```

### Emotion Tags

```typescript
type EmotionTag =
  | 'anxious' | 'stressed'
  | 'low' | 'depressed'
  | 'angry' | 'frustrated'
  | 'neutral' | 'curious'
  | 'excited' | 'motivated'
  | 'grief' | 'loss'
  | 'overwhelmed'
  | 'dissociated';
```

### Protocol IDs

```typescript
type ProtocolId =
  | 'nsdr'      // Non-Sleep Deep Rest
  | 'ifs'       // Internal Family Systems
  | 'woop'      // Wish-Outcome-Obstacle-Plan
  | 'act'       // Acceptance & Commitment
  | 'nvc'       // Nonviolent Communication
  | 'se'        // Somatic Experiencing
  | 'breathwork'
  | 'general';  // Fallback / general wellbeing
```

## Routing Logic

### Decision Tree

```
userInput
  │
  ├─▶ contains_goal_keywords? ──▶ WOOP (if timeOfDay=morning/afternoon)
  │
  ├─▶ detectedEmotion == 'overwhelmed' │ 'anxious' │ 'stressed'
  │   ├─▶ recentProtocols.includes('nsdr') ──▶ BREATHWORK
  │   └─▶ else ──▶ NSDR
  │
  ├─▶ detectedEmotion == 'low' │ 'depressed' │ 'grief' │ 'loss'
  │   └─▶ IFS
  │
  ├─▶ contains_parts_keywords? ──▶ IFS
  │
  ├─▶ contains_body_keywords? ──▶ SE
  │
  ├─▶ contains_relationship_keywords? ──▶ NVC
  │
  └─▶ else ──▶ ACT │ GENERAL
```

### Keyword Sets

```typescript
const GOAL_KEYWORDS = ['want', 'wish', 'hope', 'plan', 'goal', 'achieve', 'decide'];
const PARTS_KEYWORDS = ['part', 'inner', 'self', 'conflict', 'torn', 'should', 'want-but'];
const BODY_KEYWORDS = ['body', 'somatic', 'tension', 'pain', 'physical', 'felt sense'];
const RELATIONSHIP_KEYWORDS = ['relationship', 'partner', 'communication', 'argument', 'family'];
```

## Confidence Thresholds

| Confidence | Behavior |
|------------|----------|
| ≥ 0.85 | Use selected protocol directly |
| 0.60–0.84 | Use selected protocol + offer "not right? try X" |
| 0.40–0.59 | Ask clarifying question before routing |
| < 0.40 | Default to GENERAL + log for learning |

## Context Package

```typescript
interface ContextPackage {
  protocol: ProtocolId;
  userId: string;
  sessionId: string;
  detectedEmotion?: EmotionTag;
  suggestedDuration: number;       // minutes
  preprompts: string[];            // System prompts for specialist
  priorSessionSummary?: string;    // Last session in 1 sentence
  userPreferences?: UserPrefs;
}
```

## Implementation Notes

- Router Agent runs locally (no external API call required for routing decision)
- LLM is only called if confidence < 0.40 AND user engages with GENERAL protocol
- Routing logic is deterministic — no randomness for repeat inputs
- All routing decisions are logged for future training data

## Status

- [x] Implement routing logic in TypeScript — ✅ `src/router-agent/router.ts`
- [x] Write unit tests for all decision paths — ✅ 61 tests covering all branches
- [ ] Add keyword set extensibility (plugins)
- [ ] Integrate emotion detection (future: voice tone analysis)
