#!/bin/bash
# Runs all project test suites from within their own directories
# to avoid Python module name collisions between projects.

set -e

WORKSPACE="${WORKSPACE:-/home/drg/.openclaw/workspace}"
VENV="/home/drg/.venv/research/bin/activate"

echo "=== Festival Coordinator (140 tests) ==="
(cd "${WORKSPACE}/projects/festival-coordinator" && source "${VENV}" && python -m pytest tests/ -q)

echo "=== Contribution Graph - API (47 tests) ==="
(cd "${WORKSPACE}/projects/contribution-graph" && source "${VENV}" && python -m pytest tests/ -q)

echo "=== Contribution Graph - Web (24 tests) ==="
(cd "${WORKSPACE}/projects/contribution-graph" && source "${VENV}" && python -m pytest web/ -q)

echo "=== Contribution Graph - Bot+DB (39 tests) ==="
(cd "${WORKSPACE}/projects/contribution-graph" && source "${VENV}" && python -m pytest bot/tests/ db/ -q)

echo "=== JCI Org Manager (62 tests) ==="
(cd "${WORKSPACE}/projects/jci-org-manager" && source "${VENV}" && python -m pytest tests/ -q)

echo "=== Youth Empowerment Platform (24 tests) ==="
(cd "${WORKSPACE}/projects/youth-empowerment-platform" && source "${VENV}" && python -m pytest tests/ -q)

echo "=== Synthesis Platform (495 vitest tests) ==="
(cd "${WORKSPACE}/projects/synthesis" && npx vitest run --reporter=verbose 2>&1 | tail -5)

echo "=== Credo Collaboration Platform (137 vitest tests) ==="
(cd "${WORKSPACE}/projects/collaboration-platform" && npx vitest run --reporter=verbose 2>&1 | tail -5)

echo "=== Audio Backend (34 vitest tests) ==="
(cd "${WORKSPACE}" && npx vitest run --reporter=verbose 2>&1 | grep -E "passed|failed" | tail -3)

echo ""
echo "All test suites complete."
