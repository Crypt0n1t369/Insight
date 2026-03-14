#!/usr/bin/env python3
"""
OpenClaw Ontology CLI

Commands to interact with the ontology system.
"""

import argparse
import sys
from pathlib import Path
from datetime import datetime

# Add ontology to path
ONTOLOGY_PATH = Path(__file__).parent.parent / "ontology"
sys.path.insert(0, str(ONTOLOGY_PATH.absolute()))

from ontology import (
    ProjectRegistry,
    TaskTracker,
    OntologyDiagnostics,
    Project,
    Task,
    Status,
    OpenClawRules,
)


def cmd_project_list(args):
    """List all projects"""
    workspace = Path(args.workspace)
    registry = ProjectRegistry(workspace)
    
    projects = registry.list_projects()
    if not projects:
        print("No projects registered")
        return
    
    for p in projects:
        print(f"{p.id:20} | {p.status:10} | {p.name}")


def cmd_project_add(args):
    """Add a new project"""
    workspace = Path(args.workspace)
    registry = ProjectRegistry(workspace)
    
    project = Project(
        id=args.id,
        name=args.name,
        path=args.path,
        description=args.description or "",
        tags=args.tags.split(",") if args.tags else []
    )
    
    if registry.register_project(project):
        print(f"Project '{args.name}' registered successfully")
    else:
        print(f"Project '{args.id}' already exists")


def cmd_project_status(args):
    """Update project status"""
    workspace = Path(args.workspace)
    registry = ProjectRegistry(workspace)
    
    status = Status(args.status)
    if registry.update_status(args.id, status):
        print(f"Project '{args.id}' status updated to {args.status}")
    else:
        print(f"Project '{args.id}' not found")


def cmd_task_list(args):
    """List tasks"""
    workspace = Path(args.workspace)
    tracker = TaskTracker(workspace)
    
    if args.project:
        tasks = tracker.get_project_tasks(args.project)
    elif args.agent:
        tasks = tracker.get_agent_tasks(args.agent)
    elif args.blocked:
        tasks = tracker.get_blocked_tasks()
    else:
        tasks = tracker.get_active_tasks()
    
    if not tasks:
        print("No tasks found")
        return
    
    for t in tasks:
        print(f"{t.id:20} | {t.status:10} | {t.priority} | {t.title[:40]}")


def cmd_task_add(args):
    """Add a new task"""
    workspace = Path(args.workspace)
    tracker = TaskTracker(workspace)
    
    task = Task(
        id=args.id,
        title=args.title,
        description=args.description or "",
        project_id=args.project,
        priority=args.priority or 5
    )
    
    tracker.create_task(task)
    print(f"Task '{args.id}' created: {args.title}")


def cmd_task_assign(args):
    """Assign task to agent"""
    workspace = Path(args.workspace)
    tracker = TaskTracker(workspace)
    
    if tracker.assign_task(args.task, args.agent):
        print(f"Task '{args.task}' assigned to {args.agent}")
    else:
        print(f"Task '{args.task}' not found")


def cmd_diagnose(args):
    """Diagnose issues"""
    workspace = Path(args.workspace)
    diagnostics = OntologyDiagnostics(workspace)
    
    if args.task:
        result = diagnostics.diagnose_failure(args.task)
    elif args.project:
        result = diagnostics.diagnose_project_stall(args.project)
    else:
        result = diagnostics.system_health()
    
    print(result)


def main():
    parser = argparse.ArgumentParser(description="OpenClaw Ontology CLI")
    parser.add_argument("--workspace", default="/workspace", help="Workspace path")
    
    subparsers = parser.add_subparsers()
    
    # Project commands
    proj_parser = subparsers.add_parser("project", help="Project commands")
    proj_sub = proj_parser.add_subparsers()
    
    p_list = proj_sub.add_parser("list", help="List projects")
    p_list.set_defaults(func=cmd_project_list)
    
    p_add = proj_sub.add_parser("add", help="Add project")
    p_add.add_argument("--id", required=True)
    p_add.add_argument("--name", required=True)
    p_add.add_argument("--path", required=True)
    p_add.add_argument("--description", "")
    p_add.add_argument("--tags", "")
    p_add.set_defaults(func=cmd_project_add)
    
    p_status = proj_sub.add_parser("status", help="Update project status")
    p_status.add_argument("--id", required=True)
    p_status.add_argument("--status", required=True, choices=["active", "inactive", "failed"])
    p_status.set_defaults(func=cmd_project_status)
    
    # Task commands
    task_parser = subparsers.add_parser("task", help="Task commands")
    task_sub = task_parser.add_subparsers()
    
    t_list = task_sub.add_parser("list", help="List tasks")
    t_list.add_argument("--project", "-p")
    t_list.add_argument("--agent", "-a")
    t_list.add_argument("--blocked", "-b", action="store_true")
    t_list.set_defaults(func=cmd_task_list)
    
    t_add = task_sub.add_parser("add", help="Add task")
    t_add.add_argument("--id", required=True)
    t_add.add_argument("--title", required=True)
    t_add.add_argument("--description", "")
    t_add.add_argument("--project", "-p")
    t_add.add_argument("--priority", type=int, default=5)
    t_add.set_defaults(func=cmd_task_add)
    
    t_assign = task_sub.add_parser("assign", help="Assign task")
    t_assign.add_argument("--task", required=True)
    t_assign.add_argument("--agent", required=True)
    t_assign.set_defaults(func=cmd_task_assign)
    
    # Diagnose
    diag_parser = subparsers.add_parser("diagnose", help="Diagnose issues")
    diag_parser.add_argument("--task")
    diag_parser.add_argument("--project")
    diag_parser.set_defaults(func=cmd_diagnose)
    
    args = parser.parse_args()
    
    if hasattr(args, "func"):
        args.func(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
