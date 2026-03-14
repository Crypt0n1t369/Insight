"""
Vault Manager - Handles user encrypted vaults
"""
import json
from pathlib import Path
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict
import uuid
from datetime import datetime

from .encryption import encrypt, decrypt

# Default vault structure
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

DEFAULT_META = {
    "version": "1.0",
    "created_at": None,
    "updated_at": None
}


@dataclass
class VaultConfig:
    """Vault configuration"""
    user_id: str
    vault_path: Path


class VaultManager:
    """Manages user vaults - creation, loading, saving"""
    
    def __init__(self, vault_root: Optional[Path] = None):
        if vault_root is None:
            vault_root = Path("/home/drg/.openclaw/workspace/data/vaults")
        
        self.vault_root = vault_root
        self.vault_root.mkdir(parents=True, exist_ok=True)
    
    def _vault_path(self, user_id: str) -> Path:
        """Get vault directory path for user"""
        return self.vault_root / user_id
    
    def _file_path(self, user_id: str, filename: str) -> Path:
        """Get file path within vault"""
        return self._vault_path(user_id) / filename
    
    def create_vault(self, user_id: str, passphrase: str, username: str = "") -> Dict[str, Any]:
        """
        Create new vault for user.
        
        Args:
            user_id: Unique user identifier
            passphrase: Encryption passphrase (min 8 chars recommended)
            username: Optional display name
        
        Returns:
            Dictionary with creation status
        
        Raises:
            ValueError: If vault already exists
        """
        if self.vault_exists(user_id):
            raise ValueError(f"Vault already exists for user: {user_id}")
        
        if len(passphrase) < 4:
            raise ValueError("Passphrase too short (minimum 4 characters)")
        
        # Create vault directory
        vault_path = self._vault_path(user_id)
        vault_path.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().isoformat()
        
        # Initialize metadata
        meta = DEFAULT_META.copy()
        meta["created_at"] = timestamp
        meta["updated_at"] = timestamp
        meta["user_id"] = user_id
        
        # Initialize private data
        private = DEFAULT_PRIVATE.copy()
        
        # Initialize public profile
        public = DEFAULT_PUBLIC.copy()
        if username:
            public["display_name"] = username
        
        # Encrypt and save files
        self._save_encrypted(user_id, "meta.json", meta, passphrase)
        self._save_encrypted(user_id, "private.json", private, passphrase)
        self._save_encrypted(user_id, "public.json", public, passphrase)
        
        return {
            "user_id": user_id,
            "status": "created",
            "vault_path": str(vault_path)
        }
    
    def vault_exists(self, user_id: str) -> bool:
        """Check if vault exists for user"""
        vault_path = self._vault_path(user_id)
        return vault_path.exists() and (vault_path / "private.json.enc").exists()
    
    def load_vault(self, user_id: str, passphrase: str) -> Dict[str, Any]:
        """
        Load vault data into memory (decrypted).
        
        Args:
            user_id: User identifier
            passphrase: Decryption passphrase
        
        Returns:
            Dictionary with 'private', 'public', and 'meta' keys
        
        Raises:
            ValueError: If vault doesn't exist or decryption fails
        """
        if not self.vault_exists(user_id):
            raise ValueError(f"No vault found for user: {user_id}")
        
        # Load and decrypt all files
        data = {
            "meta": self._load_decrypted(user_id, "meta.json", passphrase),
            "private": self._load_decrypted(user_id, "private.json", passphrase),
            "public": self._load_decrypted(user_id, "public.json", passphrase)
        }
        
        return data
    
    def save_vault(self, user_id: str, passphrase: str, data: Dict[str, Any]):
        """
        Save vault data (encrypted).
        
        Args:
            user_id: User identifier
            passphrase: Encryption passphrase
            data: Dictionary with optional 'private', 'public', or 'meta' keys
        """
        if not self.vault_exists(user_id):
            raise ValueError(f"No vault found for user: {user_id}")
        
        timestamp = datetime.now().isoformat()
        
        # Update metadata timestamp
        if "meta" in data:
            meta = data["meta"]
            meta["updated_at"] = timestamp
            self._save_encrypted(user_id, "meta.json", meta, passphrase)
        
        # Save private data
        if "private" in data:
            self._save_encrypted(user_id, "private.json", data["private"], passphrase)
        
        # Save public profile
        if "public" in data:
            self._save_encrypted(user_id, "public.json", data["public"], passphrase)
    
    def update_private(self, user_id: str, passphrase: str, updates: Dict[str, Any]):
        """Update specific fields in private vault data"""
        data = self.load_vault(user_id, passphrase)
        data["private"].update(updates)
        self.save_vault(user_id, passphrase, data)
    
    def update_public(self, user_id: str, passphrase: str, updates: Dict[str, Any]):
        """Update specific fields in public profile"""
        data = self.load_vault(user_id, passphrase)
        data["public"].update(updates)
        self.save_vault(user_id, passphrase, data)
    
    def get_journey_stage(self, user_id: str, passphrase: str) -> int:
        """Get user's current journey stage"""
        data = self.load_vault(user_id, passphrase)
        return data.get("private", {}).get("journey_stage", 0)
    
    def advance_journey(self, user_id: str, passphrase: str, reflection: str = "") -> int:
        """Advance user to next journey stage"""
        data = self.load_vault(user_id, passphrase)
        
        current_stage = data["private"].get("journey_stage", 0)
        
        if current_stage >= 9:
            return current_stage  # Already at max
        
        # Add milestone
        if "milestones" not in data["private"]:
            data["private"]["milestones"] = []
        
        data["private"]["milestones"].append({
            "stage": current_stage,
            "completed_at": datetime.now().isoformat(),
            "reflection": reflection
        })
        
        # Advance stage
        data["private"]["journey_stage"] = current_stage + 1
        
        self.save_vault(user_id, passphrase, data)
        
        return current_stage + 1
    
    def _save_encrypted(self, user_id: str, filename: str, data: Dict, passphrase: str):
        """Save encrypted JSON file"""
        encrypted = encrypt(data, passphrase)
        file_path = self._file_path(user_id, filename + ".enc")
        
        with open(file_path, 'w') as f:
            json.dump(encrypted, f, indent=2)
    
    def _load_decrypted(self, user_id: str, filename: str, passphrase: str) -> Dict:
        """Load and decrypt JSON file"""
        file_path = self._file_path(user_id, filename + ".enc")
        
        with open(file_path, 'r') as f:
            encrypted_data = json.load(f)
        
        return decrypt(encrypted_data, passphrase)
    
    def delete_vault(self, user_id: str):
        """Delete user's vault (use with caution!)"""
        import shutil
        vault_path = self._vault_path(user_id)
        
        if vault_path.exists():
            shutil.rmtree(vault_path)
    
    def list_vaults(self) -> list[str]:
        """List all existing vault user IDs"""
        if not self.vault_root.exists():
            return []
        
        return [
            d.name for d in self.vault_root.iterdir()
            if d.is_dir() and (d / "private.json.enc").exists()
        ]


# Singleton instance
_default_manager: Optional[VaultManager] = None


def get_vault_manager() -> VaultManager:
    """Get default vault manager instance"""
    global _default_manager
    if _default_manager is None:
        _default_manager = VaultManager()
    return _default_manager
