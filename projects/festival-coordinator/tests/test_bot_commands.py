"""
Tests for Festival Coordinator bot.py command functions.
These test the async Telegram command handlers in isolation from the Telegram API.
"""
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from unittest.mock import AsyncMock, MagicMock, patch

# ─────────────────────────────────────────────────────────────────────────────
# Fake Telegram objects
# ─────────────────────────────────────────────────────────────────────────────

class FakeMessage:
    def __init__(self):
        self.text = ""
        self.reply_text_calls = []
    
    async def reply_text(self, text, **kwargs):
        self.reply_text_calls.append((text, kwargs))
        self.text = text


class FakeUser:
    def __init__(self, uid=111, first_name="Test", last_name=None, username=None):
        self.id = uid
        self.first_name = first_name
        self.last_name = last_name
        self.username = username


class FakeUpdate:
    def __init__(self, uid=111):
        self.effective_user = FakeUser(uid)
        self.message = FakeMessage()


class FakeContext:
    def __init__(self, args_text="", args=None):
        self.args_text = args_text
        self.args = args if args is not None else (args_text.split() if args_text else [])


# ─────────────────────────────────────────────────────────────────────────────
# Tests: extract_args (already in test_bot.py, extended)
# ─────────────────────────────────────────────────────────────────────────────

def test_extract_args_behavior():
    """Extended coverage for extract_args edge cases."""
    from bot import extract_args
    
    # whitespace-only string
    assert extract_args("   ", 2) == ["", ""]
    # single whitespace split
    assert extract_args("  a   b  ", 2) == ["a", "b"]
    # maxsplit does not drop extra parts when not needed
    assert extract_args("a b c", 1) == ["a"]


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_start
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_start_sends_welcome():
    """cmd_start sends the command list."""
    from bot import cmd_start
    
    update = FakeUpdate(uid=999)
    context = FakeContext()
    
    await cmd_start(update, context)
    
    assert len(update.message.reply_text_calls) == 1
    text = update.message.reply_text_calls[0][0]
    assert "/festival" in text
    assert "/tasks" in text
    assert "/claim" in text
    assert "/my_tasks" in text


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_festival
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_festival_no_args_calls_handler():
    """When no festival ID given, passes None to handler."""
    from bot import cmd_festival
    from src.handlers import handle_festival
    
    update = FakeUpdate()
    context = FakeContext(args_text="")
    
    with patch('bot.handle_festival', return_value="🎉 Festival: TestFest") as mock_hf:
        await cmd_festival(update, context)
    
    mock_hf.assert_called_once_with(None)
    assert update.message.reply_text_calls[0][0] == "🎉 Festival: TestFest"


@pytest.mark.asyncio
async def test_cmd_festival_with_id_calls_handler():
    """When festival ID is given, passes it to handler."""
    from bot import cmd_festival
    
    update = FakeUpdate()
    context = FakeContext(args_text="42")
    
    with patch('bot.handle_festival', return_value="Fest 42 info") as mock_hf:
        await cmd_festival(update, context)
    
    mock_hf.assert_called_once_with(42)


@pytest.mark.asyncio
async def test_cmd_festival_invalid_id_passes_none():
    """Non-digit festival ID is treated as None (no festival found)."""
    from bot import cmd_festival
    
    update = FakeUpdate()
    context = FakeContext(args_text="abc")
    
    with patch('bot.handle_festival', return_value="❌ No active festival found") as mock_hf:
        await cmd_festival(update, context)
    
    mock_hf.assert_called_once_with(None)


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_tasks
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_tasks_no_args():
    """No args -> both festival_id and category_id are None."""
    from bot import cmd_tasks
    
    update = FakeUpdate()
    context = FakeContext(args_text="")
    
    with patch('bot.handle_tasks', return_value="📭 No tasks") as mock:
        await cmd_tasks(update, context)
    
    mock.assert_called_once_with(None, None)


@pytest.mark.asyncio
async def test_cmd_tasks_festival_id_only():
    """One arg -> festival_id set, category_id None."""
    from bot import cmd_tasks
    
    update = FakeUpdate()
    context = FakeContext(args_text="5")
    
    with patch('bot.handle_tasks', return_value="Tasks") as mock:
        await cmd_tasks(update, context)
    
    mock.assert_called_once_with(5, None)


@pytest.mark.asyncio
async def test_cmd_tasks_both_ids():
    """Two args -> festival_id and category_id set."""
    from bot import cmd_tasks
    
    update = FakeUpdate()
    context = FakeContext(args_text="3 7")
    
    with patch('bot.handle_tasks', return_value="Tasks") as mock:
        await cmd_tasks(update, context)
    
    mock.assert_called_once_with(3, 7)


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_claim
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_claim_success():
    """Valid task ID -> handler called with task_id and member id."""
    from bot import cmd_claim
    
    update = FakeUpdate(uid=555)
    context = FakeContext(args=["42"])
    
    with patch('bot.handle_claim', return_value="✅ Claimed!") as mock:
        await cmd_claim(update, context)
    
    mock.assert_called_once_with(42, 555)
    assert update.message.reply_text_calls[0][0] == "✅ Claimed!"


