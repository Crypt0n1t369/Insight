#!/bin/bash
# OpenClaw Services Manager
# Start/Stop/Status for all OpenClaw services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Services configuration
declare -A SERVICES=(
    ["audio-tool"]="cd $SCRIPT_DIR/projects/audio-transformation-tool/code/server && GOOGLE_API_KEY="" OPENROUTER_API_KEY="" npx tsx index.ts"
    ["jci-portal"]="cd $SCRIPT_DIR/projects/jci-org-manager && python3 -m flask run --port=8080"
    ["credo"]="cd $SCRIPT_DIR/projects/collaboration-platform && npm run dev"
)

PIDS=()

start_service() {
    local name=$1
    local cmd=$2
    echo -n "Starting $name... "
    eval "$cmd" > "$LOG_DIR/$name.log" 2>&1 &
    local pid=$!
    PIDS+=($pid)
    sleep 2
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✓${NC} (PID: $pid)"
    else
        echo -e "${RED}✗${NC}"
    fi
}

stop_service() {
    local name=$1
    local pid=$(pgrep -f "$name" | head -1)
    if [ -n "$pid" ]; then
        echo -n "Stopping $name (PID: $pid)... "
        kill $pid 2>/dev/null
        sleep 1
        if kill -0 $pid 2>/dev/null; then
            kill -9 $pid 2>/dev/null
        fi
        echo -e "${GREEN}✓${NC}"
    fi
}

status_service() {
    local name=$1
    local pid=$(pgrep -f "$name" | head -1)
    if [ -n "$pid" ]; then
        echo -e "$name: ${GREEN}running${NC} (PID: $pid)"
    else
        echo -e "$name: ${RED}stopped${NC}"
    fi
}

case "${1:-status}" in
    start)
        echo "Starting all OpenClaw services..."
        start_service "audio-tool" "${SERVICES[audio-tool]}"
        start_service "jci-portal" "${SERVICES[jci-portal]}"
        start_service "credo" "${SERVICES[credo]}"
        echo ""
        echo "All services started!"
        ;;
    stop)
        echo "Stopping all OpenClaw services..."
        for svc in "${!SERVICES[@]}"; do
            stop_service "$svc"
        done
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        echo "OpenClaw Services Status:"
        echo "========================="
        for svc in "${!SERVICES[@]}"; do
            status_service "$svc"
        done
        ;;
    logs)
        if [ -n "$2" ]; then
            tail -f "$LOG_DIR/$2.log"
        else
            ls -la "$LOG_DIR/"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs [service]}"
        exit 1
        ;;
esac
