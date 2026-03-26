# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.

## Contribution Graph Web Health Check
- description: Verify CG Web server is running on port 3006
- frequency: 15m
- action: |
    curl -s http://localhost:3006/health | grep -q '"status": "ok"' && echo "CG Web: OK" || echo "CG Web: FAIL"
- alert: |
    Contribution Graph Web down! Run: cd projects/contribution-graph && CG_WEB_PORT=3006 python3 -m web.server &

## Credo Platform Health Check
- description: Verify Credo API and Frontend are running
- frequency: 15m
- action: |
    curl -s http://localhost:3000/health | grep -q "ok" && echo "API: OK" || echo "API: FAIL"
    curl -s http://localhost:3002 | grep -q "Credo" && echo "Frontend: OK" || echo "Frontend: FAIL"
- alert: |
    Credo Platform down! API or Frontend not responding.

## Bug Report Processor
- description: Check for new bug reports and spawn analysis
- frequency: 30m
- action: |
    REPORTS=$(curl -s "http://localhost:3002/api/bug-reports?status=pending" | grep -c '"status":"pending"' || echo "0")
    if [ "$REPORTS" -gt "0" ]; then
      echo "Found $REPORTS pending bug report(s) - requires agent attention"
    fi
- alert: |
    New bug reports need analysis! Run: node scripts/bug-processor.js list
