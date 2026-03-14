"""
Encryption utilities using Python cryptography library
Uses Fernet (AES) with key derivation via scrypt
"""
import json
import base64
import os
import hashlib
from pathlib import Path
from typing import Any, Dict

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend

# Derivation parameters
SALT_LENGTH = 16
ITERATIONS = 480000  # OWASP recommended minimum


def derive_key(passphrase: str, salt: bytes = None) -> tuple[bytes, bytes]:
    """
    Derive encryption key from passphrase using PBKDF2-SHA256.
    
    Args:
        passphrase: User's passphrase
        salt: Optional salt (generated if not provided)
    
    Returns:
        Tuple of (key, salt)
    """
    if salt is None:
        salt = os.urandom(SALT_LENGTH)
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # Fernet key size
        salt=salt,
        iterations=ITERATIONS,
        backend=default_backend()
    )
    
    key = base64.urlsafe_b64encode(kdf.derive(passphrase.encode('utf-8')))
    return key, salt


def encrypt(data: Dict[str, Any], passphrase: str) -> Dict[str, str]:
    """
    Encrypt dictionary data using Fernet (AES-128-CBC with HMAC).
    
    Args:
        data: Dictionary to encrypt
        passphrase: Passphrase for encryption
    
    Returns:
        Dictionary with salt and encrypted data (base64 encoded)
    """
    # Derive key from passphrase
    key, salt = derive_key(passphrase)
    
    # Create Fernet cipher
    fernet = Fernet(key)
    
    # Serialize data to JSON
    json_str = json.dumps(data, ensure_ascii=False)
    
    # Encrypt
    encrypted = fernet.encrypt(json_str.encode('utf-8'))
    
    return {
        "salt": base64.b64encode(salt).decode('utf-8'),
        "data": base64.b64encode(encrypted).decode('utf-8')
    }


def decrypt(encrypted_data: Dict[str, str], passphrase: str) -> Dict[str, Any]:
    """
    Decrypt data encrypted with encrypt().
    
    Args:
        encrypted_data: Dictionary with salt, data
        passphrase: Passphrase used for encryption
    
    Returns:
        Decrypted dictionary
    
    Raises:
        ValueError: If decryption fails (wrong passphrase)
    """
    # Decode components
    salt = base64.b64decode(encrypted_data["salt"])
    data = base64.b64decode(encrypted_data["data"])
    
    # Derive key
    key, _ = derive_key(passphrase, salt)
    
    # Decrypt
    fernet = Fernet(key)
    
    try:
        json_str = fernet.decrypt(data).decode('utf-8')
        return json.loads(json_str)
    except Exception as e:
        raise ValueError("Decryption failed - wrong passphrase or corrupted data") from e


def encrypt_file(input_path: Path, output_path: Path, passphrase: str):
    """
    Encrypt a file and save to output path.
    
    Args:
        input_path: Path to plaintext file
        output_path: Path for encrypted file
        passphrase: Passphrase for encryption
    """
    with open(input_path, 'r') as f:
        data = json.load(f)
    
    encrypted = encrypt(data, passphrase)
    
    with open(output_path, 'w') as f:
        json.dump(encrypted, f, indent=2)


def decrypt_file(encrypted_path: Path, passphrase: str) -> Dict[str, Any]:
    """
    Decrypt an encrypted file.
    
    Args:
        encrypted_path: Path to encrypted file
        passphrase: Passphrase for decryption
    
    Returns:
        Decrypted dictionary
    """
    with open(encrypted_path, 'r') as f:
        encrypted_data = json.load(f)
    
    return decrypt(encrypted_data, passphrase)


# Test function
def test_encryption():
    """Test encryption/decryption roundtrip"""
    test_data = {
        "name": "Test User",
        "intentions": ["learn", "grow"],
        "journey_stage": 1,
        "nested": {"key": "value", "list": [1, 2, 3]}
    }
    
    passphrase = "test_password_123"
    
    # Encrypt
    encrypted = encrypt(test_data, passphrase)
    print("Encrypted:", json.dumps(encrypted, indent=2))
    
    # Decrypt
    decrypted = decrypt(encrypted, passphrase)
    print("Decrypted:", decrypted)
    
    # Verify
    assert decrypted == test_data, "Decryption failed!"
    print("✓ Encryption test passed")
    
    # Test wrong passphrase
    try:
        decrypt(encrypted, "wrong_password")
        assert False, "Should have raised error"
    except ValueError:
        print("✓ Wrong passphrase correctly rejected")
    
    # Test with unicode
    unicode_data = {"name": "Tēst Üser", "emoji": "🎉"}
    enc = encrypt(unicode_data, passphrase)
    dec = decrypt(enc, passphrase)
    assert dec == unicode_data
    print("✓ Unicode test passed")


if __name__ == "__main__":
    test_encryption()
