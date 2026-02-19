#!/bin/bash
# Quick Recall - Query second brain domains
# Usage: ./recall.sh "<search_term>"

SEARCH="$1"

if [ -z "$SEARCH" ]; then
    echo "Usage: recall.sh \"<search_term>\""
    echo "Example: recall.sh \"model routing\""
    exit 1
fi

echo "🔍 Searching domains for: $SEARCH"
echo ""

cd /home/drg/.openclaw/workspace/memory

# Search in domain files
grep -l -i "$SEARCH" domains/*.md 2>/dev/null | while read file; do
    echo "📁 $file"
    grep -i "$SEARCH" "$file" | head -3
    echo ""
done

# Also search research index
if grep -l -i "$SEARCH" research/*.md 2>/dev/null; then
    echo "🔬 Also in research:"
    grep -l -i "$SEARCH" research/*.md 2>/dev/null
fi
