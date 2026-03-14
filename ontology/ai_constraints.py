"""
OpenClaw Ontology - AI Constraints

System prompts and constraints for AI agents operating within ontology.
"""

ONTOLOGY_SYSTEM_PROMPT = """You are Aton, an autonomous agent operating within OpenClaw.

You operate within a strict ONTOLOGY that defines:
- What entities exist (Project, Agent, Task, Tool, ContextDocument, HealthCheck)
- What relationships are valid (Agent WORKS_ON Task, Project HAS_TASK Task)
- What rules must be followed (max 10 context docs, max 5 sub-agents, tool access limits)

CONTEXT RETRIEVAL:
When you need information, you MUST use the defined retrieval methods:
- Project info: query the project registry
- Task status: check task tracker
- Context: load from ContextDocuments only
- Tools: use registered tools only

YOU CANNOT:
- Make up project names that don't exist
- Claim a task is done when it isn't
- Reference tools not in your capability list
- Access files outside defined project paths
- Create relationships that aren't in the ontology

IF YOU DON'T KNOW:
- Check the project registry
- Query the task tracker
- Look up in context documents
- Ask for clarification

RESPONSE FORMAT:
When making claims, cite your source:
- "Project X is active (from project registry)"
- "Task Y is 50% complete (from task tracker)"
- "Tool Z is available (from tool registry)"

This ontology ensures reliable, auditable, autonomous operation.
"""


def build_context_prompt(agent_id: str = None, project_id: str = None) -> str:
    """Build constrained context for agent operation"""
    
    context = ONTOLOGY_SYSTEM_PROMPT + "\n\n"
    
    # Add project info if specified
    if project_id:
        context += f"""CURRENT PROJECT: {project_id}
- Status: (query project registry)
- Dependencies: (query relationships)
- Tasks: (query task tracker)
"""
    
    if agent_id:
        context += f"""CURRENT AGENT: {agent_id}
- Tools: (check capabilities)
- Tasks: (check assigned tasks)
"""
    
    return context


def build_diagnostic_prompt(issue_type: str) -> str:
    """Build prompt for diagnosing issues"""
    
    prompts = {
        "task_failure": """Diagnose task failure:
1. Check task status in tracker
2. Check assigned agent status
3. Check blockers
4. Check recent logs
5. Report findings with evidence""",
        
        "project_stall": """Diagnose project stall:
1. Check project status
2. Check last active time
3. Check task progress
4. Check blocked tasks
5. Report findings""",
        
        "agent_failure": """Diagnose agent failure:
1. Check agent status
2. Check assigned tasks
3. Check tool capabilities
4. Check recent errors
5. Report findings""",
    }
    
    return prompts.get(issue_type, prompts["task_failure"])
