#!/usr/bin/env python3
"""
Ontology Agent Helper

Provides a simple CLI for agents to query the ontology.
Usage from agent:
    import subprocess
    result = subprocess.run(['python3', 'scripts/ontology_agent.py', 'health'], capture_output=True)
"""

import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "ontology"))

from ontology import ProjectRegistry, TaskTracker, OntologyDiagnostics, OpenClawRules


def cmd_health():
    """Get system health"""
    workspace = Path('/home/drg/.openclaw/workspace')
    diag = OntologyDiagnostics(workspace)
    return diag.system_health()


def cmd_projects():
    """List all projects"""
    workspace = Path('/home/drg/.openclaw/workspace')
    registry = ProjectRegistry(workspace)
    return [{"id": p.id, "name": p.name, "status": p.status.value} for p in registry.list_projects()]


def cmd_tasks(project_id=None, agent_id=None, blocked=False):
    """List tasks"""
    workspace = Path('/home/drg/.openclaw/workspace')
    tracker = TaskTracker(workspace)
    
    if project_id:
        tasks = tracker.get_project_tasks(project_id)
    elif agent_id:
        tasks = tracker.get_agent_tasks(agent_id)
    elif blocked:
        tasks = tracker.get_blocked_tasks()
    else:
        tasks = tracker.get_active_tasks()
    
    return [{"id": t.id, "title": t.title, "status": t.status.value, "project": t.project_id} for t in tasks]


def cmd_diagnose_task(task_id):
    """Diagnose a task"""
    workspace = Path('/home/drg/.openclaw/workspace')
    diag = OntologyDiagnostics(workspace)
    return diag.diagnose_failure(task_id)


def cmd_diagnose_project(project_id):
    """Diagnose a project"""
    workspace = Path('/home/drg/.openclaw/workspace')
    diag = OntologyDiagnostics(workspace)
    return diag.diagnose_project_stall(project_id)


def cmd_validate_tool(agent_tools, tool):
    """Validate if agent can use tool"""
    return {"valid": OpenClawRules.validate_tool_access(agent_tools, tool)}


def cmd_can_spawn_subagent(current_count):
    """Check if can spawn subagent"""
    return {"valid": OpenClawRules.can_spawn_subagent("agent", current_count)}


def main():
    if len(sys.argv) < 2:
        print("Usage: ontology_agent.py <command> [args...]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    try:
        if cmd == "health":
            print(json.dumps(cmd_health(), indent=2))
        elif cmd == "projects":
            print(json.dumps(cmd_projects(), indent=2))
        elif cmd == "tasks":
            project = None
            agent = None
            blocked = False
            for i, arg in enumerate(sys.argv[2:]):
                if arg == "--project" and i+2 < len(sys.argv):
                    project = sys.argv[i+3]
                elif arg == "--agent" and i+2 < len(sys.argv):
                    agent = sys.argv[i+3]
                elif arg == "--blocked":
                    blocked = True
            print(json.dumps(cmd_tasks(project, agent, blocked), indent=2))
        elif cmd == "diagnose-task" and len(sys.argv) > 2:
            print(json.dumps(cmd_diagnose_task(sys.argv[2]), indent=2))
        elif cmd == "diagnose-project" and len(sys.argv) > 2:
            print(json.dumps(cmd_diagnose_project(sys.argv[2]), indent=2))
        elif cmd == "validate-tool" and len(sys.argv) > 3:
            print(json.dumps(cmd_validate_tool(sys.argv[2].split(','), sys.argv[3]), indent=2))
        elif cmd == "can-spawn" and len(sys.argv) > 2:
            print(json.dumps(cmd_can_spawn_subagent(int(sys.argv[2])), indent=2))
        else:
            print(f"Unknown command: {cmd}")
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
