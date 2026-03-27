"""
Festival Coordinator — Handler Formatting Function Tests

Tests pure formatting functions in src/handlers.py.
These are isolated from the Telegram API and database — pure unit tests.
"""
import pytest
from datetime import datetime, timezone
from unittest.mock import MagicMock
import sys, os
sys.path.insert(0, os.path.dirname(__file__) + '/..')

from src.handlers import (
    format_festival_info,
    format_task_list,
    format_task_detail,
    format_my_tasks,
    format_points_balance,
    format_leaderboard,
    format_rewards,
)


class MockFestival:
    _default_dates = object()  # sentinel for "use default"
    def __init__(self, id=1, name="Test Festival", description="A test event",
                 status="active", start_date=_default_dates, end_date=_default_dates):
        self.id = id
        self.name = name
        self.description = description
        self.status = status
        self.start_date = (
            start_date if start_date is not MockFestival._default_dates
            else datetime(2026, 6, 1, 9, 0, tzinfo=timezone.utc)
        )
        self.end_date = (
            end_date if end_date is not MockFestival._default_dates
            else datetime(2026, 6, 3, 18, 0, tzinfo=timezone.utc)
        )
        self.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)


class MockTask:
    def __init__(self, id=1, title="Test Task", description="Do something",
                 status="open", points_value=10, time_estimate="2hrs",
                 category_id=1, festival_id=1, deadline=None):
        self.id = id
        self.title = title
        self.description = description
        self.status = status
        self.points_value = points_value
        self.time_estimate = time_estimate
        self.category_id = category_id
        self.festival_id = festival_id
        self.deadline = deadline  # can be None


class MockReward:
    def __init__(self, id=1, title="Free Shirt", points_cost=100,
                 description="Get a free t-shirt", emoji="👕", quantity=None):
        self.id = id
        self.title = title
        self.points_cost = points_cost
        self.description = description
        self.emoji = emoji
        self.quantity = quantity


# ─── format_festival_info tests ────────────────────────────────────────────

class TestFormatFestivalInfo:
    def test_active_festival_shows_correct_emoji(self):
        festival = MockFestival(status="active")
        result = format_festival_info(festival)
        assert "🎉" in result

    def test_planning_festival_shows_planning_emoji(self):
        festival = MockFestival(status="planning")
        result = format_festival_info(festival)
        assert "📋" in result

    def test_completed_festival_shows_completed_emoji(self):
        festival = MockFestival(status="completed")
        result = format_festival_info(festival)
        assert "✅" in result

    def test_cancelled_festival_shows_cancelled_emoji(self):
        festival = MockFestival(status="cancelled")
        result = format_festival_info(festival)
        assert "❌" in result

    def test_name_included(self):
        festival = MockFestival(name="Summer Fest 2026")
        result = format_festival_info(festival)
        assert "Summer Fest 2026" in result

    def test_description_included(self):
        festival = MockFestival(description="The best festival ever")
        result = format_festival_info(festival)
        assert "The best festival ever" in result

    def test_status_shown_capitalized(self):
        festival = MockFestival(status="active")
        result = format_festival_info(festival)
        assert "Active" in result

    def test_start_date_formatted(self):
        festival = MockFestival()
        result = format_festival_info(festival)
        assert "June 01, 2026" in result

    def test_end_date_formatted(self):
        festival = MockFestival()
        result = format_festival_info(festival)
        assert "June 03, 2026" in result

    def test_no_end_date_does_not_show_ends_line(self):
        festival = MockFestival(start_date=datetime(2026, 6, 1, tzinfo=timezone.utc), end_date=None)
        result = format_festival_info(festival)
        # Should not crash; ends line should be absent
        assert "Ends:" not in result

    def test_markdown_bold_formatting(self):
        festival = MockFestival(name="Bold Name")
        result = format_festival_info(festival)
        # Name should be wrapped in markdown bold
        assert "*Bold Name*" in result


# ─── format_task_list tests ─────────────────────────────────────────────────

