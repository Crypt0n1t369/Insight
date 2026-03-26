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
