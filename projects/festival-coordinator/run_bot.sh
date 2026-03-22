#!/bin/bash
# Festival Coordinator - Telegram Bot Runner
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
if [ -f "$SCRIPT_DIR/.env" ]; then
    set -a
    source "$SCRIPT_DIR/.env"
    set +a
fi
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "ERROR: TELEGRAM_BOT_TOKEN is not set."
    echo "Get a token from @BotFather and set it in your environment or .env file."
    exit 1
fi
echo "Festival Coordinator Bot starting..."
echo "Admin IDs: ${ADMIN_TELEGRAM_IDS:-none set}"
if [ -d "$SCRIPT_DIR/venv" ]; then
    source "$SCRIPT_DIR/venv/bin/activate"
fi
python3 bot.py
