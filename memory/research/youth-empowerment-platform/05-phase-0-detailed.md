# Phase 0: Foundation - Detailed Implementation Guide

## Week 1: Vault + Bot

### Day 1: Project Setup

```bash
# Create project directory
mkdir -p /home/drg/.openclaw/workspace/projects/youth-empowerment-platform
cd /home/drg/.openclaw/workspace/projects/youth-empowerment-platform

# Initialize Python project
python3 -m venv venv
source venv/bin/activate

# Install core dependencies
pip install fastapi uvicorn python-telegram-bot pydantic python-jose
pip install age cryptography
```

#### `requirements.txt`
```
fastapi==0.109.0
uvicorn==0.27.0
python-telegram-bot==20.7
pydantic==2.5.3
python-jose[cryptography]==3.3.0
age==1.1.1
cryptography==42.0.0
```

### Day 2: Vault Manager Module

#### `src/vault/manager.py`
```python
"""
Vault Manager - Handles user encrypted vaults
"""
import os
import json
import shutil
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

VAULT_ROOT = Path("/home/drg/.openclaw/workspace/data/vaults")

@dataclass
class VaultConfig:
    user_id: str
    vault_path: Path
    
class VaultManager:
    """Manages user vaults - creation, loading, saving"""
    
    def __init__(self, vault_root: Path = VAULT_ROOT):
        self.vault_root = vault_root
        self.vault_root.mkdir(parents=True, exist_ok=True)
    
    def create_vault(self, user_id: str, passphrase: str) -> VaultConfig:
        """Create new vault for user"""
        vault_path = self.vault_root / user_id
        
        if vault_path.exists():
            raise ValueError(f"Vault already exists for {user_id}")
        
        # Create directory structure
        (vault_path / ".meta").mkdir(parents=True)
        (vault_path / "private").mkdir(parents=True)
        (vault_path / "public").mkdir(parents=True)
        
        # Initialize manifest
        manifest = {
            "user_id": user_id,
            "created_at": "now",  # TODO: timestamp
            "version": "1.0"
        }
        self._write_encrypted(vault_path / ".meta/manifest.json", manifest, passphrase)
        
        # Initialize default private data
        private_data = {
            "intentions": [],
            "challenges": [],
            "journey_stage": 0,
            "session_history": []
        }
        self._write_encrypted(vault_path / "private/data.json", private_data, passphrase)
        
        # Initialize public profile
        public_data = {
            "skills": [],
            "interests": [],
            "availability": {},
            "contributions": []
        }
        self._write_encrypted(vault_path / "public/profile.json", public_data, passphrase)
        
        return VaultConfig(user_id=user_id, vault_path=vault_path)
    
    def vault_exists(self, user_id: str) -> bool:
        """Check if vault exists"""
        return (self.vault_root / user_id).exists()
    
    def load_vault(self, user_id: str, passphrase: str) -> dict:
        """Load vault data into memory (decrypted)"""
        vault_path = self.vault_root / user_id
        
        if not vault_path.exists():
            raise ValueError(f"No vault found for {user_id}")
        
        # Load and decrypt all files
        data = {}
        
        # Load manifest
        manifest = self._read_decrypted(vault_path / ".meta/manifest.json", passphrase)
        data["meta"] = manifest
        
        # Load private data
        private = self._read_decrypted(vault_path / "private/data.json", passphrase)
        data["private"] = private
        
        # Load public profile
        profile = self._read_decrypted(vault_path / "public/profile.json", passphrase)
        data["public"] = profile
        
        return data
    
    def save_vault(self, user_id: str, passphrase: str, data: dict):
        """Save vault data (encrypted)"""
        vault_path = self.vault_root / user_id
        
        if not vault_path.exists():
            raise ValueError(f"No vault found for {user_id}")
        
        # Save private data
        if "private" in data:
            self._write_encrypted(
                vault_path / "private/data.json", 
                data["private"], 
                passphrase
            )
        
        # Save public profile
        if "public" in data:
            self._write_encrypted(
                vault_path / "public/profile.json",
                data["public"],
                passphrase
            )
    
    def _write_encrypted(self, path: Path, data: dict, passphrase: str):
        """Write encrypted JSON file using age"""
        import subprocess
        
        json_str = json.dumps(data, indent=2)
        
        # Use age to encrypt
        # Passphrase -> age uses scrypt
        proc = subprocess.run(
            ["age", "-p", "--passphrase", "-o", str(path)],
            input=json_str,
            text=True,
            check=True
        )
        
        # For simpler implementation, also store plaintext for development
        # In production, remove this
        # plaintext_path = path.with_suffix('.json')
        # with open(plaintext_path, 'w') as f:
        #     json.dump(data, f, indent=2)
    
    def _read_decrypted(self, path: Path, passphrase: str) -> dict:
        """Read and decrypt JSON file"""
        import subprocess
        
        proc = subprocess.run(
            ["age", "-d", "--passphrase", "-i", str(path)],
            capture_output=True,
            text=True,
            check=True,
            input=passphrase  # This won't work - need different approach
        )
        
        # For development: read plaintext
        plaintext_path = path.with_suffix('.json')
        if plaintext_path.exists():
            with open(plaintext_path, 'r') as f:
                return json.load(f)
        
        raise ValueError(f"Cannot decrypt {path}")
```

