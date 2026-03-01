#!/usr/bin/env python3
"""
Agent Spawner
=============
Manages parallel worker agents with 5-hour reset cycle.

Usage:
    python3 scripts/spawn_worker.py start --project audio-transformation-tool --worker worker-1
    python3 scripts/spawn_worker.py status
    python3 scripts/spawn_worker.py reset-all
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime, timedelta
import time

WORKSPACE = Path("/home/drg/.openclaw/workspace")
STATE_FILE = WORKSPACE / ".agent_state.json"
RESET_HOURS = 5  # Max cycle time, NOT auto-reset

def load_state():
    """Load agent state."""
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"workers": {}, "last_reset": None}

def save_state(state):
    """Save agent state."""
    STATE_FILE.write_text(json.dumps(state, indent=2))

def start_worker(project, worker_id, task=None):
    """Start a worker agent."""
    state = load_state()
    
    now = datetime.now()
    
    state["workers"][worker_id] = {
        "project": project,
        "started": now.isoformat(),
        "task": task,
        "status": "running",
        "last_reset": now.isoformat()
    }
    
    save_state(state)
    
    # In practice, this would spawn via sessions_spawn
    print(f"🚀 Started {worker_id} on {project}")
    print(f"   Task: {task or 'Pick from backlog'}")
    print(f"   Reset in {RESET_HOURS} hours")

def stop_worker(worker_id):
    """Stop a worker."""
    state = load_state()
    
    if worker_id in state["workers"]:
        state["workers"][worker_id]["status"] = "stopped"
        save_state(state)
        print(f"🛑 Stopped {worker_id}")
    else:
        print(f"⚠️  Worker {worker_id} not found")

def check_reset():
    """Check if any workers need reset."""
    state = load_state()
    now = datetime.now()
    reset_needed = []
    
    for worker_id, info in state["workers"].items():
        if info.get("status") != "running":
            continue
        
        started = datetime.fromisoformat(info["started"])
        hours_running = (now - started).total_seconds() / 3600
        
        if hours_running >= RESET_HOURS:
            reset_needed.append(worker_id)
    
    return reset_needed

def reset_worker(worker_id):
    """Reset worker (archive and restart)."""
    state = load_state()
    
    if worker_id not in state["workers"]:
        print(f"⚠️  Worker {worker_id} not found")
        return
    
    # Archive current state
    project = state["workers"][worker_id]["project"]
    task = state["workers"][worker_id].get("task")
    
    # Log to memory
    memory_file = WORKSPACE / "memory" / f"{datetime.now().strftime('%Y-%m-%d')}.md"
    if memory_file.exists():
        with open(memory_file, "a") as f:
            f.write(f"\n- Worker {worker_id} reset: completed {task}\n")
    
    # Restart with fresh context
    state["workers"][worker_id]["started"] = datetime.now().isoformat()
    state["workers"][worker_id]["last_reset"] = datetime.now().isoformat()
    state["workers"][worker_id]["task"] = None  # Pick new task
    
    save_state(state)
    print(f"🔄 Reset {worker_id} - fresh context")

def status_workers():
    """Show all worker status."""
    state = load_state()
    
    print("\n🤖 Worker Status")
    print("=" * 50)
    
    if not state["workers"]:
        print("No workers running")
        return
    
    now = datetime.now()
    
    for worker_id, info in state["workers"].items():
        started = datetime.fromisoformat(info["started"])
        hours = (now - started).total_seconds() / 3600
        
        status = info.get("status", "unknown")
        project = info.get("project", "unknown")
        task = info.get("task", "idle")
        
        reset_in = max(0, RESET_HOURS - hours)
        
        print(f"{worker_id}: {status}")
        print(f"  Project: {project}")
        print(f"  Task: {task}")
        print(f"  Running: {hours:.1f}h | Reset in: {reset_in:.1f}h")
        print()
    
    # Check reset needs
    reset_needed = check_reset()
    if reset_needed:
        print(f"⚠️  Workers needing reset: {', '.join(reset_needed)}")

def main():
    args = sys.argv[1:]
    
    if not args:
        status_workers()
        return
    
    command = args[0]
    
    if command == "start":
        project = args[1] if len(args) > 1 else "general"
        worker = args[2] if len(args) > 2 else "worker-1"
        task = " ".join(args[3:]) if len(args) > 3 else None
        start_worker(project, worker, task)
    
    elif command == "stop":
        worker = args[1] if len(args) > 1 else "worker-1"
        stop_worker(worker)
    
    elif command == "reset":
        worker = args[1] if len(args) > 1 else None
        if worker:
            reset_worker(worker)
        else:
            # Reset all that need it
            for w in check_reset():
                reset_worker(w)
    
    elif command == "status":
        status_workers()
    
    elif command == "reset-all":
        state = load_state()
        for w in state["workers"]:
            reset_worker(w)

if __name__ == "__main__":
    main()
