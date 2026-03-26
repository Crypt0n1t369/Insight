"""
Tests for Contribution Graph bot handlers
Run: python -m pytest tests/test_handlers.py
"""

import pytest
from bot.states import Phase, UserState, ConversationSignal, SignalType
from bot.handlers import (
    handle_update,
    handle_phase_1_opening,
    handle_phase_2_orientation,
    handle_phase_3_evidence,
    handle_phase_4_mirror,
    handle_phase_5_first_stretch,
    handle_phase_new,
    handle_phase_completed,
    handle_challenge_completion,
    handle_start,
    handle_map,
    handle_continue,
    handle_notifications,
    handle_help,
    _assess_confidence,
    _generate_mirror_summary,
    _select_challenge,
)


@pytest.fixture
def fresh_state():
    """A fresh user state for testing"""
    return UserState(telegram_user_id=12345678)


class TestPhaseTransitions:
    """Test that users advance through phases correctly"""

    @pytest.mark.asyncio
    async def test_new_user_starts_at_phase_1(self, fresh_state):
        response = await handle_phase_1_opening(
            "I want to figure out what kind of work actually fulfills me",
            fresh_state
        )
        assert fresh_state.phase == Phase.PHASE_2_ORIENTATION
        assert len(fresh_state.signals) == 1
        assert "Is that the core of it?" in response

    @pytest.mark.asyncio
    async def test_phase_1_requires_minimal_text(self, fresh_state):
        response = await handle_phase_1_opening("hi", fresh_state)
        # Should prompt for more detail, not advance
        assert fresh_state.phase == Phase.NEW  # Phase unchanged
        assert len(fresh_state.signals) == 0

    @pytest.mark.asyncio
    async def test_phase_2_requires_minimal_text(self, fresh_state):
        fresh_state.phase = Phase.PHASE_2_ORIENTATION
        response = await handle_phase_2_orientation("good", fresh_state)
        assert fresh_state.phase == Phase.PHASE_2_ORIENTATION
        assert len(fresh_state.signals) == 0

    @pytest.mark.asyncio
    async def test_phase_2_advances_to_phase_3(self, fresh_state):
        fresh_state.phase = Phase.PHASE_2_ORIENTATION
        response = await handle_phase_2_orientation(
            "I was working on a project and suddenly everything clicked into place",
            fresh_state
        )
        assert fresh_state.phase == Phase.PHASE_3_EVIDENCE
        assert len(fresh_state.signals) == 1

    @pytest.mark.asyncio
    async def test_phase_3_advances_to_phase_4(self, fresh_state):
        fresh_state.phase = Phase.PHASE_3_EVIDENCE
        response = await handle_phase_3_evidence(
            "I created a new slide deck for my presentation and my manager loved it",
            fresh_state
        )
        assert fresh_state.phase == Phase.PHASE_4_MIRROR
        assert fresh_state.mirror_summary is not None
        assert "text" in fresh_state.mirror_summary

    @pytest.mark.asyncio
    async def test_phase_4_corrections_advance_to_phase_5(self, fresh_state):
        fresh_state.phase = Phase.PHASE_4_MIRROR
        fresh_state.mirror_summary = {"text": "You are a creative person"}
        response = await handle_phase_4_mirror(
            "That's mostly right but I would also emphasize my analytical side",
            fresh_state
        )
        assert fresh_state.phase == Phase.PHASE_5_FIRST_STRETCH
        # Corrections give high-confidence signal
        correction_sig = [s for s in fresh_state.signals if s.signal_type == SignalType.VOICE_AUTHENTICITY][0]
        assert correction_sig.confidence == 0.9

    @pytest.mark.asyncio
    async def test_phase_5_yes_starts_challenge(self, fresh_state):
        fresh_state.phase = Phase.PHASE_5_FIRST_STRETCH
        response = await handle_phase_5_first_stretch("yes", fresh_state)
        assert fresh_state.chosen_challenge is not None
        assert "challenge" in response.lower() or "ready" in response.lower()

    @pytest.mark.asyncio
    async def test_phase_5_later_skips_challenge(self, fresh_state):
        fresh_state.phase = Phase.PHASE_5_FIRST_STRETCH
        response = await handle_phase_5_first_stretch("later", fresh_state)
        assert fresh_state.chosen_challenge is None
        assert "no pressure" in response.lower()

    @pytest.mark.asyncio
    async def test_phase_5_completion_generates_map(self, fresh_state):
        fresh_state.phase = Phase.PHASE_5_FIRST_STRETCH
        fresh_state.chosen_challenge = {"id": "test_001", "title": "Test Challenge"}
        response = await handle_phase_5_first_stretch(
            "I made a sketch of my ideal week and it was really clarifying",
            fresh_state
        )
        assert fresh_state.phase == Phase.COMPLETED
        assert "contributiongraph.ai/map" in response


