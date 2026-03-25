# SPEC: Specialist Agents

## Overview

Each **Specialist Agent** implements a specific therapeutic protocol. They receive a `ContextPackage` from the Router Agent and produce a session: audio guidance, exercises, and real-time adaptation.

## Base Interface

```typescript
interface SpecialistAgent {
  readonly protocolId: ProtocolId;
  readonly displayName: string;
  readonly description: string;           // Shown to user before session
  readonly defaultDuration: number;       // minutes

  // Execute a session
  run(input: ContextPackage): AsyncGenerator<SessionEvent>;

  // Validate that this agent can handle the given context
  validate(input: ContextPackage): ValidationResult;
}

interface SessionEvent {
  type: 'guidance' | 'prompt' | 'transition' | 'completion';
  audioUrl?: string;                     // Pre-generated audio clip
  transcript?: string;                   // What to say (TTS fallback)
  duration?: number;                     // seconds
  metadata?: Record<string, unknown>;
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
}
```

## Implemented Agents

### 1. NSDR Agent
**Protocol:** Non-Sleep Deep Rest

```typescript
const NSDR: SpecialistAgent = {
  protocolId: 'nsdr',
  displayName: 'Non-Sleep Deep Rest',
  description: 'A guided 20-30 minute protocol that induces a hypnogogic state for neural integration and recovery.',
  defaultDuration: 20,

  async *run(input: ContextPackage) {
    // Yield structured session events:
    // 1. Body scan introduction (2 min)
    // 2. Progressive relaxation (5 min)
    // 3. Scripted suggestion sequence (12 min)
    // 4. Gradual return (1 min)
    // 5. Post-session integration prompt
  }
};
```

**Session Structure:**
| Phase | Duration | Content |
|-------|----------|---------|
| Intro | 2 min | Breathing intro, intention setting |
| Body Scan | 5 min | Progressive relaxation |
| Deep Rest | 12 min | Yogi nidra style suggestions |
| Return | 1 min | Counting up, awareness return |
| Integration | 2 min | Gentle prompts, no rush |

### 2. IFS Agent
**Protocol:** Internal Family Systems

```typescript
const IFS: SpecialistAgent = {
  protocolId: 'ifs',
  displayName: 'Internal Family Systems',
  description: 'Dialogue-based session for exploring and harmonizing inner parts.',
  defaultDuration: 25,
};
```

**Session Structure:**
| Phase | Duration | Content |
|-------|----------|---------|
| Grounding | 3 min | Breath + safe place |
| Identify Parts | 5 min | "What part is active right now?" |
|-dialogue | 10 min | Unblend, listen, understand |
| Modification | 5 min | Update relationship to parts |
| Integration | 2 min | Recap, anchor |

### 3. WOOP Agent
**Protocol:** Wish-Outcome-Obstacle-Plan

```typescript
const WOOP: SpecialistAgent = {
  protocolId: 'woop',
  displayName: 'Mental Contrasting',
  description: 'Goal-setting through vivid imagination of success and obstacle mapping.',
  defaultDuration: 15,
};
```

**Session Structure:**
| Phase | Duration | Content |
|-------|----------|---------|
| Wish | 3 min | Identify heartfelt wish |
| Outcome | 3 min | Vivid best outcome |
| Obstacle | 5 min | Identify #1 inner obstacle |
| Plan | 4 min | If-then plan for obstacle |

### 4. BREATHWORK Agent
**Protocol:** Conscious Connected Breathwork

```typescript
const BREATHWORK: SpecialistAgent = {
  protocolId: 'breathwork',
  displayName: 'Conscious Connected Breathwork',
  description: 'Continuous breath without pause, inducing altered states and emotional release.',
  defaultDuration: 15,
};
```

**Session Structure:**
| Phase | Duration | Content |
|-------|----------|---------|
| Prep | 2 min | Intention + technique explanation |
| Breathing | 10 min | Continuous connected breath |
| Integration | 3 min | Stillness, prompts |

### 5. SE Agent
**Protocol:** Somatic Experiencing

```typescript
const SE: SpecialistAgent = {
  protocolId: 'se',
  displayName: 'Somatic Experiencing',
  description: 'A body-based approach to processing trauma and stress by tracking physical sensations.',
  defaultDuration: 20,
};
```

**Session Structure (Hexaflex):**
| Phase | Duration | Content |
|-------|----------|---------|
| Grounding | 2 min | Orient to present, body awareness |
| Identifying Hook | 2 min | Notice the "hook" — recurring trigger pattern |
| Defusion | 2 min | Create distance from the thought/pattern |
| Acceptance | 2 min | Allow the sensation to be there |
| Values | 2 min | Identify what's truly important |
| Committed Action | 8 min | Small action aligned with values |
| Integration | 2 min | Recap, somatic anchor |

### 6. ACT Agent
**Protocol:** Acceptance and Commitment Therapy

```typescript
const ACT: SpecialistAgent = {
  protocolId: 'act',
  displayName: 'Acceptance and Commitment Therapy',
  description: 'A structured 25-minute protocol using the hexaflex model to build psychological flexibility.',
  defaultDuration: 25,
};
```

**Session Structure (Hexaflex):**
| Phase | Duration | Content |
|-------|----------|---------|
| Grounding | 2 min | Breath, present-moment orientation |
| Identifying Hook | 2 min | Notice the active inner conflict |
| Defusion — Leaves | 2 min | "Notice the thinking mind — thoughts are like leaves" |
| Acceptance | 2 min | Make space for difficult experience |
| Values | 2 min | Clarify chosen values direction |
| Committed Action | 12 min | Concrete value-aligned micro-commitment |
| Integration | 3 min | Anchor, recap, somatic commitment |

## Agent Registry

```typescript
const AGENT_REGISTRY: Record<ProtocolId, SpecialistAgent> = {
  nsdr: NSDR,
  ifs: IFS,
  woop: WOOP,
  breathwork: BREATHWORK,
  se: SE,           // Somatic Experiencing
  act: ACT,         // Acceptance and Commitment Therapy
  nvc: NVC,         // Future (Nonviolent Communication)
  general: GENERAL, // Always available fallback
};

function getAgent(protocolId: ProtocolId): SpecialistAgent {
  return AGENT_REGISTRY[protocolId] ?? GENERAL;
}
```

## Audio Output

Each agent can provide:
- **Pre-generated audio clips** — stored in `media/protocols/{protocolId}/`
- **TTS fallback** — Web Speech API reads transcript
- **Future:** Gemini TTS API for dynamic, emotionally-appropriate voice

## Error Handling

| Error | Behavior |
|-------|----------|
| Audio clip missing | Fall back to TTS transcript |
| LLM unavailable | Use scripted fallback prompts |
| User interrupts | Save progress, offer resume |
| Invalid context | Return error with reason, suggest alternative |

## Status

- [x] NSDR agent implementation — ✅ `src/specialist-agents/nsdr.ts` (37 tests)
- [x] IFS agent implementation — ✅ `src/specialist-agents/ifs.ts` (31 tests)
- [x] WOOP agent implementation — ✅ `src/specialist-agents/woop.ts` (25 tests)
- [x] BREATHWORK agent implementation — ✅ `src/specialist-agents/breathwork.ts` (28 tests)
- [x] SE agent implementation — ✅ `src/specialist-agents/se.ts` (22 tests)
- [x] ACT agent implementation — ✅ `src/specialist-agents/act.ts` (29 tests)
- [ ] NVC agent (future — Nonviolent Communication)
- [ ] Audio clip library per agent (future — TTS fallback active)
- [x] Unit tests per agent — ✅ All 6 agents tested (172 tests total)
