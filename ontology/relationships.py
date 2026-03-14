"""
OpenClaw Ontology - Valid Relationships

Defines what relationships are valid between entities.
This is the CONSTRAINT layer - relationships not defined here are invalid.
"""

# This defines what's VALID in the system
VALID_RELATIONSHIPS = {
    # Project relationships
    "Project": {
        "contains": "Project",           # Sub-projects
        "depends_on": "Project",         # Dependencies
        "uses": "Tool",                  # Tools it employs
        "has_context": "ContextDocument", # Context it loads
        "has_task": "Task",              # Tasks within
        "tracked_by": "HealthCheck",     # Health checks
    },
    
    # Agent relationships
    "Agent": {
        "works_on": "Task",
        "belongs_to": "Project",
        "can_use": "Tool",
        "loads": "ContextDocument",
        "spawns": "Agent",              # Sub-agents
        "reports_to": "Agent",          # Hierarchy
    },
    
    # Task relationships
    "Task": {
        "assigned_to": "Agent",
        "part_of": "Project",
        "blocked_by": "Task",           # Dependencies
        "produces": "Document",         # Output
    },
    
    # Context relationships
    "ContextDocument": {
        "applies_to": "Project",
        "loaded_by": "Agent",
        "references": "ContextDocument", # Includes other context
    },
}


def is_valid_relationship(from_type: str, rel: str, to_type: str) -> bool:
    """
    Check if a relationship is defined in the ontology.
    
    Returns True only if the relationship is explicitly defined.
    """
    valid_targets = VALID_RELATIONSHIPS.get(from_type, {}).get(rel, [])
    if isinstance(valid_targets, list):
        return to_type in valid_targets
    return valid_targets == to_type or valid_targets == "Any"


def get_valid_relationships(entity_type: str) -> dict:
    """Get all valid relationships for an entity type."""
    return VALID_RELATIONSHIPS.get(entity_type, {})


def get_valid_targets(entity_type: str, relationship: str) -> list:
    """Get valid target types for a relationship."""
    targets = VALID_RELATIONSHIPS.get(entity_type, {}).get(relationship, [])
    if isinstance(targets, str):
        return [targets]
    return targets if targets else []
