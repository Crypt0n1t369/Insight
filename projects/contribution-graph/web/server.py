"""
Contribution Graph — Web Server

Flask server serving the contribution map page.
Run: python -m web.server

Endpoints:
  GET  /                     — Landing page
  GET  /map/<short_code>     — User's contribution map (public, no auth)
  GET  /api/map/<short_code> — JSON API for map data
  GET  /health               — Health check

For production: use gunicorn or similar WSGI server.
"""

import os
import sys
import json
import logging
from pathlib import Path
from functools import wraps

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from flask import Flask, render_template, jsonify, abort, request, send_from_directory

from web.store import InMemoryStore
from web.rate_limiter import ShortCodeRateLimiter
from web.map_renderer import render_map_svg, MapData
from bot.states import Phase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["JSON_SORT_KEYS"] = False

# In-memory store (use SQLiteInMemoryStore for dev, swap for PostgresStore in prod)
store = InMemoryStore()
rate_limiter = ShortCodeRateLimiter(limit=3, window_seconds=60)

# Set server secret for short-code generation
os.environ.setdefault("CG_SERVER_SECRET", os.getenv("CG_SERVER_SECRET", "dev-secret-change-me"))


# =============================================================================
# ROUTES
# =============================================================================

@app.route("/")
def landing():
    """Public landing page"""
    return render_template("landing.html")


@app.route("/map/<short_code>")
def view_map(short_code: str):
    """
    Public contribution map page.
    Short code is validated (format check + rate limit).
    No authentication required — maps are public by design.
    """
    # Rate limit check
    client_ip = request.remote_addr or "unknown"
    if not rate_limiter.check(client_ip, short_code):
        abort(429, description="Too many requests. Please try again in a minute.")

    # Validate short code format
    from db.identity import parse_short_code
    normalized = parse_short_code(short_code)
    if not normalized:
        abort(404, description="Invalid short code.")

    # Look up user
    user = store.get_user_by_short_code(normalized)
    if not user:
        abort(404, description="Map not found. Complete onboarding to get your map!")

    # Get map data
    signals = store.get_signals(user["telegram_user_id"])
    challenges = store.get_challenges(user["telegram_user_id"])
    comparative_vector = store.get_comparative_vector(user["telegram_user_id"])

    map_data = MapData(
        short_code=short_code,
        display_name=user.get("display_name", f"Contributor {short_code}"),
        phase=Phase(user.get("current_phase", "completed")),
        signals=signals,
        challenges=challenges,
        comparative_vector=comparative_vector,
        map_version=user.get("map_version", 1),
    )

    svg_content = render_map_svg(map_data)

    return render_template(
        "map.html",
        short_code=short_code,
        display_name=map_data.display_name,
        svg_content=svg_content,
        phase_display=map_data.phase.display_name,
        map_version=map_data.map_version,
    )


@app.route("/api/map/<short_code>")
def api_map(short_code: str):
    """JSON API for map data (used by the map page JS for dynamic updates)"""
    from db.identity import parse_short_code

    client_ip = request.remote_addr or "unknown"
    if not rate_limiter.check(client_ip, short_code):
        return jsonify({"error": "rate_limited", "retry_after": 60}), 429

    normalized = parse_short_code(short_code)
    if not normalized:
        return jsonify({"error": "invalid_short_code"}), 404

    user = store.get_user_by_short_code(normalized)
    if not user:
        return jsonify({"error": "not_found"}), 404

    signals = store.get_signals(user["telegram_user_id"])
    challenges = store.get_challenges(user["telegram_user_id"])
    comparative_vector = store.get_comparative_vector(user["telegram_user_id"])

    return jsonify({
        "short_code": short_code,
        "display_name": user.get("display_name", f"Contributor {short_code}"),
        "phase": user.get("current_phase", "completed"),
        "map_version": user.get("map_version", 1),
        "comparative_vector": comparative_vector,
        "signals": signals,
        "challenges": challenges,
    })


@app.route("/health")
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "contribution-graph-web",
        "store_type": type(store).__name__,
    })


# =============================================================================
# DEV SEEDING ENDPOINTS (development only — should be disabled in production)
# =============================================================================

@app.route("/dev/seed/<int:telegram_user_id>")
def dev_seed(telegram_user_id: int):
    """
    Seed a test user with sample data (dev only).
    In production this would be done via the Telegram bot flow.
    """
    if app.config.get("ENV", "development") == "production":
        abort(403)

    from db.identity import generate_short_code

    short_code = generate_short_code(telegram_user_id)

    # Upsert user
    store.upsert_user(
        telegram_user_id=telegram_user_id,
        short_code=short_code,
        display_name=f"Test User {telegram_user_id % 1000}",
        phase="completed",
    )

    # Add sample signals
    import uuid
    import time
    now = time.time()
    sample_signals = [
        {"type": "purpose_clarity", "value": {"answer": "Building tools that help people think"}, "confidence": 0.85, "ts": now - 86400},
        {"type": "initiative_taking", "value": {"answer": "Started a side project last week"}, "confidence": 0.78, "ts": now - 43200},
        {"type": "pattern_recognition", "value": {"answer": "Noticed a recurring theme in my work"}, "confidence": 0.72, "ts": now - 21600},
        {"type": "voice_authenticity", "value": {"answer": "Shared an honest perspective"}, "confidence": 0.91, "ts": now - 10800},
        {"type": "challenge_completion", "value": {"challenge_id": "test_001"}, "confidence": 0.80, "ts": now - 3600},
    ]
    for sig in sample_signals:
        store.add_signal(
            user_id=telegram_user_id,
            signal_type=sig["type"],
            value=sig["value"],
            confidence=sig["confidence"],
        )

    # Add sample comparative vector
    store.set_comparative_vector(
        user_id=telegram_user_id,
        vector={"purpose_clarity": 0.85, "initiative_taking": 0.78, "pattern_recognition": 0.72, "voice_authenticity": 0.91, "contribution_drive": 0.65},
    )

    # Add sample challenge
    store.add_challenge(
        user_id=telegram_user_id,
        challenge_id="meaningful_moment_001",
        challenge_type="creative",
        status="completed",
        evidence={"report": "Captured a meaningful moment from my work."},
    )

    return jsonify({
        "ok": True,
        "telegram_user_id": telegram_user_id,
        "short_code": short_code,
        "map_url": f"/map/{short_code}",
    })


# =============================================================================
# ERROR HANDLERS
# =============================================================================

@app.errorhandler(404)
def not_found(e):
    from flask import render_template
    return render_template("error.html", message=str(e.description or "Page not found")), 404


@app.errorhandler(429)
def rate_limited(e):
    from flask import render_template
    return render_template("error.html", message="Too many requests. Please wait a moment and try again."), 429


# =============================================================================
# MAIN
# =============================================================================

def create_app():
    return app


if __name__ == "__main__":
    port = int(os.getenv("CG_WEB_PORT", 3006))
    debug = os.getenv("FLASK_ENV", "development") == "development"
    logger.info(f"Starting Contribution Graph Web Server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
