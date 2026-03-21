# OpenClaw Comprehensive Audit Report
**Version:** 2026.3.13  
**Date:** 2026-03-22  
**System:** drg-ThinkPad-Edge | Linux 6.17.0  
**Uptime:** 26 days | RAM: 4.8GB available

---

## Executive Summary

| Category | Status | Score | Critical Issues |
|----------|--------|-------|-----------------|
| Secrets Management | ❌ CRITICAL | 2/10 | API keys in plaintext |
| Execution Control | ❌ CRITICAL | 1/10 | No sandbox, no approval prompts |
| Sandbox Isolation | ❌ CRITICAL | 0/10 | mode="all" = sandbox disabled |
| Browser Security | ❌ CRITICAL | 1/10 | Host control enabled |
| Network Security | ⚠️ MEDIUM | 5/10 | Proxy range too broad |
| Model Config | ✅ GOOD | 9/10 | M2.7 default, 16K output |
| Monitoring | ⚠️ BROKEN | 3/10 | Watchdog fixed, no external alerts |
| Authentication | ⚠️ WEAK | 6/10 | Password only, no 2FA |

**Overall Risk: CRITICAL** - System should not be exposed to untrusted parties.

---

## 🔴 CRITICAL Issues (Fix Immediately)

### 1. Execution Host Access = Full + No Approval
```json
"exec": {
  "host": "gateway",
  "security": "full",  // ← Full host access
  "ask": "off"         // ← No confirmation prompt
}
```
**Threat:** T-IMPACT-001, T-EXEC-004 (from OpenClaw threat model)  
**Risk:** Agent can execute ANY shell command on host without confirmation  
**Impact:** Full system compromise if agent is manipulated

**Fix:**
```json
"exec": {
  "host": "gateway",
  "security": "allowlist",
  "ask": "on-miss",
  "allowlist": [
    "read", "write", "edit", "process", "sessions_list", "sessions_history"
  ]
}
```

---

### 2. Sandbox = All (Disabled)
```json
"sandbox": {
  "mode": "all",  // ← ALL sandboxing disabled
  ...
}
```
**Threat:** T-IMPACT-001 (Critical - Host execution without sandbox)  
**Risk:** No isolation between agent and host system  
**Impact:** Any tool can access host filesystem, network, processes

**Fix:** Change to `"mode": "require"` or `"sandbox": "inherit"`

---

### 3. Browser Host Control Enabled
```json
"browser": {
  "allowHostControl": true,  // ← Agent can control host browser
  "autoStart": true
}
```
**Threat:** T-EXEC-002 (Indirect prompt injection via browser)  
**Risk:** Agent could visit malicious sites, steal browser data, perform actions as user  
**Impact:** Phishing, credential theft, remote code execution

**Fix:** Set `"allowHostControl": false` unless explicitly needed

---

### 4. Secrets in Plaintext Config
```json
"env": {
  "vars": {
    "OPENROUTER_API_KEY": "[REDACTED_API_KEY]",
    "botToken": "[REDACTED_BOT_TOKEN]",
    "token": "[REDACTED_TOKEN]"
  }
}
```
**Risk:** Anyone with config read access gets all API keys  
**Impact:** Account compromise, unauthorized API usage, bill fraud

**Fix:** Move to `.env` file:
```bash
# ~/.openclaw/.env
OPENROUTER_API_KEY=[REDACTED_API_KEY]
TELEGRAM_BOT_TOKEN=[REDACTED_BOT_TOKEN]
OPENCLAW_GATEWAY_TOKEN=[REDACTED_TOKEN]
```

Then in config:
```json
"env": {
  "vars": {
    "OPENROUTER_API_KEY": { "env": "OPENROUTER_API_KEY" }
  }
}
```

---

## 🟠 HIGH Issues (Fix This Week)

### 5. Trusted Proxy Range Too Broad
```json
"trustedProxies": [
  "127.0.0.1", "::1",
  "100.64.0.0/10"  // ← Carrier-grade NAT - too wide
]
```
**Risk:** If behind CGNAT, external attackers could spoof requests  
**Fix:** Remove `100.64.0.0/10` unless you have actual CGNAT proxy

---

### 6. No Budget Controls
**Risk:** Unexpected high API costs  
**Fix:**
```json
"agents": {
  "defaults": {
    "budget": {
      "dailyLimit": 10.00,
      "alertAt": 7.50,
      "hardCap": true
    }
  }
}
```

---

### 7. dmHistoryLimit = 50 Still Low
**Issue:** Context resets after 50 messages  
**Fix:** Consider increasing to 100-200 for longer conversations

---

### 8. Fallback Model List Too Long (37 models)
**Issue:** Clutters config, slow model selection  
**Fix:** Prune to 5-8 essential fallbacks:
```json
"fallbacks": [
  "openrouter/auto",
  "openrouter/anthropic/claude-sonnet-4.6",
  "openrouter/google/gemini-3-flash-preview",
  "openrouter/minimax/minimax-m2.5"
]
```

