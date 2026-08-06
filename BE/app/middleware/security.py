"""
Security middleware: HTTP headers + lightweight IP rate limiting.

In-memory rate limiting is best-effort (per process). For multi-instance
production, put a reverse proxy or Redis limiter in front as well.
"""

from __future__ import annotations

import time
from collections import defaultdict, deque
from threading import Lock

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


# path prefix -> (max requests, window seconds)
RATE_LIMITS: list[tuple[str, int, int]] = [
    ("/api/auth/login", 20, 60),
    ("/api/auth/register", 10, 60),
    ("/api/auth/change-password", 10, 60),
    ("/api/hiring/candidates/bulk-import", 5, 60),
]


class _Bucket:
    def __init__(self) -> None:
        self.hits: dict[str, deque[float]] = defaultdict(deque)
        self.lock = Lock()

    def allow(self, key: str, limit: int, window: float) -> bool:
        now = time.monotonic()
        with self.lock:
            q = self.hits[key]
            while q and now - q[0] > window:
                q.popleft()
            if len(q) >= limit:
                return False
            q.append(now)
            return True


_bucket = _Bucket()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Rate limit sensitive routes first
        path = request.url.path
        client = request.client.host if request.client else "unknown"
        for prefix, limit, window in RATE_LIMITS:
            if path.startswith(prefix) and request.method in ("POST", "PUT", "PATCH"):
                if not _bucket.allow(f"{prefix}:{client}", limit, float(window)):
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Too many requests. Please try again shortly."},
                        headers={"Retry-After": str(window)},
                    )
                break

        response = await call_next(request)

        # Standard hardening headers (API + any HTML from this app)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=()",
        )
        response.headers.setdefault("X-XSS-Protection", "0")
        # API responses should not be cached by shared caches when authenticated
        if path.startswith("/api/") and request.headers.get("authorization"):
            response.headers.setdefault("Cache-Control", "no-store")
        return response
