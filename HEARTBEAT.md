# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.

## Credo Platform Health Check
- description: Verify Credo API and Frontend are running
- frequency: 15m
- action: |
    curl -s http://localhost:3000/health | grep -q "ok" && echo "API: OK" || echo "API: FAIL"
    curl -s http://localhost:3002 | grep -q "Credo" && echo "Frontend: OK" || echo "Frontend: FAIL"
- alert: |
    Credo Platform down! API or Frontend not responding.
