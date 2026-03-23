import asyncio
from pathlib import Path
from typing import Dict, List, Optional
import aiohttp
import json

class TelegramBotModule:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = f"https://api.telegram.org/bot{api_key}"
        self.modules = self._load_modules()
        
    def _load_modules(self) -> Dict[str, Dict]:
        """Load module configurations from project directories."""
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
    
    async def handle_update(self, update: dict) -> Optional[str]:
        """Process incoming Telegram update."""
        if "message" not in update:
            return None
        
        message = update["message"]
        text = message.get("text", "")
        chat_id = message["chat"]["id"]
        
        # Check for module activation commands
        for module_name, config in self.modules.items():
            for command in config["activation_commands"]:
                if text.startswith(command):
                    return await self._handle_module_activation(
                        module_name, config, chat_id
                    )
        
        return None
    
    async def _handle_module_activation(
        self, module_name: str, config: dict, chat_id: int
    ) -> str:
        """Handle module activation logic."""
        # Check permissions
        if not await self._check_permissions(chat_id, config["permissions"]):
            return f"🔴 Insufficient permissions for {module_name}"
        
        # Check module status
        status = await self._get_module_status(module_name)
        
        if status == "active":
            return f"📋 {module_name} is already active"
        
        # Activate module
        if await self._activate_module(module_name, config):
            return f"✅ {module_name} activated successfully"
        else:
            return f"❌ Failed to activate {module_name}"
    
    async def _check_permissions(
        self, chat_id: int, permissions: dict
    ) -> bool:
        """Check if user has required permissions."""
        # Mock permission check - in real implementation this would
        # check against a database or user roles system
        required_roles = permissions.get("required_roles", [])
        
        # For now, allow admin and moderator roles
        if "admin" in required_roles or "moderator" in required_roles:
            return True
        
        return False
    
    async def _get_module_status(self, module_name: str) -> str:
        """Get current module status."""
        # Mock status - in real implementation this would check actual module state
        # For now, return 'inactive' to allow activation
        return "inactive"
    
    async def _activate_module(
        self, module_name: str, config: dict
    ) -> bool:
        """Activate the module."""
        # Mock activation - in real implementation this would:
        # 1. Start the module service
        # 2. Register it with the main system
        # 3. Return success/failure
        
        print(f"Activating module: {module_name}")
        return True
    
    async def send_message(self, chat_id: int, text: str) -> bool:
        """Send message to Telegram chat."""
        url = f"{self.base_url}/sendMessage"
        params = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=params) as response:
                return response.status == 200

class TelegramBotHandler:
    def __init__(self, api_key: str):
        self.bot = TelegramBotModule(api_key)
        self.commands = self._setup_commands()
    
    def _setup_commands(self) -> Dict[str, str]:
        """Set up command descriptions."""
        commands = {}
        
        for module_name, config in self.bot.modules.items():
            for command in config["activation_commands"]:
                commands[command] = f"Activate {module_name}"
        
        return commands
    
    async def handle_command(self, command: str, chat_id: int) -> str:
        """Handle direct command execution."""
        if command not in self.commands:
            return "Unknown command"
        
        # Find the module for this command
        for module_name, config in self.bot.modules.items():
            if command in config["activation_commands"]:
                return await self.bot._handle_module_activation(
                    module_name, config, chat_id
                )
        
        return "Command processing failed"
    
    def get_command_list(self) -> str:
        """Get formatted list of available commands."""
        if not self.commands:
            return "No modules available"
        
        command_list = "Available commands:\n\n"
        for command, description in self.commands.items():
            command_list += f"/{command} - {description}\n"
        
        return command_list