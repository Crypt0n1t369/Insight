#!/usr/bin/env python3
"""
Task Queue Manager
=================
Manages tasks across projects, handles unstructured input.

Usage:
    python3 scripts/task_queue.py add "task description" --project audio-transformation-tool --priority P0
    python3 scripts/task_queue.py list --project all
    python3 scripts/task_queue.py next --worker worker-1
    python3 scripts/task_queue.py process "unstructured text"
"""

import os
import sys
import re
from pathlib import Path
from datetime import datetime, timedelta
import json

WORKSPACE = Path("/home/drg/.openclaw/workspace")
BACKLOG = WORKSPACE / "BACKLOG.md"
PROJECTS_DIR = WORKSPACE / "projects"

# Project task files
PROJECT_TASKS = {
    "audio-transformation-tool": WORKSPACE / "projects/audio-transformation-tool/TASKS.md",
    "solar-scout": WORKSPACE / "projects/solar-scout/TASKS.md",
    "openclaw": WORKSPACE / "PROJECTS.md",  # Use PROJECTS as task repo
}

PRIORITIES = ["P0", "P1", "P2", "P3"]

def load_backlog():
    """Load main backlog."""
    if BACKLOG.exists():
        return BACKLOG.read_text()
    return ""

def save_backlog(content):
    """Save backlog."""
    BACKLOG.write_text(content)

def add_task(description, project="general", priority="P2", assignee="any"):
    """Add task to backlog."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    task_line = f"- [ ] {description} | Project: {project} | Priority: {priority} | Assignee: {assignee} | Added: {timestamp}"
    
    content = load_backlog()
    
    # Find appropriate section
    section_marker = f"### {priority}"
    if section_marker in content:
        # Insert after section header
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if section_marker in line:
                # Find end of section
                for j in range(i+1, len(lines)):
                    if any(p in lines[j] for p in PRIORITIES):
                        lines.insert(j, task_line)
                        break
                else:
                    lines.insert(i+1, task_line)
                break
        content = '\n'.join(lines)
    else:
        # Add new section
        content += f"\n\n### {priority}\n{task_line}"
    
    save_backlog(content)
    print(f"✅ Added: {description[:50]}... [{priority}]")

def process_unstructured(text):
    """Auto-parse unstructured input to tasks."""
    # Simple heuristics
    text = text.strip().lower()
    
    # Detect priority
    priority = "P2"
    if any(kw in text for kw in ["urgent", "asap", "critical", "immediately"]):
        priority = "P0"
    elif any(kw in text for kw in ["important", "soon", "priority"]):
        priority = "P1"
    
    # Detect project
    project = "general"
    if any(kw in text for kw in ["audio", "insight", "transformation", "meditation"]):
        project = "audio-transformation-tool"
    elif any(kw in text for kw in ["solar", "lead", "latvia", "crm"]):
        project = "solar-scout"
    elif any(kw in text for kw in ["memory", "context", "health", "openclaw"]):
        project = "openclaw"
    
    # Clean up text
    task = text.replace("you should", "").replace("i need", "").replace("please", "").strip()
    task = task[0].upper() + task[1:] if task else task
    
    if len(task) > 5:
        add_task(task, project=project, priority=priority)
        print(f"📥 Processed: '{task[:40]}...' → {project} [{priority}]")
    else:
        print("⚠️  Task too vague")

def list_tasks(project="all"):
    """List tasks."""
    content = load_backlog()
    print(f"\n📋 Tasks in BACKLOG:")
    print("=" * 40)
    
    for p in PRIORITIES:
        section = f"### {p}"
        if section in content:
            lines = content.split('\n')
            in_section = False
            for line in lines:
                if section in line:
                    in_section = True
                elif in_section and line.strip():
                    if any(n in line for n in PRIORITIES):
                        break
                    print(line)
    print()

def get_next_task(worker_id):
    """Get next task for worker."""
    content = load_backlog()
    lines = content.split('\n')
    
    # Look for unassigned or worker-assigned tasks
    for priority in PRIORITIES:
        for i, line in enumerate(lines):
            if f"Priority: {priority}" in line and "[ ]" in line:
                if f"Assignee: {worker_id}" in line or "Assignee: any" in line:
                    # Extract task
                    task_match = re.search(r'- \[ \] (.+?) \|', line)
                    if task_match:
                        task = task_match.group(1)
                        # Mark as in progress
                        lines[i] = line.replace("[ ]", "[→]")
                        save_backlog('\n'.join(lines))
                        return task, priority
    
    return None, None

def mark_done(task_text):
    """Mark task as done."""
    content = load_backlog()
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        if task_text in line and "[→]" in line:
            lines[i] = line.replace("[→]", "[x]").replace("[ ]", "[x]")
            save_backlog('\n'.join(lines))
            print(f"✅ Completed: {task_text[:50]}")
            return
    
    print("⚠️  Task not found")

def main():
    args = sys.argv[1:]
    
    if not args:
        list_tasks()
        return
    
    command = args[0]
    
    if command == "add":
        desc = " ".join(args[1:]) if len(args) > 1 else input("Task: ")
        project = "general"
        priority = "P2"
        for arg in args:
            if arg.startswith("--project="):
                project = arg.split("=")[1]
            if arg.startswith("--priority="):
                priority = arg.split("=")[1]
        add_task(desc, project, priority)
    
    elif command == "list":
        project = args[1] if len(args) > 1 else "all"
        list_tasks(project)
    
    elif command == "next":
        worker = args[1] if len(args) > 1 else "worker-1"
        task, priority = get_next_task(worker)
        if task:
            print(f"📌 {priority}: {task}")
        else:
            print("No tasks available")
    
    elif command == "done":
        task = " ".join(args[1:])
        mark_done(task)
    
    else:
        # Treat as unstructured input
        process_unstructured(" ".join(args))

if __name__ == "__main__":
    main()
