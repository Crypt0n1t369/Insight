from aiohttp import web
import json
from pathlib import Path
from module_dashboard import ModuleDashboard

async def handle_module_status(request):
    """API endpoint to get module status."""
    dashboard = ModuleDashboard()
    module_name = request.match_info.get('name', None)
    
    if module_name:
        status = dashboard.get_module_status(module_name)
        return web.json_response(status)
    else:
        statuses = dashboard.get_all_module_statuses()
        return web.json_response(statuses)

async def handle_module_dashboard(request):
    """API endpoint to get module dashboard HTML."""
    dashboard = ModuleDashboard()
    html = dashboard.get_dashboard_html()
    return web.Response(text=html, content_type='text/html')

async def handle_module_toggles(request):
    """API endpoint to get module toggle interface."""
    dashboard = ModuleDashboard()
    html = dashboard.get_module_toggles()
    return web.Response(text=html, content_type='text/html')

async def handle_module_commands(request):
    """API endpoint to get available module commands."""
    dashboard = ModuleDashboard()
    modules = dashboard.get_all_module_statuses()
    
    commands = {}
    for module in modules:
        for command in module['activation_commands']:
            commands[command] = {
                'module': module['name'],
                'description': f"Activate {module['name']}",
                'status': module['status']
            }
    
    return web.json_response(commands)

async def handle_module_activate(request):
    """API endpoint to activate a module."""
    data = await request.json()
    module_name = data.get('module_name', '')
    action = data.get('action', 'enable')
    
    dashboard = ModuleDashboard()
    
    if module_name not in [m['name'] for m in dashboard.get_all_module_statuses()]:
        return web.json_response({
            'ok': False,
            'error': 'Module not found'
        }, status=404)
    
    # Mock activation - in real implementation this would:
    # 1. Start the module service
    # 2. Register it with the main system
    # 3. Return success/failure
    
    if action == 'enable':
        result = "Module activated successfully"  # Mock success
    else:
        result = "Module deactivated successfully"  # Mock success
    
    return web.json_response({
        'ok': True,
        'result': result,
        'module': module_name,
        'action': action
    })

def setup_module_routes(app):
    """Setup module-related routes."""
    app.router.add_get('/api/modules/status', handle_module_status)
    app.router.add_get('/api/modules/status/{name}', handle_module_status)
    app.router.add_get('/api/modules/dashboard', handle_module_dashboard)
    app.router.add_get('/api/modules/toggles', handle_module_toggles)
    app.router.get('/api/modules/commands', handle_module_commands)
    app.router.post('/api/modules/activate', handle_module_activate)