@pytest.mark.asyncio
async def test_cmd_claim_no_args():
    """No args -> sends usage message."""
    from bot import cmd_claim
    
    update = FakeUpdate()
    context = FakeContext(args=[])
    
    await cmd_claim(update, context)
    
    assert len(update.message.reply_text_calls) == 1
    assert "Usage" in update.message.reply_text_calls[0][0]


@pytest.mark.asyncio
async def test_cmd_claim_invalid_id():
    """Non-integer task ID -> sends 'Invalid task ID' message."""
    from bot import cmd_claim
    
    update = FakeUpdate()
    context = FakeContext(args=["abc"])
    
    await cmd_claim(update, context)
    
    assert update.message.reply_text_calls[0][0] == "Invalid task ID."


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_my_tasks
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_my_tasks_no_args():
    """No args -> festival_id=None, member_id from effective_user."""
    from bot import cmd_my_tasks
    
    update = FakeUpdate(uid=777)
    context = FakeContext(args_text="")
    
    with patch('bot.handle_my_tasks', return_value="Your tasks") as mock:
        await cmd_my_tasks(update, context)
    
    mock.assert_called_once_with(None, 777)


@pytest.mark.asyncio
async def test_cmd_my_tasks_with_festival_id():
    """Festival ID arg -> passed through."""
    from bot import cmd_my_tasks
    
    update = FakeUpdate(uid=777)
    context = FakeContext(args_text="9")
    
    with patch('bot.handle_my_tasks', return_value="Your tasks") as mock:
        await cmd_my_tasks(update, context)
    
    mock.assert_called_once_with(9, 777)


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_complete
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_complete_success_with_proof():
    """Valid task ID with proof -> handler called with proof string."""
    from bot import cmd_complete
    
    update = FakeUpdate(uid=222)
    context = FakeContext(args=["10", "Done", "with", "proof"])
    
    with patch('bot.handle_complete', return_value="✅ Completed!") as mock:
        await cmd_complete(update, context)
    
    # args[0]=task_id, rest=proof
    mock.assert_called_once_with(10, 222, "Done with proof")


@pytest.mark.asyncio
async def test_cmd_complete_success_no_proof():
    """Valid task ID without proof -> proof is None."""
    from bot import cmd_complete
    
    update = FakeUpdate(uid=222)
    context = FakeContext(args=["10"])
    
    with patch('bot.handle_complete', return_value="✅ Completed!") as mock:
        await cmd_complete(update, context)
    
    mock.assert_called_once_with(10, 222, None)


@pytest.mark.asyncio
async def test_cmd_complete_no_args():
    """No args -> usage message."""
    from bot import cmd_complete
    
    update = FakeUpdate()
    context = FakeContext(args=[])
    
    await cmd_complete(update, context)
    
    assert "Usage" in update.message.reply_text_calls[0][0]


@pytest.mark.asyncio
async def test_cmd_complete_invalid_id():
    """Non-integer task ID -> 'Invalid task ID.'"""
    from bot import cmd_complete
    
    update = FakeUpdate()
    context = FakeContext(args=["xyz"])
    
    await cmd_complete(update, context)
    
    assert update.message.reply_text_calls[0][0] == "Invalid task ID."


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_verify
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_verify_success():
    """Valid task ID -> handler called."""
    from bot import cmd_verify
    
    update = FakeUpdate(uid=333)
    context = FakeContext(args=["7"])
    
    with patch('bot.handle_verify', return_value="✅ Verified!") as mock:
        await cmd_verify(update, context)
    
    mock.assert_called_once_with(7, 333)


@pytest.mark.asyncio
async def test_cmd_verify_no_args():
    """No args -> usage message."""
    from bot import cmd_verify
    
    update = FakeUpdate()
    context = FakeContext(args=[])
    
    await cmd_verify(update, context)
    
    assert "Usage" in update.message.reply_text_calls[0][0]


@pytest.mark.asyncio
async def test_cmd_verify_invalid_id():
    """Non-integer -> 'Invalid task ID.'"""
    from bot import cmd_verify
    
    update = FakeUpdate()
    context = FakeContext(args=["nope"])
    
    await cmd_verify(update, context)
    
    assert update.message.reply_text_calls[0][0] == "Invalid task ID."


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_points
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_points_no_args():
    """No festival ID -> festival_id=None."""
    from bot import cmd_points
    
    update = FakeUpdate(uid=444)
    context = FakeContext(args_text="")
    
    with patch('bot.handle_points', return_value="💰 50 pts") as mock:
        await cmd_points(update, context)
    
    mock.assert_called_once_with(None, 444)


