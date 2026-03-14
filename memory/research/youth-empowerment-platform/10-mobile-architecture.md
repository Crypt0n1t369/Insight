# Youth Empowerment Platform - Mobile & Offline Architecture

## Executive Summary

Target users (16-25) primarily access via mobile. Design for offline-first, native-like PWA experience, with local encryption and sync. Avoid app store dependency initially.

---

## Mobile Strategy

### Approach: PWA First

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE STRATEGY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │ PWA (Web)       │     │ Native (Later)  │                   │
│  │ ─────────────── │     │ ─────────────── │                   │
│  │ • No install    │     │ • Push          │                   │
│  │ • Instant       │     │   notifications │                   │
│  │ • Always latest │     │ • Better        │                   │
│  │ • App-like      │     │   performance   │                   │
│  └────────┬────────┘     └────────┬────────┘                   │
│           │                      │                             │
│           └──────────┬───────────┘                             │
│                      ▼                                         │
│              ┌─────────────────┐                               │
│              │  Mobile First   │                               │
│              │     Design      │                               │
│              └─────────────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why PWA First
- No app store approval delay
- Instant updates
- Lower development cost
- "Good enough" for most features

### When to Go Native
- Complex animations
- Background processing
- Push notifications critical
- Hardware access needed

---

## Offline-First Architecture

### Core Principle
> "Works without internet. Syncs when connected."

```
┌─────────────────────────────────────────────────────────────────┐
│                 OFFLINE-FIRST DATA FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐         ┌─────────────┐                        │
│  │   Mobile    │         │   Server    │                        │
│  │   Device    │         │             │                        │
│  └──────┬──────┘         └──────┬──────┘                        │
│         │                       │                                │
│         ▼                       ▼                                │
│  ┌─────────────┐         ┌─────────────┐                        │
│  │  Local DB   │◄───────►│   Sync     │                        │
│  │ (IndexedDB) │         │   Queue    │                        │
│  └──────┬──────┘         └──────┬──────┘                        │
│         │                       │                                │
│         ▼                       ▼                                │
│  ┌─────────────┐         ┌─────────────┐                        │
│  │   Encrypted │         │  Encrypted  │                        │
│  │   Vault     │         │   Vault     │                        │
│  │  (local)    │         │   (cloud)   │                        │
│  └─────────────┘         └─────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Local Storage (Mobile)

| Data | Storage | Sync Strategy |
|------|---------|---------------|
| Private vault | Encrypted file | Sync on connect |
| Journey state | IndexedDB | Sync on connect |
| Shared activities | IndexedDB | Background sync |
| Conversation | IndexedDB | Keep local |

### Sync Protocol

```
1. USER IS ONLINE
   │
   ▼
2. Detect connection
   │
   ▼
3. Push local changes → server
   │
   ▼
4. Pull server changes → local
   │
   ▼
5. Resolve conflicts (last-write-wins + merge)
   │
   ▼
6. Update UI
```

### Conflict Resolution
- **Simple:** Last-write-wins for most data
- **Merge:** Conversation history combines
- **User choice:** For important conflicts

---

## Encryption on Mobile

### Challenge
Mobile devices are more vulnerable to theft/compromise.

### Solution: Device-Locked Encryption

```
┌─────────────────────────────────────────────────────────────────┐
│              MOBILE ENCRYPTION LAYERS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: File Encryption                                       │
│  ─────────────────────────────                                  │
│  • Vault encrypted with user passphrase                        │
│  • Passphrase never stored                                      │
│  • Derived key in memory only during session                    │
│                                                                 │
│  Layer 2: Device Security                                       │
│  ────────────────────────────                                   │
│  • Biometric unlock (optional)                                  │
│  • Screen lock required                                         │
│  • Remote wipe capability                                       │
│                                                                 │
│  Layer 3: Memory Protection                                     │
│  ────────────────────────────                                   │
│  • Clear decrypted data on app close                           │
│  • No caching sensitive data                                   │
│  • Secure delete                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Management on Mobile

