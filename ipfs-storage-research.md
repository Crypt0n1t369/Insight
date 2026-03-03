# IPFS & Decentralized Storage for Credo

## Options

### 1. IPFS + Pinata
**Pros:**
- Popular, well-supported
- Pinata makes it easy
- Content addressing
- CDN-like performance

**Cons:**
- Data persistence depends on pins
- Free tier limited (1GB)
- Gateway costs

---

### 2. Arweave
**Pros:**
- Permanent storage
- Pay once, store forever
- Good for important data

**Cons:**
- More expensive upfront
- Less popular than IPFS

---

### 3. Filecoin
**Pros:**
- Decentralized
- Cheaper long-term
- Active ecosystem

**Cons:**
- Complex
- Retrieval can be slow

---

### 4. Sia
**Pros:**
- Decentralized
- Privacy-focused

**Cons:**
- Less developer tooling
- Smaller ecosystem

---

## Recommendation

**Hybrid approach:**
- IPFS + Pinata for most content
- Arweave for permanent records (merged branches)
- Keep metadata in PostgreSQL for queryability

---

*Research for technical-architecture.md*
