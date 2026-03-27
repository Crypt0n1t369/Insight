"""
Contribution Graph — Map SVG Renderer

Renders a user's contribution map as an interactive SVG visualization.
Based on: DISCOVERY-FLOW.md / IDENTITY-ARCHITECTURE.md
"""

from dataclasses import dataclass, field
from typing import Optional
import html


@dataclass
class MapData:
    short_code: str
    display_name: str
    phase: any  # Phase enum
    signals: list[dict]
    challenges: list[dict]
    comparative_vector: dict[str, float]
    map_version: int = 1


# Signal type → display metadata
# Covers all SignalType enum values from bot/states.py
SIGNAL_META = {
    # Identity & Meaning
    "purpose_clarity":        {"label": "Purpose Clarity",        "icon": "🎯", "color": "#7C3AED"},
    "values_alignment":       {"label": "Values Alignment",       "icon": "⚖️",  "color": "#06B6D4"},
    "contribution_drive":     {"label": "Contribution Drive",     "icon": "🌱", "color": "#3B82F6"},
    # Creative Ability
    "pattern_recognition":    {"label": "Pattern Recognition",   "icon": "🔍", "color": "#10B981"},
    "expression_fluency":     {"label": "Expression Fluency",    "icon": "💬", "color": "#F472B6"},
    "novel_assembly":         {"label": "Novel Assembly",         "icon": "🧩", "color": "#A78BFA"},
    # Goal Pursuit
    "initiative_taking":      {"label": "Initiative",            "icon": "⚡", "color": "#F59E0B"},
    "obstacle_persistence":   {"label": "Obstacle Persistence",   "icon": "🔥", "color": "#EF4444"},
    "milestone_tracking":     {"label": "Milestone Tracking",     "icon": "📍", "color": "#14B8A6"},
    # Social Proof
    "peer_recognition":       {"label": "Peer Recognition",      "icon": "👏", "color": "#FB923C"},
    "community_recitation":   {"label": "Community Citation",    "icon": "🔗", "color": "#38BDF8"},
    "mutual_aid_exchange":    {"label": "Mutual Aid Exchange",   "icon": "🤝", "color": "#4ADE80"},
    # Challenge Status
    "challenge_completion":    {"label": "Challenge Completion",  "icon": "🏆", "color": "#8B5CF6"},
    "challenge_complexity":   {"label": "Challenge Complexity",   "icon": "📈", "color": "#F87171"},
    "challenge_velocity":     {"label": "Challenge Velocity",    "icon": "🚀", "color": "#FBBF24"},
    # Voice & Agency
    "voice_authenticity":     {"label": "Voice & Authenticity",  "icon": "🎤", "color": "#EF4444"},
    "agency_assertion":       {"label": "Agency Assertion",      "icon": "💪", "color": "#F97316"},
    "resistance_persistence": {"label": "Resistance Persistence", "icon": "🛡️", "color": "#6B7280"},
}

DEFAULT_COLOR = "#6B7280"


def _signal_bar(value: float, color: str, label: str, dim: int) -> str:
    """Render a single signal strength bar"""
    pct = int(value * 100)
    bar_id = f"bar-{dim}"
    return f"""
    <g class="signal-row" transform="translate(40, {dim * 52})">
        <text x="0" y="12" class="signal-icon">{SIGNAL_META.get(label, {}).get('icon', '○')}</text>
        <text x="32" y="14" class="signal-label">{SIGNAL_META.get(label, {}).get('label', label)}</text>
        <rect x="200" y="2" width="200" height="20" rx="4" fill="#1F2937"/>
        <rect x="200" y="2" width="{pct * 2}" height="20" rx="4" fill="{color}" class="bar-fill">
            <animate attributeName="width" from="0" to="{pct * 2}" dur="0.8s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1"/>
        </rect>
        <text x="410" y="16" class="signal-pct">{pct}%</text>
    </g>"""


def _challenge_item(challenge: dict, idx: int) -> str:
    """Render a single challenge entry"""
    status = challenge.get("status", "unknown")
    emoji = "✅" if status == "completed" else "⏳" if status == "in_progress" else "○"
    title = challenge.get("challenge_id", "challenge").replace("_", " ").title()
    return f"""
    <g transform="translate(0, {idx * 30})">
        <text x="0" y="14" class="challenge-emoji">{emoji}</text>
        <text x="24" y="14" class="challenge-title">{title}</text>
    </g>"""


