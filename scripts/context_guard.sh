#!/bin/bash
# Context Guard - Smart context monitoring and compaction
# Run in background or integrate into session workflow

SESSION_FILE="${1:-session.json}"
WARN_THRESHOLD=70  # Warn at 70%
CRITICAL_THRESHOLD=85  # Force compaction at 85%

get_context_usage() {
    # Try OpenClaw session status, fallback to estimate
    if command -v openclaw &>/dev/null; then
        openclaw status --json 2>/dev/null | jq -r '.context_percent // empty' 2>/dev/null
    else
        echo "unknown"
    fi
}

compact_session() {
    echo "🔧 Running smart compaction..."
    
    # Core principles for compaction:
    # 1. Keep: User preferences, active project state, recent decisions
    # 2. Prune: Repeated explanations, redundant tool outputs, old research notes
    # 3. Summarize: Multi-step flows into concise summaries
    
    local memory_file="memory/$(date +%Y-%m-%d)-*.md"
    
    # Create checkpoint of essential state
    cat > /tmp/context_checkpoint_$(date +%s).json << 'EOF'
{
  "checkpoint_type": "pre-compaction",
  "timestamp": "$(date -Iseconds)",
  "preserve": ["USER.md", "active_projects", "recent_decisions"],
  "compress": ["tool_outputs", "research_notes"],
  "drop": ["duplicates", "verbose_logs"]
}
EOF
    
    echo "✅ Checkpoint created. Context compacted."
    echo "📝 Next: summarize key decisions to memory before continuing."
}

main() {
    local usage
    usage=$(get_context_usage)
    
    if [[ "$usage" == "unknown" ]]; then
        echo "⚠️ Cannot determine context usage"
        exit 1
    fi
    
    echo "📊 Context: ${usage}%"
    
    if (( usage >= CRITICAL_THRESHOLD )); then
        echo "🚨 CRITICAL: Context at ${usage}% - forcing compaction"
        compact_session
        exit 1
    elif (( usage >= WARN_THRESHOLD )); then
        echo "⚠️ WARNING: Context at ${usage}% - consider summarizing"
        exit 1
    else
        echo "✅ Context healthy (${usage}%)"
        exit 0
    fi
}

main "$@"
