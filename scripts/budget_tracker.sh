#!/bin/bash
# Budget Tracker - Track daily spending
# Usage: ./budget_tracker.sh [date]

DATE="${1:-$(date +%Y-%m-%d)}"
BUDGET_FILE="$HOME/.openclaw_budget"
DAILY_CAP=10.00

# Load existing budget or init
load_budget() {
    if [ -f "$BUDGET_FILE" ]; then
        source "$BUDGET_FILE"
    else
        SPEND_TODAY=0.00
        LAST_DATE="$DATE"
    fi
}

# Save budget
save_budget() {
    cat > "$BUDGET_FILE" << EOF
SPEND_TODAY=$SPEND_TODAY
LAST_DATE=$LAST_DATE
EOF
}

# Add expense
add_expense() {
    local amount=$1
    SPEND_TODAY=$(echo "$SPEND_TODAY + $amount" | bc)
    save_budget
}

# Check if new day
check_date() {
    if [ "$LAST_DATE" != "$DATE" ]; then
        echo "📅 New day detected. Resetting daily spend."
        SPEND_TODAY=0.00
        LAST_DATE="$DATE"
        save_budget
    fi
}

# Main
load_budget
check_date

echo "=== Aton Budget Tracker ==="
echo "Date: $DATE"
echo "Spend Today: \$$SPEND_TODAY"
echo "Daily Cap: \$$DAILY_CAP"
echo ""

REMAINING=$(echo "$DAILY_CAP - $SPEND_TODAY" | bc)
if (( $(echo "$REMAINING < 2.5" | bc -l) )); then
    echo "⚠️  WARNING: Less than \$2.50 remaining today"
elif (( $(echo "$REMAINING < 0" | bc -l) )); then
    echo "🚨 CRITICAL: Budget exceeded!"
else
    echo "✅ Remaining: \$$REMAINING"
fi

# If arg provided, treat as expense
if [ -n "$2" ]; then
    add_expense "$2"
    echo "Added expense: \$$2"
fi