"""Prospect directory and OpenAPI are not public by default."""

from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

# Pin a throwaway database before app.config loads dotenv defaults.
os.environ["SUPABASE_DB_URL"] = ""
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:////tmp/nxthike_security_lockdown.db"
os.environ["ENVIRONMENT"] = "production"
os.environ["ENABLE_API_DOCS"] = ""
os.environ["SECRET_KEY"] = "x" * 48
os.environ["ADMIN_PASSWORD"] = "Lockdown-test-1!"
os.environ.pop("ENV", None)

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.api.companies import list_companies
from app.config import docs_enabled
from app.database import Base, async_session, engine
from app.main import app
from app.models.company import Company
from app.models.user import User
from app.services.auth import create_access_token


def _bearer(user_id: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=create_access_token(user_id))


def test_openapi_is_off_in_production_unless_explicit():
    assert app.openapi_url is None
    assert app.docs_url is None
    assert app.redoc_url is None
    assert docs_enabled() is False


def test_docs_flag_matrix(monkeypatch):
    monkeypatch.delenv("ENV", raising=False)

    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("ENABLE_API_DOCS", "")
    assert docs_enabled() is False

    monkeypatch.setenv("ENABLE_API_DOCS", "true")
    assert docs_enabled() is True

    monkeypatch.setenv("ENABLE_API_DOCS", "false")
    monkeypatch.setenv("ENVIRONMENT", "development")
    assert docs_enabled() is False

    monkeypatch.setenv("ENABLE_API_DOCS", "")
    assert docs_enabled() is True

    monkeypatch.delenv("ENVIRONMENT", raising=False)
    monkeypatch.delenv("ENABLE_API_DOCS", raising=False)
    assert docs_enabled() is False


def test_prospects_require_admin_or_staff():
    async def scenario():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

        async with async_session() as db:
            db.add_all(
                [
                    Company(
                        id="client-1",
                        name="Real Client",
                        industry="Staffing",
                        location="Hyderabad",
                        description="A client account",
                        is_client=True,
                        contacts=[],
                        hours={},
                        tags=[],
                    ),
                    Company(
                        id="prospect-1",
                        name="Scraped Prospect",
                        industry="Apartment building",
                        location="Hyderabad",
                        description="Imported from a directory",
                        is_client=False,
                        phone="+910000000000",
                        contacts=[],
                        hours={},
                        tags=[],
                    ),
                    User(
                        id="admin-1",
                        email="admin-lockdown@example.com",
                        password_hash="not-used",
                        role="admin",
                        first_name="Ada",
                        last_name="Admin",
                    ),
                    User(
                        id="staff-1",
                        email="staff-lockdown@example.com",
                        password_hash="not-used",
                        role="employer",
                        persona="p2",
                        first_name="Sam",
                        last_name="Staff",
                    ),
                    User(
                        id="student-1",
                        email="student-lockdown@example.com",
                        password_hash="not-used",
                        role="student",
                        first_name="Stu",
                        last_name="Dent",
                    ),
                ]
            )
            await db.commit()

            public = await list_companies(False, None, db)
            assert [c.name for c in public] == ["Real Client"]

            try:
                await list_companies(True, None, db)
                raise AssertionError("anonymous includeProspects should fail")
            except HTTPException as exc:
                assert exc.status_code == 401

            try:
                await list_companies(True, _bearer("student-1"), db)
                raise AssertionError("student includeProspects should fail")
            except HTTPException as exc:
                assert exc.status_code == 403

            for user_id in ("admin-1", "staff-1"):
                rows = await list_companies(True, _bearer(user_id), db)
                assert {c.name for c in rows} == {"Real Client", "Scraped Prospect"}

            # The response DTO does not include the prospect phone either way.
            assert all(not hasattr(c, "phone") or getattr(c, "phone", None) in (None,) for c in public)

    asyncio.run(scenario())