class TestFormatTaskList:
    def test_empty_returns_no_tasks_message(self):
        result = format_task_list([])
        assert "📭" in result
        assert "no tasks" in result.lower()

    def test_open_task_shows_open_emoji(self):
        task = MockTask(status="open")
        result = format_task_list([task])
        assert "⭕" in result

    def test_claimed_task_shows_blue_circle(self):
        task = MockTask(status="claimed")
        result = format_task_list([task])
        assert "🔵" in result

    def test_in_progress_task_shows_yellow_circle(self):
        task = MockTask(status="in_progress")
        result = format_task_list([task])
        assert "🟡" in result

    def test_completed_task_shows_green_circle(self):
        task = MockTask(status="completed")
        result = format_task_list([task])
        assert "🟢" in result

    def test_verified_task_shows_check(self):
        task = MockTask(status="verified")
        result = format_task_list([task])
        assert "✅" in result

    def test_unknown_status_shows_white_circle(self):
        task = MockTask(status="unknown_status")
        result = format_task_list([task])
        assert "⚪" in result

    def test_task_title_included(self):
        task = MockTask(title="Build Booth")
        result = format_task_list([task])
        assert "Build Booth" in result

    def test_task_id_included(self):
        task = MockTask(id=42)
        result = format_task_list([task])
        assert "42" in result

    def test_points_value_included(self):
        task = MockTask(points_value=25)
        result = format_task_list([task])
        assert "25" in result

    def test_time_estimate_included(self):
        task = MockTask(time_estimate="4hrs")
        result = format_task_list([task])
        assert "4hrs" in result

    def test_long_description_truncated(self):
        task = MockTask(description="A" * 120)
        result = format_task_list([task])
        assert "..." in result
        # The long string should not appear in full
        assert ("A" * 120) not in result

    def test_multiple_tasks_all_shown(self):
        tasks = [
            MockTask(id=1, title="Task One"),
            MockTask(id=2, title="Task Two"),
            MockTask(id=3, title="Task Three"),
        ]
        result = format_task_list(tasks)
        assert "Task One" in result
        assert "Task Two" in result
        assert "Task Three" in result

    def test_available_tasks_header(self):
        task = MockTask()
        result = format_task_list([task])
        assert "Available Tasks" in result or "available" in result.lower()


# ─── format_task_detail tests ───────────────────────────────────────────────

class TestFormatTaskDetail:
    def test_title_included(self):
        task = MockTask(title="Specific Task")
        result = format_task_detail(task)
        assert "Specific Task" in result

    def test_points_included(self):
        task = MockTask(points_value=50)
        result = format_task_detail(task)
        assert "50" in result

    def test_time_estimate_included(self):
        task = MockTask(time_estimate="3hrs")
        result = format_task_detail(task)
        assert "3hrs" in result

    def test_no_time_estimate_does_not_crash(self):
        task = MockTask(time_estimate=None)
        result = format_task_detail(task)
        # Should not crash; title is still shown
        assert "Test Task" in result

    def test_no_description_does_not_show_none(self):
        task = MockTask(description=None)
        result = format_task_detail(task)
        # Should not literally show "None" as string
        assert "None" not in result

    def test_task_id_included(self):
        task = MockTask(id=99)
        result = format_task_detail(task)
        assert "99" in result


# ─── format_my_tasks tests ─────────────────────────────────────────────────

class TestFormatMyTasks:
    def test_empty_returns_no_tasks_message(self):
        result = format_my_tasks([])
        assert "📭" in result
        assert "haven't claimed" in result.lower()

    def test_claimed_task_shows_blue(self):
        task = MockTask(status="claimed")
        result = format_my_tasks([task])
        assert "🔵" in result

    def test_in_progress_task_shows_yellow(self):
        task = MockTask(status="in_progress")
        result = format_my_tasks([task])
        assert "🟡" in result

    def test_completed_task_shows_green(self):
        task = MockTask(status="completed")
        result = format_my_tasks([task])
        assert "🟢" in result

    def test_task_status_shown_in_message(self):
        task = MockTask(id=5, status="claimed")
        result = format_my_tasks([task])
        assert "5" in result
        assert "claimed" in result

    def test_multiple_tasks(self):
        tasks = [MockTask(id=1), MockTask(id=2)]
        result = format_my_tasks(tasks)
        assert "1" in result
        assert "2" in result


