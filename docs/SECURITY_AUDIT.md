# OpenClaw Security & Autonomy Audit
**Date:** 2026-03-22  
**System:** drg-ThinkPad-Edge | Linux 6.17.0-14-generic  
**OpenClaw:** 2026.3.2

---

## 🔴 CRITICAL FINDINGS

### 1. Secrets Exposed in Config Files
**Severity:** CRITICAL

```json
// openclaw.json contains plaintext secrets:
"OPENROUTER_API_KEY": "[REDACTED_API_KEY]"
"botToken": "[REDACTED_BOT_TOKEN]"
"token": "[REDACTED_TOKEN]"
```

**Issue:** API keys, bot tokens, and auth tokens stored in plain text config.

**Fix:** Move all secrets to `.env` file with `env:` prefix in config, or use environment variables.

---

### 2. Execution Approvals Disabled
**Severity:** CRITICAL

```json
"approvals": {
  "exec": {
    "enabled": false,  // ⚠️ NO APPROVAL REQUIRED
    "agentFilter": []
  }
}
```

**Issue:** Agent can execute arbitrary shell commands without confirmation.

**Fix:** Enable approvals, especially for:
- Host system modifications
- Network operations
- File deletions

---

### 3. Exec Security = Full + Ask = Off
**Severity:** HIGH

```json
"exec": {
  "host": "gateway",
  "security": "full",  // ⚠️ Full host access
  "ask": "off"         // ⚠️ No confirmation
}
```

**Issue:** Agent has unrestricted host access with no confirmation prompts.

**Fix:** Set `ask: "on-miss"` or enable explicit approval workflow.

---

## 🟠 HIGH FINDINGS

### 4. Sandbox Mode = All
**Severity:** HIGH

```json
"sandbox": {
  "mode": "all",  // ⚠️ All sandboxing disabled
  ...
}
```

**Issue:** Running without sandbox isolation.

**Fix:** Use `"mode": "require"` to enforce sandbox, or `"sandbox": "inherit"` for controlled contexts.

---

### 5. Browser Host Control Enabled
**Severity:** HIGH

```json
"browser": {
  "allowHostControl": true,  // ⚠️ Can control browser on host
  "autoStart": true
}
```

**Issue:** Agent can control the host's browser, potentially visiting malicious sites or performing actions.

**Fix:** Disable `allowHostControl` unless explicitly needed.

---

### 6. jci-bot Agent Using M2.5 (Outdated)
**Severity:** MEDIUM

```json
"id": "jci-bot",
"model": "minimax/MiniMax-M2.5"  // Should be M2.7
```

**Fix:** Update to `minimax/MiniMax-M2.7` for consistency.

---

### 7. Trusted Proxy Range Too Wide
**Severity:** MEDIUM

```json
"trustedProxies": [
  "127.0.0.1",
  "::1",
  "100.64.0.0/10"  // ⚠️ Carrier-grade NAT - very broad
]
```

**Issue:** `100.64.0.0/10` includes many external IPs if behind CGNAT.

**Fix:** Narrow to specific known proxy IPs or remove if not using reverse proxy.

---

### 8. dmHistoryLimit = 12 (Too Low)
**Severity:** LOW

**Issue:** Only 12 messages retained per DM session - poor context for longer conversations.

**Fix:** Increase to 50-100 for useful conversation history.

---

### 9. Memory Search Has No TTL
**Severity:** LOW

```json
"memorySearch": {
  "enabled": true,
  "cache": {
    "enabled": true  // No TTL specified
  }
}
```

**Issue:** Cache may grow unbounded.

**Fix:** Add `ttl` configuration for memory cache.

---

### 10. Watchdog Script Broken
**Severity:** MEDIUM

```
/home/drg/watchdog.sh: line 41: openclaw: command not found
```

**Issue:** Health checks not running - system health is unmonitored.

**Fix:** Use full path `/usr/bin/openclaw` in watchdog script.

---

## 🟢 FUNCTIONALITY ISSUES

### 11. Fallback List Unnecessarily Long
**Severity:** INFO

40+ fallback models listed. Most unused.

**Fix:** Prune to 5-10 essential fallbacks:
```json
"fallbacks": [
  "openrouter/auto",
  "openrouter/anthropic/claude-opus-4.6",
  "openrouter/google/gemini-3-flash-preview",
  "openrouter/minimax/minimax-m2.5"
]
```

---

### 12. No Budget Controls
**Severity:** MEDIUM

**Issue:** No daily/monthly spending limits configured.

**Fix:** Add to `agents.defaults`:
```json
"budget": {
  "dailyLimit": 10.00,
  "alertAt": 7.50
}
```

---

## 📋 IMPROVEMENT PLAN

### Phase 1: Immediate Security Hardening (Day 1)
1. **Move secrets to .env**
   - Extract API keys, tokens to environment variables
   - Update config to reference `env:VAR_NAME`
   
2. **Enable exec approvals**
   ```json
   "approvals": {
     "exec": {
       "enabled": true,
       "agentFilter": ["main"]
     }
   }
   ```

3. **Fix watchdog script**
   - Change `openclaw` to `/usr/bin/openclaw`

4. **Update jci-bot to M2.7**

---

### Phase 2: Sandbox & Browser Isolation (Day 2-3)
1. **Enable sandbox mode**
   - Change `"mode": "all"` → `"mode": "require"` or `"sandbox": "inherit"`
   - Test all functionality works

2. **Disable browser host control**
   - Set `"allowHostControl": false` unless needed
   - If needed, limit to specific domains

---

### Phase 3: Network & Access Hardening (Day 4-5)
1. **Narrow trusted proxies**
   - Remove `100.64.0.0/10` unless CGNAT is in use
   - Document actual proxy infrastructure

2. **Add network rate limiting** (if available)

3. **Review Telegram group policy**
   - Current: `"groupPolicy": "allowlist"` (good)
   - Verify all allowed groups are intentional

---

### Phase 4: Functionality Optimization (Day 6-7)
1. **Prune fallback models** to essential set
2. **Increase dmHistoryLimit** to 50
3. **Add budget controls**
4. **Configure memory cache TTL**

---

### Phase 5: Monitoring & Auditing (Week 2)
1. **Fix logging/auditing**
   - Command logger is good, ensure it's being reviewed
   - Add periodic config audit

2. **Set up external monitoring**
   - UptimeRobot or similar for gateway health
   - Budget alerts via email/Telegram

3. **Create runbook**
   - Document recovery procedures
   - Document emergency shutdown steps

---

## 📊 CURRENT STATE SUMMARY

| Area | Status | Score |
|------|--------|-------|
| Secrets Management | ❌ Critical | 2/10 |
| Execution Controls | ❌ Critical | 1/10 |
| Sandbox Isolation | ❌ Critical | 1/10 |
| Model Currency | ✅ Good | 9/10 |
| Monitoring | ⚠️ Broken | 3/10 |
| Network Security | ⚠️ Needs Review | 6/10 |
| Autonomy | ⚠️ Too Permissive | 4/10 |

**Overall:** Needs significant hardening before production use.

---

## 🚀 QUICK WINS (5 minutes)

1. ✅ Update jci-bot to M2.7
2. ✅ Fix watchdog PATH
3. ✅ Increase dmHistoryLimit to 50
4. ✅ Add budget limits

**Estimated time to complete all phases:** 1-2 weeks (1-2 hrs/day)

---

*Audit by Aton - 2026-03-22*
