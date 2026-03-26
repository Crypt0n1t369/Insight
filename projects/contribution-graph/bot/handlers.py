"""
Contribution Graph — Telegram Bot Handlers

Implements the 5-phase Discovery Flow conversation.
See: DISCOVERY-FLOW.md

Entry point: handle_update(update) — called by the Telegram webhook/polling loop.
"""

import time
import logging
from typing import Optional

from .states import Phase, UserState, ConversationSignal, SignalType

logger = logging.getLogger(__name__)


# =============================================================================
# ENTRY POINT
# =============================================================================

async def handle_update(telegram_update: dict, user_state: UserState) -> str:
    """
    Main entry point. Routes a Telegram update to the appropriate handler.

    Args:
        telegram_update: Parsed Telegram update dict
        user_state: Current state for this user

    Returns:
        The bot's response string (or empty string if no reply needed)
    """
    message = telegram_update.get("message", {})
    text = message.get("text", "").strip()
    chat_id = message.get("chat", {}).get("id")

    # Handle commands first
    if text.startswith("/"):
        return await handle_command(text, user_state)

    # Route by phase
    handlers = {
        Phase.NEW: handle_phase_new,
        Phase.PHASE_1_OPENING: handle_phase_1_opening,
        Phase.PHASE_2_ORIENTATION: handle_phase_2_orientation,
        Phase.PHASE_3_EVIDENCE: handle_phase_3_evidence,
        Phase.PHASE_4_MIRROR: handle_phase_4_mirror,
        Phase.PHASE_5_FIRST_STRETCH: handle_phase_5_first_stretch,
        Phase.COMPLETED: handle_phase_completed,
    }

    handler = handlers.get(user_state.phase, handle_phase_new)
    return await handler(text, user_state)


# =============================================================================
# COMMAND HANDLERS
# =============================================================================

async def handle_command(text: str, state: UserState) -> str:
    """Handle /commands like /start, /map, /continue, /notifications"""
    cmd = text.split()[0].lower()

    if cmd == "/start":
        return handle_start(state)
    elif cmd == "/map":
        return handle_map(state)
    elif cmd == "/continue":
        return handle_continue(state)
    elif cmd == "/notifications":
        return handle_notifications(state)
    elif cmd == "/help":
        return handle_help(state)
    else:
        return f"Unknown command: {cmd}. Try /help"


def handle_start(state: UserState) -> str:
    """Fresh start — reset to Phase 1"""
    state.phase = Phase.PHASE_1_OPENING
    state.signals.clear()
    state.mirror_summary = None
    state.chosen_challenge = None
    state.quick_replies = []
    return P1_OPENING_QUESTION


def handle_map(state: UserState) -> str:
    """Return the user's map URL (or prompt to complete onboarding first)"""
    if state.phase == Phase.NEW:
        return "You haven't started your map yet. Type anything to begin!"
    short_code = _get_short_code(state.telegram_user_id)
    return (
        f"Your map: contributiongraph.ai/map/{short_code}\n\n"
        "Use /notifications to control reminders."
    )


def handle_continue(state: UserState) -> str:
    """Resume from where they left off"""
    if not state.is_resumable:
        return handle_start(state)

    prompts = {
        Phase.PHASE_1_OPENING: "Welcome back! Let's continue your map.\n\n" + P1_OPENING_QUESTION,
        Phase.PHASE_2_ORIENTATION: "Welcome back! You were in the Orientation phase.\n\n" + P2_ENTRY,
        Phase.PHASE_3_EVIDENCE: "Welcome back! Let's gather more evidence.\n\n" + P3_ENTRY,
        Phase.PHASE_4_MIRROR: "Welcome back! Your map summary is ready.\n\n" + P4_ENTRY,
        Phase.PHASE_5_FIRST_STRETCH: "Welcome back! Let's choose your first challenge.\n\n" + P5_ENTRY,
    }
    return prompts.get(state.phase, handle_start(state))


def handle_notifications(state: UserState) -> str:
    """Toggle or show notification preferences"""
    state.quick_replies = ["Full", "Focus", "Off"]
    return "Choose notification level:\n• Full — all reminders\n• Focus — 2-3/week max\n• Off — you initate"


def handle_help(state: UserState) -> str:
    return (
        "Contribution Graph Bot\n\n"
        "/start — Begin your map\n"
        "/map — View your contribution map\n"
        "/continue — Resume where you left off\n"
        "/notifications — Control reminders\n"
        "/help — Show this message"
    )


