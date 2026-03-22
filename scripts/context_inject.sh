#!/bin/bash
# context_inject.sh - Pull relevant context from memory for prompt injection
QUERY="$1"
MEMORY_DIR="/home/drg/.openclaw/workspace/memory"
MAX_CHARS=1500

if [ -z "$QUERY" ]; then
    echo "Usage: source context_inject.sh \"<search_term>\""
    return 1 2>/dev/null || exit 1
fi

CONTEXT=""
query_words=$(echo "$QUERY" | tr "[:upper:]" "[:lower:]" | tr -cs "[:alnum:]" " ")

for memofile in "$MEMORY_DIR"/*.md; do
    [ -f "$memofile" ] || continue
    basename="$(basename "$memofile")"
    content=$(cat "$memofile" | tr "[:upper:]" "[:lower:]")
    relevance=0
    for word in $query_words; do
        count=$(echo "$content" | grep -o "\b$word\b" | wc -l)
        relevance=$((relevance + count))
    done
    
    if [ $relevance -gt 0 ]; then
        snippet=$(grep -i -B1 -A2 "$query_words" "$memofile" 2>/dev/null | head -20 | tr "\n" " ")
        if [ -n "$snippet" ] && [ ${#CONTEXT} -lt $MAX_CHARS ]; then
            CONTEXT="${CONTEXT}\n\n## From ${basename}:\n${snippet}"
        fi
    fi
done

if [ -n "$CONTEXT" ]; then
    echo -e "\n📚 RELEVANT CONTEXT:"
    echo -e "$CONTEXT"
    export MEMORY_CONTEXT="$CONTEXT"
else
    echo "No relevant context found for: $QUERY"
    export MEMORY_CONTEXT=""
fi
