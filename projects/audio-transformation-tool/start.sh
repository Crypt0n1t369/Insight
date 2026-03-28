#!/bin/bash
# Audio Transformation Tool — Start Script
# Usage: ./start.sh [backend|frontend|all]
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CODE_DIR="$SCRIPT_DIR/code"
SERVER_DIR="/home/drg/.openclaw/workspace/server"
LOG_DIR="/tmp/audio-tool-logs"
PORT_BACKEND=${PORT_BACKEND:-3001}
PORT_FRONTEND=${PORT_FRONTEND:-3005}

mkdir -p "$LOG_DIR"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

start_backend() {
    log "Starting Audio Backend on port $PORT_BACKEND..."
    # Kill existing backend on this port
    local pid=$(lsof -t -i:$PORT_BACKEND 2>/dev/null || true)
    [ -n "$pid" ] && kill $pid 2>/dev/null || true
    sleep 1
    
    cd "$CODE_DIR"
    PORT=$PORT_BACKEND nohup /home/drg/.npm-global/bin/tsx server/index.ts > "$LOG_DIR/backend.log" 2>&1 &
    local backend_pid=$!
    sleep 3
    
    # Verify health
    local health=$(curl -s http://localhost:$PORT_BACKEND/health 2>/dev/null || echo "{}")
    if echo "$health" | grep -q "ok"; then
        log "Backend healthy: $health"
    else
        log "WARNING: Backend may not be healthy. Check $LOG_DIR/backend.log"
    fi
}

start_frontend() {
    log "Building and starting Frontend on port $PORT_FRONTEND..."
    cd "$CODE_DIR"
    
    # Build
    log "Building frontend..."
    npm run build > "$LOG_DIR/frontend-build.log" 2>&1
    
    # Kill existing frontend
    local pid=$(lsof -t -i:$PORT_FRONTEND 2>/dev/null || true)
    [ -n "$pid" ] && kill $pid 2>/dev/null || true
    sleep 1
    
    # Serve dist
    nohup npx vite preview --port $PORT_FRONTEND --host > "$LOG_DIR/frontend.log" 2>&1 &
    local frontend_pid=$!
    sleep 3
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT_FRONTEND 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
        log "Frontend serving: http://localhost:$PORT_FRONTEND"
    else
        log "WARNING: Frontend returned $status. Check $LOG_DIR/frontend.log"
    fi
}

run_tests() {
    log "Running audio backend tests..."
    cd "$SCRIPT_DIR/../.."  # workspace root
    npx vitest run server/ --reporter=verbose 2>&1 | tail -10
}

case "${1:-all}" in
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    test)
        run_tests
        ;;
    all)
        start_backend
        start_frontend
        log "All services started. Backend: http://localhost:$PORT_BACKEND, Frontend: http://localhost:$PORT_FRONTEND"
        log "Logs: $LOG_DIR/"
        ;;
    *)
        echo "Usage: $0 [backend|frontend|test|all]"
        exit 1
        ;;
esac
