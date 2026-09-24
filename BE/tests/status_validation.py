"""
Candidate status validation against a throwaway SQLite file.

Run:  cd BE && python -m tests.status_validation

Covers the web/mobile mismatch where a client wrote "screening" (not a backend status) and the
web desk showed the candidate as Sourced: aliases are normalised on write, unknown values are
refused, and rows already stored under an alias are repaired at startup.
"""

from __future__ import annotations

import asyncio
import sys

from tests.local_db import use_sqlite

DB_PATH = use_sqlite()

from httpx import ASGITransport, AsyncClient  # noqa: E402

from app.database import async_session, engine, Base  # noqa: E402
from app.main import app  # noqa: E402
from app.migrations import run_migrations  # noqa: E402
from app.services.auth import hash_password  # noqa: E402

PASSED: list[str] = []
FAILED: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    (PASSED if ok else FAILED).append(name)
    print(f"{'  ok ' if ok else 'FAIL '} {name}{f' — {detail}' if detail else ''}")


async def seed() -> None:
    from app.models.hiring import Candidate, HiringRole
    from app.models.user import User

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with async_session() as db:
        db.add(User(id="u-admin", email="admin@status.example", password_hash=hash_password("status-only-pw"),
                    first_name="Ada", last_name="Admin", role="admin", persona="p8"))
        db.add(HiringRole(id="r-bde", name="BDE"))
        # Rows as an older mobile build left them.
        db.add(Candidate(id="c-legacy-1", role_id="r-bde", role_name="BDE", name="Legacy One", status="screening"))
        db.add(Candidate(id="c-legacy-2", role_id="r-bde", role_name="BDE", name="Legacy Two", status="Submitted"))
        db.add(Candidate(id="c-ok", role_id="r-bde", role_name="BDE", name="Fine", status="interview"))
        await db.commit()
    # Startup migration repairs them.
    await run_migrations(engine)


async def stored(cid: str) -> str | None:
    from app.models.hiring import Candidate

    async with async_session() as db:
        c = await db.get(Candidate, cid)
        return c.status if c else None


async def main() -> int:
    await seed()
    check("startup repairs 'screening' → reviewing", await stored("c-legacy-1") == "reviewing", str(await stored("c-legacy-1")))
    check("startup repairs 'Submitted' → shortlisted", await stored("c-legacy-2") == "shortlisted", str(await stored("c-legacy-2")))
    check("startup leaves canonical rows alone", await stored("c-ok") == "interview")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://status") as client:
        r = await client.post("/api/auth/login", json={"email": "admin@status.example", "password": "status-only-pw"})
        tok = r.json().get("access_token") if r.status_code == 200 else None
        check("login", bool(tok), f"HTTP {r.status_code}")
        if not tok:
            return 1
        A = {"Authorization": f"Bearer {tok}"}

        r = await client.patch("/api/hiring/candidates/c-ok", json={"status": "screening"}, headers=A)
        check("PATCH alias 'screening' is accepted", r.status_code == 200, f"HTTP {r.status_code} {r.text[:120]}")
        check("… and stored as 'reviewing'", await stored("c-ok") == "reviewing", str(await stored("c-ok")))
        check("… and returned as 'reviewing'", r.status_code == 200 and r.json().get("status") == "reviewing")

        r = await client.patch("/api/hiring/candidates/c-ok", json={"status": "OFFER"}, headers=A)
        check("PATCH is case-insensitive", r.status_code == 200 and await stored("c-ok") == "offer", f"HTTP {r.status_code}")

        r = await client.patch("/api/hiring/candidates/c-ok", json={"status": "bogus"}, headers=A)
        check("PATCH unknown status is refused (422)", r.status_code == 422, f"HTTP {r.status_code}")
        check("… and nothing is written", await stored("c-ok") == "offer", str(await stored("c-ok")))

        r = await client.patch("/api/hiring/candidates/c-ok", json={"name": "Renamed"}, headers=A)
        check("PATCH without status still works", r.status_code == 200 and await stored("c-ok") == "offer", f"HTTP {r.status_code}")

        r = await client.post("/api/hiring/candidates", json={"roleId": "r-bde", "name": "New Person", "status": "sourced"}, headers=A)
        check("POST alias 'sourced' stored as 'new'", r.status_code == 201 and r.json().get("status") == "new", f"HTTP {r.status_code} {r.text[:120]}")

        r = await client.post("/api/hiring/candidates", json={"roleId": "r-bde", "name": "Default"}, headers=A)
        check("POST without status defaults to 'new'", r.status_code == 201 and r.json().get("status") == "new", f"HTTP {r.status_code}")

        r = await client.post("/api/hiring/candidates", json={"roleId": "r-bde", "name": "Bad", "status": "nope"}, headers=A)
        check("POST unknown status is refused (422)", r.status_code == 422, f"HTTP {r.status_code}")

        r = await client.post("/api/hiring/candidates/bulk-status", json={"ids": ["c-legacy-1"], "status": "submitted"}, headers=A)
        check("bulk-status alias accepted", r.status_code == 200 and await stored("c-legacy-1") == "shortlisted", f"HTTP {r.status_code} {r.text[:120]}")

        r = await client.post("/api/hiring/candidates/bulk-status", json={"ids": ["c-legacy-1"], "status": "nope"}, headers=A)
        check("bulk-status unknown refused", r.status_code in (400, 422) and await stored("c-legacy-1") == "shortlisted", f"HTTP {r.status_code}")

    # Running the repair again is a no-op.
    from app.migrations import normalize_candidate_statuses
    check("repair is idempotent", await normalize_candidate_statuses(engine) == 0)

    print(f"\n{len(PASSED)} passed, {len(FAILED)} failed")
    return 1 if FAILED else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
