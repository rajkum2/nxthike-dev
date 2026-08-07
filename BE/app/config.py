import os
import ssl
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode, quote_plus, unquote

from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url: str) -> str:
    """
    Accept Supabase / Postgres URLs and force an asyncpg SQLAlchemy URL.

    - postgres:// → postgresql+asyncpg://
    - Strip libpq-only query params (sslmode, channel_binding) — SSL is set in connect_args
    - Detect Supabase pooler (port 6543 / pooler host) for pgbouncer-friendly settings
    """
    if not url:
        return "sqlite+aiosqlite:///./nxthike.db"

    url = url.strip().strip('"').strip("'")

    if url.startswith("postgres://"):
        url = "postgresql+asyncpg://" + url[len("postgres://") :]
    elif url.startswith("postgresql://") and "+asyncpg" not in url and "+psycopg" not in url:
        url = "postgresql+asyncpg://" + url[len("postgresql://") :]
    elif url.startswith("postgresql+asyncpg://"):
        pass
    elif url.startswith("sqlite"):
        return url

    if "+asyncpg" in url:
        parsed = urlparse(url)
        # Drop params asyncpg does not understand / that break SSL handshake
        drop = {
            "sslmode",
            "sslrootcert",
            "sslcert",
            "sslkey",
            "channel_binding",
            "pgbouncer",  # handled via connect_args
        }
        qs = [(k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=True) if k.lower() not in drop]
        url = urlunparse(parsed._replace(query=urlencode(qs)))

    return url


def _is_local_host(url: str) -> bool:
    """Local dev Postgres normally has SSL disabled — forcing it breaks the connect."""
    try:
        host = (urlparse(url).hostname or "").lower()
    except Exception:
        return False
    return host in ("localhost", "127.0.0.1", "::1", "")


def _is_supabase_or_postgres(url: str) -> bool:
    u = url.lower()
    if u.startswith("sqlite"):
        return False
    if _is_local_host(url):
        return False
    return (
        "supabase" in u
        or "pooler.supabase" in u
        or u.startswith("postgresql")
        or "+asyncpg" in u
    )


def _is_pooler(url: str) -> bool:
    """Transaction pooler (pgbouncer) usually port 6543 or host contains pooler."""
    try:
        p = urlparse(url)
        host = (p.hostname or "").lower()
        port = p.port
        if "pooler.supabase" in host:
            return True
        if port == 6543:
            return True
    except Exception:
        pass
    return "pgbouncer=true" in url.lower()


_WEAK_SECRETS = frozenset({
    "", "change-me", "secret", "changeme", "password", "admin", "nxthike",
    "dev", "development", "test", "jwt-secret",
})


class Settings:
    # Prefer SUPABASE_DB_URL, then DATABASE_URL. Local default: SQLite.
    _raw_db = (
        os.getenv("SUPABASE_DB_URL")
        or os.getenv("DATABASE_URL")
        or "sqlite+aiosqlite:///./nxthike.db"
    )
    DATABASE_URL: str = _normalize_database_url(_raw_db)
    DB_IS_POOLER: bool = _is_pooler(DATABASE_URL)
    DB_NEEDS_SSL: bool = _is_supabase_or_postgres(DATABASE_URL) and not DATABASE_URL.startswith(
        "sqlite"
    )

    ENVIRONMENT: str = (os.getenv("ENVIRONMENT") or os.getenv("ENV") or "development").lower()
    IS_PRODUCTION: bool = ENVIRONMENT in ("production", "prod", "staging")
    # Trust X-Forwarded-For / X-Real-IP only behind a reverse proxy you control.
    TRUST_PROXY: bool = os.getenv("TRUST_PROXY", "0").lower() in ("1", "true", "yes")
    # Public student/employer self-signup. Turn off in locked CRM deploys.
    ALLOW_PUBLIC_REGISTER: bool = os.getenv(
        "ALLOW_PUBLIC_REGISTER",
        "false" if (os.getenv("ENVIRONMENT") or "").lower() in ("production", "prod", "staging") else "true",
    ).lower() in ("1", "true", "yes")
    # Swagger / OpenAPI — off by default in production.
    ENABLE_API_DOCS: bool = os.getenv(
        "ENABLE_API_DOCS",
        "false" if (os.getenv("ENVIRONMENT") or "").lower() in ("production", "prod", "staging") else "true",
    ).lower() in ("1", "true", "yes")

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    ALGORITHM: str = "HS256"
    # Shorter sessions reduce blast radius if a token is stolen from localStorage.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 12)))  # 12h default
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@nxthike.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
        ).split(",")
        if o.strip()
    ]
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    SEED_DIR: str = os.getenv("SEED_DIR", "../FE/public/seed")

    # Storage: "local" (disk) or "r2" (Cloudflare R2)
    STORAGE_BACKEND: str = os.getenv("STORAGE_BACKEND", "local")
    R2_ACCOUNT_ID: str = os.getenv("R2_ACCOUNT_ID", "")
    R2_ACCESS_KEY_ID: str = os.getenv("R2_ACCESS_KEY_ID", "")
    R2_SECRET_ACCESS_KEY: str = os.getenv("R2_SECRET_ACCESS_KEY", "")
    R2_BUCKET_NAME: str = os.getenv("R2_BUCKET_NAME", "")
    R2_PUBLIC_URL: str = os.getenv("R2_PUBLIC_URL", "")
    R2_ENDPOINT: str = os.getenv("R2_ENDPOINT", "")
    MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", "15"))
    # Hard caps against bulk abuse
    MAX_BULK_IDS: int = int(os.getenv("MAX_BULK_IDS", "200"))
    MAX_BULK_IMPORT: int = int(os.getenv("MAX_BULK_IMPORT", "500"))

    # If true, skip alembic on boot (use create_all). Safer when migrations lag schema.
    SKIP_ALEMBIC: bool = os.getenv("SKIP_ALEMBIC", "true").lower() in ("1", "true", "yes")

    @property
    def secret_is_weak(self) -> bool:
        sk = (self.SECRET_KEY or "").strip()
        return sk.lower() in _WEAK_SECRETS or len(sk) < 24


settings = Settings()


def build_connect_args() -> dict:
    """Connect args for create_async_engine."""
    if settings.DATABASE_URL.startswith("sqlite"):
        return {"check_same_thread": False}

    args: dict = {}
    if settings.DB_NEEDS_SSL:
        # asyncpg: True or SSLContext. Default context works with Supabase.
        ctx = ssl.create_default_context()
        # Some managed PG hosts use certs that need this in container environments
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        args["ssl"] = ctx

    # pgbouncer / Supabase transaction pooler: disable prepared statement cache
    if settings.DB_IS_POOLER:
        args["statement_cache_size"] = 0

    return args
