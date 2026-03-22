"""Tests for Festival Coordinator bot.py"""
import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Test helpers
def test_extract_args():
    from bot import extract_args
    # Normal case
    assert extract_args("hello world", 2) == ["hello", "world"]
    # Too few args -> padded
    assert extract_args("hello", 3) == ["hello", "", ""]
    # Empty string
    assert extract_args("", 2) == ["", ""]
    # None
    assert extract_args(None, 2) == ["", ""]
    # Extra args truncated
    assert extract_args("a b c d", 2) == ["a", "b"]

def test_admin_check_no_admins_set(monkeypatch):
    """When ADMIN_IDS is empty, anyone is admin."""
    monkeypatch.setenv("ADMIN_TELEGRAM_IDS", "")
    # Re-import to pick up env var
    import importlib, bot
    # Save current ADMIN_IDS
    orig = bot.ADMIN_IDS.copy()
    bot.ADMIN_IDS = set()
    class FakeUpdate:
        effective_user = type("U", (), {"id": 12345})()
    class FakeContext:
        bot_data = {}
    assert bot._admin_check(FakeUpdate()) == True
    bot.ADMIN_IDS = orig

def test_admin_check_with_admin_ids(monkeypatch):
    """When ADMIN_IDS is set, only those IDs pass."""
    monkeypatch.setenv("ADMIN_TELEGRAM_IDS", "111,222,333")
    import importlib, bot
    orig = bot.ADMIN_IDS.copy()
    bot.ADMIN_IDS = {111, 222, 333}
    class FakeUpdate:
        effective_user = type("U", (), {"id": 222})()
    class FakeContext:
        bot_data = {}
    assert bot._admin_check(FakeUpdate()) == True
    # Non-admin
    class FakeUpdate2:
        effective_user = type("U", (), {"id": 999})()
    assert bot._admin_check(FakeUpdate2()) == False
    bot.ADMIN_IDS = orig

def test_bot_module_import():
    """bot.py imports without errors."""
    import bot
    assert hasattr(bot, "cmd_start")
    assert hasattr(bot, "cmd_claim")
    assert hasattr(bot, "cmd_festival")
    assert hasattr(bot, "create_task_start")
    assert hasattr(bot, "add_reward_start")
    assert hasattr(bot, "main")
    assert hasattr(bot, "ADMIN_IDS")
    assert isinstance(bot.ADMIN_IDS, set)

def test_bot_no_token_raises():
    """main() raises RuntimeError when TELEGRAM_BOT_TOKEN is not set."""
    import bot
    # Patch BOT_TOKEN to empty
    orig = bot.BOT_TOKEN
    bot.BOT_TOKEN = None
    with pytest.raises(RuntimeError, match="TELEGRAM_BOT_TOKEN"):
        bot.main()
    bot.BOT_TOKEN = orig