class TestConfidenceScoring:
    """Test keyword-based confidence scoring"""

    def test_high_confidence_keywords(self):
        text = "I decided to start the project and I actually finished it"
        confidence = _assess_confidence(text, keywords=["i decided", "i started", "i made", "i created", "finished", "done"])
        assert confidence > 0.6

    def test_low_confidence_no_keywords(self):
        text = "it was okay i guess"
        confidence = _assess_confidence(text, keywords=["i decided", "i started", "i made", "i created", "finished", "done"])
        assert confidence < 0.6

    def test_confidence_capped_at_09(self):
        text = "i decided i started i made i created finished done extra"
        confidence = _assess_confidence(text, keywords=["i", "dec", "sta", "mad", "cre", "fin", "don"])
        assert confidence <= 0.9


class TestMirrorSummary:
    """Test mirror summary generation"""

    def test_generates_top_signals(self):
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.PURPOSE_CLARITY, {"text": "a"}, 0.7, "q1"),
            ConversationSignal(SignalType.INITIATIVE_TAKING, {"text": "b"}, 0.8, "q2"),
            ConversationSignal(SignalType.PATTERN_RECOGNITION, {"text": "c"}, 0.6, "q3"),
        ]
        summary = _generate_mirror_summary(state)
        assert "text" in summary
        assert len(summary["top_signals"]) == 3
        assert summary["top_signals"][0][0] == "initiative_taking"  # Highest

    def test_handles_no_signals(self):
        state = UserState(telegram_user_id=123)
        summary = _generate_mirror_summary(state)
        assert "text" in summary
        assert summary["top_signals"] == []

    def test_sectioned_format_version_3(self):
        """Enhanced mirror summary: sectioned format with version=3"""
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.INITIATIVE_TAKING, {"text": "a"}, 0.85, "q1"),
            ConversationSignal(SignalType.PURPOSE_CLARITY, {"text": "b"}, 0.72, "q2"),
            ConversationSignal(SignalType.PATTERN_RECOGNITION, {"text": "c"}, 0.68, "q3"),
            ConversationSignal(SignalType.CONTRIBUTION_DRIVE, {"text": "d"}, 0.55, "q4"),
            ConversationSignal(SignalType.CHALLENGE_COMPLETION, {"text": "e"}, 0.50, "q5"),
        ]
        summary = _generate_mirror_summary(state)
        # Version 3 = sectioned format (What you move toward / How you operate / Where growing / Bottom line)
        assert summary.get("version") == 3
        text = summary["text"]
        assert "What you move toward" in text
        assert "How you operate" in text
        assert "Where you're growing" in text or "edge" in text.lower()
        assert "Bottom line" in text
        # Top signals correctly ordered by confidence
        assert len(summary["top_signals"]) == 3
        assert summary["top_signals"][0][0] == "initiative_taking"  # 0.85 — highest
        assert summary["top_signals"][1][0] == "purpose_clarity"    # 0.72
        assert summary["top_signals"][2][0] == "pattern_recognition"  # 0.68

    def test_signature_pattern_detected(self):
        """Starter+Finisher pattern: initiative_taking + challenge_completion"""
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.INITIATIVE_TAKING, {"text": "a"}, 0.82, "q1"),
            ConversationSignal(SignalType.CHALLENGE_COMPLETION, {"text": "b"}, 0.78, "q2"),
            ConversationSignal(SignalType.PATTERN_RECOGNITION, {"text": "c"}, 0.55, "q3"),
        ]
        summary = _generate_mirror_summary(state)
        text = summary["text"]
        # Should detect the Starter + Finisher signature pattern
        assert "Starter" in text or "Finisher" in text or "start" in text.lower()
        # Growth edge should be the lowest-confidence signal
        growth_sig = summary["top_signals"][-1][0]  # lowest
        assert growth_sig == "pattern_recognition"

    def test_growth_edge_lowest_signal(self):
        """Growth edge is the lowest-confidence signal"""
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.PURPOSE_CLARITY, {"text": "a"}, 0.85, "q1"),
            ConversationSignal(SignalType.INITIATIVE_TAKING, {"text": "b"}, 0.75, "q2"),
            ConversationSignal(SignalType.VOICE_AUTHENTICITY, {"text": "c"}, 0.45, "q3"),
        ]
        summary = _generate_mirror_summary(state)
        # voice_authenticity is lowest at 0.45 — should appear in growth edge section
        text = summary["text"]
        assert "voice" in text.lower() or "edge" in text.lower() or "grow" in text.lower()


