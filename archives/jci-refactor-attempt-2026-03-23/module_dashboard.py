from pathlib import Path
import json
from typing import Dict, List

class ModuleDashboard:
    def __init__(self):
        self.modules = self._load_modules()
        self.active_modules = self._get_active_modules()
    
    def _load_modules(self) -> Dict[str, Dict]:
        """Load module configurations."""
        modules_dir = Path(__file__).parent.parent.parent / "projects"
        modules = {}
        
        for module_dir in modules_dir.iterdir():
            if module_dir.is_dir():
                config_path = module_dir / "module-config.json"
                if config_path.exists():
                    with open(config_path) as f:
                        try:
                            config = json.load(f)
                            modules[config["module_name"]] = config
                        except json.JSONDecodeError:
                            continue
        
        return modules
    
    def _get_active_modules(self) -> List[str]:
        """Get list of active modules."""
        # Mock implementation - in real system this would check actual module state
        # For now, return all modules as active for demo purposes
        return list(self.modules.keys())
    
    def get_module_status(self, module_name: str) -> Dict:
        """Get status of a specific module."""
        if module_name not in self.modules:
            return {"status": "not_found", "error": "Module not found"}
        
        config = self.modules[module_name]
        status = "active" if module_name in self.active_modules else "inactive"
        
        return {
            "name": module_name,
            "status": status,
            "type": config["integration_type"],
            "features": config["features"],
            "permissions": config["permissions"],
            "activation_commands": config["activation_commands"]
        }
    
    def get_all_module_statuses(self) -> List[Dict]:
        """Get status of all modules."""
        statuses = []
        
        for module_name in self.modules.keys():
            statuses.append(self.get_module_status(module_name))
        
        return statuses
    
    def get_dashboard_html(self) -> str:
        """Generate HTML for module dashboard."""
        modules = self.get_all_module_statuses()
        
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Module Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .module-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; }
                .active { border-left: 4px solid #28a745; }
                .inactive { border-left: 4px solid #dc3545; }
                .module-name { font-weight: bold; font-size: 1.2em; }
                .module-type { color: #666; font-size: 0.9em; }
                .features { margin: 10px 0; }
                .feature { display: inline-block; background: #e9ecef; padding: 2px 8px; border-radius: 4px; margin: 2px; }
                .status-badge { float: right; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; }
                .active-status { background: #28a745; color: white; }
                .inactive-status { background: #dc3545; color: white; }
                .commands { margin-top: 10px; }
                .command { display: inline-block; background: #007bff; color: white; padding: 2px 6px; border-radius: 3px; margin: 2px; cursor: pointer; }
            </style>
        </head>
        <body>
            <h1>Module Dashboard</h1>
            <p>Click a command to activate/deactivate modules</p>
        """
        
        for module in modules:
            html += f"""
            <div class="module-card {'active' if module['status'] == 'active' else 'inactive'}">
                <div class="module-name">{module['name']}</div>
                <div class="module-type">{module['type']}</div>
                <div class="status-badge {'active-status' if module['status'] == 'active' else 'inactive-status'}">
                    {module['status'].capitalize()}
                </div>
                <div class="features">
                    <strong>Features:</strong><br>
                    {''.join(f'<span class="feature">{feature}</span>' for feature in module['features'])}
                </div>
                <div class="commands">
                    <strong>Commands:</strong><br>
                    {''.join(f'<span class="command">/{cmd}</span>' for cmd in module['activation_commands'])}
                </div>
            </div>
            """
        
        html += """
        </body>
        </html>
        """
        
        return html
    
    def get_module_toggles(self) -> str:
        """Generate HTML for module toggle interface."""
        modules = self.get_all_module_statuses()
        
        html = """
        <div class="module-toggles">
            <h2>Module Controls</h2>
        """
        
        for module in modules:
            html += f"""
            <div class="module-toggle">
                <h3>{module['name']}</h3>
                <p>Status: <strong>{module['status'].capitalize()}</strong></p>
                <p>Type: {module['type']}</p>
                <p>Features: {', '.join(module['features'])}</p>
                <div class="toggle-buttons">
                    <button onclick="toggleModule('{module['name']}', 'enable')">Enable</button>
                    <button onclick="toggleModule('{module['name']}', 'disable')">Disable</button>
                </div>
            </div>
            """
        
        html += "</div>"
        return html