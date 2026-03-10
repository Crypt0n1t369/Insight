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
if python3 "$WORKSPACE/scripts/enhanced_context.py" --save > /dev/null 2>&1; then
    echo "OK" | tee -a $LOG_FILE
else
    echo "WARN - inject failed" | tee -a $LOG_FILE
fi

# H11: Context Summarizer (check if summary needed)
echo -n "H11: Context summary... " | tee -a $LOG_FILE
MEM_SIZE=$(wc -c < "$WORKSPACE/.memory_context" 2>/dev/null || echo "0")
if [ "$MEM_SIZE" -gt 1000 ]; then
    echo "OK (${MEM_SIZE} bytes)" | tee -a $LOG_FILE
else
    echo "WARN - context low" | tee -a $LOG_FILE
fi

# H12: Budget Check
echo -n "H12: Budget... " | tee -a $LOG_FILE
if python3 "$WORKSPACE/scripts/budget_monitor.py" 2>&1 | grep -q "Status: OK"; then
    echo "OK" | tee -a $LOG_FILE
else
    echo "WARN" | tee -a $LOG_FILE
fi

# H13: Memory Usage
echo -n "H13: Memory usage... " | tee -a $LOG_FILE
MEM_AVAIL=$(free -m | awk 'NR==2{print $7}')
if [ "$MEM_AVAIL" -gt 500 ]; then
    echo "OK (${MEM_AVAIL}MB free)" | tee -a $LOG_FILE
elif [ "$MEM_AVAIL" -gt 200 ]; then
    echo "WARN - ${MEM_AVAIL}MB free" | tee -a $LOG_FILE
else
    echo "CRITICAL - ${MEM_AVAIL}MB free" | tee -a $LOG_FILE
fi

# H14: Critical Services
echo -n "H14: Services... " | tee -a $LOG_FILE
SERVICES_OK=0
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null | grep -q "200"; then
    SERVICES_OK=$((SERVICES_OK + 1))
fi
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 2>/dev/null | grep -q "200"; then
    SERVICES_OK=$((SERVICES_OK + 1))
fi
if pgrep -f "openclaw-gateway" > /dev/null 2>&1; then
    SERVICES_OK=$((SERVICES_OK + 1))
fi
if [ $SERVICES_OK -ge 2 ]; then
    echo "OK ($SERVICES_OK/3 running)" | tee -a $LOG_FILE
else
    echo "WARN - only $SERVICES_OK/3 running" | tee -a $LOG_FILE
fi

# H15: CPU Load
echo -n "H15: CPU load... " | tee -a $LOG_FILE
LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
LOAD_INT=$(echo "$LOAD" | cut -d. -f1)
if [ "$LOAD_INT" -lt 4 ]; then
    echo "OK (load: $LOAD)" | tee -a $LOG_FILE
else
    echo "WARN - high load: $LOAD" | tee -a $LOG_FILE
fi

# H16: Disk Space
echo -n "H16: Disk space... " | tee -a $LOG_FILE
DISK_USED=$(df -h . | awk 'NR==2{print $5}' | sed 's/%//')
if [ "$DISK_USED" -lt 80 ]; then
    echo "OK (${DISK_USED}% used)" | tee -a $LOG_FILE
else
    echo "WARN - ${DISK_USED}% used" | tee -a $LOG_FILE
fi

# H17: Credo Service
echo -n "H17: Credo API... " | tee -a $LOG_FILE
if curl -s http://localhost:3003/health 2>/dev/null | grep -q "ok"; then
    echo "OK" | tee -a $LOG_FILE
else
    echo "WARN - not responding" | tee -a $LOG_FILE
fi

# H18: OpenClaw Gateway
echo -n "H18: Gateway... " | tee -a $LOG_FILE
if pgrep -f "openclaw-gateway" > /dev/null 2>&1; then
    echo "OK" | tee -a $LOG_FILE
else
    echo "WARN - not running" | tee -a $LOG_FILE
fi

echo "=== Health Check Complete ===" | tee -a $LOG_FILE
