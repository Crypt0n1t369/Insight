"""
OpenClaw Ontology - Comprehensive Test Suite

Tests all ontology functionality.
"""

import pytest
from pathlib import Path
import sys
import json
import tempfile
import os

# Add ontology to path
ONTOLOGY_PATH = Path(__file__).parent.parent / "ontology"
sys.path.insert(0, str(ONTOLOGY_PATH.absolute()))

from ontology import (
    ProjectRegistry,
    TaskTracker,
    OntologyDiagnostics,
    Project,
    Task,
    Agent,
    Tool,
    ContextDocument,
    Status,
    OpenClawRules,
    is_valid_relationship,
    get_valid_relationships,
    get_valid_targets,
)


@pytest.fixture
def temp_workspace():
    """Create temporary workspace for testing"""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create .openclaw directory
        Path(tmpdir, ".openclaw").mkdir()
        yield Path(tmpdir)


class TestEntities:
    """Test entity definitions"""
    
    def test_project_creation(self):
        """Test Project entity"""
        project = Project(
            id="test-proj",
            name="Test Project",
            path="/workspace/test"
        )
        
        assert project.id == "test-proj"
        assert project.name == "Test Project"
        assert project.status == Status.ACTIVE
        assert project.dependencies == []
    
    def test_task_creation(self):
        """Test Task entity"""
        task = Task(
            id="task-1",
            title="Test Task",
            project_id="test-proj",
            priority=8
        )
        
        assert task.id == "task-1"
        assert task.priority == 8
        assert task.progress == 0.0
        assert task.status == Status.INACTIVE
    
    def test_agent_creation(self):
        """Test Agent entity"""
        agent = Agent(
            id="agent-1",
            name="Test Agent",
            type="subagent",
            tools=["read", "write", "exec"]
        )
        
        assert agent.id == "agent-1"
        assert agent.type == "subagent"
        assert "read" in agent.tools


class TestRelationships:
    """Test relationship validation"""
    
    def test_valid_project_task_relationship(self):
        """Project can have Task"""
        assert is_valid_relationship("Project", "has_task", "Task")
    
    def test_valid_agent_task_relationship(self):
        """Agent can work on Task"""
        assert is_valid_relationship("Agent", "works_on", "Task")
    
    def test_valid_agent_tool_relationship(self):
        """Agent can use Tool"""
        assert is_valid_relationship("Agent", "can_use", "Tool")
    
    def test_invalid_relationship(self):
        """Invalid relationship should fail"""
        assert not is_valid_relationship("Task", "owns", "Project")
    
    def test_get_valid_relationships(self):
        """Get all valid relationships for entity"""
        rels = get_valid_relationships("Agent")
        assert "works_on" in rels
        assert "belongs_to" in rels


class TestRules:
    """Test rules engine"""
    
    def test_max_subagents(self):
        """Test sub-agent limit"""
        valid, msg = OpenClawRules.can_spawn_subagent("parent", 4)
        assert valid == True
        
        valid, msg = OpenClawRules.can_spawn_subagent("parent", 5)
        assert valid == False
        assert "Max" in msg
    
    def test_tool_access(self):
        """Test tool access validation"""
        valid, msg = OpenClawRules.validate_tool_access(["read", "write"], "read")
        assert valid == True
        
        valid, msg = OpenClawRules.validate_tool_access(["read"], "delete")
        assert valid == False
        assert "not in agent capabilities" in msg
    
    def test_task_assignment(self):
        """Test task assignment limits"""
        # Agent with capacity
        valid, msg = OpenClawRules.can_assign_task("agent-1", 2, 7)
        assert valid == True
        
        # Agent at capacity with low priority
        valid, msg = OpenClawRules.can_assign_task("agent-1", 3, 3)
        assert valid == False
    
    def test_project_path_validation(self):
        """Test project path must be under workspace"""
        valid, msg = OpenClawRules.validate_project_path(
            "/home/drg/.openclaw/workspace/projects/test",
            "/home/drg/.openclaw/workspace"
        )
        assert valid == True
        
        valid, msg = OpenClawRules.validate_project_path(
            "/etc/passwd",
            "/home/drg/.openclaw/workspace"
        )
        assert valid == False
    
    def test_circular_dependency_detection(self):
        """Test circular task dependency detection"""
        all_tasks = [
            {"id": "task-1", "blockers": ["task-2"]},
            {"id": "task-2", "blockers": ["task-3"]},
            {"id": "task-3", "blockers": []},
        ]
        
        valid, msg = OpenClawRules.validate_task_blocker("task-1", "task-2", all_tasks)
        assert valid == True
        
        # Add circular
        all_tasks[2]["blockers"] = ["task-1"]
        valid, msg = OpenClawRules.validate_task_blocker("task-1", "task-3", all_tasks)
        assert valid == False


