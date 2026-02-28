#!/bin/bash
# Quick Recall - Query second brain domains
# Usage: ./recall.sh "<search_term>"

SEARCH="$1"

if [ -z "$SEARCH" ]; then
    echo "Usage: recall.sh \"<search_term>\""
    echo "Example: recall.sh \"model routing\""
    exit 1
fi

echo "🔍 Searching memory for: $SEARCH"
echo "================================"
echo ""

# Use vector search first
echo "📊 Relevance scoring:"
/workspace/scripts/memory_vector.sh "$SEARCH" 2>/dev/null
echo ""

# Then show context from top matches
echo "📄 Top matches context:"
echo ""

for file in $(find /workspace/memory -name "*.md" -type f 2>/dev/null); do
    if grep -qi "$SEARCH" "$file"; then
        echo "→ $(basename "$file"):"
        grep -i "$SEARCH" "$file" | head -2 | sed 's/^/   /'
        echo ""
    fi
done | head -30
