#!/bin/bash
# Domain Capture Script - Quick knowledge entry to second brain
# Usage: ./domain_capture.sh <domain> "<note>"

DOMAIN="$1"
NOTE="$2"

if [ -z "$DOMAIN" ] || [ -z "$NOTE" ]; then
    echo "Usage: domain_capture.sh <domain> \"<note>\""
    echo "Example: domain_capture.sh ai-automation \"New model: Claude Opus 4.6 context 1M\""
    exit 1
fi

DOMAIN_FILE="/home/drg/.openclaw/workspace/memory/domains/${DOMAIN}.md"

if [ ! -f "$DOMAIN_FILE" ]; then
    echo "# ${DOMAIN} Domain" > "$DOMAIN_FILE"
    echo "" >> "$DOMAIN_FILE"
    echo "## Overview" >> "$DOMAIN_FILE"
    echo "- Created: $(date '+%Y-%m-%d')" >> "$DOMAIN_FILE"
    echo "" >> "$DOMAIN_FILE"
    echo "## Notes" >> "$DOMAIN_FILE"
fi

echo "- $(date '+%Y-%m-%d %H:%M'): ${NOTE}" >> "$DOMAIN_FILE"

echo "✓ Added to ${DOMAIN}: ${NOTE}"
