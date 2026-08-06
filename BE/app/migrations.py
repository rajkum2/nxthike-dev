"""
Additive, idempotent schema migrations.

`Base.metadata.create_all` creates missing *tables* but never touches an
existing one — so a new column on `users` or `candidates` would be invisible to
the database while SQLAlchemy happily generates SQL referencing it, and every
read would fail against live data.

This module closes that gap the only way that is safe on a populated
production database: inspect what is actually there, and `ADD COLUMN` what is
missing. It never drops, renames, retypes or reorders anything, so running it
twice — or against a database that is already current — is a no-op.

Every column added here is nullable or carries a default, because existing rows
are backfilled with it.
"""

from __future__ import annotations

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncEngine


class Col:
    """
    A column to add, rendered per dialect.

    SQLite and PostgreSQL disagree on exactly the types we need: `BOOLEAN
    DEFAULT 0` is a type error on Postgres, and a JSON column declared as TEXT
    makes asyncpg refuse to bind dicts. So each kind renders its own DDL rather
    than hoping one string works everywhere.
    """

    def __init__(self, kind: str, default: object | None = None):
        self.kind = kind
        self.default = default

    def ddl(self, dialect: str) -> str:
        pg = dialect == "postgresql"

        if self.kind == "json":
            # SQLAlchemy's JSON type maps to `json` on Postgres and TEXT on
            # SQLite; the physical column has to match or binding fails.
            base = "JSONB" if pg else "TEXT"
        elif self.kind == "bool":
            base = "BOOLEAN"
        elif self.kind == "int":
            base = "INTEGER"
        elif self.kind == "float":
            base = "DOUBLE PRECISION" if pg else "FLOAT"
        elif self.kind == "ts":
            base = "TIMESTAMP"
        elif self.kind == "text":
            base = "TEXT"
        else:
            base = "VARCHAR"

        if self.default is None:
            return base

        if self.kind == "bool":
            literal = ("TRUE" if self.default else "FALSE") if pg else ("1" if self.default else "0")
        elif isinstance(self.default, str):
            literal = "'" + self.default.replace("'", "''") + "'"
        else:
            literal = str(self.default)

        return f"{base} DEFAULT {literal}"


# table -> column -> spec
ADDITIVE_COLUMNS: dict[str, dict[str, Col]] = {
    # ---- Workspace people ------------------------------------------------
    "users": {
        # Which of the eight product personas this account behaves as. The
        # coarse `role` column keeps its existing meaning for the public portal.
        "persona": Col("str"),
        "status": Col("str", "active"),
        "title": Col("str"),
        "org": Col("str"),
        "phone": Col("str"),
        "invited_at": Col("ts"),
        "last_active_at": Col("ts"),
    },
    # ---- Requisitions (hiring_roles is the requisition table) ------------
    "hiring_roles": {
        "client_id": Col("str"),
        "department": Col("str"),
        "priority": Col("str", "P2"),
        "openings": Col("int", 1),
        "filled": Col("int", 0),
        "sla_due": Col("ts"),
        "comp_min": Col("float"),
        "comp_max": Col("float"),
        "bill_rate": Col("str"),
        "pay_rate": Col("str"),
        "owner_id": Col("str"),
        "location": Col("str"),
        "skills": Col("json"),
        "status": Col("str", "open"),
    },
    # ---- Clients (companies doubles as the client account table) ---------
    "companies": {
        "health": Col("str", "good"),
        "margin_pct": Col("float"),
        "terms": Col("text"),
        "owner_id": Col("str"),
        "is_client": Col("bool", False),
        "contacts": Col("json"),
    },
    # ---- Candidates ------------------------------------------------------
    # The mobile app had to infer these from free text; the web design needs
    # them as real fields.
    "candidates": {
        "owner_id": Col("str"),
        "source": Col("str"),
        "current_ctc": Col("float"),
        "expected_ctc": Col("float"),
        "notice_days": Col("int"),
        "buyout": Col("bool", False),
        "consent_at": Col("ts"),
        "consent_channel": Col("str"),
        "dnc": Col("bool", False),
        "requisition_id": Col("str"),
    },
}


async def ensure_columns(engine: AsyncEngine) -> list[str]:
    """
    Add any missing column in [ADDITIVE_COLUMNS]. Returns what it added, so
    startup can log it.

    Tables that do not exist yet are skipped — `create_all` will have made them
    with the full definition already.
    """
    dialect = engine.dialect.name
    added: list[str] = []

    async with engine.begin() as conn:

        def _existing(sync_conn) -> dict[str, set[str]]:
            insp = inspect(sync_conn)
            present = set(insp.get_table_names())
            return {
                table: {c["name"] for c in insp.get_columns(table)}
                for table in ADDITIVE_COLUMNS
                if table in present
            }

        existing = await conn.run_sync(_existing)

        for table, columns in ADDITIVE_COLUMNS.items():
            have = existing.get(table)
            if have is None:
                # Freshly created by create_all with every column already.
                continue
            for column, spec in columns.items():
                if column in have:
                    continue
                try:
                    await conn.execute(
                        text(f"ALTER TABLE {table} ADD COLUMN {column} {spec.ddl(dialect)}")
                    )
                    added.append(f"{table}.{column}")
                except Exception as e:  # pragma: no cover - defensive
                    # A concurrent deploy may have added it between inspect and
                    # execute. Never let a migration take the API down.
                    print(f"[migrate] skip {table}.{column}: {type(e).__name__}: {e}")

    return added


async def run_migrations(engine: AsyncEngine) -> None:
    try:
        added = await ensure_columns(engine)
    except Exception as e:  # pragma: no cover - defensive
        print(f"[migrate] WARNING: could not run migrations: {type(e).__name__}: {e}")
        return
    if added:
        print(f"[migrate] added {len(added)} column(s): {', '.join(added)}")
    else:
        print("[migrate] schema already current")
