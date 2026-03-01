#!/bin/bash
# Health Check Script - Phase 1 MVP
# Run daily to verify workspace health

# Support both sandbox and host execution
if [ -d "/home/drg/.openclaw/workspace" ]; then
    WORKSPACE="/home/drg/.openclaw/workspace"
elif [ -d "/workspace" ]; then
    WORKSPACE="/workspace"
else
    echo "ERROR: Cannot find workspace"
    exit 1
fi

DATE=$(date +%Y-%m-%d)
LOG_FILE="$WORKSPACE/.health_check.log"

echo "=== Aton Health Check - $DATE ===" | tee -a $LOG_FILE

# H1: Repository Health
echo -n "H1: Repo status... " | tee -a $LOG_FILE
cd "$WORKSPACE" || exit 1
if git diff --quiet 2>/dev/null; then
    echo "OK" | tee -a $LOG_FILE
else
    echo "WARN - uncommitted changes" | tee -a $LOG_FILE
fi

# H2: Secrets Hygiene  
echo -n "H2: Secrets check... " | tee -a $LOG_FILE
if grep -r "password\|secret\|api_key" $WORKSPACE/scripts/*.js 2>/dev/null | grep -v "^//" | grep -qv "placeholder"; then
    echo "FAIL - secrets found!" | tee -a $LOG_FILE
else
    echo "OK" | tee -a $LOG_FILE
fi

# H3: Memory Growth
echo -n "H3: Memory files... " | tee -a $LOG_FILE
MEM_COUNT=$(ls $WORKSPACE/memory/*.md 2>/dev/null | wc -l)
if [ $MEM_COUNT -gt 0 ]; then
    echo "OK ($MEM_COUNT files)" | tee -a $LOG_FILE
else
    echo "WARN - no memory files" | tee -a $LOG_FILE
fi

# H4: Test Results
echo -n "H4: Test harness... " | tee -a $LOG_FILE
if [ -f "$WORKSPACE/tests/phase1_core_tests.md" ]; then
    echo "OK" | tee -a $LOG_FILE
else
    echo "WARN - no tests found" | tee -a $LOG_FILE
fi

# H5: Budget (manual check - just log)
echo "H5: Budget - check session_status manually" | tee -a $LOG_FILE

# H6: Git Branch
echo -n "H6: Git branch... " | tee -a $LOG_FILE
BRANCH=$(git branch --show-current 2>/dev/null)
# Check for detached HEAD state
if [ -z "$BRANCH" ]; then
    # Try to get commit hash or tag
    BRANCH=$(git describe --tags --always --dirty 2>/dev/null || echo "detached")
fi
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ] || [[ "$BRANCH" == feature/* ]]; then
    echo "OK (on $BRANCH)" | tee -a $LOG_FILE
elif [ "$BRANCH" = "detached" ]; then
    echo "WARN - detached HEAD" | tee -a $LOG_FILE
else
    echo "WARN - on $BRANCH" | tee -a $LOG_FILE
fi

# H7: Memory Freshness (warn if no updates in 3 days)
echo -n "H7: Memory freshness... " | tee -a $LOG_FILE
LATEST_MEM=$(ls -t "$WORKSPACE"/memory/*.md 2>/dev/null | head -1)
if [ -n "$LATEST_MEM" ]; then
    DAYS_OLD=$(echo "$(date +%s) - $(stat -c %Y "$LATEST_MEM" 2>/dev/null || stat -f %m "$LATEST_MEM" 2>/dev/null)" | bc 2>/dev/null | cut -d. -f1)
    DAYS_OLD=$((DAYS_OLD / 86400))
    if [ "$DAYS_OLD" -lt 3 ]; then
        echo "OK (${DAYS_OLD}d old)" | tee -a $LOG_FILE
    else
        echo "WARN - ${DAYS_OLD}d since last entry" | tee -a $LOG_FILE
    fi
else
    echo "WARN - no memory files" | tee -a $LOG_FILE
fi

# H8: Auto-commit suggestion
echo -n "H8: Git cleanup... " | tee -a $LOG_FILE
if ! git diff --quiet 2>/dev/null; then
    echo "PENDING - run 'git add -A && git commit -m \"updates\"'" | tee -a $LOG_FILE
else
    echo "OK" | tee -a $LOG_FILE
fi

# H9: Cron health (check if cron is running)
echo -n "H9: Cron active... " | tee -a $LOG_FILE
if pgrep -x "cron" > /dev/null 2>&1 || pgrep -f "openclaw" > /dev/null 2>&1; then
    echo "OK" | tee -a $LOG_FILE
else
    echo "WARN - no active cron/openclaw processes" | tee -a $LOG_FILE
fi

# H10: Memory Context Auto-Inject
echo -n "H10: Memory context... " | tee -a $LOG_FILE
if python3 "$WORKSPACE/scripts/auto_memory_inject.py" > /dev/null 2>&1; then
    echo "OK" | tee -a $LOG_FILE
else
    echo "WARN - inject failed" | tee -a $LOG_FILE
fi

echo "=== Health Check Complete ===" | tee -a $LOG_FILE