class TestChallengeSelection:
    """Test challenge selection based on comparative vector"""

    def test_selects_initiative_challenge(self):
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.INITIATIVE_TAKING, {"text": "a"}, 0.85, "q1"),
            ConversationSignal(SignalType.PATTERN_RECOGNITION, {"text": "b"}, 0.4, "q2"),
        ]
        challenge = _select_challenge(state)
        assert challenge["signal_targeted"] == "initiative_taking"

    def test_selects_creative_challenge(self):
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.PATTERN_RECOGNITION, {"text": "a"}, 0.85, "q1"),
            ConversationSignal(SignalType.INITIATIVE_TAKING, {"text": "b"}, 0.4, "q2"),
        ]
        challenge = _select_challenge(state)
        assert challenge["signal_targeted"] == "pattern_recognition"

    def test_fallback_for_empty_vector(self):
        state = UserState(telegram_user_id=123)
        challenge = _select_challenge(state)
        # Default is first impact challenge when no vector available
        assert challenge["category"] == "impact"

    def test_selects_purpose_clarity_challenge(self):
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.PURPOSE_CLARITY, {"text": "a"}, 0.88, "q1"),
            ConversationSignal(SignalType.VOICE_AUTHENTICITY, {"text": "b"}, 0.4, "q2"),
        ]
        challenge = _select_challenge(state)
        assert challenge["signal_targeted"] == "purpose_clarity"

    def test_selects_contribution_drive_challenge(self):
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.CONTRIBUTION_DRIVE, {"text": "a"}, 0.82, "q1"),
            ConversationSignal(SignalType.INITIATIVE_TAKING, {"text": "b"}, 0.4, "q2"),
        ]
        challenge = _select_challenge(state)
        assert challenge["signal_targeted"] == "contribution_drive"

    def test_selects_voice_authenticity_challenge(self):
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.VOICE_AUTHENTICITY, {"text": "a"}, 0.91, "q1"),
            ConversationSignal(SignalType.PATTERN_RECOGNITION, {"text": "b"}, 0.4, "q2"),
        ]
        challenge = _select_challenge(state)
        assert challenge["signal_targeted"] == "voice_authenticity"

    def test_highest_confidence_wins_among_tied_signals(self):
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.PURPOSE_CLARITY, {"text": "a"}, 0.70, "q1"),
            ConversationSignal(SignalType.CONTRIBUTION_DRIVE, {"text": "b"}, 0.75, "q2"),
            ConversationSignal(SignalType.VOICE_AUTHENTICITY, {"text": "c"}, 0.60, "q3"),
        ]
        challenge = _select_challenge(state)
        # contribution_drive has highest confidence at 0.75
        assert challenge["signal_targeted"] == "contribution_drive"

    def test_selects_values_alignment_challenge(self):
        """values_alignment signal → impact category challenge"""
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.VALUES_ALIGNMENT, {"text": "a"}, 0.85, "q1"),
            ConversationSignal(SignalType.INITIATIVE_TAKING, {"text": "b"}, 0.4, "q2"),
        ]
        challenge = _select_challenge(state)
        assert challenge["signal_targeted"] == "values_alignment"
        assert challenge["category"] == "impact"
        assert challenge["id"] == "impact_values_001"

    def test_selects_obstacle_persistence_challenge(self):
        """obstacle_persistence signal → business category challenge"""
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.OBSTACLE_PERSISTENCE, {"text": "a"}, 0.82, "q1"),
            ConversationSignal(SignalType.PATTERN_RECOGNITION, {"text": "b"}, 0.4, "q2"),
        ]
        challenge = _select_challenge(state)
        assert challenge["signal_targeted"] == "obstacle_persistence"
        assert challenge["category"] == "business"
        assert challenge["id"] == "business_obstacle_001"

    def test_selects_challenge_completion_challenge(self):
        """challenge_completion signal → business category challenge"""
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.CHALLENGE_COMPLETION, {"text": "a"}, 0.79, "q1"),
            ConversationSignal(SignalType.VOICE_AUTHENTICITY, {"text": "b"}, 0.4, "q2"),
        ]
        challenge = _select_challenge(state)
        assert challenge["signal_targeted"] == "challenge_completion"
        assert challenge["category"] == "business"
        assert challenge["id"] == "business_completion_001"

    def test_selects_peer_recognition_challenge(self):
        """peer_recognition signal → creative category challenge"""
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.PEER_RECOGNITION, {"text": "a"}, 0.88, "q1"),
            ConversationSignal(SignalType.CONTRIBUTION_DRIVE, {"text": "b"}, 0.4, "q2"),
        ]
        challenge = _select_challenge(state)
        assert challenge["signal_targeted"] == "peer_recognition"
        assert challenge["category"] == "creative"
        assert challenge["id"] == "creative_peer_001"


