# Youth Empowerment Platform - Research Notes

## 1. Concept Overview (Refined)

### Core Vision
A platform where each user has a personal AI agent that:
- Operates from user's own encrypted data space
- Synergizes with a shared knowledge base
- Matches users to meaningful opportunities
- Enables hero's journey experiences

### Refined Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MASTER ORCHESTRATOR                         │
│  (Synergy Engine + Knowledge Graph + Opportunity Matcher)       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ Shared DB   │  │ Shared DB   │  │ Shared DB   │
   │ Activities  │  │ Challenges  │  │ Characters  │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER DATA VAULT (Per User)                  │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │ Private Zone    │    │ Public Zone     │                    │
│  │ - Intentions    │    │ - Skills        │                    │
│  │ - Challenges    │    │ - Availability  │                    │
│  │ - Journey State │    │ - Contributions │                    │
│  └────────┬────────┘    └────────┬────────┘                    │
│           │                      │                              │
│           ▼                      ▼                             
│  ┌─────────────────────────────────────────┐                   │
│  │        ON-DEMAND USER AGENT             │                   │
│  │  - Reads user vault                     │                  
│  │ - Queries shared DB for synergies       │
│  │ - Presents opportunities               │                   
│  │ - NPC interactions                      │                   
│  └─────────────────────────────────────────┘                   
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. User-Owned File System with Encryption

### Challenge
Users must own their data, data must be encrypted, but agents need access to serve the user.

### Solution Approaches

#### Approach A: Zero-Knowledge Vault (Recommended)
- User's key never leaves their device
- Encryption/decryption happens client-side
- Agent receives decrypted data only in memory during session
- Agent memory wiped after session ends

```
Client Device          Agent Runtime         Server Storage
┌──────────┐          ┌──────────┐          ┌──────────┐
│ User Key │          │          │          │          │
│ (local)  │──decrypt─▶ Agent    │          │ Encrypted│
│          │          │ Memory   │          │ Vaults   │
└──────────┘          └──────────┘          └──────────┘
                           │                    
                           ▼                    
                    ┌──────────┐              
                    │ Presents │              
                    │ to User  │              
                    └──────────┘              
```

**Tech Stack:**
- libsodium (TweetNaCl) for client-side encryption
- Key derivation: Argon2 or scrypt from user's password/passphrase
- File format: age/pgp encrypted files
- Session secrets: Agent gets temporary decryption key

#### Approach B: Trusted Execution Environment
- Intel SGX or similar for secure enclave
- More complex, hardware-dependent

#### Comparison

| Aspect | A (ZK Vault) | B (TEE) |
|--------|--------------|---------|
| Complexity | Medium | High |
| Security | Strong | Stronger |
| UX | Requires auth | Seamless |
| Portability | High | Low |
| **Recommendation** | **✓ Preferred** | Consider later |

### User Folder Structure

```
user-vault/
├── .meta/
│   ├── identity.key (encrypted public key)
│   └── manifest.json.enc
├── private/
│   ├── intentions.md.enc
│   ├── challenges.md.enc
│   ├── journey-state.md.enc
│   └── preferences.json.enc
├── public/
│   ├── profile.json.enc
│   ├── skills.yaml.enc
│   └── portfolio/
└── .agent/
    └── agent-memory.md.enc (agent's working notes)
```

---

## 3. On-Demand Agent Spawning

### Requirements
- Fast spawn time (<3 seconds)
- Resource isolation
- Session-based lifecycle
- Access to user's vault

### Architecture Options

#### Option A: Container Per Agent (Docker/Kubernetes)
```yaml
# Per-user agent pod
apiVersion: v1
kind: Pod
metadata:
  name: user-agent-{user-id}
spec:
  containers:
  - name: agent
    image: agent-runtime:latest
    env:
    - name: USER_VAULT_PATH
      value: /vaults/{user-id}
    - name: AGENT_SESSION_KEY
      value: {session-secret}
    volumeMounts:
    - name: user-vault
      mountPath: /vaults/{user-id}
```

**Pros:** Clean isolation, scalable
**Cons:** Cold start time, resource overhead

#### Option B: Long-Running Agent with Session Switching
```
┌──────────────────┐
│ Agent Pool       │
│ (N warm agents) │
└────────┬─────────┘
         │
         ▼
   ┌───────────┐     ┌──────────────┐
   │ Session   │────▶│ User Vault A │
   │ Router    │     │ (loaded)     │
   └───────────┘     └──────────────┘
         │
         ▼
   ┌───────────┐     ┌──────────────┐
   │ Session   │────▶│ User Vault B │
   │ Switch    │     │ (loaded)     │
   └───────────┘     └──────────────┘
```

