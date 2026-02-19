#!/bin/bash
# Health Check Script - Phase 1 MVP
# Run daily to verify workspace health

WORKSPACE="/home/drg/.openclaw/workspace"
DATE=$(date +%Y-%m-%d)
LOG_FILE="$WORKSPACE/.health_check.log"

echo "=== Aton Health Check - $DATE ===" | tee -a $LOG_FILE

# H1: Repository Health
echo -n "H1: Repo status... " | tee -a $LOG_FILE
cd $WORKSPACE
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
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ] || [[ "$BRANCH" == feature/* ]]; then
    echo "OK (on $BRANCH)" | tee -a $LOG_FILE
else
    echo "WARN - on $BRANCH" | tee -a $LOG_FILE
fi

echo "=== Health Check Complete ===" | tee -a $LOG_FILE
