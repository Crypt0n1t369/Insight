"""
Contribution Graph — Web Server Tests

Tests the Flask web server including:
- Landing page
- Map page with seeded user
- API endpoint
- Rate limiting
- Error handling
"""

import pytest
import os
import sys

# Ensure project root is in path
sys.path.insert(0, str(__file__).rsplit("/web/", 1)[0])

os.environ["CG_SERVER_SECRET"] = "test-secret-for-testing-only"
os.environ["FLASK_ENV"] = "development"

from web.server import app
from web.store import InMemoryStore, SQLiteInMemoryStore
from web.rate_limiter import ShortCodeRateLimiter
from web.map_renderer import render_map_svg, MapData
from db.identity import generate_short_code, verify_short_code, parse_short_code
from bot.states import Phase


@pytest.fixture
def client():
    """Flask test client"""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def store():
    """Fresh in-memory store for each test"""
    return InMemoryStore()


# =============================================================================
# IDENTITY TESTS
# =============================================================================

class TestIdentity:
    def test_generate_short_code_is_deterministic(self):
        uid = 123456
        code1 = generate_short_code(uid)
        code2 = generate_short_code(uid)
        assert code1 == code2
        assert code1.startswith("CG-")
        assert len(code1) == 9  # CG- + 6 chars

    def test_generate_short_code_different_users(self):
        code1 = generate_short_code(111111)
        code2 = generate_short_code(222222)
        assert code1 != code2

    def test_verify_short_code_valid(self):
        uid = 999888
        code = generate_short_code(uid)
        assert verify_short_code(uid, code) is True

    def test_verify_short_code_invalid(self):
        uid = 999888
        code = generate_short_code(uid)
        assert verify_short_code(uid, "CG-INVALID") is False

    def test_parse_short_code_valid(self):
        assert parse_short_code("CG-ABC123") == "CG-ABC123"
        assert parse_short_code("  cg-abc123  ") == "CG-ABC123"  # strips + lower

    def test_parse_short_code_invalid(self):
        assert parse_short_code("INVALID") is None
        assert parse_short_code("CG-") is None
        assert parse_short_code("CG-AB1") is None  # too short


# =============================================================================
# RATE LIMITER TESTS
# =============================================================================

class TestRateLimiter:
    def test_allows_up_to_limit(self):
        rl = ShortCodeRateLimiter(limit=3, window_seconds=60)
        ip, code = "10.0.0.1", "CG-TEST99"
        assert rl.check(ip, code) is True
        assert rl.check(ip, code) is True
        assert rl.check(ip, code) is True

    def test_blocks_after_limit(self):
        rl = ShortCodeRateLimiter(limit=3, window_seconds=60)
        ip, code = "10.0.0.2", "CG-TEST99"
        rl.check(ip, code)
        rl.check(ip, code)
        rl.check(ip, code)
        assert rl.check(ip, code) is False

    def test_remaining_count(self):
        rl = ShortCodeRateLimiter(limit=3, window_seconds=60)
        ip, code = "10.0.0.3", "CG-TEST99"
        assert rl.remaining(ip, code) == 3
        rl.check(ip, code)
        assert rl.remaining(ip, code) == 2
        rl.check(ip, code)
        assert rl.remaining(ip, code) == 1

    def test_reset_clears_attempts(self):
        rl = ShortCodeRateLimiter(limit=3, window_seconds=60)
        ip, code = "10.0.0.4", "CG-TEST99"
        for _ in range(3):
            rl.check(ip, code)
        assert rl.check(ip, code) is False
        rl.reset(ip, code)
        assert rl.check(ip, code) is True
        assert rl.remaining(ip, code) == 2


# =============================================================================
# STORE TESTS
# =============================================================================

