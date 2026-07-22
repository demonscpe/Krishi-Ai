"""Simple in-memory rate limiter."""
import time
from config import CHAT_RATE_LIMIT


class RateLimiter:
    """Rate limiter by IP address."""

    def __init__(self, max_requests: int = CHAT_RATE_LIMIT, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        self._store: dict[str, list[float]] = {}

    def is_limited(self, ip: str) -> bool:
        now = time.time()
        if ip not in self._store:
            self._store[ip] = []
        # Purge old entries
        self._store[ip] = [t for t in self._store[ip] if now - t < self.window]

        if len(self._store[ip]) >= self.max_requests:
            return True

        self._store[ip].append(now)
        return False

    def reset(self, ip: str) -> None:
        self._store.pop(ip, None)
rate_limiter = RateLimiter()