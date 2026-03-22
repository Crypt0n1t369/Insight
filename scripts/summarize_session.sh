#!/bin/bash
# Smart Context Compactor - Cuts the fat, keeps the meat
# Usage: scripts/summarize_session.sh [session_key]

set -e

SESSION_KEY="${1:-}"
OUTPUT_FILE="memory/$(date +%Y-%m-%d)-compact.md"

echo "🧹 Smart Context Compaction"
echo "============================"

# What to KEEP (essential)
KEEP=(
    "USER.md"
    "IDENTITY.md"
    "SOUL.md"
    "AGENTS.md"
    "PROJECTS.md"
)

# What to SUMMARIZE (compress to key points)
SUMMARIZE=(
    "memory/20*.md"  # Daily memories → extract milestones
)

# What to DROP (noise)
DROP=(
    "*test*"
    "*tmp*"
    "*.log"
    "node_modules/"
)

echo "📋 Principles:"
echo "  • Keep: User prefs, identity, active projects"
echo "  • Summarize: Session logs → bullet points"
echo "  • Drop: Test files, temp data, verbose outputs"

# Extract key decisions from recent sessions
echo ""
echo "📦 Extracting key milestones..."

# Get last 3 days of memory for context
RECENT_MEMORIES=$(ls -t memory/20*.md 2>/dev/null | head -3 || echo "")

if [[ -n "$RECENT_MEMORIES" ]]; then
    echo "### Recent Milestones" > "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    for mem in $RECENT_MEMORIES; do
        # Extract only lines with ✅, 🔲, decision markers
        grep -E "^(- ✅|- 🔲|###|^\*\*)" "$mem" 2>/dev/null | head -20 >> "$OUTPUT_FILE" || true
    done
    
    echo "" >> "$OUTPUT_FILE"
    echo "*Compacted on $(date)*" >> "$OUTPUT_FILE"
    
    echo "✅ Created: $OUTPUT_FILE"
    wc -l "$OUTPUT_FILE"
else
    echo "⚠️ No recent memories found"
fi

echo ""
echo "🎯 Context now lean and ready."