@pytest.mark.asyncio
async def test_cmd_points_with_festival_id():
    """Festival ID arg -> passed through."""
    from bot import cmd_points
    
    update = FakeUpdate(uid=444)
    context = FakeContext(args_text="2")
    
    with patch('bot.handle_points', return_value="💰 50 pts") as mock:
        await cmd_points(update, context)
    
    mock.assert_called_once_with(2, 444)


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_leaderboard
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_leaderboard_no_args():
    """No festival ID -> passes member id."""
    from bot import cmd_leaderboard
    
    update = FakeUpdate(uid=888)
    context = FakeContext(args_text="")
    
    with patch('bot.handle_leaderboard', return_value="🏆 LB") as mock:
        await cmd_leaderboard(update, context)
    
    mock.assert_called_once_with(None, 888)


@pytest.mark.asyncio
async def test_cmd_leaderboard_with_festival_id():
    """Festival ID -> passed through."""
    from bot import cmd_leaderboard
    
    update = FakeUpdate(uid=888)
    context = FakeContext(args_text="6")
    
    with patch('bot.handle_leaderboard', return_value="🏆 LB") as mock:
        await cmd_leaderboard(update, context)
    
    mock.assert_called_once_with(6, 888)


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_rewards
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_rewards_no_args():
    """No festival ID -> None."""
    from bot import cmd_rewards
    
    update = FakeUpdate()
    context = FakeContext(args_text="")
    
    with patch('bot.handle_rewards', return_value="🎁 Rewards") as mock:
        await cmd_rewards(update, context)
    
    mock.assert_called_once_with(None)


@pytest.mark.asyncio
async def test_cmd_rewards_with_festival_id():
    """Festival ID -> passed through."""
    from bot import cmd_rewards
    
    update = FakeUpdate()
    context = FakeContext(args_text="3")
    
    with patch('bot.handle_rewards', return_value="🎁 Rewards") as mock:
        await cmd_rewards(update, context)
    
    mock.assert_called_once_with(3)


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_redeem
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_redeem_success():
    """Valid reward ID -> handler called."""
    from bot import cmd_redeem
    
    update = FakeUpdate(uid=666)
    context = FakeContext(args=["5"])
    
    with patch('bot.handle_redeem', return_value="✅ Redeemed!") as mock:
        await cmd_redeem(update, context)
    
    mock.assert_called_once_with(5, 666)


@pytest.mark.asyncio
async def test_cmd_redeem_no_args():
    """No args -> usage message."""
    from bot import cmd_redeem
    
    update = FakeUpdate()
    context = FakeContext(args=[])
    
    await cmd_redeem(update, context)
    
    assert "Usage" in update.message.reply_text_calls[0][0]


@pytest.mark.asyncio
async def test_cmd_redeem_invalid_id():
    """Non-integer -> 'Invalid reward ID.'"""
    from bot import cmd_redeem
    
    update = FakeUpdate()
    context = FakeContext(args=["bad"])
    
    await cmd_redeem(update, context)
    
    assert update.message.reply_text_calls[0][0] == "Invalid reward ID."


# ─────────────────────────────────────────────────────────────────────────────
# Tests: cmd_cancel
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_cmd_cancel_returns_end():
    """cmd_cancel sends 'Cancelled.' and returns ConversationHandler.END."""
    from bot import cmd_cancel
    from telegram.ext import ConversationHandler
    
    update = FakeUpdate()
    context = FakeContext()
    
    result = await cmd_cancel(update, context)
    
    assert result == ConversationHandler.END
    assert update.message.reply_text_calls[0][0] == "Cancelled."


# ─────────────────────────────────────────────────────────────────────────────
# Tests: ConversationHandler admin guards
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_task_start_blocks_non_admin():
    """create_task_start rejects non-admin users."""
    from bot import create_task_start, ADMIN_IDS
    
    # Temporarily set ADMIN_IDS to a known value
    orig = ADMIN_IDS.copy()
    try:
        # Override module-level ADMIN_IDS for this test
        import bot
        bot.ADMIN_IDS = {111}  # Only uid=111 is admin
        
        # Non-admin user (uid=999)
        update = FakeUpdate(uid=999)
        context = FakeContext()
        
        await create_task_start(update, context)
        
        assert update.message.reply_text_calls[0][0] == "Admin only."
    finally:
        bot.ADMIN_IDS = orig


@pytest.mark.asyncio
async def test_create_task_start_allows_admin():
    """create_task_start allows admin users."""
    from bot import create_task_start
    
    import bot
    orig = bot.ADMIN_IDS.copy()
    try:
        bot.ADMIN_IDS = {111}
        
        update = FakeUpdate(uid=111)
        context = FakeContext()
        
        result = await create_task_start(update, context)
        
        assert result == bot.AWAIT_TASK_FESTIVAL_ID
        assert "Step 1/6" in update.message.reply_text_calls[0][0]
    finally:
        bot.ADMIN_IDS = orig
