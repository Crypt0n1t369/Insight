# Zero-Knowledge Proofs for Identity

## What Are ZK Proofs?

Prove a statement is true without revealing the underlying data:

```
Classic example:
"I am over 18" without revealing age
"I am a unique human" without revealing identity
"My reputation > 100" without revealing who I am
```

## Types of ZK Proofs

### 1. zk-SNARKs
- Succinct, non-interactive
- Requires trusted setup
- Used by Zcash, Filecoin

### 2. zk-STARKs
- Transparent (no trusted setup)
- Post-quantum secure
- Larger proofs

### 3. BBS+ Signatures
- Blind, unlinkable
- Great for credentials
- Used by Spruce, MATTR

## Credo Use Cases

### Sybil Prevention
```
Prove: "I am a unique human"
Without revealing: name, email, device fingerprint
```

### Reputation Gating
```
Prove: "My credibility score > threshold"
Without revealing: actual score, identity
```

### Contribution Attribution
```
Prove: "I contributed to node X"
Without revealing: which user ID
```

## Implementation

### Simple (Current)
- Random UUID per user
- LocalStorage persistence
- No linking

### Intermediate (Phase 2)
- Wallet-based optional identity
- Pseudonymous profiles
- ZK proofs for reputation

### Advanced (Phase 3)
- Full credential system
- Selective disclosure
- Cross-platform portability

## Tools

- **Semaphore**: ZK identity for Ethereum
- **Polygon ID**: DID + credentials
- **maci**: Quadratic voting with ZK
- **Groth16**: SNARK library

---

*Status: Sketch*
