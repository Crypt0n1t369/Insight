"""
OpenClaw Ontology - Task Tracker

Track all tasks and their relationships.
"""

import json
from pathlib import Path
from typing import List, Optional, Dict
from datetime import datetime
from .entities import Task, Status


class TaskTracker:
    """Track all tasks and their relationships"""
    
    def __init__(self, workspace: Path):
        self.workspace = workspace
        self.tasks_file = workspace / ".openclaw" / "tasks.json"
        self._ensure_file()
    
    def _ensure_file(self):
        if not self.tasks_file.exists():
            self.tasks_file.parent.mkdir(parents=True, exist_ok=True)
            self._save({"tasks": []})
    
    def _load(self) -> dict:
        return json.loads(self.tasks_file.read_text())
    
    def _save(self, data: dict):
        # Convert datetime objects to ISO format strings
        def convert(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            elif isinstance(obj, dict):
                return {k: convert(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert(i) for i in obj]
            return obj
        
        data = convert(data)
        self.tasks_file.write_text(json.dumps(data, indent=2))
    
    def create_task(self, task: Task) -> str:
        """Create new task"""
        data = self._load()
        data["tasks"].append(task.model_dump())
        self._save(data)
        return task.id
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by ID"""
        data = self._load()
        for t in data["tasks"]:
            if t["id"] == task_id:
                return Task(**t)
        return None
    
    def update_progress(self, task_id: str, progress: float, notes: str = "") -> bool:
        """Update task progress"""
        data = self._load()
        
        for t in data["tasks"]:
            if t["id"] == task_id:
                t["progress"] = min(1.0, max(0.0, progress))
                if t["progress"] >= 1.0:
                    t["status"] = Status.COMPLETED.value
                    t["completed_at"] = datetime.now().isoformat()
                self._save(data)
                return True
        
        return False
    
    def update_status(self, task_id: str, status: Status) -> bool:
        """Update task status"""
        data = self._load()
        
        for t in data["tasks"]:
            if t["id"] == task_id:
                t["status"] = status.value
                if status == Status.COMPLETED:
                    t["completed_at"] = datetime.now().isoformat()
                    t["progress"] = 1.0
                self._save(data)
                return True
        
        return False
    
    def add_blocker(self, task_id: str, blocker_id: str) -> bool:
        """Add a blocker to a task"""
        data = self._load()
        
        for t in data["tasks"]:
            if t["id"] == task_id:
                if blocker_id not in t["blockers"]:
                    t["blockers"].append(blocker_id)
                    self._save(data)
                return True
        
        return False
    
    def remove_blocker(self, task_id: str, blocker_id: str) -> bool:
        """Remove a blocker from a task"""
        data = self._load()
        
        for t in data["tasks"]:
            if t["id"] == task_id:
                if blocker_id in t["blockers"]:
                    t["blockers"].remove(blocker_id)
                    self._save(data)
                return True
        
        return False
    
    def get_agent_tasks(self, agent_id: str) -> List[Task]:
        """Get tasks assigned to an agent"""
        data = self._load()
        return [Task(**t) for t in data["tasks"] if t.get("assigned_to") == agent_id]
    
    def get_project_tasks(self, project_id: str) -> List[Task]:
        """Get tasks for a project"""
        data = self._load()
        return [Task(**t) for t in data["tasks"] if t.get("project_id") == project_id]
    
    def get_blocked_tasks(self) -> List[Task]:
        """Get all blocked tasks"""
        data = self._load()
        return [Task(**t) for t in data["tasks"] if t.get("blockers")]
    
    def get_active_tasks(self) -> List[Task]:
        """Get all active (non-completed) tasks"""
        data = self._load()
        return [Task(**t) for t in data["tasks"] 
                if t.get("status") not in [Status.COMPLETED.value, Status.STOPPED.value]]
    
    def get_tasks_by_status(self, status: Status) -> List[Task]:
        """Get tasks by status"""
        data = self._load()
        return [Task(**t) for t in data["tasks"] if t.get("status") == status.value]
    
    def assign_task(self, task_id: str, agent_id: str) -> bool:
        """Assign task to agent"""
        data = self._load()
        
        for t in data["tasks"]:
            if t["id"] == task_id:
                t["assigned_to"] = agent_id
                if t["status"] == Status.INACTIVE.value:
                    t["status"] = Status.ACTIVE.value
                self._save(data)
                return True
        
        return False
    
    def unassign_task(self, task_id: str) -> bool:
        """Unassign task from agent"""
        data = self._load()
        
        for t in data["tasks"]:
            if t["id"] == task_id:
                t["assigned_to"] = None
                self._save(data)
                return True
        
        return False
    
    def delete_task(self, task_id: str) -> bool:
        """Delete a task"""
        data = self._load()
        
        original_len = len(data["tasks"])
        data["tasks"] = [t for t in data["tasks"] if t["id"] != task_id]
        
        if len(data["tasks"]) < original_len:
            self._save(data)
            return True
        
        return False
    
    def get_task_count(self) -> int:
        """Get total task count"""
        data = self._load()
        return len(data["tasks"])
