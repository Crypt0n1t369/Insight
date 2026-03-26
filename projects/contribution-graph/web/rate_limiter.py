"""
Contribution Graph — Short-Code Rate Limiter

Enforces: max N short-code verification attempts per minute per IP.
Based on: db/schema.sql short_code_attempts table spec.

Usage:
    limiter = ShortCodeRateLimiter(limit=3, window_seconds=60)
    if not limiter.check("192.168.1.1", "CG-ABC123"):
        raise RateLimitedError()
"""

import time
import threading
import logging
from collections import defaultdict
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class Attempt:
    timestamp: float
    short_code: str


class ShortCodeRateLimiter:
    """
    In-memory rate limiter for short-code verification attempts.

    Policy: max `limit` attempts per `window_seconds` for each (IP, short_code) pair.
    Sliding window — old attempts are evicted on each check.

    Thread-safe for concurrent access.
    """

    def __init__(self, limit: int = 3, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        self._attempts: dict[str, list[Attempt]] = defaultdict(list)
        self._lock = threading.Lock()
        self._cleanup_interval = 300  # cleanup every 5 minutes
        self._last_cleanup = time.time()

    def _key(self, ip: str, short_code: str) -> str:
        """Generate a unique key for this IP + short_code pair"""
        return f"{ip}:{short_code.upper()}"

    def _cleanup(self):
        """Remove expired attempts older than window_seconds"""
        now = time.time()
        if now - self._last_cleanup < self._cleanup_interval:
            return
        self._last_cleanup = now
        cutoff = now - self.window_seconds
        with self._lock:
            for k, attempts in list(self._attempts.items()):
                self._attempts[k] = [a for a in attempts if a.timestamp > cutoff]
                if not self._attempts[k]:
                    del self._attempts[k]

    def check(self, ip: str, short_code: str) -> bool:
        """
        Check if an attempt is allowed and record it if so.

        Args:
            ip: Client IP address
            short_code: Short code being verified

        Returns:
            True if attempt is allowed (under limit), False if rate limited
        """
        self._cleanup()
        k = self._key(ip, short_code)
        now = time.time()
        cutoff = now - self.window_seconds

        with self._lock:
            # Evict old attempts
            self._attempts[k] = [a for a in self._attempts[k] if a.timestamp > cutoff]

            if len(self._attempts[k]) >= self.limit:
                logger.warning(f"Rate limited: {ip} for short_code {short_code}")
                return False

            # Record this attempt
            self._attempts[k].append(Attempt(timestamp=now, short_code=short_code))
            return True

    def remaining(self, ip: str, short_code: str) -> int:
        """Return how many attempts remain for this IP + short_code"""
        self._cleanup()
        k = self._key(ip, short_code)
        cutoff = time.time() - self.window_seconds
        with self._lock:
            active = [a for a in self._attempts.get(k, []) if a.timestamp > cutoff]
            return max(0, self.limit - len(active))

    def reset(self, ip: str, short_code: str):
        """Reset attempts for a specific IP + short_code (for testing)"""
        k = self._key(ip, short_code)
        with self._lock:
            if k in self._attempts:
                del self._attempts[k]

    def reset_all(self):
        """Reset all rate limit state (for testing)"""
        with self._lock:
            self._attempts.clear()
