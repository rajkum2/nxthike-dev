"""
Apply ADMIN_EMAIL / ADMIN_PASSWORD from env to the users table.

Also neutralizes known weak demo accounts (student/employer @nxthike.com)
that previously used password123.

Usage (from BE/):
  python -m app.sync_admin_password
"""

from __future__ import annotations

import asyncio
import secrets
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import select

from app.config import settings
from app.database import async_session, engine, Base
from app.models.user import User
from app.services.auth import hash_password


WEAK_DEMO_EMAILS = (
    "student@nxthike.com",
    "employer@nxthike.com",
)


async def run() -> None:
    if settings.secret_is_weak:
        raise SystemExit("SECRET_KEY is weak — set a 32+ character random SECRET_KEY in .env")
    if settings.admin_password_is_weak:
        raise SystemExit(
            "ADMIN_PASSWORD is missing or weak — set a strong password in .env "
            "(12+ chars, mixed case, digit, symbol)."
        )

    email = (settings.ADMIN_EMAIL or "").strip().lower()
    if not email or "@" not in email:
        raise SystemExit("ADMIN_EMAIL is invalid")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        admin = (
            await db.execute(select(User).where(User.email == email))
        ).scalar_one_or_none()
        if not admin:
            # Also try common id used by seed
            admin = await db.get(User, "admin-1")
            if admin:
                admin.email = email

        if admin:
            admin.password_hash = hash_password(settings.ADMIN_PASSWORD)
            admin.role = "admin"
            if hasattr(admin, "status") and (admin.status or "").lower() == "suspended":
                admin.status = "active"
            action = f"updated password for {admin.email}"
        else:
            admin = User(
                id="admin-1",
                email=email,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                role="admin",
                first_name="Admin",
                last_name="User",
            )
            db.add(admin)
            action = f"created admin {email}"

        # Kill weak demo logins: randomize password + suspend (no CRM access without persona anyway)
        for demo_email in WEAK_DEMO_EMAILS:
            u = (
                await db.execute(select(User).where(User.email == demo_email))
            ).scalar_one_or_none()
            if not u:
                continue
            u.password_hash = hash_password(secrets.token_urlsafe(24))
            if hasattr(u, "status"):
                u.status = "suspended"
            print(f"  neutralized weak demo account: {demo_email} (password rotated + suspended)")

        await db.commit()
        print(f"OK: {action}")
        print("All existing JWTs signed with the old SECRET_KEY are now invalid.")


if __name__ == "__main__":
    asyncio.run(run())