# =============================================================================
# PHASE 1: OPENING
# =============================================================================

# The Socratic entry question from DISCOVERY-FLOW.md
P1_OPENING_QUESTION = (
    "Hey — I've been thinking about what you said the last time we talked.\n\n"
    "Here's what I noticed: you seem to care about doing work that actually matters "
    "to you — not just completing tasks, but creating something you're proud of.\n\n"
    "Is that right? And if so — what's the thing you're most trying to figure out right now?"
)


async def handle_phase_new(text: str, state: UserState) -> str:
    """Phase NEW — greet and direct to /start"""
    if not text or len(text) < 5:
        return (
            "Welcome! I'm the Contribution Graph bot. "
            "Type /start to begin your map."
        )
    # If they type something, treat it as a first message after directing to start
    state.phase = Phase.PHASE_1_OPENING
    return P1_OPENING_QUESTION


async def handle_phase_1_opening(text: str, state: UserState) -> str:
    """
    Phase 1: Opening — establish the topic, collect the primary question.

    The user's answer reveals:
    - IM (Identity & Meaning): What they care about, purpose clarity
    - VA (Voice & Agency): How they express themselves, agency assertion
    """
    if not text or len(text) < 10:
        return (
            "I'd love to understand more. "
            "What's the thing you've been thinking about most — "
            "not just a task, but something that actually matters to you?"
        )

    # Collect signal from this exchange
    signal = ConversationSignal(
        signal_type=SignalType.PURPOSE_CLARITY,
        value={"answer": text, "question": P1_OPENING_QUESTION},
        confidence=_assess_confidence(text, keywords=["i want", "i'm trying", "i'm working", "my goal"]),
        question_id="p1_opening"
    )
    state.signals.append(signal)

    # Advance to Phase 2
    state.phase = Phase.PHASE_2_ORIENTATION
    state.quick_replies = ["Yes, exactly", "Sort of", "Not really"]

    return (
        f"That's helpful context. Let me make sure I'm tracking correctly.\n\n"
        f"So the thing you're working toward is: {text[:100]}{'...' if len(text) > 100 else ''}\n\n"
        f"Is that the core of it?"
    )


# =============================================================================
# PHASE 2: ORIENTATION
# =============================================================================

P2_ENTRY = (
    "Good. Now let me ask you something a little differently.\n\n"
    "Think about the last time you did something that felt really meaningful to you — "
    "not necessarily big, but something where you felt like you were in the zone, "
    "doing exactly what you were meant to do.\n\n"
    "What was happening? What did it feel like?"
)


async def handle_phase_2_orientation(text: str, state: UserState) -> str:
    """
    Phase 2: Orientation — notice the problem, discover the aspirational self.

    Collects evidence of:
    - CA (Creative Ability): Pattern recognition, expression fluency
    - GO (Goal Pursuit): Initiative taking, obstacle persistence
    - VA (Voice & Agency): Voice authenticity, agency assertion
    """
    if not text or len(text) < 15:
        return (
            "Take your time. What was the situation, and what did it feel like on the inside?"
        )

    # Extract aspirational self description from the answer
    aspirational_keywords = _extract_keywords(text)

    signal = ConversationSignal(
        signal_type=SignalType.PATTERN_RECOGNITION,
        value={"answer": text, "keywords": aspirational_keywords, "question": P2_ENTRY},
        confidence=_assess_confidence(text, keywords=["felt like", "exactly", "right", "meant to"]),
        question_id="p2_zone"
    )
    state.signals.append(signal)

    state.phase = Phase.PHASE_3_EVIDENCE
    state.quick_replies = []

    return (
        f"That's a powerful signal. The fact that you can describe it — "
        f"what it felt like and what was happening — tells me something real about "
        f"how you work.\n\n"
        f"Now let me ask you something that might feel a little uncomfortable: "
        f"how often do you get to do work that feels like that?"
    )


# =============================================================================
# PHASE 3: EVIDENCE
# =============================================================================

P3_ENTRY = (
    "That's the gap I want to understand.\n\n"
    "Here's a specific question: think about the last two weeks. "
    "What's the thing you did that you're most proud of — not what turned out best, "
    "but what felt most like *you*?"
)


