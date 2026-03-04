# Integration Architecture

## Module Communication

### Event-Driven Architecture
```
User Action → Event Bus → Relevant Modules
                ↓
         [Router] → [Specialist]
                ↓
         [Knowledge Graph]
                ↓
         [Credibility Engine]
                ↓
         [Synthetic Mediator]
```

### Events
```typescript
type Event = 
  | { type: 'session_start', userId, protocol }
  | { type: 'session_complete', sessionId, outcome }
  | { type: 'contribution', userId, type, content }
  | { type: 'mediation_request', context, participants }
  | { type: 'reputation_update', userId, change };
```

## Data Flow

### Audio Tool → Knowledge Graph
1. User completes session
2. Extract protocol used, duration, outcome
3. Create/update session node
4. Update user state node

### Knowledge Graph → Specialist Agents
1. Query relevant nodes for context
2. Inject into agent prompt
3. Agent generates response
4. Update knowledge graph

### Credibility Engine → All
1. Track all contributions
2. Calculate scores
3. Update reputation tiers
4. Weight voting power

### Synthetic Mediator → Collaboration
1. Receive user's positions
2. Summarize for context
3. Participate in discussions
4. Report back outcomes

## API Design

### REST Endpoints
```
POST /api/sessions      - Start session
GET  /api/sessions/:id  - Get session
POST /api/contribute    - Add knowledge
GET  /api/graph/:nodeId - Get related nodes
GET  /api/reputation    - Get user score
POST /api/mediate       - Request mediation
```

### WebSocket (Future)
- Real-time collaboration
- Live updates
- Presence indicators

---

*Status: Sketch*
