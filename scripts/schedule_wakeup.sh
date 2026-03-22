#!/bin/bash
# Scheduled wake-up script for Aton
# Usage: ./schedule_wakeup.sh "+1h" "Continue Credo MVP"

DELAY="$1"
MESSAGE="${2:-Continue working on current task}"
LOG_FILE="/home/drg/.openclaw/workspace/.wakeup_log"

if [ -z "$DELAY" ]; then
    echo "Usage: $0 <delay> [message]"
    echo "Example: $0 '+1 hour' 'Continue Credo MVP'"
    exit 1
fi

# Calculate wake time
WAKE_TIME=$(date -d "$DELAY" "+%Y-%m-%d %H:%M:%S")
TIMESTAMP=$(date -d "$DELAY" "+%s")

echo "[$(date)] Scheduled wake-up: $WAKE_TIME - $MESSAGE" >> $LOG_FILE

# Create at job (one-time scheduled task)
echo "echo 'ATON_WAKEUP: $MESSAGE' | at '$WAKE_TIME' 2>/dev/null" | bash

# Also add to cron for recurring
CRON_ENTRY="$(( $(date -d "$DELAY" "+%M") )) $(date -d "$DELAY" "+%H") * * * echo 'ATON_WAKEUP: $MESSAGE' >> /home/drg/.openclaw/workspace/.wakeup_log"

echo "Scheduled: $WAKE_TIME"
echo "Message: $MESSAGE"
