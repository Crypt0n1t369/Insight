#!/usr/bin/env python3
"""
Budget Monitor
=============
Tracks model usage and alerts when approaching limits.

Usage:
    python3 scripts/budget_monitor.py [--warn-only]
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import json

WORKSPACE = Path("/home/drg/.openclaw/workspace")
BUDGET_FILE = WORKSPACE / ".budget_tracker.json"
DAILY_LIMIT = 10.0  # $10/day
WARN_THRESHOLD = 0.75  # 75%

def load_usage():
    """Load current usage from tracker file."""
    if BUDGET_FILE.exists():
        try:
            return json.loads(BUDGET_FILE.read_text())
        except:
            pass
    return {"daily": [], "total": 0}

def get_today_usage():
    """Get today's total usage."""
    usage = load_usage()
    today = datetime.now().strftime("%Y-%m-%d")
    
    total = 0
    for entry in usage.get("daily", []):
        if entry.get("date", "").startswith(today):
            total += entry.get("cost", 0)
    
    return total

def check_budget():
    """Check budget status."""
    today_usage = get_today_usage()
    remaining = DAILY_LIMIT - today_usage
    pct = (today_usage / DAILY_LIMIT) * 100
    
    status = "OK"
    if pct >= (WARN_THRESHOLD * 100):
        status = "WARN"
    if today_usage >= DAILY_LIMIT:
        status = "CRIT"
    
    return {
        "today": today_usage,
        "limit": DAILY_LIMIT,
        "remaining": remaining,
        "percent": pct,
        "status": status
    }

def main():
    args = sys.argv[1:]
    
    budget = check_budget()
    
    if "--warn-only" in args and budget["status"] == "OK":
        return
    
    print(f"💰 Budget Status: {budget['status']}")
    print(f"   Today: ${budget['today']:.2f} / ${budget['limit']:.2f}")
    print(f"   Remaining: ${budget['remaining']:.2f} ({budget['percent']:.0f}%)")
    
    if budget["status"] == "WARN":
        print("\n⚠️  Approaching daily limit!")
    elif budget["status"] == "CRIT":
        print("\n❌ Daily limit reached!")

if __name__ == "__main__":
    main()