**Simpler approach for encryption:** Use PyNaCl instead of age CLI for better programmatic control.

### Day 2 (Revised): Vault with PyNaCl

#### `src/vault/encryption.py`
```python
"""
Encryption utilities using PyNaCl
"""
import os
import json
import base64
from pathlib import Path
from typing import Any

from nacl.secret import SecretBox
from nacl.password_pwhash import argon2id
from nacl import utils

PWHASH_OPSLIMIT = nacl.password_pwhash.argon2id.OPSLIMIT_INTERACTIVE
MEMLIMIT_OPSLIMIT = nacl.password_pwhash.argon2id.MEMLIMIT_INTERACTIVE

def derive_key(passphrase: str, salt: bytes = None) -> tuple[bytes, bytes]:
    """Derive encryption key from passphrase using Argon2id"""
    if salt is None:
        salt = utils.random(argon2id.SALTBYTES)
    
    key = argon2id.kdf(
        passphrase.encode(),
        salt,
        PWHASH_OPSLIMIT,
        MEMLIMIT_OPSLIMIT,
        SecretBox.KEY_BYTES
    )
    return key, salt

def encrypt(data: dict, passphrase: str) -> dict:
    """Encrypt dictionary data"""
    # Derive key
    key, salt = derive_key(passphrase)
    
    # Create box
    box = SecretBox(key)
    
    # Encrypt
    json_str = json.dumps(data)
    nonce = utils.random(SecretBox.NONCE_BYTES)
    encrypted = box.encrypt(json_str.encode(), nonce)
    
    return {
        "salt": base64.b64encode(salt).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "data": base64.b64encode(encrypted).decode()
    }

def decrypt(encrypted_data: dict, passphrase: str) -> dict:
    """Decrypt encrypted dictionary"""
    # Extract components
    salt = base64.b64decode(encrypted_data["salt"])
    nonce = base64.b64decode(encrypted_data["nonce"])
    data = base64.b64decode(encrypted_data["data"])
    
    # Derive key
    key, _ = derive_key(passphrase, salt)
    
    # Decrypt
    box = SecretBox(key)
    json_str = box.decrypt(data, nonce).decode()
    
    return json.loads(json_str)
```