**Pros:** Instant response, lower resource
**Cons:** Complex state management

#### Option C: Serverless Agent Functions (Recommended)
```python
# Cloudflare Workers / AWS Lambda style
async function spawnAgent(userId, sessionToken):
    vault = await unlockVault(userId, sessionToken)
    agent = new Agent(runtime="sandbox")
    agent.loadContext(vault.public, vault.sharedPreferences)
    return agent

# Agent lifecycle
async function handleRequest(agent, userMessage):
    # Agent has ephemeral access to decrypted vault
    response = await agent.process(userMessage)
    await agent.snapshot()  # Save to encrypted vault
    await agent.clearMemory()  # Wipe decrypted data
    return response
```

**Pros:** Scalable, pay-per-use, fast spawn
**Cons:** Stateless requires reconstruction

### Recommended Hybrid Approach
- **Warm pool** for frequent users
- **Serverless spawn** for cold starts
- **Ephemeral containers** for heavy operations

---

## 4. Shared Database & Synergy Detection

### Data Model

```typescript
// Core entities
interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'role' | 'challenge' | 'idea' | 'task' | 'event';
  tags: string[];
  requirements: Requirement[];
  createdBy: string; // user or system
  createdAt: Date;
}

interface UserProfile {
  userId: string;
  publicProfile: {
    skills: Skill[];
    interests: string[];
    availability: Availability;
    contributions: Contribution[];
  };
  // Private data stays in vault
}

interface SynergyMatch {
  userId: string;
  activityId: string;
  score: number; // 0-1
  reasoning: string;
  suggestedApproach: string;
}
```

### Synergy Detection Engine

```
┌────────────────────────────────────────────────────────────┐
│                    SYNERGY ENGINE                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  User Profile ──▶ Embedding ──┐                            │
│                            ▼                              │
│                    Similarity Search                       │
│                            │                              │
│  Activities DB ──▶ Embedding ──┘                            │
│                            │                              │
│                            ▼                              │
│                   ┌────────────────┐                       │
│                   │  Vector Store  │                       │
│                   │  (Pinecone/    │                       │
│                   │   Qdrant/     │                       │
│                   │   Milvus)     │                       │
│                   └────────┬───────┘                       │
│                            │                              │
│                            ▼                              │
│                   ┌────────────────┐                       │
│                   │  Ranking &     │                       │
│                   │  Filtering     │                       │
│                   └────────┬───────┘                       │
│                            │                              │
│                            ▼                              │
│                   ┌────────────────┐                       │
│                   │  Matched       │                       │
│                   │  Opportunities │                       │
│                   └────────────────┘                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Tech Stack
- **Vector DB:** Qdrant (self-hosted friendly) or Pinecone (managed)
- **Embeddings:** sentence-transformers or OpenAI embeddings
- **Graph DB:** Neo4j or Memgraph for relationship discovery

---

## 5. Master Agent Orchestration

### Responsibilities
1. **Ingest** new activities/challenges from users
2. **Categorize** and tag entries
3. **Detect synergies** between users and opportunities
4. **Seed** user agent memories with relevant matches
5. **Narrate** NPC experiences

### Agent Architecture

```python
class MasterAgent:
    def __init__(self):
        self.knowledge_graph = GraphDB()
        self.vector_store = VectorDB()
        self.narrative_engine = NarrativeEngine()
    
    def process_new_activity(self, activity):
        # 1. Extract entities and relationships
        entities = self.nlp.extract_entities(activity)
        
        # 2. Store in knowledge graph
        self.knowledge_graph.add_activity(activity, entities)
        
        # 3. Create embeddings for similarity
        self.vector_store.embed(activity)
        
        # 4. Find potential synergies
        matches = self.find_synergies(activity)
        
        # 5. Seed relevant user agents
        for user_id in matches:
            self.seed_user_agent(user_id, activity, match_score)
    
    def find_synergies(self, activity):
        # Vector similarity
        similar_activities = self.vector_store.search(activity, top_k=10)
        
        # Graph traversal for related users
        related_users = self.knowledge_graph.find_users(
            interests=activity.tags,
            skills=activity.requirements
        )
        
        # Combine and rank
        return self.rank_matches(related_users, similar_activities)
