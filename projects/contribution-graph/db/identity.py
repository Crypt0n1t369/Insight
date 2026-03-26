"""
Contribution Graph — Identity Utilities
Short-code generation and verification

Based on: IDENTITY-ARCHITECTURE.md
Generated: 2026-03-26
"""

import hashlib
import secrets
import re
from typing import Optional

# Server secret (set via environment variable — never hardcode)
# The short_code is deterministic per user_id: same user always gets same code
SERVER_SECRET = __import__("os").getenv("CG_SERVER_SECRET", "")

if not SERVER_SECRET:
    import warnings
    warnings.warn(
        "CG_SERVER_SECRET not set. Short-code generation will use empty secret "
        "(only suitable for development/testing)."
    )

SHORT_CODE_PREFIX = "CG-"
SHORT_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
SHORT_CODE_LENGTH = 6  # Characters after prefix


def generate_short_code(user_id: int) -> str:
    """
    Generate a user-specific short code that is:
    - Unique per user (different codes for different users)
    - Unguessable without knowing user_id + SERVER_SECRET
    - Deterministic (same user_id always gets same code — for consistency)

    Format: CG-[A-Z0-9]{6}  (e.g. CG-X7K2M9)

    Args:
        user_id: The Telegram user_id (from message.from.id)

    Returns:
        A short code string, e.g. "CG-X7K2M9"
    """
    if not SERVER_SECRET:
        # Insecure fallback for dev — use random code
        code_chars = "".join(
            secrets.choice(SHORT_CODE_CHARS) for _ in range(SHORT_CODE_LENGTH)
        )
        return f"{SHORT_CODE_PREFIX}{code_chars}"

    raw = f"{user_id}:{SERVER_SECRET}"
    token = hashlib.sha256(raw.encode()).hexdigest()[:SHORT_CODE_LENGTH].upper()
    # Ensure all chars are valid (hex might include D-F which is fine)
    return f"{SHORT_CODE_PREFIX}{token}"


def verify_short_code(user_id: int, code: str) -> bool:
    """
    Verify that a provided short_code matches the expected code for a user_id.

    Used for cross-channel identity verification (e.g. user claims code via web).

    Args:
        user_id: The Telegram user_id
        code: The short_code to verify (e.g. "CG-X7K2M9")

    Returns:
        True if the code is valid for this user_id, False otherwise
    """
    expected = generate_short_code(user_id)
    # Constant-time comparison to prevent timing attacks
    return secrets.compare_digest(expected, code.upper())


def parse_short_code(code: str) -> Optional[str]:
    """
    Validate and parse a short_code string.

    Args:
        code: Raw input (may have whitespace, mixed case)

    Returns:
        Normalized code (e.g. "CG-X7K2M9") if valid, None if invalid format
    """
    if not code:
        return None
    cleaned = code.strip().upper()
    pattern = rf"^{re.escape(SHORT_CODE_PREFIX)}[{SHORT_CODE_CHARS}]{{{SHORT_CODE_LENGTH}}}$"
    if re.match(pattern, cleaned):
        return cleaned
    return None


def generate_random_code() -> str:
    """
    Generate a random short code (for cases where deterministic is not needed,
    e.g. initial setup before user has a telegram_user_id).

    Returns:
        A random short code string, e.g. "CG-R4KP9"
    """
    code_chars = "".join(
        secrets.choice(SHORT_CODE_CHARS) for _ in range(SHORT_CODE_LENGTH)
    )
    return f"{SHORT_CODE_PREFIX}{code_chars}"
