"""
Contribution Graph — Bot State Machine

Implements the 5-phase Discovery Flow conversation.
See: DISCOVERY-FLOW.md Phase definitions

Phase flow:
  NEW → PHASE_1_OPENING → PHASE_2_ORIENTATION → PHASE_3_EVIDENCE
      → PHASE_4_MIRROR → PHASE_5_FIRST_STRETCH → COMPLETED
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import Optional
import uuid


class Phase(Enum):
    NEW = "new"
    PHASE_1_OPENING = "phase_1_opening"
    PHASE_2_ORIENTATION = "phase_2_orientation"
    PHASE_3_EVIDENCE = "phase_3_evidence"
    PHASE_4_MIRROR = "phase_4_mirror"
    PHASE_5_FIRST_STRETCH = "phase_5_first_stretch"
    COMPLETED = "completed"

    @property
    def display_name(self) -> str:
        names = {
            Phase.NEW: "Welcome",
            Phase.PHASE_1_OPENING: "Opening",
            Phase.PHASE_2_ORIENTATION: "Orientation",
            Phase.PHASE_3_EVIDENCE: "Evidence",
            Phase.PHASE_4_MIRROR: "Mirror",
            Phase.PHASE_5_FIRST_STRETCH: "First Stretch",
            Phase.COMPLETED: "Complete",
        }
        return names[self]

    def next(self) -> "Phase":
        """Advance to the next phase"""
        order = [
            Phase.NEW,
            Phase.PHASE_1_OPENING,
            Phase.PHASE_2_ORIENTATION,
            Phase.PHASE_3_EVIDENCE,
            Phase.PHASE_4_MIRROR,
            Phase.PHASE_5_FIRST_STRETCH,
            Phase.COMPLETED,
        ]
        idx = order.index(self)
        if idx + 1 < len(order):
            return order[idx + 1]
        return Phase.COMPLETED


# Behavioral signal types from DISCOVERY-FLOW.md Behavioral Signal Inventory
class SignalType(Enum):
    # Identity & Meaning (IM)
    PURPOSE_CLARITY = "purpose_clarity"        # "I know what I want to create"
    VALUES_ALIGNMENT = "values_alignment"       # "My actions match my values"
    CONTRIBUTION_DRIVE = "contribution_drive"    # "I want my work to matter"

    # Creative Ability (CA)
    PATTERN_RECOGNITION = "pattern_recognition" # Notices patterns others miss
    EXPRESSION_FLUENCY = "expression_fluency"   # Can articulate ideas clearly
    NOVEL_ASSEMBLY = "novel_assembly"            # Combines elements in new ways

    # Goal Pursuit (GO)
    INITIATIVE_TAKING = "initiative_taking"     # Acts without external催促
    OBSTACLE_PERSISTENCE = "obstacle_persistence" # Continues despite difficulty
    MILESTONE_TRACKING = "milestone_tracking"   # Breaks work into checkable pieces

    # Social Proof (SP)
    PEER_RECOGNITION = "peer_recognition"       # Others notice their work
    COMMUNITY_RECITATION = "community_recitation" # Others reference their ideas
    MUTUAL_AID_EXCHANGE = "mutual_aid_exchange"  # Gives and receives help

    # Challenge Status (CS)
    CHALLENGE_COMPLETION = "challenge_completion" # Finishes what they start
    CHALLENGE_COMPLEXITY = "challenge_complexity"  # Chooses appropriately hard challenges
    CHALLENGE_VELOCITY = "challenge_velocity"     # Speed of challenge progression

    # Voice & Agency (VA)
    VOICE_AUTHENTICITY = "voice_authenticity"   # Speaks in their own voice
    AGENCY_ASSERTION = "agency_assertion"        # "I decided this"
    RESISTANCE_PERSISTENCE = "resistance_persistence"  # Maintains direction under pressure


@dataclass
class ConversationSignal:
    """A behavioral signal collected during conversation"""
    signal_type: SignalType
    value: dict          # Raw signal data (question asked, answer given, context)
    confidence: float    # 0.0-1.0
    question_id: str     # Which question triggered this signal


@dataclass
class UserState:
    """
    Persistent state for a user across conversation sessions.
    Stored in the database (users + conversation_sessions tables).
    """
    telegram_user_id: int
    phase: Phase = Phase.NEW
    session_id: Optional[uuid.UUID] = None

    # Signals collected across ALL sessions
    signals: list[ConversationSignal] = field(default_factory=list)

    # Mirror phase — the bot's summary of the user's map (to be corrected)
    mirror_summary: Optional[dict] = None

    # The personalized challenge chosen in Phase 5
    chosen_challenge: Optional[dict] = None

    # Evidence of completion (what they produced)
    evidence: Optional[dict] = None

    # Quick-reply buttons for current phase
    quick_replies: list[str] = field(default_factory=list)

    # Last active timestamp
    last_message_at: Optional[str] = None

    @property
    def signals_by_type(self) -> dict[SignalType, list[ConversationSignal]]:
        """Group signals by type for map generation"""
        grouped = {}
        for sig in self.signals:
            grouped.setdefault(sig.signal_type, []).append(sig)
        return grouped

    @property
    def comparative_vector(self) -> dict[str, float]:
        """
        Compute comparative vector from collected signals.
        Averaged confidence per signal type.
        """
        vector = {}
        for sig_type, sigs in self.signals_by_type.items():
            avg_confidence = sum(s.confidence for s in sigs) / len(sigs)
            vector[sig_type.value] = avg_confidence
        return vector

    @property
    def is_resumable(self) -> bool:
        """Can this user's conversation be resumed?"""
        return self.phase not in (Phase.NEW, Phase.COMPLETED)


# Rate limiter for short_code verification attempts
@dataclass
class RateLimitEntry:
    ip_address: str
    attempts: int
    window_start: float  # Unix timestamp