```

### NPC Character System

```
┌─────────────────────────────────────────┐
│          NPC EXPERIENCE ENGINE          │
├─────────────────────────────────────────┤
│                                         │
│  User Journey ──▶ Character Arc ──▶     │
│  (Hero's Journey stages)    (NPC role)  │
│                                         │
│  ┌─────────┐   ┌─────────┐   ┌────────┐ │
│  │ Mentor  │   │ Trickster│   │ Shadow │ │
│  │ Guide   │   │ Catalyst │   │ Antagonist│
│  └─────────┘   └─────────┘   └────────┘ │
│                                         │
│  Each NPC has:                          │
│  - Backstory (generated/curated)       │
│  - Interaction style                    │
│  - Knowledge domain                     │
│  - Evolution with user                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 6. Hero's Journey Integration

### Framework
Based on Joseph Campbell's monomyth:
1. **Ordinary World** - User's current state
2. **Call to Adventure** - Platform presents opportunity
3. **Meeting the Mentor** - NPC guide introduction
4. **Crossing the Threshold** - User commits
5. **Tests, Allies, Enemies** - Challenges and community
6. **Ordeal** - Core challenge
7. **Reward** - Growth/achievement
8. **Road Back** - Integration
9. **Resurrection** - Final test
10. **Return with Elixir** - Transformation complete

### User Journey State

```typescript
interface JourneyState {
  userId: string;
  currentStage: number; // 0-9
  completedArcs: string[];
  activeQuests: Quest[];
  npcRelationships: Map<string, RelationshipLevel>;
  growthMetrics: {
    skills: string[];
    contributions: string[];
    reflections: string[];
  };
}
```

---

## 7. Security & Encryption Deep Dive

### Encryption Strategy

```
┌────────────────────────────────────────────────────────────┐
│                 ENCRYPTION LAYERS                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Layer 1: Storage Encryption (at rest)                    │
│  ─────────────────────────────────────                     │
│  Algorithm: ChaCha20-Poly1305 or AES-256-GCM              │
│  Key: Derived from user's master key                      │
│                                                            │
│  Layer 2: Transport Encryption (in transit)              │
│  ─────────────────────────────────────                     │
│  TLS 1.3 + mTLS between services                           │
│                                                            │
│  Layer 3: Processing Encryption (in use)                  │
│  ─────────────────────────────────────                     │
│  - Agent memory encryption                                 │
│  - Session key rotation                                   │
│  - Memory wiping after sessions                           │
│                                                            │
│  Layer 4: Access Control Encryption                       │
│  ─────────────────────────────────────                     │
│  - Attribute-based encryption for shared data             │
│  - Proxy re-encryption for delegated access                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Key Management

```
┌─────────────────────────────────────────┐
│           KEY HIERARCHY                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────┐                   │
│  │ Master Key (KMK)│◄── User remembers  │
│  │ (user's brain)  │    (password)      │
│  └────────┬────────┘                   │
│           │ KDF (Argon2)                │
│           ▼                            │
│  ┌─────────────────┐                   │
│  │  Vault Key (VK) │◄── Encrypts vault  │
│  └────────┬────────┘                   │
│           │                            │
│     ┌─────┴─────┐                      │
│     ▼           ▼                      │
│ ┌───────┐  ┌───────┐                   │
│ │Private│  │Public │                   │
│ │ Zone  │  │ Zone  │                   │
│ │  Key  │  │  Key  │                   │
│ └───────┘  └───────┘                   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 8. Recommended Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- [ ] User vault structure and encryption
- [ ] Basic agent spawning system
- [ ] Shared activity database (manual entry)

### Phase 2: Intelligence (Weeks 5-8)
- [ ] Embedding and vector similarity
- [ ] Basic synergy matching
- [ ] User profile ingestion

### Phase 3: Experience (Weeks 9-12)
- [ ] Master agent orchestration
- [ ] NPC character system
- [ ] Hero's journey state machine

### Phase 4: Scale (Weeks 13-16)
- [ ] Multi-user support
- [ ] Performance optimization
- [ ] Advanced encryption features

---

## 9. Key Decisions to Validate

1. **Encryption approach:** Zero-knowledge vault vs TEE?
2. **Agent spawn strategy:** Container pool vs serverless?
3. **Vector database:** Self-hosted (Qdrant) vs managed (Pinecone)?
4. **NPC generation:** Template-based vs LLM-generated?
5. **Journey framework:** Fixed stages or adaptive?

---

## 10. Research Sources to Explore

- Zero-knowledge proof systems for data ownership
- Multi-agent AI architectures (AutoGen, CrewAI patterns)
- Vector database comparison (Qdrant vs Weaviate vs Pinecone)
- Hero's journey gamification in learning platforms
- Encrypted data processing techniques
- Federated learning for user data

---

*Research initiated: 2026-03-14*
*Status: Foundation established, architectural decisions documented*
