"""
OpenClaw Ontology - Diagnostics

Systematic troubleshooting through ontology.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pathlib import Path

from .registry import ProjectRegistry
from .task_tracker import TaskTracker
from .entities import Status, Task, Project


class OntologyDiagnostics:
    """Systematic troubleshooting through ontology"""
    
    def __init__(self, workspace: Path):
        self.workspace = workspace
        self.projects = ProjectRegistry(workspace)
        self.tasks = TaskTracker(workspace)
    
    def diagnose_failure(self, task_id: str) -> Dict[str, Any]:
        """Diagnose why a task failed"""
        
        task = self.tasks.get_task(task_id)
        if not task:
            return {"error": "Task not found"}
        
        diagnosis = {
            "task": {
                "id": task.id,
                "title": task.title,
                "status": task.status,
                "progress": task.progress,
                "assigned_to": task.assigned_to,
                "blockers": task.blockers,
            },
            "context": [],
            "constraints": [],
            "recommendations": []
        }
        
        # Check constraints
        if task.blockers:
            for blocker_id in task.blockers:
                blocker = self.tasks.get_task(blocker_id)
                if blocker and blocker.status != Status.COMPLETED:
                    diagnosis["constraints"].append(
                        f"Blocked by: {blocker.title} (status: {blocker.status})"
                    )
                    diagnosis["recommendations"].append(
                        f"Complete or unblock: {blocker.title}"
                    )
        
        # Check agent capacity
        if task.assigned_to:
            agent_tasks = self.tasks.get_agent_tasks(task.assigned_to)
            active = [t for t in agent_tasks if t.status == Status.RUNNING]
            if len(active) >= 3:
                diagnosis["constraints"].append(
                    f"Agent {task.assigned_to} at capacity ({len(active)} tasks)"
                )
                diagnosis["recommendations"].append(
                    "Reassign to different agent or wait"
                )
        
        # Check for circular dependencies
        if task.blockers:
            cycle = self._check_circular_dependency(task_id, task.blockers)
            if cycle:
                diagnosis["constraints"].append(f"Circular dependency: {' -> '.join(cycle)}")
                diagnosis["recommendations"].append("Remove circular dependency")
        
        return diagnosis
    
    def _check_circular_dependency(self, task_id: str, blockers: List[str]) -> Optional[List[str]]:
        """Check for circular task dependencies"""
        visited = {task_id}
        path = [task_id]
        
        to_check = list(blockers)
        while to_check:
            current = to_check.pop()
            if current in visited:
                path.append(current)
                return path
            visited.add(current)
            path.append(current)
            
            task = self.tasks.get_task(current)
            if task:
                to_check.extend(task.blockers)
        
        return None
    
    def diagnose_project_stall(self, project_id: str) -> Dict[str, Any]:
        """Diagnose why a project is stalled"""
        
        project = self.projects.get_project(project_id)
        if not project:
            return {"error": "Project not found"}
        
        stalled = []
        
        # Check for no activity
        if project.last_active:
            if isinstance(project.last_active, str):
                last = datetime.fromisoformat(project.last_active)
                if datetime.now() - last > timedelta(days=1):
                    stalled.append("No activity in >24 hours")
            else:
                if datetime.now() - project.last_active > timedelta(days=1):
                    stalled.append("No activity in >24 hours")
        
        # Check for blocked tasks
        project_tasks = self.tasks.get_project_tasks(project_id)
        blocked = [t for t in project_tasks if t.blockers and 
                   any(self.tasks.get_task(b).status != Status.COMPLETED 
                       for b in t.blockers if self.tasks.get_task(b))]
        
        if blocked:
            stalled.append(f"{len(blocked)} blocked tasks")
        
        # Check for failed tasks
        failed = [t for t in project_tasks if t.status == Status.FAILED]
        if failed:
            stalled.append(f"{len(failed)} failed tasks")
        
        return {
            "project": {
                "id": project.id,
                "name": project.name,
                "status": project.status,
                "last_active": project.last_active,
            },
            "stalled_reasons": stalled,
            "task_count": len(project_tasks),
            "active_tasks": len([t for t in project_tasks if t.status == Status.RUNNING]),
            "completed_tasks": len([t for t in project_tasks if t.status == Status.COMPLETED]),
            "recommendations": self._get_stall_recommendations(stalled)
        }
    
    def _get_stall_recommendations(self, stalled: List[str]) -> List[str]:
        """Generate recommendations based on stall reasons"""
        recommendations = []
        
        if "No activity in >24 hours" in stalled:
            recommendations.append("Review project priority or archive if inactive")
        
        if any("blocked" in s.lower() for s in stalled):
            recommendations.append("Address blocked tasks first")
        
        if any("failed" in s.lower() for s in stalled):
            recommendations.append("Diagnose failed tasks and restart or reassign")
        
        return recommendations
    
    def system_health(self) -> Dict[str, Any]:
        """Full system health check"""
        
        all_projects = self.projects.list_projects()
        all_tasks = self.tasks._load()["tasks"]
        
        return {
            "projects": {
                "total": len(all_projects),
                "active": len([p for p in all_projects if p.status == Status.ACTIVE]),
                "failed": len([p for p in all_projects if p.status == Status.FAILED]),
            },
            "tasks": {
                "total": len(all_tasks),
                "running": len([t for t in all_tasks if t.get("status") == Status.RUNNING.value]),
                "active": len([t for t in all_tasks if t.get("status") == Status.ACTIVE.value]),
                "blocked": len([t for t in all_tasks if t.get("blockers")]),
                "failed": len([t for t in all_tasks if t.get("status") == Status.FAILED.value]),
                "completed": len([t for t in all_tasks if t.get("status") == Status.COMPLETED.value]),
            }
        }
    
    def get_task_graph(self, project_id: str = None) -> Dict[str, List[str]]:
        """Get task dependency graph"""
        if project_id:
            tasks = self.tasks.get_project_tasks(project_id)
        else:
            tasks = self.tasks.get_active_tasks()
        
        graph = {}
        for task in tasks:
            graph[task.id] = {
                "title": task.title,
                "status": task.status,
                "blockers": task.blockers,
                "assigned_to": task.assigned_to
            }
        
        return graph
    
    def suggest_next_task(self, agent_id: str) -> Optional[Task]:
        """Suggest next best task for an agent"""
        # Get agent's current tasks
        current_tasks = self.tasks.get_agent_tasks(agent_id)
        
        # Filter available tasks
        available = self.tasks.get_tasks_by_status(Status.ACTIVE)
        
        # Sort by priority (higher first)
        available.sort(key=lambda t: t.priority, reverse=True)
        
        # Return highest priority not blocked
        for task in available:
            if not task.blockers:
                # Check blockers are completed
                blockers_complete = True
                for blocker_id in task.blockers:
                    blocker = self.tasks.get_task(blocker_id)
                    if blocker and blocker.status != Status.COMPLETED:
                        blockers_complete = False
                        break
                
                if blockers_complete:
                    return task
        
        return None
