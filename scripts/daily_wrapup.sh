#!/bin/bash
# Daily Wrap-Up - End of day summary and preparation for tomorrow
# Run at end of day or before night shift

DATE=$(date +%Y-%m-%d)
WORKSPACE="/home/drg/.openclaw/workspace"

echo "🌙 === Aton Daily Wrap-Up - $DATE ==="
echo ""

# Run health checks
echo "📊 Running health checks..."
$WORKSPACE/scripts/health_check.sh 2>&1 | grep -E "(H[0-9]:|===)" | sed 's/^/  /'
echo ""

# Test results
echo "🧪 Test results:"
$WORKSPACE/scripts/test_runner.sh 2>&1 | grep -E "(Test |PASS|FAIL)" | sed 's/^/  /'
echo ""

# Budget summary
echo "💰 Budget:"
$WORKSPACE/scripts/budget_tracker.sh $DATE | grep -E "(Spend|Remaining)" | sed 's/^/  /'
echo ""

# Memory summary
echo "📝 Memory entries:"
ls -1 $WORKSPACE/memory/*.md 2>/dev/null | wc -l | xargs echo "  Total:"
echo ""

# Research progress
echo "🔬 Research queue:"
if [ -f "$WORKSPACE/memory/research/index.md" ]; then
    QUEUE_COUNT=$(grep -c "^\- \[ \]" "$WORKSPACE/memory/research/index.md" 2>/dev/null || echo 0)
    echo "  Pending: $QUEUE_COUNT items"
fi
echo ""

# Uncommitted changes
cd $WORKSPACE
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted changes - run 'git add && git commit'"
else
    echo "✓ Repo clean"
fi

echo ""
echo "=== Ready for tomorrow! ==="