async def handle_phase_3_evidence(text: str, state: UserState) -> str:
    """
    Phase 3: Evidence — collect behavioral signals through behavioral questions.

    Behavioral signals collected (vs. self-report):
    - CA: Evidence of novel assembly, expression fluency
    - GO: Evidence of initiative taking, milestone tracking
    - SP: Evidence of peer recognition, mutual aid
    """
    if not text or len(text) < 15:
        return (
            "No wrong answer here — what's the moment from the last two weeks "
            "that felt most like you?"
        )

    signal = ConversationSignal(
        signal_type=SignalType.INITIATIVE_TAKING,
        value={"answer": text, "question": P3_ENTRY, "timeframe": "last_two_weeks"},
        confidence=_assess_confidence(text, keywords=["i decided", "i started", "i made", "i created", "actually"]),
        question_id="p3_proudest"
    )
    state.signals.append(signal)

    state.phase = Phase.PHASE_4_MIRROR
    state.quick_replies = []

    # Generate the mirror summary (this would normally call the AI synthesis module)
    state.mirror_summary = _generate_mirror_summary(state)

    return (
        f"Okay. I have enough to show you something.\n\n"
        f"Based on what you've told me, here's what I see:\n\n"
        f"{state.mirror_summary['text']}\n\n"
        f"Does that feel right? What's off?"
    )


# =============================================================================
# PHASE 4: MIRROR
# =============================================================================

P4_ENTRY = (
    "Here's what I see from what you've shared:\n\n"
    "{mirror_text}\n\n"
    "Tell me what's wrong with this picture — "
    "what did I get wrong, and what's missing?"
)


async def handle_phase_4_mirror(text: str, state: UserState) -> str:
    """
    Phase 4: Mirror — user corrects the bot's summary.

    Collects:
    - Corrections (what the bot got wrong) — high-signal for VA and IM
    - Additions (what was missing) — fills gaps in comparative vector
    """
    if not text or len(text) < 5:
        return (
            "What did I get wrong? What's missing? "
            "Be as specific as you want — this part is important."
        )

    # High-confidence signal from corrections (user telling us who they really are)
    signal = ConversationSignal(
        signal_type=SignalType.VOICE_AUTHENTICITY,
        value={"corrections": text, "mirror": state.mirror_summary},
        confidence=0.9,  # Corrections are high-confidence signals
        question_id="p4_corrections"
    )
    state.signals.append(signal)

    state.phase = Phase.PHASE_5_FIRST_STRETCH
    state.quick_replies = []

    return (
        f"Thank you for that — that's exactly what helps the map become more accurate.\n\n"
        f"I've updated it. Now here's the thing: your map becomes real "
        f"not by thinking about it, but by testing it.\n\n"
        f"I'm going to give you a small challenge — something that matches "
        f"what I see in you. You don't have to accept it. But if you do it, "
        f"it'll show you something about how you work.\n\n"
        f"Ready?"
    )


# =============================================================================
# PHASE 5: FIRST STRETCH
# =============================================================================

P5_ENTRY = (
    "Here's your challenge:\n\n"
    "{challenge_text}\n\n"
    "This should take about 20-30 minutes. "
    "When you're done, come back here and tell me what happened — "
    "what you made, what you noticed, what surprised you.\n\n"
    "Your map will update based on what you actually did, not what you said you'd do."
)


async def handle_phase_5_first_stretch(text: str, state: UserState) -> str:
    """
    Phase 5: First Stretch — assign personalized challenge, deliver map.

    User's response to "Ready?" can be Yes/No/Later.
    After challenge completion, map URL is delivered.
    """
    text_lower = text.lower().strip()

    if text_lower in ("yes", "yeah", "sure", "let's do it", "ready", "ok", "okay"):
        challenge = _select_challenge(state)
        state.chosen_challenge = challenge
        challenge_text = _format_challenge(challenge)
        return P5_ENTRY.replace("{challenge_text}", challenge_text)

    elif text_lower in ("no", "not now", "later", "maybe later"):
        state.quick_replies = ["I'm ready now", "Remind me tomorrow"]
        return (
            "No pressure at all. Come back whenever you're ready — "
            "your map will be here. Just type /continue to pick up."
        )

    else:
        # They might be reporting challenge completion
        if state.chosen_challenge:
            return await handle_challenge_completion(text, state)
        return "Type 'yes' when you're ready for your challenge, or 'later' to skip."