class TestUserStateHelpers:
    """Test UserState computed properties"""

    def test_signals_by_type_groups_correctly(self):
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.PURPOSE_CLARITY, {}, 0.5, "q1"),
            ConversationSignal(SignalType.PURPOSE_CLARITY, {}, 0.7, "q2"),
            ConversationSignal(SignalType.INITIATIVE_TAKING, {}, 0.8, "q3"),
        ]
        by_type = state.signals_by_type
        assert len(by_type[SignalType.PURPOSE_CLARITY]) == 2
        assert len(by_type[SignalType.INITIATIVE_TAKING]) == 1

    def test_comparative_vector_averages(self):
        state = UserState(telegram_user_id=123)
        state.signals = [
            ConversationSignal(SignalType.PURPOSE_CLARITY, {}, 0.6, "q1"),
            ConversationSignal(SignalType.PURPOSE_CLARITY, {}, 0.8, "q2"),
        ]
        vector = state.comparative_vector
        # Average of 0.6 and 0.8 = 0.7
        assert vector["purpose_clarity"] == pytest.approx(0.7)

    def test_is_resumable_for_in_progress_phases(self):
        state = UserState(telegram_user_id=123)
        for phase in [Phase.PHASE_1_OPENING, Phase.PHASE_2_ORIENTATION,
                      Phase.PHASE_3_EVIDENCE, Phase.PHASE_4_MIRROR]:
            state.phase = phase
            assert state.is_resumable

    def test_is_not_resumable_for_new_and_completed(self):
        state = UserState(telegram_user_id=123)
        state.phase = Phase.NEW
        assert not state.is_resumable
        state.phase = Phase.COMPLETED
        assert not state.is_resumable


class TestCommandHandlers:
    """Test /command handlers that are independent of async Telegram flow"""

    def test_handle_start_resets_state(self, fresh_state):
        """Fresh start resets signals, mirror_summary, challenge, and quick_replies"""
        # Pre-populate state to verify reset
        fresh_state.phase = Phase.PHASE_4_MIRROR
        fresh_state.signals.append(ConversationSignal(
            signal_type=SignalType.PURPOSE_CLARITY,
            value="something",
            confidence=0.8,
            question_id="p1"
        ))
        fresh_state.mirror_summary = "old summary"
        fresh_state.chosen_challenge = {"id": "some_challenge"}
        fresh_state.quick_replies = ["old reply"]

        response = handle_start(fresh_state)

        assert fresh_state.phase == Phase.PHASE_1_OPENING
        assert len(fresh_state.signals) == 0
        assert fresh_state.mirror_summary is None
        assert fresh_state.chosen_challenge is None
        assert fresh_state.quick_replies == []

    def test_handle_start_returns_opening_question(self, fresh_state):
        response = handle_start(fresh_state)
        # Should return the Phase 1 opening question
        assert len(response) > 20

    def test_handle_map_prompts_new_user(self, fresh_state):
        """NEW users haven't started — should prompt to begin"""
        fresh_state.phase = Phase.NEW
        response = handle_map(fresh_state)
        assert "haven't started" in response.lower() or "begin" in response.lower()

    def test_handle_map_returns_url_for_active_user(self, fresh_state):
        """Active users get their map URL"""
        fresh_state.phase = Phase.PHASE_3_EVIDENCE
        response = handle_map(fresh_state)
        assert "map" in response.lower()
        assert "contributiongraph.ai" in response or "/map/" in response

    def test_handle_continue_restarts_completed_user(self, fresh_state):
        """COMPLETED users who /continue get a fresh start (Phase 1 opening)"""
        fresh_state.phase = Phase.COMPLETED
        response = handle_continue(fresh_state)
        # COMPLETED.is_resumable = False, so /continue → handle_start → Phase 1
        assert fresh_state.phase == Phase.PHASE_1_OPENING
        assert len(response) > 0

    def test_handle_continue_prompts_new_user(self, fresh_state):
        """NEW users should be prompted to start"""
        fresh_state.phase = Phase.NEW
        response = handle_continue(fresh_state)
        assert len(response) > 0

    def test_handle_continue_resumes_in_progress_user(self, fresh_state):
        """In-progress users should get a resume message"""
        fresh_state.phase = Phase.PHASE_3_EVIDENCE
        response = handle_continue(fresh_state)
        assert len(response) > 0
        # Should not say "map" for in-progress users
        assert "map" not in response.lower()

    def test_handle_notifications_returns_info(self, fresh_state):
        response = handle_notifications(fresh_state)
        assert len(response) > 0

    def test_handle_help_returns_info(self, fresh_state):
        response = handle_help(fresh_state)
        assert len(response) > 0
        assert "/" in response  # Help should list commands


