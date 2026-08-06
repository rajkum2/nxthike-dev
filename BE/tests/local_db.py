"""
Force a throwaway SQLite database for local tests.

Import this **before** anything that touches `app.config`, `app.database` or
`app.main`:

    from tests.local_db import use_sqlite
    DB_PATH = use_sqlite()
    from app.main import app          # now safely pointed at SQLite

Why this exists: `app.config` resolves the database as
`SUPABASE_DB_URL or DATABASE_URL or sqlite`, and `BE/.env` sets
`SUPABASE_DB_URL` to the production Supabase project. Setting only
`DATABASE_URL` in a test therefore does nothing, and the test runs against
production — creating tables and writing rows there. This module removes both
variables and verifies the result, so that failure mode cannot recur silently.
"""

from __future__ import annotations

import os
import sys
import tempfile
import uuid


def use_sqlite(path: str | None = None) -> str:
    """Point the app at a fresh SQLite file. Returns the path."""
    if "app.config" in sys.modules:
        raise RuntimeError(
            "app.config is already imported — call use_sqlite() before importing any app module."
        )

    db_path = path or os.path.join(
        tempfile.mkdtemp(prefix="nxthike-test-"), f"{uuid.uuid4().hex[:8]}.db"
    )

    # SUPABASE_DB_URL wins over DATABASE_URL in app.config, so it must be
    # neutralised. Set it *empty* rather than deleting it: `load_dotenv()` does
    # not override variables that already exist, so an empty value both blocks
    # the .env value and reads as falsy in config's `or` chain.
    os.environ["SUPABASE_DB_URL"] = ""
    os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{db_path}"
    os.environ.setdefault("SECRET_KEY", "test-only-secret")

    from app.config import settings  # imported only after the environment is set

    if not settings.DATABASE_URL.startswith("sqlite"):
        raise RuntimeError(
            "Refusing to run: the app resolved to a non-SQLite database "
            f"({settings.DATABASE_URL.split('@')[-1]}). Tests must never touch a real database."
        )

    return db_path
