#!/bin/bash
# KB Ingestion Script - Fetch and store knowledge from URLs
# Usage: ./kb_ingest.sh <url> [topic]

URL="$1"
TOPIC="${2:-general}"
DATE=$(date +%Y-%m-%d)
KB_DIR="/home/drg/.openclaw/workspace/memory/kb"
LOG_FILE="$KB_DIR/.ingest_log"

mkdir -p "$KB_DIR"

if [ -z "$URL" ]; then
    echo "Usage: $0 <url> [topic]"
    echo "Example: $0 https://example.com AI"
    exit 1
fi

echo "=== KB Ingestion ==="
echo "URL: $URL"
echo "Topic: $TOPIC"
echo "Date: $DATE"
echo ""

# Extract domain for filename
DOMAIN=$(echo "$URL" | sed -E 's|https?://([^/]+).*|\1|' | sed 's/www\.//')
SLUG=$(echo "$URL" | sed -E 's|https?://||' | cut -d'/' -f1-3 | sed 's/\./-/g' | tr -d '/')
FILENAME="$KB_DIR/${DATE}_${SLUG}.md"

echo "Fetching content..."

# Use web_fetch to get content
if command -v web_fetch &> /dev/null; then
    CONTENT=$(web_fetch --url "$URL" --maxChars 5000 2>/dev/null)
else
    CONTENT="[Content fetch not available - use web_fetch tool]"
fi

# Create KB entry
cat > "$FILENAME" << EOF
# KB Entry: $DOMAIN

**Source:** $URL
**Topic:** $TOPIC
**Date:** $DATE
**Status:** To review

## Summary
$(echo "$CONTENT" | head -20)

## Key Points
- 

## Tags
#kb #$TOPIC

---
*Ingested by Aton KB system*
EOF

echo "✓ KB entry created: $FILENAME"
echo "[$(date)] Ingested: $URL -> $FILENAME" >> "$LOG_FILE"

# Also update domain index if relevant
if [ -f "/home/drg/.openclaw/workspace/memory/domains/index.md" ]; then
    echo "- [$DATE] KB: $DOMAIN - $URL" >> "/home/drg/.openclaw/workspace/memory/domains/index.md"
fi

echo "Done!"
