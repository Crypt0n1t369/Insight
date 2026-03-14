"""
OpenClaw Ontology - Agent Integration

Hooks the ontology INTO the agent's actual execution loop.
This makes the ontology OPERATIONAL, not just a reference.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from ontology import (
    ProjectRegistry, TaskTracker, OntologyDiagnostics,
    Project, Task, Agent, Status, OpenClawRules
)


class OntologyAgent:
    """
    An agent that operates WITHIN ontology constraints.
    
    Before any action, the agent MUST check:
    1. Can I spawn a subagent? (rule check)
    2. Can I use this tool? (rule check)
    3. What's the task context? (query)
    4. Are there blockers? (check)
    """
    
    def __init__(self, agent_id: str, workspace: Path):
        self.agent_id = agent_id
        self.workspace = workspace
        self.registry = ProjectRegistry(workspace)
        self.tracker = TaskTracker(workspace)
        self.diagnostics = OntologyDiagnostics(workspace)
        
        # Agent's tool capabilities (from ontology)
        self.capabilities: List[str] = []
        
        # Context from ontology
        self.current_project: Optional[str] = None
        self.current_task: Optional[str] = None
    
    def can_use_tool(self, tool: str) -> tuple[bool, str]:
        """Check if agent can use this tool (ONTOLOGY ENFORCED)"""
        return OpenClawRules.validate_tool_access(self.capabilities, tool)
    
    def can_spawn_subagent(self, current_count: int) -> tuple[bool, str]:
        """Check if can spawn sub-agent (ONTOLOGY ENFORCED)"""
        return OpenClawRules.can_spawn_subagent(self.agent_id, current_count)
    
    def assign_task(self, task_id: str) -> bool:
        """Assign task to this agent"""
        # Check capacity
        current_tasks = self.tracker.get_agent_tasks(self.agent_id)
        active = [t for t in current_tasks if t.status in [Status.ACTIVE, Status.RUNNING]]
        
        if len(active) >= OpenClawRules.MAX_PARALLEL_TASKS:
            return False
        
        return self.tracker.assign_task(task_id, self.agent_id)
    
    def get_task_context(self, task_id: str) -> Dict[str, Any]:
        """Get full context for a task"""
        task = self.tracker.get_task(task_id)
        if not task:
            return {"error": "Task not found"}
        
        # Get blockers
        blockers = []
        for bid in task.blockers:
            blocker = self.tracker.get_task(bid)
            if blocker:
                blockers.append({
                    "id": blocker.id,
                    "title": blocker.title,
                    "status": blocker.status.value,
                    "progress": blocker.progress
                })
        
        return {
            "task": {
                "id": task.id,
                "title": task.title,
                "status": task.status.value,
                "progress": task.progress,
                "project_id": task.project_id
            },
            "blockers": blockers,
            "recommendations": self._get_recommendations(task)
        }
    
    def _get_recommendations(self, task: Task) -> List[str]:
        """Get actionable recommendations"""
        recs = []
        
        # Check blockers
        for bid in task.blockers:
            blocker = self.tracker.get_task(bid)
            if blocker and blocker.status != Status.COMPLETED:
                recs.append(f"Blocked by: {blocker.title} - help complete it or reassign")
        
        # Check agent capacity
        agent_tasks = self.tracker.get_agent_tasks(self.agent_id)
        active = [t for t in agent_tasks if t.status == Status.RUNNING]
        if len(active) >= 2:
            recs.append("Approaching capacity - consider completing current tasks first")
        
        return recs
    
    def update_progress(self, task_id: str, progress: float) -> bool:
        """Update task progress"""
        return self.tracker.update_progress(task_id, progress)
    
    def complete_task(self, task_id: str) -> bool:
        """Mark task as complete and check blockers"""
        # Update status
        self.tracker.update_status(task_id, Status.COMPLETED)
        
        # Check what was unblocked
        task = self.tracker.get_task(task_id)
        unblocked = []
        
        # Find tasks that were blocked by this one
        all_tasks = self.tracker._load()["tasks"]
        for t in all_tasks:
            if task_id in t.get("blockers", []):
                self.tracker.remove_blocker(t["id"], task_id)
                unblocked.append(t["id"])
        
        return True
    
    def diagnose_my_work(self) -> Dict[str, Any]:
        """Diagnose current agent's situation"""
        my_tasks = self.tracker.get_agent_tasks(self.agent_id)
        
        issues = []
        for t in my_tasks:
            if t.status == Status.FAILED:
                diag = self.diagnostics.diagnose_failure(t.id)
                issues.append(diag)
        
        return {
            "agent_id": self.agent_id,
            "tasks_assigned": len(my_tasks),
            "issues": issues
        }


class OntologyEnforcer:
    """
    Middleware that enforces ontology constraints on agent actions.
    
    Use this to wrap any agent execution.
    """
    
    def __init__(self, workspace: Path):
        self.workspace = workspace
        self.rules = OpenClawRules()
    
    def pre_exec_check(self, agent_tools: List[str], action: str) -> tuple[bool, str]:
        """Check if action is allowed BEFORE execution"""
        return self.rules.validate_tool_access(agent_tools, action)
    
    def pre_spawn_check(self, current_subagents: int) -> tuple[bool, str]:
        """Check if can spawn sub-agent"""
        return self.rules.can_spawn_subagent("agent", current_subagents)
    
    def pre_task_assign(self, agent_id: str, agent_current_tasks: int, priority: int) -> tuple[bool, str]:
        """Check if can assign task"""
        return self.rules.can_assign_task(agent_id, agent_current_tasks, priority)


def demo():
    """Demonstrate practical usage"""
    workspace = Path('/home/drg/.openclaw/workspace')
    
    # Create agent with limited capabilities
    agent = OntologyAgent("demo-agent", workspace)
    agent.capabilities = ["read", "write", "exec", "browser"]
    
    print("="*60)
    print("ONTOLOGY AGENT DEMO")
    print("="*60)
    
    # 1. Tool access check
    print("\n1️⃣ TOOL ACCESS CHECKS:")
    for tool in ["exec", "browser", "delete", "subagents"]:
        allowed, msg = agent.can_use_tool(tool)
        status = "✅" if allowed else "⛔"
        print(f"   {status} {tool}: {msg}")
    
    # 2. Subagent spawning
    print("\n2️⃣ SUBAGENT SPAWNING:")
    for count in range(6):
        allowed, msg = agent.can_spawn_subagent(count)
        status = "✅" if allowed else "⛔"
        print(f"   {status} Spawn #{count+1}: {msg}")
    
    # 3. Task context
    print("\n3️⃣ TASK CONTEXT:")
    tasks = agent.tracker.get_active_tasks()
    if tasks:
        task = tasks[0]
        ctx = agent.get_task_context(task.id)
        print(f"   Task: {ctx['task']['title']}")
        print(f"   Blockers: {len(ctx['blockers'])}")
        for b in ctx['blockers']:
            print(f"     - {b['title']} ({b['status']})")
    
    # 4. Diagnosis
    print("\n4️⃣ SELF-DIAGNOSIS:")
    diag = agent.diagnose_my_work()
    print(f"   Tasks: {diag['tasks_assigned']}")
    print(f"   Issues: {len(diag['issues'])}")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    demo()