class TestProjectRegistry:
    """Test project registry"""
    
    def test_register_project(self, temp_workspace):
        """Test project registration"""
        registry = ProjectRegistry(temp_workspace)
        
        project = Project(
            id="proj-1",
            name="Project 1",
            path="/workspace/proj1"
        )
        
        assert registry.register_project(project) == True
        assert registry.register_project(project) == False  # Duplicate
    
    def test_get_project(self, temp_workspace):
        """Test getting project"""
        registry = ProjectRegistry(temp_workspace)
        
        project = Project(id="proj-1", name="P1", path="/w/p1")
        registry.register_project(project)
        
        retrieved = registry.get_project("proj-1")
        assert retrieved is not None
        assert retrieved.name == "P1"
    
    def test_list_projects(self, temp_workspace):
        """Test listing projects"""
        registry = ProjectRegistry(temp_workspace)
        
        registry.register_project(Project(id="p1", name="P1", path="/w/p1"))
        registry.register_project(Project(id="p2", name="P2", path="/w/p2"))
        
        projects = registry.list_projects()
        assert len(projects) == 2
        
        # Filter by status
        projects = registry.list_projects(Status.ACTIVE)
        assert len(projects) == 2
    
    def test_update_status(self, temp_workspace):
        """Test updating project status"""
        registry = ProjectRegistry(temp_workspace)
        
        registry.register_project(Project(id="p1", name="P1", path="/w/p1"))
        assert registry.update_status("p1", Status.FAILED) == True
        assert registry.get_project("p1").status == Status.FAILED
    
    def test_add_dependency(self, temp_workspace):
        """Test adding project dependencies"""
        registry = ProjectRegistry(temp_workspace)
        
        registry.register_project(Project(id="p1", name="P1", path="/w/p1"))
        registry.register_project(Project(id="p2", name="P2", path="/w/p2"))
        
        registry.add_dependency("p1", "p2")
        
        deps = registry.get_dependencies("p1")
        assert "p2" in deps
    
    def test_search_projects(self, temp_workspace):
        """Test project search"""
        registry = ProjectRegistry(temp_workspace)
        
        registry.register_project(Project(id="audio", name="Audio Tool", path="/w/audio", tags=["audio"]))
        registry.register_project(Project(id="video", name="Video Tool", path="/w/video", tags=["video"]))
        
        results = registry.search_projects("audio")
        assert len(results) == 1
        assert results[0].name == "Audio Tool"


class TestTaskTracker:
    """Test task tracker"""
    
    def test_create_task(self, temp_workspace):
        """Test task creation"""
        tracker = TaskTracker(temp_workspace)
        
        task = Task(id="t1", title="Task 1", project_id="p1")
        tracker.create_task(task)
        
        retrieved = tracker.get_task("t1")
        assert retrieved is not None
        assert retrieved.title == "Task 1"
    
    def test_update_progress(self, temp_workspace):
        """Test task progress update"""
        tracker = TaskTracker(temp_workspace)
        
        tracker.create_task(Task(id="t1", title="T1"))
        
        tracker.update_progress("t1", 0.5)
        assert tracker.get_task("t1").progress == 0.5
        
        tracker.update_progress("t1", 1.0)
        assert tracker.get_task("t1").status == Status.COMPLETED
    
    def test_blockers(self, temp_workspace):
        """Test task blockers"""
        tracker = TaskTracker(temp_workspace)
        
        tracker.create_task(Task(id="t1", title="Blocker"))
        tracker.create_task(Task(id="t2", title="Blocked"))
        
        tracker.add_blocker("t2", "t1")
        
        task = tracker.get_task("t2")
        assert "t1" in task.blockers
        
        tracker.remove_blocker("t2", "t1")
        assert "t1" not in tracker.get_task("t2").blockers
    
    def test_get_agent_tasks(self, temp_workspace):
        """Test getting tasks by agent"""
        tracker = TaskTracker(temp_workspace)
        
        tracker.create_task(Task(id="t1", title="T1"))
        tracker.create_task(Task(id="t2", title="T2"))
        
        tracker.assign_task("t1", "agent-1")
        tracker.assign_task("t2", "agent-1")
        
        tasks = tracker.get_agent_tasks("agent-1")
        assert len(tasks) == 2
    
    def test_get_blocked_tasks(self, temp_workspace):
        """Test getting blocked tasks"""
        tracker = TaskTracker(temp_workspace)
        
        tracker.create_task(Task(id="t1", title="T1"))
        tracker.create_task(Task(id="t2", title="T2", blockers=["t1"]))
        
        blocked = tracker.get_blocked_tasks()
        assert len(blocked) == 1


