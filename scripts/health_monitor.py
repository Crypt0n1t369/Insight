#!/usr/bin/env python3
"""
OpenClaw Ontology Health Monitor

Runs continuously and provides actionable alerts.
"""

import time
import json
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add ontology to path
ONTOLOGY_PATH = Path(__file__).parent.parent / "ontology"
sys.path.insert(0, str(ONTOLOGY_PATH.absolute()))

from ontology import ProjectRegistry, TaskTracker, OntologyDiagnostics, Status


class HealthMonitor:
    """Continuous health monitoring with actionable alerts"""
    
    def __init__(self, workspace: Path):
        self.workspace = workspace
        self.registry = ProjectRegistry(workspace)
        self.tracker = TaskTracker(workspace)
        self.diag = OntologyDiagnostics(workspace)
        
        # Thresholds
        self.stale_hours = 24
        self.max_blocked = 5
    
    def check(self) -> dict:
        """Run all health checks"""
        health = self.diag.system_health()
        alerts = []
        
        # Check 1: Failed projects
        for p in self.registry.list_projects():
            if p.status == Status.FAILED:
                alerts.append({
                    "severity": "critical",
                    "type": "project_failed",
                    "project": p.id,
                    "message": f"Project '{p.name}' has failed status",
                    "action": f"Run: diagnose-project {p.id}"
                })
        
        # Check 2: Stale projects (no activity)
        for p in self.registry.list_projects():
            if p.last_active:
                last = p.last_active if isinstance(p.last_active, datetime) else datetime.fromisoformat(p.last_active)
                if datetime.now() - last > timedelta(hours=self.stale_hours):
                    alerts.append({
                        "severity": "warning",
                        "type": "project_stale",
                        "project": p.id,
                        "message": f"Project '{p.name}' inactive for {self.stale_hours}+ hours",
                        "action": f"Review or archive: {p.id}"
                    })
        
        # Check 3: Blocked tasks
        blocked = self.tracker.get_blocked_tasks()
        if len(blocked) > self.max_blocked:
            alerts.append({
                "severity": "warning",
                "type": "too_many_blocked",
                "count": len(blocked),
                "message": f"{len(blocked)} tasks are blocked",
                "action": "Review blocker chains"
            })
        
        # Check 4: Failed tasks
        failed = self.tracker.get_tasks_by_status(Status.FAILED)
        for t in failed:
            alerts.append({
                "severity": "critical",
                "type": "task_failed",
                "task": t.id,
                "message": f"Task '{t.title}' has failed",
                "action": f"Run: diagnose-task {t.id}"
            })
        
        # Check 5: Tasks stuck in progress
        running = self.tracker.get_tasks_by_status(Status.RUNNING)
        for t in running:
            # Could add time-based stale check here
            pass
        
        return {
            "timestamp": datetime.now().isoformat(),
            "health": health,
            "alerts": alerts,
            "summary": {
                "total_alerts": len(alerts),
                "critical": len([a for a in alerts if a["severity"] == "critical"]),
                "warning": len([a for a in alerts if a["severity"] == "warning"])
            }
        }
    
    def format_alerts(self, result: dict) -> str:
        """Format alerts for display"""
        lines = []
        lines.append(f"🖥️  Health Check - {result['timestamp'][:19]}")
        lines.append(f"   Projects: {result['health']['projects']['total']} | Tasks: {result['health']['tasks']['total']}")
        
        if not result["alerts"]:
            lines.append("   ✅ No issues")
        else:
            lines.append(f"   ⚠️  {result['summary']['total_alerts']} alerts ({result['summary']['critical']} critical)")
            for alert in result["alerts"]:
                emoji = "🔴" if alert["severity"] == "critical" else "🟡"
                lines.append(f"   {emoji} {alert['message']}")
                lines.append(f"      → {alert['action']}")
        
        return "\n".join(lines)


def main():
    workspace = Path('/home/drg/.openclaw/workspace')
    monitor = HealthMonitor(workspace)
    
    result = monitor.check()
    print(monitor.format_alerts(result))
    
    # Exit with error code if critical alerts
    if result["summary"]["critical"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
