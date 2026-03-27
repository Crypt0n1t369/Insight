#!/bin/bash
# Synthesis Platform — Start Script
#
# Usage:
#   ./start.sh          # start server (default: port 3004)
#   ./start.sh test     # run all tests
#   ./start.sh server   # start server in foreground
#   ./start.sh typecheck # run TypeScript check

set -e

PORT="${PORT:-3004}"
CMD="${1:-}"

cd "$(dirname "$0")"

start_server() {
  echo "☀️  Starting Synthesis Platform API on port $PORT..."
  node --import tsx server/index.ts
}

run_tests() {
  echo "🧪 Running all tests (vitest run)..."
  npm run test
}

run_typecheck() {
  echo "🔍 Running TypeScript check..."
  npx tsc --noEmit
  echo "✅ No errors"
}

case "$CMD" in
  test)
    run_tests
    ;;
  server)
    start_server
    ;;
  typecheck)
    run_typecheck
    ;;
  *)
    echo "Usage: $0 [test|server|typecheck]"
    echo ""
    echo "  (no args)  — start API server on port $PORT"
    echo "  test       — run all vitest tests"
    echo "  server     — start server in foreground"
    echo "  typecheck  — run TypeScript type check"
    echo ""
    echo "Environment:"
    echo "  PORT=$PORT"
    start_server
    ;;
esac