#### `src/vault/manager.py` (Simplified)
```python
"""
Vault Manager - Simple JSON-based encrypted storage
"""
import json
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, asdict

from .encryption import encrypt, decrypt

VAULT_ROOT = Path("/home/drg/.openclaw/workspace/data/vaults")

DEFAULT_PRIVATE = {
    "intentions": [],
    "challenges": [],
    "journey_stage": 0,
    "session_history": [],
    "preferences": {}
}

DEFAULT_PUBLIC = {
    "skills": [],
    "interests": [],
    "availability": {},
    "contributions": [],
    "display_name": ""
}

class VaultManager:
    """Manages user vaults"""
    
    def __init__(self, vault_root: Path = VAULT_ROOT):
        self.vault_root = vault_root
        self.vault_root.mkdir(parents=True, exist_ok=True)
    
    def _vault_path(self, user_id: str) -> Path:
        return self.vault_root / user_id
    
    def _file_path(self, user_id: str, filename: str) -> Path:
        return self._vault_path(user_id) / filename
    
    def create_vault(self, user_id: str, passphrase: str) -> dict:
        """Create new vault for user"""
        vault_path = self._vault_path(user_id)
        
        if vault_path.exists():
            raise ValueError(f"Vault already exists for {user_id}")
        
        vault_path.mkdir(parents=True, exist_ok=True)
        
        # Save encrypted files
        private_encrypted = encrypt(DEFAULT_PRIVATE, passphrase)
        with open(self._file_path(user_id, "private.enc"), 'w') as f:
            json.dump(private_encrypted, f)
        
        public_encrypted = encrypt(DEFAULT_PUBLIC, passphrase)
        with open(self._file_path(user_id, "public.enc"), 'w') as f:
            json.dump(public_encrypted, f)
        
        # Save metadata (not sensitive)
        meta = {"user_id": user_id, "created_at": "now"}
        with open(self._file_path(user_id, "meta.json"), 'w') as f:
            json.dump(meta, f)
        
        return {"user_id": user_id, "status": "created"}
    
    def vault_exists(self, user_id: str) -> bool:
        return self._vault_path(user_id).exists()
    
    def load_vault(self, user_id: str, passphrase: str) -> dict:
        """Load vault into memory (decrypted)"""
        if not self.vault_exists(user_id):
            raise ValueError(f"No vault found for {user_id}")
        
        # Load private
        with open(self._file_path(user_id, "private.enc"), 'r') as f:
            private = decrypt(json.load(f), passphrase)
        
        # Load public
        with open(self._file_path(user_id, "public.enc"), 'r') as f:
            public = decrypt(json.load(f), passphrase)
        
        return {"private": private, "public": public}
    
    def save_vault(self, user_id: str, passphrase: str, data: dict):
        """Save vault data"""
        if not self.vault_exists(user_id):
            raise ValueError(f"No vault found for {user_id}")
        
        if "private" in data:
            private_encrypted = encrypt(data["private"], passphrase)
            with open(self._file_path(user_id, "private.enc"), 'w') as f:
                json.dump(private_encrypted, f)
        
        if "public" in data:
            public_encrypted = encrypt(data["public"], passphrase)
            with open(self._file_path(user_id, "public.enc"), 'w') as f:
                json.dump(public_encrypted, f)
    
    def get_public_profile(self, user_id: str, passphrase: str) -> dict:
        """Get just the public profile (for sharing)"""
        data = self.load_vault(user_id, passphrase)
        return data["public"]
```

### Day 3-4: FastAPI Server

#### `src/api/main.py`
```python
"""
FastAPI server for Youth Empowerment Platform
"""
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid

from vault.manager import VaultManager

app = FastAPI(title="Youth Empowerment Platform API")
vault_manager = VaultManager()

# In-memory session store (for MVP)
# TODO: Replace with secure session management
user_sessions = {}

class CreateVaultRequest(BaseModel):
    user_id: str
    passphrase: str

class VaultData(BaseModel):
    private: Optional[dict] = None
    public: Optional[dict] = None

@app.get("/")
def root():
    return {"status": "ok", "service": "youth-empowerment-platform"}

@app.post("/vault/create")
def create_vault(request: CreateVaultRequest):
    """Create new user vault"""
    try:
        result = vault_manager.create_vault(request.user_id, request.passphrase)
        
        # Create session token
        session_token = str(uuid.uuid4())
        user_sessions[session_token] = {
            "user_id": request.user_id,
            "passphrase": request.passphrase  # In production, never store this!
        }
        
        return {"status": "created", "session_token": session_token}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/vault/{user_id}")
def get_vault(user_id: str, session_token: str):
    """Get user vault data"""
    if session_token not in user_sessions:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    session = user_sessions[session_token]
    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        data = vault_manager.load_vault(user_id, session["passphrase"])
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/vault/{user_id}")
def update_vault(user_id: str, data: VaultData, session_token: str):
    """Update vault data"""
    if session_token not in user_sessions:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    session = user_sessions[session_token]
    if session["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        vault_manager.save_vault(user_id, session["passphrase"], data.dict(exclude_none=True))
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
```

