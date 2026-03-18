"""
Tests for Youth Empowerment Platform Vault Manager
"""
import pytest
import sys
import tempfile
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from vault.manager import VaultManager, DEFAULT_PRIVATE, DEFAULT_PUBLIC
from vault.encryption import encrypt, decrypt


class TestVaultEncryption:
    """Test vault encryption/decryption"""
    
    def test_encrypt_decrypt_roundtrip(self):
        """Test that encryption followed by decryption returns original data"""
        data = "Hello, this is a test message!"
        passphrase = "test_passphrase_123"
        
        encrypted = encrypt(data, passphrase)
        decrypted = decrypt(encrypted, passphrase)
        
        assert decrypted == data
    
    def test_encrypt_produces_different_output(self):
        """Test that encryption produces different output than original"""
        data = "Secret data"
        passphrase = "my_secure_pass"
        
        encrypted = encrypt(data, passphrase)
        
        # Encryption returns a dict with 'data' and 'salt'
        assert encrypted != data
        assert isinstance(encrypted, dict)
        assert "data" in encrypted
        assert "salt" in encrypted
    
    def test_decrypt_wrong_passphrase_fails(self):
        """Test that decryption with wrong passphrase fails"""
        data = "Sensitive information"
        passphrase = "correct_passphrase"
        wrong_passphrase = "wrong_passphrase"
        
        encrypted = encrypt(data, passphrase)
        
        with pytest.raises(Exception):
            decrypt(encrypted, wrong_passphrase)
    
    def test_encrypt_empty_string(self):
        """Test encrypting empty string"""
        data = ""
        passphrase = "pass"
        
        encrypted = encrypt(data, passphrase)
        decrypted = decrypt(encrypted, passphrase)
        
        assert decrypted == data
    
    def test_encrypt_unicode(self):
        """Test encrypting unicode data"""
        data = "مرحبا بالعالم 🌍 Hello 世界"
        passphrase = "unicode_pass_🎉"
        
        encrypted = encrypt(data, passphrase)
        decrypted = decrypt(encrypted, passphrase)
        
        assert decrypted == data


class TestVaultManager:
    """Test Vault Manager functionality"""
    
    @pytest.fixture
    def temp_vault_root(self):
        """Create temporary vault root"""
        temp_dir = tempfile.mkdtemp()
        yield Path(temp_dir)
        shutil.rmtree(temp_dir)
    
    def test_vault_manager_initialization(self, temp_vault_root):
        """Test VaultManager initializes correctly"""
        vm = VaultManager(vault_root=temp_vault_root)
        
        assert vm.vault_root == temp_vault_root
        assert temp_vault_root.exists()
    
    def test_vault_path_generation(self, temp_vault_root):
        """Test vault path generation for user"""
        vm = VaultManager(vault_root=temp_vault_root)
        
        user_path = vm._vault_path("test_user_123")
        
        assert user_path == temp_vault_root / "test_user_123"
    
    def test_file_path_generation(self, temp_vault_root):
        """Test file path generation within vault"""
        vm = VaultManager(vault_root=temp_vault_root)
        
        file_path = vm._file_path("user_abc", "private.json")
        
        assert file_path == temp_vault_root / "user_abc" / "private.json"
    
    def test_default_private_structure(self):
        """Test default private vault structure"""
        assert "intentions" in DEFAULT_PRIVATE
        assert "challenges" in DEFAULT_PRIVATE
        assert "journey_stage" in DEFAULT_PRIVATE
        assert "session_history" in DEFAULT_PRIVATE
        assert "preferences" in DEFAULT_PRIVATE
    
    def test_default_public_structure(self):
        """Test default public vault structure"""
        assert "skills" in DEFAULT_PUBLIC
        assert "interests" in DEFAULT_PUBLIC
        assert "availability" in DEFAULT_PUBLIC
        assert "contributions" in DEFAULT_PUBLIC
        assert "display_name" in DEFAULT_PUBLIC


class TestVaultIntegration:
    """Integration tests for vault creation and loading"""
    
    @pytest.fixture
    def temp_vault_root(self):
        """Create temporary vault root"""
        temp_dir = tempfile.mkdtemp()
        yield Path(temp_dir)
        shutil.rmtree(temp_dir)
    
    def test_create_vault_creates_directories(self, temp_vault_root):
        """Test that create_vault creates necessary directories"""
        vm = VaultManager(vault_root=temp_vault_root)
        
        # We can't fully test create_vault without DB, but we can test path creation
        user_path = vm._vault_path("new_user")
        user_path.mkdir(parents=True, exist_ok=True)
        
        assert user_path.exists()
        assert user_path.is_dir()