# ─── format_points_balance tests ───────────────────────────────────────────

class TestFormatPointsBalance:
    def test_zero_balance(self):
        result = format_points_balance(12345, 0)
        assert "0" in result
        assert "💰" in result

    def test_positive_balance(self):
        result = format_points_balance(12345, 500)
        assert "500" in result
        assert "💰" in result

    def test_member_id_not_in_output(self):
        """format_points_balance returns balance only, not member ID."""
        result = format_points_balance(99999, 100)
        # Function signature takes member_id but output is just the balance
        assert "100" in result
        assert "💰" in result
        # member_id is passed for potential future use but not rendered
        assert "99999" not in result

    def test_markdown_formatting(self):
        result = format_points_balance(1, 250)
        # Should use markdown bold
        assert "*" in result


# ─── format_leaderboard tests ──────────────────────────────────────────────

class TestFormatLeaderboard:
    def test_empty_returns_no_data_message(self):
        result = format_leaderboard([])
        assert "no leaderboard" in result.lower() or "🏆" in result

    def test_single_entry(self):
        result = format_leaderboard([(111, 300)])
        assert "111" in result
        assert "300" in result

    def test_gold_medal_first(self):
        entries = [(1, 300), (2, 200), (3, 100)]
        result = format_leaderboard(entries)
        assert "🥇" in result

    def test_silver_medal_second(self):
        entries = [(1, 300), (2, 200)]
        result = format_leaderboard(entries)
        assert "🥈" in result

    def test_bronze_medal_third(self):
        entries = [(1, 300), (2, 200), (3, 100)]
        result = format_leaderboard(entries)
        assert "🥉" in result

    def test_fourth_shows_position_number(self):
        entries = [(1, 400), (2, 300), (3, 200), (4, 100)]
        result = format_leaderboard(entries)
        assert "4." in result

    def test_points_suffix(self):
        entries = [(1, 150)]
        result = format_leaderboard(entries)
        assert "pts" in result

    def test_member_id_shown(self):
        entries = [(98765, 200)]
        result = format_leaderboard(entries)
        assert "98765" in result

    def test_you_marker_when_member_id_matches(self):
        entries = [(123, 100), (456, 200)]
        result = format_leaderboard(entries, member_id=456)
        assert "(You)" in result


# ─── format_rewards tests ─────────────────────────────────────────────────

class TestFormatRewards:
    def test_empty_returns_no_rewards_message(self):
        result = format_rewards([])
        assert "🎁" in result
        assert "no rewards" in result.lower()

    def test_single_reward(self):
        reward = MockReward(title="VIP Access", points_cost=500)
        result = format_rewards([reward])
        assert "VIP Access" in result
        assert "500" in result

    def test_emoji_shown(self):
        reward = MockReward(emoji="🎫")
        result = format_rewards([reward])
        assert "🎫" in result

    def test_no_emoji_uses_default(self):
        reward = MockReward(emoji=None)
        result = format_rewards([reward])
        assert "🎁" in result

    def test_limited_quantity_shows_count(self):
        reward = MockReward(quantity=7)
        result = format_rewards([reward])
        assert "7" in result
        assert "left" in result.lower()

    def test_unlimited_quantity_no_left_text(self):
        reward = MockReward(quantity=None)
        result = format_rewards([reward])
        assert "left" not in result.lower()

    def test_description_shown(self):
        reward = MockReward(description="A unique experience")
        result = format_rewards([reward])
        assert "A unique experience" in result

    def test_reward_id_shown(self):
        reward = MockReward(id=12)
        result = format_rewards([reward])
        assert "12" in result

    def test_multiple_rewards(self):
        rewards = [
            MockReward(id=1, title="Reward A"),
            MockReward(id=2, title="Reward B"),
        ]
        result = format_rewards(rewards)
        assert "Reward A" in result
        assert "Reward B" in result
