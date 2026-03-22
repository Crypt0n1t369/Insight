#!/bin/bash
# memory_vector.sh - Lightweight semantic-ish search for memory files
# Uses keyword weighting + frequency scoring (TF-IDF style)

MEMORY_DIR="/home/drg/.openclaw/workspace/memory"
QUERY="$1"

if [ -z "$QUERY" ]; then
    echo "Usage: $0 <search query>"
    echo "Example: $0 'audio transformation project'"
    exit 1
fi

echo "Searching for: $QUERY"
echo "---"

query_words=$(echo "$QUERY" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' ' ')

# Simple scoring: count matching keywords across all memory files
for file in $(find "$MEMORY_DIR" -name "*.md" -type f 2>/dev/null); do
    score=0
    content=$(cat "$file" | tr '[:upper:]' '[:lower:]')
    
    for word in $query_words; do
        count=$(echo "$content" | grep -o "\b$word\b" | wc -l)
        score=$((score + count))
    done
    
    if [ $score -gt 0 ]; then
        echo "$score: $(basename "$file")"
    fi
done | sort -rn | head -5

echo "---"
