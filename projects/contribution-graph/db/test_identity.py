"""
Tests for Contribution Graph identity utilities
Run: python -m pytest db/test_identity.py
"""

import os
import pytest

# Set a known secret BEFORE importing identity (module reads at import time)
os.environ["CG_SERVER_SECRET"] = "test-secret-for-testing-only"

from db.identity import (
    generate_short_code,
    verify_short_code,
    parse_short_code,
    generate_random_code,
    SHORT_CODE_PREFIX,
    SHORT_CODE_LENGTH,
)


class TestGenerateShortCode:
    def test_format(self):
        code = generate_short_code(123456)
        assert code.startswith(SHORT_CODE_PREFIX)
        assert len(code) == len(SHORT_CODE_PREFIX) + SHORT_CODE_LENGTH  # CG- + 6 chars

    def test_deterministic_same_user(self):
        """Same user_id always produces same short_code"""
        code1 = generate_short_code(123456)
        code2 = generate_short_code(123456)
        assert code1 == code2

    def test_different_users_different_codes(self):
        """Different user_ids produce different short_codes"""
        code1 = generate_short_code(123456)
        code2 = generate_short_code(789012)
        assert code1 != code2

    def test_all_chars_valid(self):
        """Generated codes only contain valid characters"""
        import re
        from db.identity import SHORT_CODE_CHARS
        valid_chars = set(SHORT_CODE_CHARS)
        for user_id in range(1000):
            code = generate_short_code(user_id)
            suffix = code[len(SHORT_CODE_PREFIX):]
            assert all(c in valid_chars for c in suffix), f"Invalid char in {code}"


class TestVerifyShortCode:
    def test_valid_verification(self):
        user_id = 123456
        code = generate_short_code(user_id)
        assert verify_short_code(user_id, code) is True

    def test_case_insensitive(self):
        user_id = 123456
        code = generate_short_code(user_id)
        assert verify_short_code(user_id, code.lower()) is True
        assert verify_short_code(user_id, code.upper()) is True

    def test_wrong_user(self):
        code = generate_short_code(123456)
        assert verify_short_code(999999, code) is False

    def test_tampered_code(self):
        user_id = 123456
        code = generate_short_code(user_id)
        # Change one character
        tampered = code[:-1] + ("X" if code[-1] != "X" else "Y")
        assert verify_short_code(user_id, tampered) is False


class TestParseShortCode:
    def test_valid_code(self):
        code = parse_short_code("CG-X7K2M9")
        assert code == "CG-X7K2M9"

    def test_lowercase_normalized(self):
        code = parse_short_code("cg-x7k2m9")
        assert code == "CG-X7K2M9"

    def test_with_whitespace(self):
        code = parse_short_code("  CG-X7K2M9  ")
        assert code == "CG-X7K2M9"

    def test_invalid_prefix(self):
        assert parse_short_code("XX-X7K2M9") is None

    def test_invalid_length(self):
        assert parse_short_code("CG-X7K2") is None  # Too short
        assert parse_short_code("CG-X7K2M9AB") is None  # Too long

    def test_invalid_characters(self):
        assert parse_short_code("CG-AAAA1@") is None  # '@' is not in SHORT_CODE_CHARS

    def test_empty_input(self):
        assert parse_short_code("") is None
        assert parse_short_code("   ") is None
        assert parse_short_code(None) is None


class TestGenerateRandomCode:
    def test_format(self):
        code = generate_random_code()
        assert code.startswith(SHORT_CODE_PREFIX)
        assert len(code) == len(SHORT_CODE_PREFIX) + SHORT_CODE_LENGTH

    def test_randomness(self):
        """Multiple calls produce different codes"""
        codes = [generate_random_code() for _ in range(100)]
        assert len(set(codes)) > 90  # At least 90% unique (statistically expected)

    def test_not_deterministic(self):
        """Random codes are not tied to user_id"""
        code1 = generate_random_code()
        code2 = generate_random_code()
        assert code1 != code2
