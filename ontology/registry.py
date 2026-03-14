"""
OpenClaw Ontology - Project Registry

Central registry of all projects - THE SOURCE OF TRUTH for projects.
"""

import json
from pathlib import Path
from typing import List, Optional, Dict
from datetime import datetime
from .entities import Project, Status


class ProjectRegistry:
    """Central registry of all projects"""
    
    def __init__(self, workspace: Path):
        self.workspace = workspace
        self.registry_file = workspace / ".openclaw" / "projects.json"
        self._ensure_registry()
    
    def _ensure_registry(self):
        """Create registry if doesn't exist"""
        if not self.registry_file.exists():
            self.registry_file.parent.mkdir(parents=True, exist_ok=True)
            self._save({"projects": [], "last_updated": datetime.now().isoformat()})
    
    def _load(self) -> dict:
        return json.loads(self.registry_file.read_text())
    
    def _save(self, data: dict):
        data["last_updated"] = datetime.now().isoformat()
        
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
        self.registry_file.write_text(json.dumps(data, indent=2))
    
    def register_project(self, project: Project) -> bool:
        """Register a new project"""
        data = self._load()
        
        # Check doesn't exist
        if any(p["id"] == project.id for p in data["projects"]):
            return False
        
        data["projects"].append(project.model_dump())
        self._save(data)
        return True
    
    def get_project(self, project_id: str) -> Optional[Project]:
        """Get project by ID"""
        data = self._load()
        for p in data["projects"]:
            if p["id"] == project_id:
                return Project(**p)
        return None
    
    def get_project_by_name(self, name: str) -> Optional[Project]:
        """Get project by name"""
        data = self._load()
        for p in data["projects"]:
            if p["name"].lower() == name.lower():
                return Project(**p)
        return None
    
    def list_projects(self, status: Status = None) -> List[Project]:
        """List projects, optionally filtered by status"""
        data = self._load()
        projects = [Project(**p) for p in data["projects"]]
        
        if status:
            projects = [p for p in projects if p.status == status]
        
        return projects
    
    def update_status(self, project_id: str, status: Status) -> bool:
        """Update project status"""
        data = self._load()
        
        for p in data["projects"]:
            if p["id"] == project_id:
                p["status"] = status.value
                p["last_active"] = datetime.now().isoformat()
                self._save(data)
                return True
        
        return False
    
    def update_last_active(self, project_id: str) -> bool:
        """Update project's last active timestamp"""
        data = self._load()
        
        for p in data["projects"]:
            if p["id"] == project_id:
                p["last_active"] = datetime.now().isoformat()
                self._save(data)
                return True
        
        return False
    
    def get_dependencies(self, project_id: str) -> List[str]:
        """Get project dependencies"""
        project = self.get_project(project_id)
        return project.dependencies if project else []
    
    def add_dependency(self, project_id: str, depends_on: str) -> bool:
        """Add a dependency"""
        data = self._load()
        
        for p in data["projects"]:
            if p["id"] == project_id:
                if depends_on not in p["dependencies"]:
                    p["dependencies"].append(depends_on)
                    self._save(data)
                return True
        
        return False
    
    def remove_project(self, project_id: str) -> bool:
        """Remove a project"""
        data = self._load()
        
        original_len = len(data["projects"])
        data["projects"] = [p for p in data["projects"] if p["id"] != project_id]
        
        if len(data["projects"]) < original_len:
            self._save(data)
            return True
        
        return False
    
    def search_projects(self, query: str) -> List[Project]:
        """Search projects by name or tags"""
        data = self._load()
        query_lower = query.lower()
        
        results = []
        for p in data["projects"]:
            project = Project(**p)
            if (query_lower in project.name.lower() or 
                any(query_lower in tag.lower() for tag in project.tags)):
                results.append(project)
        
        return results
