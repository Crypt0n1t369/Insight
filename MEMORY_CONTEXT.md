=== ATON CONTEXT ===
Generated: 2026-03-26 22:58 Cairo (20:58 UTC)

## Active Projects

### Audio Transformation Tool ✅ RUNNING (Demo Mode)
- **Location**: `projects/audio-transformation-tool/code/` (submodule at 6548ed2)
- **Backend**: port 3001 (node tsx server/index.ts)
- **Frontend**: port 5173 (npx serve dist - PRE-BUILT only)
- **Tests**: 68/68 passing (vitest, 4 test files)
- **Demo Mode**: Fully operational, 9 protocols, Web Speech API fallback
- **Git**: Submodule at 6548ed2, synced
- **Issue**: Frontend source missing — cannot rebuild (only dist/ committed)
- **Blocked**: User needs to deploy to Vercel + add OpenRouter credits

### Credo Collaboration Platform ✅ RUNNING
- **Location**: `projects/collaboration-platform/`
- **API**: port 3000, Frontend: port 3002
- **Tests**: 75/75 passing (vitest, 6 test files)

### Youth Empowerment Platform ✅ RUNNING
- **Location**: `projects/youth-empowerment-platform/`
- **Port**: 3003
- **Tests**: 24/24 passing (pytest)

### Synthesis Platform ✅ RUNNING
- **Location**: `projects/synthesis/` (same repo as workspace)
- **Tests**: 382/382 passing (vitest, 11 test files)
- **Specialist agents**: NSDR (37), IFS (31), BREATHWORK (28), WOOP (25), SE (22), ACT (29), GENERAL (fallback)

### JCI Org Manager ✅ RUNNING
- **Location**: `projects/jci-org-manager/` (submodule at 97aa1d0)
- **Port**: 8080
- **Tests**: 41/41 passing (pytest)

### Festival Coordinator ✅ RUNNING
- **Location**: `projects/festival-coordinator/`
- **Tests**: 49/49 passing (pytest)
- **Phase 2**: Telegram bot ready; needs TELEGRAM_BOT_TOKEN

## Key Decisions
- Memory System: Hybrid TF-IDF + file-based context (no Mem0 cloud)
- Audio Tool: Demo mode with Web Speech API fallback (no API key needed)
- Frontend: Pre-built dist committed (source not in repo)

## Code Fix This Session
- `server.test.ts`: Mock validation now uses `Object.keys(CLINICAL_PROTOCOLS)` instead of hardcoded 12-entry array
- Fixed in both workspace root `server/` and audio submodule `projects/audio-transformation-tool/code/server/`

## Current Focus
- Wakeup cron: Service health monitoring + progress doc updates
- BLOCKED on user: Vercel deploy + OpenRouter credits + Telegram tokens

## Quick Status
- Memory: Fresh (today)
- Health: 6/6 services passing
- Git: Clean workspace (2 staged changes pending)
- Context: Auto-generated
- Total Tests: 639 passing