---

## 🟡 MEDIUM Issues (Fix This Month)

### 9. No 2FA on Gateway Auth
**Current:** Password only (`"mode": "password"`)  
**Fix:** Enable Tailscale or OAuth if available

---

### 10. Memory Cache Has No TTL
```json
"memorySearch": {
  "cache": { "enabled": true }  // No TTL
}
```
**Issue:** Cache grows unbounded  
**Fix:** Add `"ttl": 3600` (1 hour)

---

### 11. Control UI Origins Not Verified
```json
"controlUi": {
  "allowedOrigins": ["https://drg-thinkpad-edge.tail9e72dc.ts.net"]
}
```
**Note:** This is a Tailscale origin which is good, but verify in OpenClaw docs

---

## ✅ What's Working Well

1. **Model Config** ✅
   - MiniMax M2.7 as primary (good)
   - 16K max tokens (2x improvement)
   - Fallback chain exists

2. **Exec Approvals Enabled** ✅
   - `approvals.exec.enabled: true`
   - `agentFilter: ["main"]`

3. **Command Logging** ✅
   - `hooks.internal.entries.command-logger: enabled`

4. **Watchdog Script** ✅
   - Fixed path issues
   - Will now properly detect crashes

5. **Telegram Group Policy** ✅
   - `groupPolicy: "allowlist"` (good practice)

---

## 📋 Stage-by-Stage Improvement Plan

### Stage 1: Emergency Hardening (Day 1)
**Time:** 30 minutes  
**Risk Reduction:** Critical → Medium

| # | Action | Config Change |
|---|--------|---------------|
| 1 | Enable sandbox | `sandbox.mode: "require"` |
| 2 | Disable browser host control | `browser.allowHostControl: false` |
| 3 | Set exec ask to on-miss | `exec.ask: "on-miss"` |
| 4 | Create .env with secrets | Move keys out of config |

**Verification:**
```bash
openclaw gateway restart
# Test exec works for allowed tools only
```

---

### Stage 2: Network Hardening (Day 2-3)
**Time:** 1 hour  
**Risk Reduction:** Medium → Low

| # | Action |
|---|--------|
| 1 | Narrow trustedProxies to actual proxy IPs |
| 2 | Add rate limiting if available |
| 3 | Review Telegram allowFrom list |
| 4 | Consider firewall rules for gateway port |

---

### Stage 3: Budget & Monitoring (Day 4-5)
**Time:** 1 hour

| # | Action |
|---|--------|
| 1 | Add daily budget limits to config |
| 2 | Set up external uptime monitoring (UptimeRobot) |
| 3 | Configure Telegram alerts for budget exceeded |
| 4 | Review logs weekly |

---

### Stage 4: Model & Config Optimization (Day 6-7)
**Time:** 1 hour

| # | Action |
|---|--------|
| 1 | Prune fallback models to essential set |
| 2 | Increase dmHistoryLimit to 100+ |
| 3 | Add memory cache TTL |
| 4 | Document all agents and their purposes |

---

### Stage 5: Long-term Security (Week 2-3)
**Time:** 3-4 hours

| # | Action | Notes |
|---|--------|-------|
| 1 | Enable OAuth for gateway | Instead of password |
| 2 | Add skill sandboxing | Per OpenClaw threat model |
| 3 | Implement content wrapping | For external content |
| 4 | Add VirusTotal integration | For exec (if available) |
| 5 | Security audit by community | Submit to OpenClaw trust |

---

## 🔧 Quick Wins (Done Today)

```bash
# Already completed:
✅ jci-bot updated to M2.7
✅ dmHistoryLimit increased to 50
✅ exec approvals enabled
✅ watchdog.sh fixed

# Still needed today:
⚠️  Move secrets to .env
⚠️  Set sandbox.mode = "require"
⚠️  Disable browser host control
```

---

## 📊 Risk Score After Each Stage

| Stage | Risk Level | Score |
|-------|------------|-------|
| Current | CRITICAL | 2/10 |
| After Stage 1 | MEDIUM | 5/10 |
| After Stage 2 | LOW-MEDIUM | 6/10 |
| After Stage 3 | LOW | 7/10 |
| After Stage 4 | LOW | 8/10 |
| After Stage 5 | MINIMAL | 9/10 |

---

## 🔍 Testing Checklist

After each stage, verify:

- [ ] Gateway restarts successfully
- [ ] Telegram messages work
- [ ] Agent responds to queries
- [ ] Exec tools work (read/write/edit)
- [ ] Browser tools work (if enabled)
- [ ] No crashes in logs
- [ ] Budget tracking works

---

*Audit by Aton ☀️🦞 - 2026-03-22*
*Based on OpenClaw v2026.3.13 and MITRE ATLAS threat model*