async def handle_challenge_completion(text: str, state: UserState) -> str:
    """
    User completed the challenge and is reporting back.
    Generate the map and deliver the URL.
    """
    # High-signal completion evidence
    signal = ConversationSignal(
        signal_type=SignalType.CHALLENGE_COMPLETION,
        value={
            "challenge": state.chosen_challenge,
            "report": text,
            "challenge_id": state.chosen_challenge.get("id")
        },
        confidence=_assess_confidence(text, keywords=["i made", "i did", "i created", "finished", "done"]),
        question_id="p5_completion"
    )
    state.signals.append(signal)

    state.phase = Phase.COMPLETED
    short_code = _get_short_code(state.telegram_user_id)

    return (
        f"That counts. What you just did — reporting back honestly — "
        f"is already showing me something about your arc.\n\n"
        f"Your map is ready: contributiongraph.ai/map/{short_code}\n\n"
        f"It'll grow every time you complete a challenge. "
        f"Come back whenever you're ready for the next one."
    )


# =============================================================================
# COMPLETED PHASE
# =============================================================================

async def handle_phase_completed(text: str, state: UserState) -> str:
    """Returning user who has completed at least one challenge"""
    short_code = _get_short_code(state.telegram_user_id)
    return (
        f"Welcome back! Your map is at: contributiongraph.ai/map/{short_code}\n\n"
        f"Use /continue to pick up where you left off, or /map to view it.\n\n"
        f"When you're ready for your next challenge, just say so."
    )


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _assess_confidence(text: str, keywords: list[str]) -> float:
    """Simple keyword-based confidence scoring (0.0-1.0)"""
    text_lower = text.lower()
    matches = sum(1 for kw in keywords if kw.lower() in text_lower)
    return min(0.9, 0.4 + (matches * 0.15))  # 0.4 base + 0.15 per keyword, max 0.9


def _extract_keywords(text: str) -> list[str]:
    """Extract meaningful words from text (simple implementation)"""
    # Remove common words, keep nouns/verbs
    stopwords = {"the", "a", "an", "is", "was", "were", "i", "me", "my", "to", "and", "it", "of", "in", "for", "on", "that", "this"}
    words = [w.strip(",.!?") for w in text.lower().split()]
    return [w for w in words if len(w) > 3 and w not in stopwords]


def _generate_mirror_summary(state: UserState) -> dict:
    """
    Generate the bot's summary of the user (Phase 4 Mirror).
    In production, this would call the AI synthesis module.
    For now, generates a simple text summary from collected signals.
    """
    vector = state.comparative_vector

    # Find top 3 signal types by confidence
    sorted_sigs = sorted(vector.items(), key=lambda x: x[1], reverse=True)
    top_signals = sorted_sigs[:3]

    lines = [
        "Here's what I see from what you've told me:",
        "",
    ]

    for sig_type, confidence in top_signals:
        if sig_type == "purpose_clarity":
            lines.append("• You have a clear sense of what matters to you")
        elif sig_type == "initiative_taking":
            lines.append("• You tend to start things on your own initiative")
        elif sig_type == "pattern_recognition":
            lines.append("• You notice things other people miss")
        elif sig_type == "voice_authenticity":
            lines.append("• You know how to speak in your own voice")
        elif sig_type == "contribution_drive":
            lines.append("• You care about work that contributes to something bigger")
        else:
            lines.append(f"• You show {sig_type.replace('_', ' ')}")

    if top_signals:
        avg_confidence = sum(c for _, c in top_signals) / len(top_signals)
        lines.extend(["", f"(Average confidence: {int(avg_confidence * 100)}%)"])

    return {
        "text": "\n".join(lines),
        "top_signals": top_signals,
        "version": 1,
    }


# =============================================================================
# CHALLENGE LIBRARY
# =============================================================================
# Expanded from DISCOVERY-FLOW-APPENDIX.md — Appendix D
# Each challenge: id, category (impact/creative/business), type (meaning/action/creative),
# title, description, duration_minutes, signal_targeted
#
# Selection logic: primary signal → category match; secondary signals → specific challenge within category
# Track mapping: purpose_clarity→meaning/impact, initiative_taking→action/impact/business,
#                pattern_recognition→creative, voice_authenticity→creative, contribution_drive→impact