def render_map_svg(data: MapData) -> str:
    """
    Render a full contribution map as an inline SVG string.
    Designed for embedding in an HTML page.
    """
    # Sort signal dimensions by comparative vector score
    sorted_dims = sorted(
        data.comparative_vector.items(),
        key=lambda x: x[1],
        reverse=True
    )

    # Build signal bars
    signal_bars = "\n".join(
        _signal_bar(score, SIGNAL_META.get(sig, {}).get("color", DEFAULT_COLOR), sig, idx + 1)
        for idx, (sig, score) in enumerate(sorted_dims)
    ) or "<text x='40' y='120' class='empty-state'>Complete challenges to build your map...</text>"

    # Build challenge list
    challenge_rows = "\n".join(
        _challenge_item(ch, i) for i, ch in enumerate(data.challenges[-5:])
    ) or "<text x='0' y='14' class='empty-state'>No challenges completed yet.</text>"

    # Phase badge color
    phase_color = {
        "phase_1_opening": "#7C3AED",
        "phase_2_orientation": "#3B82F6",
        "phase_3_evidence": "#10B981",
        "phase_4_mirror": "#F59E0B",
        "phase_5_first_stretch": "#EF4444",
        "completed": "#8B5CF6",
    }.get(data.phase.value, "#6B7280")

    total_signals = len(data.signals)
    completed_challenges = sum(1 for c in data.challenges if c.get("status") == "completed")

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 480" class="contribution-map">
    <style>
        .map-bg {{ fill: #111827; }}
        .map-card {{ fill: #1F2937; rx: 12; }}
        .section-title {{ font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; fill: #9CA3AF; text-transform: uppercase; letter-spacing: 0.08em; }}
        .display-name {{ font-family: system-ui, sans-serif; font-size: 22px; font-weight: 700; fill: #F9FAFB; }}
        .short-code {{ font-family: monospace; font-size: 11px; fill: #6B7280; }}
        .signal-label {{ font-family: system-ui, sans-serif; font-size: 13px; fill: #D1D5DB; }}
        .signal-pct {{ font-family: system-ui, sans-serif; font-size: 12px; fill: #9CA3AF; }}
        .signal-icon {{ font-size: 14px; }}
        .bar-fill {{ transition: width 0.6s ease-out; }}
        .challenge-title {{ font-family: system-ui, sans-serif; font-size: 13px; fill: #D1D5DB; }}
        .challenge-emoji {{ font-size: 14px; }}
        .stat-value {{ font-family: system-ui, sans-serif; font-size: 28px; font-weight: 700; fill: #F9FAFB; }}
        .stat-label {{ font-family: system-ui, sans-serif; font-size: 11px; fill: #6B7280; }}
        .phase-badge {{ font-family: system-ui, sans-serif; font-size: 11px; font-weight: 600; fill: white; }}
        .empty-state {{ font-family: system-ui, sans-serif; font-size: 13px; fill: #4B5563; }}
        .footer-text {{ font-family: system-ui, sans-serif; font-size: 11px; fill: #374151; }}
        @keyframes grow-bar {{ from {{ width: 0; }} }}
        .bar-fill {{ animation: grow-bar 0.8s ease-out; }}
    </style>

    <!-- Background -->
    <rect width="620" height="480" class="map-bg"/>

    <!-- Header -->
    <text x="24" y="36" class="display-name">{html.escape(data.display_name)}</text>
    <text x="24" y="54" class="short-code">{html.escape(data.short_code)} · v{data.map_version}</text>

    <!-- Phase badge -->
    <rect x="440" y="20" width="156" height="28" rx="14" fill="{phase_color}" opacity="0.15"/>
    <rect x="440" y="20" width="156" height="28" rx="14" fill="none" stroke="{phase_color}" stroke-width="1.5"/>
    <text x="518" y="38" text-anchor="middle" class="phase-badge" fill="{phase_color}">● {html.escape(data.phase.display_name)}</text>

    <!-- Divider -->
    <line x1="24" y1="66" x2="596" y2="66" stroke="#374151" stroke-width="1"/>

    <!-- Stats row -->
    <g transform="translate(24, 82)">
        <text x="0" y="28" class="stat-value">{total_signals}</text>
        <text x="0" y="44" class="stat-label">SIGNALS</text>

        <text x="120" y="28" class="stat-value">{completed_challenges}</text>
        <text x="120" y="44" class="stat-label">CHALLENGES</text>

        <text x="220" y="28" class="stat-value">{len(data.comparative_vector)}</text>
        <text x="220" y="44" class="stat-label">DIMENSIONS</text>
    </g>

    <!-- Signal Strengths Card -->
    <rect x="16" y="115" width="450" height="320" class="map-card"/>
    <text x="40" y="142" class="section-title">Signal Strengths</text>
    {signal_bars}

    <!-- Challenge History Card -->
    <rect x="480" y="115" width="124" height="180" class="map-card"/>
    <text x="496" y="142" class="section-title">Challenges</text>
    <g transform="translate(496, 160)">
        {challenge_rows}
    </g>

    <!-- Footer -->
    <text x="310" y="468" text-anchor="middle" class="footer-text">contributiongraph.ai · Your map grows with every challenge</text>
</svg>"""
    return svg
