#!/bin/bash
# Morning Digest - Prepare daily summary for Aton
# Run at start of day to get status overview

DATE=$(date +%Y-%m-%d)
WORKSPACE="/home/drg/.openclaw/workspace"

echo "☀️ === Aton Morning Digest - $DATE ==="
echo ""

# Health snapshot
echo "📊 Health Snapshot:"
cd $WORKSPACE
if git diff --quiet 2>/dev/null; then
    echo "  ✓ Repo clean"
else
    echo "  ⚠️  Uncommitted changes"
fi

# Memory files today
MEM_COUNT=$(ls $WORKSPACE/memory/*.md 2>/dev/null | wc -l)
echo "  ✓ Memory: $MEM_COUNT files"

# Budget
echo ""
echo "💰 Budget:"
$WORKSPACE/scripts/budget_tracker.sh $DATE | grep -E "(Spend|Remaining)"

# Test results
echo ""
echo "🧪 Last Test Run:"
if [ -f "$WORKSPACE/.test_results.log" ]; then
    tail -3 "$WORKSPACE/.test_results.log" | sed 's/^/  /'
else
    echo "  No test results yet"
fi

# Active projects
echo ""
echo "📁 Active Projects:"
if [ -f "$WORKSPACE/PROJECTS.md" ]; then
    grep "###" "$WORKSPACE/PROJECTS.md" | head -3 | sed 's/###/  -/'
fi

# Research queue
echo ""
echo "🔬 Research Queue:"
if [ -f "$WORKSPACE/memory/research/index.md" ]; then
    grep "^\- \[ \]" "$WORKSPACE/memory/research/index.md" | head -3 | sed 's/^/  /'
fi

# Today's memory entry
echo ""
echo "📝 Today's Memory:"
if [ -f "$WORKSPACE/memory/$DATE.md" ]; then
    echo "  ✓ Entry exists"
else
    echo "  → Create: $WORKSPACE/memory/$DATE.md"
fi

echo ""
echo "=== Ready for the day! ==="
