#!/bin/bash
# Quick Note - Rapid idea capture
# Usage: ./quick_note.sh "your note here" [tags]

NOTE="$1"
TAGS="${2:-general}"
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
WORKSPACE="/home/drg/.openclaw/workspace"

if [ -z "$NOTE" ]; then
    echo "Usage: $0 \"your note\" [tags]"
    echo "Example: $0 \"Great idea for feature\" feature,brainstorm"
    exit 1
fi

# Append to today's memory or create new entry
MEM_FILE="$WORKSPACE/memory/$DATE.md"

if [ ! -f "$MEM_FILE" ]; then
    cat > "$MEM_FILE" << EOF
# Memory - $DATE

## Daily Notes
EOF
fi

echo "- [$TIME] $NOTE #$TAGS" >> "$MEM_FILE"

echo "✓ Note added to $MEM_FILE"
echo "  [$TIME] $NOTE #$TAGS"