class TestDiagnostics:
    """Test diagnostics"""
    
    def test_system_health(self, temp_workspace):
        """Test system health check"""
        registry = ProjectRegistry(temp_workspace)
        tracker = TaskTracker(temp_workspace)
        diag = OntologyDiagnostics(temp_workspace)
        
        registry.register_project(Project(id="p1", name="P1", path="/w/p1"))
        tracker.create_task(Task(id="t1", title="T1", project_id="p1"))
        
        health = diag.system_health()
        assert health["projects"]["total"] == 1
        assert health["tasks"]["total"] == 1
    
    def test_diagnose_task_failure(self, temp_workspace):
        """Test task failure diagnosis"""
        diag = OntologyDiagnostics(temp_workspace)
        
        # Create task with blocker
        tracker = TaskTracker(temp_workspace)
        tracker.create_task(Task(id="t1", title="Blocker", status=Status.ACTIVE))
        tracker.create_task(Task(id="t2", title="Blocked", status=Status.ACTIVE, blockers=["t1"]))
        
        diag_result = diag.diagnose_failure("t2")
        
        assert "task" in diag_result
        assert "constraints" in diag_result
        assert len(diag_result["constraints"]) > 0
    
    def test_diagnose_project_stall(self, temp_workspace):
        """Test project stall diagnosis"""
        diag = OntologyDiagnostics(temp_workspace)
        
        registry = ProjectRegistry(temp_workspace)
        registry.register_project(Project(id="p1", name="P1", path="/w/p1"))
        
        tracker = TaskTracker(temp_workspace)
        tracker.create_task(Task(id="t1", title="T1", project_id="p1"))
        
        result = diag.diagnose_project_stall("p1")
        
        assert "project" in result
        assert result["project"]["id"] == "p1"
    
    def test_task_graph(self, temp_workspace):
        """Test task dependency graph"""
        tracker = TaskTracker(temp_workspace)
        tracker.create_task(Task(id="t1", title="T1"))
        tracker.create_task(Task(id="t2", title="T2", blockers=["t1"]))
        
        diag = OntologyDiagnostics(temp_workspace)
        graph = diag.get_task_graph()
        
        assert "t1" in graph
        assert "t2" in graph
        assert graph["t2"]["blockers"] == ["t1"]


class TestIntegration:
    """Integration tests"""
    
    def test_full_workflow(self, temp_workspace):
        """Test complete workflow"""
        registry = ProjectRegistry(temp_workspace)
        tracker = TaskTracker(temp_workspace)
        diag = OntologyDiagnostics(temp_workspace)
        
        # 1. Create projects
        registry.register_project(Project(id="proj1", name="Project 1", path="/w/p1"))
        registry.register_project(Project(id="proj2", name="Project 2", path="/w/p2", dependencies=["proj1"]))
        
        # 2. Create tasks
        tracker.create_task(Task(id="t1", title="Setup", project_id="proj1", priority=9))
        tracker.create_task(Task(id="t2", title="Build", project_id="proj2", priority=7, blockers=["t1"]))
        tracker.create_task(Task(id="t3", title="Test", project_id="proj1", priority=8))
        
        # 3. Assign tasks
        tracker.assign_task("t1", "agent-1")
        tracker.update_status("t1", Status.ACTIVE)
        
        # 4. Complete task
        tracker.update_progress("t1", 1.0)
        
        # 5. Check health
        health = diag.system_health()
        assert health["tasks"]["completed"] == 1
        assert health["tasks"]["total"] == 3
        
        # 6. Diagnose
        result = diag.diagnose_project_stall("proj2")
        assert result["task_count"] == 1  # t2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
