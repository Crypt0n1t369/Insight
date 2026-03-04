# Anonymous Identity Systems

## The Problem

Online systems typically require:
- Email address (identifiable)
- Phone number (linkable)
- Government ID (high stakes)

This creates barriers and surveillance concerns.

## Anonymous Options

### 1. Wallet-Based
- Ethereum addresses (public by default)
- Generate new addresses per context
- ZK proofs for uniqueness without linking

### 2. Device-Based
- Browser fingerprints
- Privacy-preserving identifiers
- Tor-compatible

### 3. Centralized Anonymous
- Issue pseudonyms
- No linking to real identity
- Requires trust in issuer

## Zero-Knowledge Proofs (ZK)

Prove something without revealing information:

```ZK Examples:
✓ "I am a unique human" (Sybil prevention)
✓ "I am over 18" (age gate)
✓ "I contributed to X" (attribution)
✓ "My reputation score > 100" (tier gate)
```

## Implementation for Credo

### Minimum Viable
1. Generate random user ID
2. Store in localStorage
3. No linking to email/IP

### Intermediate
1. Wallet connection (optional)
2. Reputation score linked to anonymous ID
3. Export reputation via ZK proof

### Advanced
1. Full ZK identity
2. Selective disclosure
3. Cross-platform reputation portability

---

*Status: Sketch*