class TestPhaseNew:
    """Test handle_phase_new — entry point for users who type without /start"""

    @pytest.mark.asyncio
    async def test_phase_new_redirects_to_phase_1(self, fresh_state):
        fresh_state.phase = Phase.NEW
        response = await handle_phase_new("I want to discover my contribution pattern", fresh_state)
        assert fresh_state.phase == Phase.PHASE_1_OPENING
        assert len(response) > 0


class TestChallengeCompletion:
    """Test challenge completion flow (Phase 5 response after choosing a challenge)"""

    @pytest.mark.asyncio
    async def test_completion_sets_phase_to_completed(self, fresh_state):
        fresh_state.phase = Phase.PHASE_5_FIRST_STRETCH
        fresh_state.chosen_challenge = {"id": "business_initiative_001", "title": "Test Challenge"}
        fresh_state.telegram_user_id = 999

        response = await handle_challenge_completion(
            "I did it — I spent 20 minutes getting started on my project",
            fresh_state
        )

        assert fresh_state.phase == Phase.COMPLETED
        assert "map" in response.lower()

    @pytest.mark.asyncio
    async def test_completion_appends_challenge_completion_signal(self, fresh_state):
        fresh_state.phase = Phase.PHASE_5_FIRST_STRETCH
        fresh_state.chosen_challenge = {"id": "impact_contribution_001", "title": "Make One Thing"}
        fresh_state.telegram_user_id = 999
        initial_signal_count = len(fresh_state.signals)

        await handle_challenge_completion("I made a thank-you note for my neighbor", fresh_state)

        assert len(fresh_state.signals) == initial_signal_count + 1
        last_signal = fresh_state.signals[-1]
        assert last_signal.signal_type == SignalType.CHALLENGE_COMPLETION

    @pytest.mark.asyncio
    async def test_completion_returns_map_url(self, fresh_state):
        fresh_state.phase = Phase.PHASE_5_FIRST_STRETCH
        fresh_state.chosen_challenge = {"id": "creative_voice_001"}
        fresh_state.telegram_user_id = 888

        response = await handle_challenge_completion("I wrote 300 words in my actual voice", fresh_state)

        assert "map" in response.lower()


class TestPhaseCompleted:
    """Test handle_phase_completed — returning user who finished at least one challenge"""

    @pytest.mark.asyncio
    async def test_completed_phase_returns_map_url(self, fresh_state):
        fresh_state.phase = Phase.COMPLETED
        fresh_state.telegram_user_id = 777

        response = await handle_phase_completed("I'm ready for my next challenge", fresh_state)

        assert "map" in response.lower()
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_completed_phase_mentions_continue(self, fresh_state):
        fresh_state.phase = Phase.COMPLETED
        fresh_state.telegram_user_id = 777

        response = await handle_phase_completed("", fresh_state)

        assert "/continue" in response or "come back" in response.lower()