```
User Passphrase ──► Argon2id ──► Vault Key
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Store in         Biometric
              Keychain         unlocks
              (encrypted)      keychain
```

---

## PWA Implementation

### Service Worker Strategy

```javascript
// sw.js - Service Worker
const CACHE_NAME = 'youth-platform-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});

// Cache strategies
// - App shell: Cache first
// - API: Network first, fallback to cache
// - Vault: Cache only (never go network for sensitive)
```

### PWA Features to Implement

| Feature | Implementation |
|---------|----------------|
| Installable | Web App Manifest |
| Offline | Service Worker + IndexedDB |
| Add to Home | manifest.json + icons |
| Push (future) | VAPID keys + Push API |
| Background sync | Background Sync API |

### IndexedDB Schema

```javascript
// Local database structure
const db = {
  vault: {
    private: EncryptedBlob,  // Intentions, challenges
    public: EncryptedBlob,   // Skills, profile
    journey: EncryptedBlob  // Stage, milestones
  },
  cache: {
    activities: [...],     // Cached shared DB
    matches: [...],         // Cached matches
    npcs: {...}             // Character data
  },
  sync: {
    queue: [...],           // Pending changes
    lastSync: timestamp     // Last sync time
  }
};
```

---

## Mobile UI Considerations

### Design Principles

```
┌─────────────────────────────────────────────────────────────────┐
│              MOBILE UI PRINCIPLES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Touch-First                                               │
│     • Large tap targets (44px minimum)                        │
│     • Swipe gestures                                           │
│     • No hover states                                          │
│                                                                 │
│  2. Low Bandwidth                                              │
│     • Minimal images                                           │
│     • Text-first                                               │
│     • Lazy load                                                │
│                                                                 │
│  3. Low Attention                                              │
│     • Quick wins                                               │
│     • One-handed use                                           │
│     • Notifications (optional)                                 │
│                                                                 │
│  4. Offline-Capable                                            │
│     • Works without connection                                │
│     • Clear offline indicator                                  │
│     • Cached content available                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Screens (Mobile)

1. **Home** — Current journey, quick actions
2. **Explore** — Browse opportunities (cached)
3. **Chat** — Agent conversation
4. **Profile** — Skills, badges, progress
5. **Settings** — Privacy, sync, vault

---

## Push Notifications (Future)

### Implementation

```javascript
// Request permission
async function requestPush() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });
    // Send to server
  }
}
```

### Notification Types

| Type | When | Content |
|------|------|---------|
| **Match** | New opportunity matches | "3 opportunities match your skills" |
| **Journey** | Stage advance | "You've progressed to [Stage]!" |
| **Connection** | Someone wants to help | "A mentor wants to connect" |
| **Reminder** | Back to platform | "Your journey awaits..." |

### Privacy Controls
- All notifications opt-in
- Granular control
- Quiet hours
- No location-based

---

## Performance Targets

### Mobile Metrics

| Metric | Target |
|--------|--------|
| First Contentful Paint | <1.5s |
| Time to Interactive | <3s |
| Lighthouse Score | >80 |
| Offline load | <1s |
| Sync time (10 items) | <5s |

### Optimization Techniques
- Code splitting
- Lazy loading
- Image optimization
- Bundle size <200KB

---

## Summary: Mobile Architecture

| Aspect | Decision |
|--------|----------|
| **Platform** | PWA first |
| **Offline** | Full support |
| **Storage** | IndexedDB |
| **Encryption** | Local + passphrase |
| **Sync** | On-connect |
| **Updates** | Instant (web) |
| **Push** | Future phase |

---

## Next Steps

- [ ] Create PWA manifest
- [ ] Implement service worker
- [ ] Set up IndexedDB layer
- [ ] Build mobile UI components
- [ ] Test offline mode

---

*Research completed: 2026-03-14*
*Next: Competitive Analysis*
