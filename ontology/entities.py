"""
OpenClaw Ontology - Entity Schemas

Defines all entities that exist in the OpenClaw system.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class EntityType(str, Enum):
    PROJECT = "project"
    AGENT = "agent"
    TASK = "task"
    TOOL = "tool"
    SKILL = "skill"
    CONTEXT = "context"
    MEMORY = "memory"
    CHECK = "check"
    DOCUMENT = "document"


class Status(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    RUNNING = "running"
    STOPPED = "stopped"
    FAILED = "failed"
    COMPLETED = "completed"


class Project(BaseModel):
    """A distinct workstream or application"""
    id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Human-readable name")
    status: Status = Field(default=Status.ACTIVE)
    description: str = ""
    path: str = Field(..., description="Filesystem path")
    created_at: datetime = Field(default_factory=datetime.now)
    last_active: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    dependencies: List[str] = Field(default_factory=list, description="Project IDs this depends on")
    parent: Optional[str] = Field(None, description="Parent project ID")
    tags: List[str] = Field(default_factory=list)


class Agent(BaseModel):
    """An AI agent that executes work"""
    id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Agent name")
    type: str = Field(..., description="agent type: main, subagent, webhook")
    status: Status = Field(default=Status.INACTIVE)
    
    # Capabilities
    capabilities: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list, description="Tool IDs available")
    
    # Context
    current_project: Optional[str] = Field(None, description="Current project ID")
    current_task: Optional[str] = Field(None, description="Current task ID")
    context_sources: List[str] = Field(default_factory=list, description="Context document IDs")
    
    # Metrics
    tasks_completed: int = 0
    tasks_failed: int = 0


class Task(BaseModel):
    """A unit of work to be accomplished"""
    id: str = Field(..., description="Unique identifier")
    title: str = ""
    description: str = ""
    status: Status = Field(default=Status.INACTIVE)
    priority: int = Field(default=5, ge=1, le=10)
    
    # Assignment
    assigned_to: Optional[str] = Field(None, description="Agent ID")
    project_id: Optional[str] = Field(None, description="Project ID")
    
    # Progress
    progress: float = Field(default=0.0, ge=0, le=1)
    blockers: List[str] = Field(default_factory=list)
    
    # History
    created_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None


class Tool(BaseModel):
    """A capability the system can perform"""
    id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Human-readable name")
    type: str = Field(..., description="tool type: exec, read, write, etc")
    
    # Capabilities
    description: str = ""
    parameters: Dict[str, Any] = Field(default_factory=dict)
    security_level: str = Field(default="user")  # user, elevated, admin
    
    # Constraints
    timeout: int = Field(default=30, description="Max execution time in seconds")
    requires_approval: bool = Field(default=False)


class ContextDocument(BaseModel):
    """A document that provides context to agents"""
    id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Document name")
    path: str = Field(..., description="Filesystem path")
    type: str = Field(..., description="context type: persona, memory, project, etc")
    
    # Content
    content_hash: str = Field(..., description="Hash for change detection")
    last_modified: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    loaded_by: List[str] = Field(default_factory=list, description="Agent IDs that load this")


class HealthCheck(BaseModel):
    """A diagnostic check for system health"""
    id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Check name")
    type: str = Field(..., description="check type: git, health, test, etc")
    
    # Definition
    command: str = Field(..., description="Command to execute")
    expected: str = Field("", description="Expected output pattern")
    critical: bool = Field(default=False, description="If failure is critical")
    
    # Results
    last_run: Optional[datetime] = None
    last_result: bool = False
    last_error: str = ""
