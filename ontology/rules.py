"""
OpenClaw Ontology - Rules Engine

Enforces constraints and validates operations.
"""

from typing import List, Tuple, Optional
from datetime import datetime


class OpenClawRules:
    """
    Enforce ontology constraints.
    
    These rules govern what agents can and cannot do.
    """
    
    # Maximums (to prevent resource exhaustion)
    MAX_CONTEXT_DOCS = 10
    MAX_NESTED_SUBAGENTS = 5
    MAX_PARALLEL_TASKS = 3
    MAX_CONTEXT_SIZE_KB = 500
    MAX_PROJECT_DEPTH = 3
    
    @staticmethod
    def can_spawn_subagent(parent_agent: str, current_subagents: int) -> Tuple[bool, str]:
        """Rule: Limit sub-agent spawning"""
        if current_subagents >= OpenClawRules.MAX_NESTED_SUBAGENTS:
            return False, f"Max sub-agents ({OpenClawRules.MAX_NESTED_SUBAGENTS}) reached"
        return True, "OK"
    
    @staticmethod
    def can_load_context(
        agent_id: str, 
        context_docs: List[str], 
        new_doc_size_kb: float = 0
    ) -> Tuple[bool, str]:
        """Rule: Context size limits"""
        if len(context_docs) >= OpenClawRules.MAX_CONTEXT_DOCS:
            return False, f"Max context docs ({OpenClawRules.MAX_CONTEXT_DOCS}) reached"
        
        # Estimate current size (could be tracked more precisely)
        current_size = len(context_docs) * 50  # rough estimate
        if current_size + new_doc_size_kb > OpenClawRules.MAX_CONTEXT_SIZE_KB:
            return False, f"Context size limit ({OpenClawRules.MAX_CONTEXT_SIZE_KB}KB) exceeded"
        
        return True, "OK"
    
    @staticmethod
    def validate_tool_access(agent_tools: List[str], requested_tool: str) -> Tuple[bool, str]:
        """Rule: Agent can only use assigned tools"""
        if requested_tool not in agent_tools:
            return False, f"Tool '{requested_tool}' not in agent capabilities"
        return True, "OK"
    
    @staticmethod
    def can_assign_task(
        agent_id: str, 
        agent_current_tasks: int, 
        task_priority: int
    ) -> Tuple[bool, str]:
        """Rule: Task assignment limits"""
        if agent_current_tasks >= OpenClawRules.MAX_PARALLEL_TASKS:
            return False, f"Agent at max capacity ({OpenClawRules.MAX_PARALLEL_TASKS})"
        
        # High priority tasks can preempt lower
        if agent_current_tasks > 0 and task_priority < 5:
            return False, "High load, cannot accept lower priority task"
        
        return True, "OK"
    
    @staticmethod
    def validate_project_path(project_path: str, workspace: str) -> Tuple[bool, str]:
        """Rule: Project paths must be under workspace"""
        if not project_path.startswith(workspace):
            return False, f"Path must be under workspace: {workspace}"
        return True, "OK"
    
    @staticmethod
    def can_create_relationship(
        from_type: str, 
        rel: str, 
        to_type: str
    ) -> Tuple[bool, str]:
        """Rule: Validate relationship creation"""
        from .relationships import is_valid_relationship
        
        if not is_valid_relationship(from_type, rel, to_type):
            return False, f"Invalid relationship: {from_type}.{rel} -> {to_type}"
        return True, "OK"
    
    @staticmethod
    def validate_task_blocker(
        task_id: str, 
        blocker_id: str,
        all_tasks: List[dict]
    ) -> Tuple[bool, str]:
        """Rule: Prevent circular task dependencies"""
        if task_id == blocker_id:
            return False, "Task cannot block itself"
        
        # Check for circular dependency
        visited = set()
        to_check = [blocker_id]
        
        while to_check:
            current = to_check.pop()
            if current == task_id:
                return False, "Circular dependency detected"
            if current in visited:
                continue
            visited.add(current)
            
            # Find blockers of current task
            for t in all_tasks:
                if t.get("id") == current:
                    blockers = t.get("blockers", [])
                    to_check.extend(blockers)
        
        return True, "OK"
