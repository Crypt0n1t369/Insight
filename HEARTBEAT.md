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

## Credo API Health Check
- description: Verify Credo API is running on port 3000
- frequency: 15m
- action: |
    curl -s http://localhost:3000/health | grep -q "ok" && echo "Credo API: OK" || echo "Credo API: FAIL"
- alert: |
    Credo API down! Run: cd projects/collaboration-platform && npm run dev &

## Audio Backend Health Check
- description: Verify Audio Backend is running on port 3001
- frequency: 15m
- action: |
    curl -s http://localhost:3001/health | grep -q '"status": "ok"' && echo "Audio Backend: OK" || echo "Audio Backend: FAIL"
- alert: |
    Audio Backend down! Run: cd workspace && bash server/start.sh backend &
