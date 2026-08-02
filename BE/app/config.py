import os
from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url: str) -> str:
    """Accept Supabase/Postgres URLs and ensure an async driver is used."""
    if not url:
        return "sqlite+aiosqlite:///./nxthike.db"
    # Supabase pooler often provides postgresql:// — use asyncpg
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url and "+psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    # SQLAlchemy asyncpg does not use sslmode query the same way; strip common sync-only params
    if "sslmode=" in url and "+asyncpg" in url:
        # asyncpg uses ssl=require via connect_args if needed; keep simple URL
        from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

        parsed = urlparse(url)
        qs = [(k, v) for k, v in parse_qsl(parsed.query) if k not in ("sslmode",)]
        url = urlunparse(parsed._replace(query=urlencode(qs)))
    return url


class Settings:
    # Prefer SUPABASE_DB_URL, then DATABASE_URL. Local default: SQLite.
    DATABASE_URL: str = _normalize_database_url(
        os.getenv("SUPABASE_DB_URL")
        or os.getenv("DATABASE_URL")
        or "sqlite+aiosqlite:///./nxthike.db"
    )
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
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
    # Path to FE seed JSON (relative to BE or absolute)
    SEED_DIR: str = os.getenv("SEED_DIR", "../FE/public/seed")


settings = Settings()
