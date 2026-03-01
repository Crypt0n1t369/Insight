# SECURITY HARDENING PLAN

## System Context

| Item | Status |
|------|--------|
| OS | Linux Mint 22.3 (Ubuntu 24.04) |
| User | drg (sudo group) |
| Public IP | 83.99.137.67 (Latvia) |
| Firewall | UFW active |
| SSH | Running |
| Cron | Running |
| Home Encryption | eCryptfs ✅ |
| OpenClaw | Running |

---

## OpenClaw Audit Findings

### CRITICAL (1)
1. **Small models with web tools, no sandboxing**
   - 3 small models (30B, 120B, 235B) configured with web_search/web_fetch/browser
   - Risk: Prompt injection, tool misuse
   - Fix: Enable sandbox OR disable web tools for small models

### WARN (2)
2. **Gateway password in config**
   - Stored in `openclaw.json` instead of env var
   - Fix: Use `OPENCLAW_GATEWAY_PASSWORD` env var

3. **Weak model tiers**
   - Old model in fallback list
   - Fix: Use latest top-tier models

### INFO (3)
4. **Tailscale serve enabled**
   - Exposes gateway to tailnet
   - Review if needed

5. **Stale plugin config**
   - `google-antigravity-auth` entry
   - Fix: Remove from config

---

## Remediation Steps

### Step 1: Fix Critical - Small Model Sandbox
```bash
# Option A: Enable sandbox for all sessions
# Edit ~/.openclaw/openclaw.json:
"agents": {
  "defaults": {
    "sandbox": {
      "mode": "all"
    }
  }
}

# Option B: Disable web tools for small models
# Remove from model.fallbacks or add:
"tools": {
  "deny": ["web_search", "web_fetch", "browser"]
}
```

### Step 2: Fix Password Storage
```bash
# Set env var
export OPENCLAW_GATEWAY_PASSWORD="your_password"

# Remove from config
# Edit ~/.openclaw/openclaw.json - remove gateway.auth.password
```

### Step 3: Remove Stale Plugin
```bash
# Edit ~/.openclaw/openclaw.json
# Remove: plugins.entries.google-antigravity-auth
```

### Step 4: Review SSH (if needed)
```bash
# Check SSH config
sudo cat /etc/ssh/sshd_config | grep -E "PermitRoot|Pubkey|Password"

# Recommend: key-only auth, no root login
```

---

## Risk Profiles (Choose One)

1. **Home/Workstation Balanced** (current) - firewall on, remote via RustDesk
2. **VPS Hardened** - deny-by-default firewall, key-only SSH
3. **Developer Convenience** - more local services

---

## Decision Required

Reply with:
1. Fix critical issues only
2. Fix all issues
3. Show plan only
4. Custom approach

🛡️
