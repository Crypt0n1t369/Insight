#!/bin/bash
# Service Manager - Start/Stop/Restart all workspace services

WORKSPACE="/home/drg/.openclaw/workspace"
cd "$WORKSPACE"

RED="[0;31m"
GREEN="[0;32m"
YELLOW="[1;33m"
NC="[0m"

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

check_port() {
    local port=$1
    if curl -s --max-time 2 "http://localhost:$port/health" > /dev/null 2>&1 || curl -s --max-time 2 "http://localhost:$port/" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

do_status() {
    local services=("3000:Credo API" "3001:Audio Backend" "3002:Credo Frontend" "3003:Youth Platform" "3005:Audio Frontend" "8080:JCI Portal")
    echo ""
    echo "=== Service Status ==="
    all_ok=true
    for entry in "${services[@]}"; do
        port="${entry%%:*}"
        name="${entry##*:}"
        if check_port $port; then
            echo -e "  ${GREEN}[OK]${NC} $name (port $port)"
        else
            echo -e "  ${RED}[DOWN]${NC} $name (port $port)"
            all_ok=false
        fi
    done
    echo ""
    $all_ok && log_info "All services running" || log_warn "Some services are down"
}

do_start() {
    log_info "Starting services..."
    if ! check_port 3000; then
        cd "$WORKSPACE/projects/collaboration-platform"
        nohup node dist/index.js > /tmp/credo-api.log 2>&1 &
        sleep 2
        log_info "Credo API started on 3000"
    fi
    if ! check_port 3001; then
        cd "$WORKSPACE/projects/audio-transformation-tool/code"
        nohup npx tsx server/index.ts > /tmp/audio-backend.log 2>&1 &
        sleep 2
        log_info "Audio Backend started on 3001"
    fi
    if ! check_port 3002; then
        cd "$WORKSPACE/projects/collaboration-platform/frontend"
        nohup npm run dev -- --port 3002 > /tmp/credo-frontend.log 2>&1 &
        sleep 5
        log_info "Credo Frontend started on 3002"
    fi
    if ! check_port 3003; then
        cd "$WORKSPACE/projects/youth-empowerment-platform"
        nohup python3 -m uvicorn src.api.main:app --host 0.0.0.0 --port 3003 > /tmp/youth-platform.log 2>&1 &
        sleep 2
        log_info "Youth Platform started on 3003"
    fi
    if ! check_port 8080; then
        cd "$WORKSPACE/projects/jci-org-manager"
        nohup python3 webapp/server.py > /tmp/jci-portal.log 2>&1 &
        sleep 3
        log_info "JCI Portal started on 8080"
    fi
    if ! check_port 3005; then
        cd "$WORKSPACE/projects/audio-transformation-tool/code"
        nohup npx vite preview --port 3005 --host 0.0.0.0 > /tmp/audio-frontend.log 2>&1 &
        sleep 3
        log_info "Audio Frontend started on 3005 (preview mode)"
    fi
    sleep 3
    do_status
}

do_stop() {
    log_info "Stopping services..."
    pkill -f "node dist/index.js" && log_info "Credo API stopped" || true
    pkill -f "tsx server/index.ts" && log_info "Audio Backend stopped" || true
    pkill -f "next dev.*3002" && log_info "Credo Frontend stopped" || true
    pkill -f "uvicorn.*3003" && log_info "Youth Platform stopped" || true
    pkill -f "python3 webapp/server.py" && log_info "JCI Portal stopped" || true
    pkill -f "vite.*3005" && log_info "Audio Frontend stopped" || true
}

case "${1:-status}" in
    start) do_start ;;
    stop) do_stop ;;
    status) do_status ;;
    restart) do_stop; sleep 2; do_start ;;
    *) echo "Usage: $0 {start|stop|status|restart}" ;;
esac