CHALLENGE_LIBRARY = {
    # ---------------------------------------------------------------------------
    # IMPACT CHALLENGES (Track 1: Helping real people, community problems)
    # Mapped to: contribution_drive (primary), purpose_clarity (secondary)
    # ---------------------------------------------------------------------------
    "impact_contribution_001": {
        "id": "impact_contribution_001",
        "category": "impact",
        "type": "meaning",
        "title": "Make One Thing for Someone Else",
        "description": (
            "Think of one person who's helped you or your community. "
            "Spend 20-30 minutes making something for them — advice, a resource, "
            "a thank-you note, a useful tool. Something concrete. "
            "Send it or give it to them this week."
        ),
        "duration_minutes": 30,
        "signal_targeted": "contribution_drive",
    },
    "impact_contribution_002": {
        "id": "impact_contribution_002",
        "category": "impact",
        "type": "action",
        "title": "The Observation Challenge",
        "description": (
            "Find one person in your life who's doing something difficult. "
            "Don't solve it. Don't help. Just ask them one question that helps them see "
            "their own situation more clearly. Report what happened — "
            "not what their problem was, but what you noticed in the conversation."
        ),
        "duration_minutes": 25,
        "signal_targeted": "contribution_drive",
    },
    "impact_contribution_003": {
        "id": "impact_contribution_003",
        "category": "impact",
        "type": "action",
        "title": "The Documentation Challenge",
        "description": (
            "There's an issue in your neighborhood, school, or community that you care about "
            "but don't fully understand. Find one person who knows more about it than you. "
            "Ask them three good questions. Write down not just what they said — "
            "but what you noticed about how they said it. "
            "What did you learn about the problem? What did you learn about them?"
        ),
        "duration_minutes": 45,
        "signal_targeted": "contribution_drive",
    },
    "impact_purpose_001": {
        "id": "impact_purpose_001",
        "category": "impact",
        "type": "meaning",
        "title": "Find the Gap",
        "description": (
            "Think about something in your community, school, or workplace that "
            "frustrates you — something that could be better. Don't solve it. "
            "Just describe: what is it, who's affected, and why it matters. "
            "One paragraph. Be specific."
        ),
        "duration_minutes": 15,
        "signal_targeted": "purpose_clarity",
    },
    "impact_purpose_002": {
        "id": "impact_purpose_002",
        "category": "impact",
        "type": "action",
        "title": "The Prototyping Challenge",
        "description": (
            "Design one small thing that could make one person's life a little better this week. "
            "It has to be something you could actually do in the next 7 days with no budget. "
            "Do it. Report what happened — including if you didn't do it."
        ),
        "duration_minutes": 20,
        "signal_targeted": "initiative_taking",
    },
    # ---------------------------------------------------------------------------
    # CREATIVE CHALLENGES (Track 2: Making something from nothing, translation)
    # Mapped to: pattern_recognition (primary), voice_authenticity (primary),
    #             initiative_taking (secondary)
    # ---------------------------------------------------------------------------
    "creative_pattern_001": {
        "id": "creative_pattern_001",
        "category": "creative",
        "type": "creative",
        "title": "Document a Pattern",
        "description": (
            "Think about an area of your work or life where you've noticed "
            "something keeps showing up. Write down: what is the pattern? "
            "When did you first notice it? What keeps driving it?"
        ),
        "duration_minutes": 20,
        "signal_targeted": "pattern_recognition",
    },
    "creative_pattern_002": {
        "id": "creative_pattern_002",
        "category": "creative",
        "type": "creative",
        "title": "The Remix Challenge",
        "description": (
            "Find something that exists — a piece of information, a concept, a story, a dataset — "
            "and remix it into something new. Give it a new context, a new audience, or a new format. "
            "The remixed version has to reveal something the original didn't, "
            "or make it matter to someone different. "
            "Tell me what you started with, what you made, and why."
        ),
        "duration_minutes": 40,
        "signal_targeted": "pattern_recognition",
    },
    "creative_pattern_003": {
        "id": "creative_pattern_003",
        "category": "creative",
        "type": "creative",
        "title": "The Translation Challenge",
        "description": (
            "Take something you know a lot about — a skill, a subject, a world you understand. "
            "Now make something that helps a 14-year-old understand the single most important thing "
            "about it. It can be a drawing, a meme, a short video, a one-page comic, a metaphor — "
            "anything except just explaining it in plain language. "
            "Make the thing. Show me."
        ),
        "duration_minutes": 35,
        "signal_targeted": "voice_authenticity",
    },
    "creative_voice_001": {
        "id": "creative_voice_001",
        "category": "creative",
        "type": "creative",
        "title": "Speak in Your Own Voice",
        "description": (
            "Write 300 words about something you care about — not for anyone else, "
            "not polished. Just your actual voice. Then share it with one person "
            "you trust and ask them what they hear."
        ),
        "duration_minutes": 35,
        "signal_targeted": "voice_authenticity",
    },
    "creative_voice_002": {
        "id": "creative_voice_002",
        "category": "creative",
        "type": "creative",
        "title": "The Uncomfortable Truth Challenge",
        "description": (
            "What's something you believe that most people around you probably wouldn't agree with? "
            "Now make something — a post, a meme, a short video, a drawing — "
            "that expresses that belief in a way that might actually make someone reconsider. "
            "Not attack their views. Just plant a seed. "
            "Make the thing. Share it somewhere. Report what happened."
        ),
        "duration_minutes": 45,
        "signal_targeted": "voice_authenticity",
        "requires_comfort_with_disagreement": True,  # Guard: only offer if user showed openness
    },
    "creative_initiative_001": {
        "id": "creative_initiative_001",
        "category": "creative",
        "type": "action",
        "title": "Capture a Meaningful Moment",
        "description": (
            "Take 20 minutes to write down, sketch, or record one specific moment "
            "from the last month where you felt like you were doing exactly what "
            "you were meant to do. Be as concrete as possible — "
            "what was happening, who was there, what did you make or do?"
        ),
        "duration_minutes": 25,
        "signal_targeted": "voice_authenticity",
    },
    # ---------------------------------------------------------------------------
    # BUSINESS CHALLENGES (Track 3: Commercial problems, real-world action)
    # Mapped to: initiative_taking (primary), purpose_clarity (secondary)
    # ---------------------------------------------------------------------------
    "business_initiative_001": {
        "id": "business_initiative_001",
        "category": "business",
        "type": "action",
        "title": "Start Before You're Ready",
        "description": (
            "Identify one thing you've been putting off. "
            "Spend 20 minutes just getting started — even 10% of the way. "
            "Don't finish it. Just begin."
        ),
        "duration_minutes": 20,
        "signal_targeted": "initiative_taking",
    },
    "business_initiative_002": {
        "id": "business_initiative_002",
        "category": "business",
        "type": "action",
        "title": "The Sales Challenge",
        "description": (
            "Find one person who might be interested in something you could offer — "
            "not something you're selling, just something you'd be willing to do. "
            "It could be a skill, a help, a favor, a small service. "
            "Approach them. Have a real conversation about it. Don't pitch. Listen first. "
            "See if there's a fit. Report what happened — including if there wasn't."
        ),
        "duration_minutes": 30,
        "signal_targeted": "initiative_taking",
    },
    "business_purpose_001": {
        "id": "business_purpose_001",
        "category": "business",
        "type": "meaning",
        "title": "Map Your Values in Action",
        "description": (
            "List 3 concrete moments in the last month where your actions matched "
            "what you actually care about. For each: what did you do, and why did it matter?"
        ),
        "duration_minutes": 20,
        "signal_targeted": "purpose_clarity",
    },
    "business_purpose_002": {
        "id": "business_purpose_002",
        "category": "business",
        "type": "meaning",
        "title": "The Intelligence Challenge",
        "description": (
            "Think of a local business you interact with regularly — a shop, a café, a service. "
            "Pretend you're advising them for free. "
            "What's one thing they're doing really well that they probably don't realize "
            "is their competitive advantage? "
            "And what's one thing they should change that would make a meaningful difference "
            "to their business in the next 3 months? "
            "Write a one-page brief. (You're not going to give it to them unless you want to.)"
        ),
        "duration_minutes": 40,
        "signal_targeted": "purpose_clarity",
    },
    "business_pattern_001": {
        "id": "business_pattern_001",
        "category": "business",
        "type": "action",
        "title": "The Problem Decomposition Challenge",
        "description": (
            "Pick a business problem you've heard about — from a friend who runs a business, "
            "something you read about a company, or something you observed. "
            "It has to be a problem involving more than one person or more than one step to solve. "
            "Now: break it down. What are the 3 most important causes? "
            "What's the one thing that, if fixed, would make everything else easier? "
            "And what's the one thing almost everyone gets wrong about this problem? "
            "Write it up in a way that would help someone who actually has this problem."
        ),
        "duration_minutes": 45,
        "signal_targeted": "pattern_recognition",
    },
}