### Day 5: Telegram Bot Integration

#### `src/bot/handler.py`
```python
"""
Telegram bot handlers
"""
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
import requests

API_URL = "http://localhost:3000"

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command"""
    user_id = str(update.effective_user.id)
    
    await update.message.reply_text(
        "Welcome to Youth Empowerment Platform! 🦞\n\n"
        "To get started, I'll create your personal vault.\n"
        "Please set a passphrase (min 8 characters):"
    )
    # TODO: State machine for onboarding

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle regular messages - forward to agent"""
    user_id = str(update.effective_user.id)
    message = update.message.text
    
    # TODO: Get session token from conversation context
    session_token = context.user_data.get("session_token")
    
    if not session_token:
        await update.message.reply_text(
            "Please /start to create your vault first."
        )
        return
    
    # Forward to agent API
    try:
        response = requests.post(
            f"{API_URL}/agent/chat",
            json={"user_id": user_id, "message": message},
            headers={"Authorization": f"Bearer {session_token}"}
        )
        
        if response.status_code == 200:
            await update.message.reply_text(response.json()["response"])
        else:
            await update.message.reply_text("Something went wrong. Try again.")
    except requests.exceptions.ConnectionError:
        await update.message.reply_text("Server unavailable. Please try later.")

def setup_bot():
    """Setup and return bot application"""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    
    application = Application.builder().token(token).build()
    
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    return application
```

---

## Week 2: Agent Runtime

### Day 6-7: Agent Spawner

#### `src/agent/spawner.py`
```python
"""
Agent Spawner - Creates ephemeral agent processes
"""
import subprocess
import json
import os
from pathlib import Path
from typing import Optional
import threading
import time

class AgentSpawner:
    """Manages agent process lifecycle"""
    
    def __init__(self):
        self.agents = {}  # user_id -> process
        self.lock = threading.Lock()
    
    def spawn_agent(self, user_id: str, vault_data: dict) -> str:
        """Spawn new agent process for user"""
        with self.lock:
            # Kill existing agent if any
            if user_id in self.agents:
                self.kill_agent(user_id)
            
            # Create agent config
            config = {
                "user_id": user_id,
                "vault": vault_data,
                "system_prompt": self._get_system_prompt(vault_data)
            }
            
            config_path = Path(f"/tmp/agent_config_{user_id}.json")
            with open(config_path, 'w') as f:
                json.dump(config, f)
            
            # Spawn agent process
            # In MVP: spawn Python script
            # Later: container or serverless
            proc = subprocess.Popen(
                ["python", "-m", "src.agent.runtime", str(config_path)],
                cwd="/home/drg/.openclaw/workspace/projects/youth-empowerment-platform",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            
            self.agents[user_id] = {
                "process": proc,
                "config_path": config_path,
                "started_at": time.time()
            }
            
            return str(proc.pid)
    
    def kill_agent(self, user_id: str):
        """Kill agent process"""
        with self.lock:
            if user_id in self.agents:
                proc = self.agents[user_id]["process"]
                proc.terminate()
                proc.wait(timeout=5)
                
                # Cleanup config
                config_path = self.agents[user_id]["config_path"]
                if config_path.exists():
                    config_path.unlink()
                
                del self.agents[user_id]
    
    def get_agent_status(self, user_id: str) -> dict:
        """Get agent status"""
        if user_id not in self.agents:
            return {"status": "not_running"}
        
        proc = self.agents[user_id]["process"]
        return {
            "status": "running" if proc.poll() is None else "dead",
            "pid": proc.pid,
            "uptime": time.time() - self.agents[user_id]["started_at"]
        }
    
    def _get_system_prompt(self, vault_data: dict) -> str:
        """Generate system prompt from vault data"""
        private = vault_data.get("private", {})
        public = vault_data.get("public", {})
        
        stage = private.get("journey_stage", 0)
        intentions = private.get("intentions", [])
        skills = public.get("skills", [])
        
        return f"""You are a helpful AI guide for a youth empowerment platform.

The user is at journey stage {stage}.
Skills: {', '.join(skills) if skills else 'Not specified'}
Intentions: {', '.join(intentions) if intentions else 'Not specified'}

Guide the user through their personal transformation journey.
Be supportive, ask clarifying questions, and help them discover opportunities.

Remember:
- Keep responses concise and actionable
- Focus on the user's stated objectives
- Help them progress in their journey
- Never share their private data with others
"""
```