class TestInMemoryStore:
    def test_upsert_and_retrieve_user(self):
        store = InMemoryStore()
        store.upsert_user(123456, "CG-TEST01", "Alice", "completed")
        user = store.get_user(123456)
        assert user["short_code"] == "CG-TEST01"
        assert user["display_name"] == "Alice"
        assert user["current_phase"] == "completed"

    def test_get_user_by_short_code(self):
        store = InMemoryStore()
        store.upsert_user(123456, "CG-TEST01", "Alice", "completed")
        user = store.get_user_by_short_code("CG-TEST01")
        assert user["telegram_user_id"] == 123456

    def test_add_and_get_signals(self):
        store = InMemoryStore()
        store.add_signal(123456, "purpose_clarity", {"answer": "test"}, 0.85)
        store.add_signal(123456, "initiative_taking", {"answer": "test2"}, 0.72)
        signals = store.get_signals(123456)
        assert len(signals) == 2
        assert signals[0]["type"] == "purpose_clarity"
        assert signals[0]["confidence"] == 0.85

    def test_comparative_vector(self):
        store = InMemoryStore()
        vector = {"purpose_clarity": 0.85, "initiative_taking": 0.72}
        store.set_comparative_vector(123456, vector)
        retrieved = store.get_comparative_vector(123456)
        assert retrieved == vector
        assert store.get_comparative_vector(999999) == {}  # unknown user

    def test_add_and_get_challenges(self):
        store = InMemoryStore()
        store.add_challenge(123456, "meaningful_moment_001", "creative", "completed", {"report": "test"})
        challenges = store.get_challenges(123456)
        assert len(challenges) == 1
        assert challenges[0]["challenge_id"] == "meaningful_moment_001"
        assert challenges[0]["status"] == "completed"


# =============================================================================
# MAP RENDERER TESTS
# =============================================================================

class TestMapRenderer:
    def test_renders_svg_with_name(self):
        from db.identity import generate_short_code
        code = generate_short_code(123456)
        data = MapData(
            short_code=code,
            display_name="Alice",
            phase=Phase.COMPLETED,
            signals=[],
            challenges=[],
            comparative_vector={"purpose_clarity": 0.85, "initiative_taking": 0.72},
        )
        svg = render_map_svg(data)
        assert "Alice" in svg
        assert code in svg
        assert "<svg" in svg
        assert "</svg>" in svg

    def test_renders_empty_map(self):
        data = MapData(
            short_code="CG-EMPTY1",
            display_name="Empty User",
            phase=Phase.PHASE_1_OPENING,
            signals=[],
            challenges=[],
            comparative_vector={},
        )
        svg = render_map_svg(data)
        assert "Empty User" in svg
        assert "<svg" in svg

    def test_all_signal_types_render_without_raw_keys(self):
        """Regression: all 18 SignalType values must render human-readable labels, not raw keys."""
        from web.map_renderer import SIGNAL_META
        all_signal_vector = {key: 0.75 for key in SIGNAL_META}
        data = MapData(
            short_code="CG-ALLSIG",
            display_name="All Signals User",
            phase=Phase.PHASE_3_EVIDENCE,
            signals=[],
            challenges=[],
            comparative_vector=all_signal_vector,
        )
        svg = render_map_svg(data)
        # No raw keys should appear as labels
        assert "purpose_clarity" not in svg  # raw key must not leak
        assert "○" not in svg  # no fallback icon should appear
        # Every SIGNAL_META label must be present
        for key, meta in SIGNAL_META.items():
            assert meta["label"] in svg, f"Missing label for {key}"
        # SVG must be a valid complete document
        assert svg.strip().startswith("<svg")
        assert svg.strip().endswith("</svg>")


# =============================================================================
# WEB SERVER TESTS
# =============================================================================

class TestWebServer:
    def test_health_endpoint(self, client):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json["status"] == "ok"
        assert r.json["service"] == "contribution-graph-web"

    def test_landing_page(self, client):
        r = client.get("/")
        assert r.status_code == 200
        assert b"Contribution Graph" in r.data

    def test_invalid_short_code_returns_404(self, client):
        r = client.get("/map/INVALID")
        assert r.status_code == 404

    def test_unknown_short_code_returns_404(self, client):
        r = client.get("/map/CG-NOTFOUND")
        assert r.status_code == 404

    def test_seed_and_view_map(self, client):
        # Seed a user
        r = client.get("/dev/seed/777666")
        assert r.status_code == 200
        short_code = r.json["short_code"]

        # View their map
        r = client.get("/map/" + short_code)
        assert r.status_code == 200
        assert b"<svg" in r.data

        # API endpoint
        r = client.get("/api/map/" + short_code)
        assert r.status_code == 200
        data = r.json
        assert "comparative_vector" in data
        assert "signals" in data
        assert "challenges" in data
        assert data["short_code"] == short_code

    def test_rate_limiting_enforced(self, client):
        # Seed first to get a valid short code
        r = client.get("/dev/seed/555444")
        short_code = r.json["short_code"]

        # First 3 allowed
        for _ in range(3):
            r = client.get("/api/map/" + short_code)
            assert r.status_code == 200, "First 3 should be allowed"

        # 4th blocked
        r = client.get("/api/map/" + short_code)
        assert r.status_code == 429, "4th should be rate limited"