def _select_challenge(state: UserState) -> dict:
    """
    Select the most appropriate challenge based on the user's comparative vector.
    
    Selection strategy:
    1. If user has chosen a track (state.track), select from that track
    2. Otherwise, use signal type → category mapping:
       - contribution_drive → impact
       - purpose_clarity → business or impact
       - initiative_taking → business or creative
       - pattern_recognition → creative
       - voice_authenticity → creative
    3. Within the chosen category, pick the challenge that best matches
       the secondary signal (or primary if unambiguous)
    
    Falls back to a sensible default if no vector is available.
    """
    vector = state.comparative_vector

    # Build lookup: category → list of challenge ids in that category
    by_category: dict[str, list[dict]] = {}
    for ch in CHALLENGE_LIBRARY.values():
        cat = ch["category"]
        by_category.setdefault(cat, []).append(ch)

    # Signal type → primary category mapping
    sig_to_category = {
        "contribution_drive": "impact",
        "purpose_clarity": "business",   # business is more structured; purpose clarity → real-world application
        "initiative_taking": "business",
        "pattern_recognition": "creative",
        "voice_authenticity": "creative",
    }

    if not vector:
        # No vector: return the first impact challenge as a safe default
        return by_category.get("impact", list(CHALLENGE_LIBRARY.values()))[0]

    # Sort signals by confidence descending
    sorted_sigs = sorted(vector.items(), key=lambda x: x[1], reverse=True)
    primary_sig = sorted_sigs[0][0] if sorted_sigs else None
    secondary_sig = sorted_sigs[1][0] if len(sorted_sigs) > 1 else None

    # Use signal → category mapping
    primary_cat = sig_to_category.get(primary_sig)
    
    def pick_from_category(cat: str, preferred_sig: Optional[str] = None) -> dict:
        """Pick a challenge from a category, preferring the given signal."""
        candidates = by_category.get(cat, [])
        if preferred_sig:
            for c in candidates:
                if c["signal_targeted"] == preferred_sig:
                    return c
        if candidates:
            return candidates[0]
        # Fallback: return first challenge in any category
        return list(CHALLENGE_LIBRARY.values())[0]

    if primary_cat:
        result = pick_from_category(primary_cat, primary_sig)
        # If primary_cat has no good match for this sig, also check secondary
        if result["signal_targeted"] != primary_sig and secondary_sig:
            secondary_cat = sig_to_category.get(secondary_sig)
            if secondary_cat and secondary_cat != primary_cat:
                secondary_result = pick_from_category(secondary_cat, secondary_sig)
                # Prefer whichever challenge has the higher signal score
                primary_score = vector.get(primary_sig, 0)
                secondary_score = vector.get(secondary_sig, 0)
                if secondary_score >= primary_score * 0.8:  # Within 80% of top → use secondary
                    result = secondary_result
        return result

    # Ultimate fallback
    return list(CHALLENGE_LIBRARY.values())[0]


def _format_challenge(challenge: dict) -> str:
    """Format a challenge dict as a readable message"""
    emoji = {"creative": "🎨", "action": "⚡", "meaning": "🌱"}.get(challenge.get("type", ""), "→")
    track_label = {
        "impact": "🎯 Impact",
        "creative": "🎨 Creative",
        "business": "💼 Business",
    }.get(challenge.get("category", ""), "")
    track_line = f"{track_label} track\n\n" if track_label else ""
    return (
        f"{emoji} *{challenge['title']}*\n\n"
        f"{track_line}"
        f"{challenge['description']}\n\n"
        f"⏱️ Estimated time: {challenge.get('duration_minutes', 20)} minutes"
    )


def _get_short_code(telegram_user_id: int) -> str:
    """Get the short_code for a user (imports from db.identity)"""
    import os
    os.environ.setdefault("CG_SERVER_SECRET", os.getenv("CG_SERVER_SECRET", ""))
    from db.identity import generate_short_code
    return generate_short_code(telegram_user_id)
