"""
Idempotent import of the Sep 2026 shared resume batch.

    python -m app.import_shared_resumes

Also called from app startup so a BE deploy/restart inserts any missing rows.
Never overwrites an existing candidate (matched by id or email).
"""

from __future__ import annotations

import asyncio
import json
from pathlib import Path

from sqlalchemy import func, select

from app.api.hiring import apply_candidate_payload
from app.database import async_session, engine, Base
from app.models.hiring import Candidate, HiringRole

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "shared_candidates_sep2026.json"


def _load() -> dict:
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Missing {DATA_PATH}")
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


async def ensure_shared_candidates() -> dict:
    """Insert missing roles/candidates. Safe to run on every boot."""
    payload = _load()
    created_roles = 0
    created = 0
    skipped = 0

    async with async_session() as db:
        for role in payload.get("roles") or []:
            existing = await db.get(HiringRole, role["id"])
            if existing:
                continue
            db.add(
                HiringRole(
                    id=role["id"],
                    name=role.get("name") or role["id"],
                    description=role.get("description"),
                    is_active=True,
                    sort_order=int(role.get("sort_order") or 0),
                )
            )
            created_roles += 1
        await db.commit()

        for raw in payload.get("candidates") or []:
            cid = raw.get("id")
            email = (raw.get("email") or "").strip().lower() or None
            existing = None
            if cid:
                existing = await db.get(Candidate, cid)
            if existing is None and email:
                existing = (
                    await db.execute(
                        select(Candidate).where(func.lower(Candidate.email) == email)
                    )
                ).scalar_one_or_none()
            if existing:
                skipped += 1
                continue
            body = {k: v for k, v in raw.items() if k != "id" and v is not None}
            c = Candidate(id=cid)
            apply_candidate_payload(c, body)
            if email:
                c.email = email
            db.add(c)
            created += 1
        await db.commit()

    return {"roles": created_roles, "created": created, "skipped": skipped}


async def _cli() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    report = await ensure_shared_candidates()
    print(
        f"shared resumes: roles+={report['roles']} "
        f"created={report['created']} skipped={report['skipped']}"
    )
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(_cli())