### Day 8-9: Agent Runtime

#### `src/agent/runtime.py`
```python
"""
Agent Runtime - Processes user messages
"""
import json
import sys
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

# Simple in-memory chat (for MVP)
# Later: integrate with LLM API

class AgentRuntime:
    """Ephemeral agent that processes user messages"""
    
    def __init__(self, config_path: str):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        
        self.user_id = self.config["user_id"]
        self.vault = self.config["vault"]
        self.system_prompt = self.config["system_prompt"]
        self.conversation_history = []
    
    def process_message(self, user_message: str) -> str:
        """Process user message and generate response"""
        # Add to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        # Simple response generation (MCP/placeholder)
        # In production: call LLM API
        response = self._generate_response(user_message)
        
        # Add response to history
        self.conversation_history.append({
            "role": "assistant", 
            "content": response
        })
        
        return response
    
    def _generate_response(self, user_message: str) -> str:
        """Generate response - placeholder for LLM"""
        # Simple keyword-based responses for MVP
        msg_lower = user_message.lower()
        
        if any(word in msg_lower for word in ["hello", "hi", "hey"]):
            return "Hello! How can I help you on your journey today?"
        
        if "journey" in msg_lower:
            stage = self.vault.get("private", {}).get("journey_stage", 0)
            stages = [
                "Ordinary World", "Call to Adventure", "Departure",
                "Meeting the Mentor", "Tests and Trials", "Ordeal",
                "Reward", "Return", "Transformation", "Elixir"
            ]
            return f"You're currently at stage: {stages[stage]}. Would you like to know more?"
        
        if "intention" in msg_lower:
            return "Let's explore your intentions. What would you like to achieve?"
        
        if "challenge" in msg_lower:
            return "Every hero faces challenges. What challenge are you facing?"
        
        # Default
        return "I'm here to guide you. Tell me more about what you're working on."
    
    def save_context(self):
        """Save agent context to vault (called before exit)"""
        # Update vault with conversation summary
        private = self.vault.get("private", {})
        
        # Add conversation summary
        if "session_history" not in private:
            private["session_history"] = []
        
        # Keep last 5 sessions
        private["session_history"].append({
            "timestamp": "now",
            "messages": self.conversation_history[-10:]  # Last 10 messages
        })
        
        if len(private["session_history"]) > 5:
            private["session_history"] = private["session_history"][-5:]
        
        return private


# Entry point for spawned agent
if __name__ == "__main__":
    config_path = sys.argv[1] if len(sys.argv) > 1 else None
    
    if not config_path:
        print("No config path provided")
        sys.exit(1)
    
    agent = AgentRuntime(config_path)
    
    # Read message from stdin (passed by spawner)
    # For now, just print config and exit
    print(f"Agent started for user: {agent.user_id}")
    print(f"System prompt: {agent.system_prompt[:200]}...")
```

### Day 10: Integration Testing

Test the complete flow:
1. Create vault via API
2. Send message via bot
3. Agent spawns
4. Response generated
5. Context saved

---

## Phase 0 Success Criteria

| Criterion | Test |
|-----------|------|
| Vault created | `POST /vault/create` returns success |
| Data encrypted | Vault files are `.enc`, unreadable without passphrase |
| Bot responds | Send message, get response |
| Agent has context | Agent knows user's journey stage |
| Memory wiped | Process exits, no leftover data |
| Cold start <5s | Time from message to response |

---

*Phase 0 Implementation Guide: 2026-03-14*
*Ready to build*
