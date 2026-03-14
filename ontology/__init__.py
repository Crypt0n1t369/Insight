"""
OpenClaw Ontology Framework

A semantic layer for autonomous agent orchestration.

Usage:
    from ontology import ProjectRegistry, TaskTracker, OntologyDiagnostics
    
    registry = ProjectRegistry(Path("/workspace"))
    diagnostics = OntologyDiagnostics(Path("/workspace"))
    
    # Register a project
    project = Project(id="youth-platform", name="Youth Platform", path="/workspace/projects/youth")
    registry.register_project(project)
    
    # Create a task
    task = Task(id="task-1", title="Research", project_id="youth-platform")
    tracker.create_task(task)
    
    # Diagnose issues
    health = diagnostics.system_health()
"""

from .entities import (
    EntityType,
    Status,
    Project,
    Agent,
    Task,
    Tool,
    ContextDocument,
    HealthCheck,
)
from .relationships import (
    VALID_RELATIONSHIPS,
    is_valid_relationship,
    get_valid_relationships,
    get_valid_targets,
)
from .rules import OpenClawRules
from .registry import ProjectRegistry
from .task_tracker import TaskTracker
from .diagnostics import OntologyDiagnostics
from .ai_constraints import (
    ONTOLOGY_SYSTEM_PROMPT,
    build_context_prompt,
    build_diagnostic_prompt,
)

__all__ = [
    # Entities
    "EntityType",
    "Status",
    "Project",
    "Agent",
    "Task",
    "Tool",
    "ContextDocument",
    "HealthCheck",
    # Relationships
    "VALID_RELATIONSHIPS",
    "is_valid_relationship",
    "get_valid_relationships",
    "get_valid_targets",
    # Rules
    "OpenClawRules",
    # Registry & Tracker
    "ProjectRegistry",
    "TaskTracker",
    # Diagnostics
    "OntologyDiagnostics",
    # AI Constraints
    "ONTOLOGY_SYSTEM_PROMPT",
    "build_context_prompt",
    "build_diagnostic_prompt",
]
