"""
Security middleware: HTTP headers + IP rate limiting.

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

from app.config import settings


# path prefix -> (max requests, window seconds) for POST/PUT/PATCH/DELETE
# (and for marked GET scrape-prone paths)
SENSITIVE_LIMITS: list[tuple[str, int, int, frozenset[str]]] = [
    # auth — tight limits against credential stuffing
    ("/api/auth/login", 8, 60, frozenset({"POST"})),
    ("/api/auth/register", 5, 60, frozenset({"POST"})),
    ("/api/auth/change-password", 5, 60, frozenset({"POST"})),
    ("/admin/login", 6, 60, frozenset({"POST"})),
    # bulk / scrape-prone hiring mutations
    ("/api/hiring/candidates/bulk-import", 3, 60, frozenset({"POST"})),
    ("/api/hiring/candidates/bulk-delete", 10, 60, frozenset({"POST"})),
    ("/api/hiring/candidates/bulk-update", 20, 60, frozenset({"POST"})),
    ("/api/hiring/candidates/bulk-role", 20, 60, frozenset({"POST"})),
    ("/api/hiring/candidates/bulk-status", 30, 60, frozenset({"POST"})),
    # list endpoints that can dump the CRM (paginate abuse)
    ("/api/hiring/candidates", 90, 60, frozenset({"GET"})),
    ("/api/calls/queue", 60, 60, frozenset({"GET"})),
    ("/api/calls", 90, 60, frozenset({"GET"})),
    ("/api/uploads", 30, 60, frozenset({"POST"})),
]

# Whole API: soft ceiling per IP (stops naive scrapers / bots)
GLOBAL_API_LIMIT = 300  # per minute
GLOBAL_API_WINDOW = 60.0


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


def client_ip(request: Request) -> str:
    """
    Prefer direct peer address. Only trust X-Forwarded-For when behind a
    known reverse proxy (TRUST_PROXY=1); otherwise clients can spoof the header
    and reset their rate-limit bucket.
    """
    if settings.TRUST_PROXY:
        xff = request.headers.get("x-forwarded-for") or request.headers.get("X-Forwarded-For")
        if xff:
            return xff.split(",")[0].strip() or "unknown"
        real = request.headers.get("x-real-ip")
        if real:
            return real.strip()
    return request.client.host if request.client else "unknown"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path
        method = request.method.upper()
        ip = client_ip(request)

        # Never rate-limit health (load balancers)
        if path not in ("/api/health", "/health", "/"):
            # Global ceiling on all /api traffic
            if path.startswith("/api/") or path.startswith("/admin"):
                if not _bucket.allow(f"global:{ip}", GLOBAL_API_LIMIT, GLOBAL_API_WINDOW):
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Too many requests. Slow down or try again shortly."},
                        headers={"Retry-After": "60"},
                    )

            for prefix, limit, window, methods in SENSITIVE_LIMITS:
                if path.startswith(prefix) and method in methods:
                    if not _bucket.allow(f"{prefix}:{method}:{ip}", limit, float(window)):
                        return JSONResponse(
                            status_code=429,
                            content={"detail": "Too many requests. Please try again shortly."},
                            headers={"Retry-After": str(window)},
                        )
                    break

        response = await call_next(request)

        # Standard hardening headers
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault(
            "Permissions-Policy",
            "camera=(), microphone=(), geolocation=(), payment=()",
        )
        response.headers.setdefault("X-XSS-Protection", "0")
        response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
        response.headers.setdefault("Cross-Origin-Resource-Policy", "same-site")
        if settings.IS_PRODUCTION:
            response.headers.setdefault(
                "Strict-Transport-Security",
                "max-age=31536000; includeSubDomains",
            )

        # Authenticated API responses must not sit in shared caches
        if path.startswith("/api/") and request.headers.get("authorization"):
            response.headers.setdefault("Cache-Control", "no-store")
            response.headers.setdefault("Pragma", "no-cache")

        return response
