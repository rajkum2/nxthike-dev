"""
Create one sign-in account per workspace persona.

The eight personas are defined in code (`app/models/workspace.PERSONA_DEFS`);
this gives each of them an account so the role can actually be signed into and
checked. It is additive and reversible:

    python -m app.seed_personas --dry-run     # report, write nothing
    python -m app.seed_personas               # create what is missing
    python -m app.seed_personas --reset-password recruiter@nxthike.com
    python -m app.seed_personas --remove      # delete only the accounts it made

Safety rules this module holds to:

* An account that already exists is **never** overwritten — not its password,
  not its portal role. At most its persona is set, and only if it has none.
* Passwords are generated per run from `secrets`, printed once, and not stored
  anywhere else. There is no default or shared password.
* Every account it creates carries `org = SEED_MARKER`, and `--remove` deletes
  only rows carrying that marker, so it can never delete a real user.
"""

from __future__ import annotations

import argparse
import asyncio
import secrets
import string
import sys

from sqlalchemy import select

from app.database import async_session, engine, Base
from app.migrations import run_migrations
from app.models.user import User
from app.models.workspace import PERSONA_BY_ID
from app.services.auth import hash_password

#: Written to `users.org` on every account this module creates. `--remove`
#: keys off it, so an account added by hand can never be swept up.
SEED_MARKER = "[persona-seed]"

#: One account per persona. The email says the role out loud so a screenshot or
#: a support conversation is unambiguous about which dashboard is on screen.
ACCOUNTS: list[dict[str, str]] = [
    {"persona": "p1", "email": "recruiter@nxthike.com", "first": "Riya", "last": "Recruiter",
     "title": "Senior Recruiter (360)"},
    {"persona": "p2", "email": "sourcer@nxthike.com", "first": "Sahil", "last": "Sourcer",
     "title": "Sourcing Specialist"},
    {"persona": "p3", "email": "ta@nxthike.com", "first": "Tara", "last": "Talent",
     "title": "In-house TA Specialist"},
    {"persona": "p4", "email": "teamlead@nxthike.com", "first": "Lakshmi", "last": "Lead",
     "title": "Recruitment Team Lead"},
    {"persona": "p5", "email": "accountmanager@nxthike.com", "first": "Arjun", "last": "Account",
     "title": "Account Manager"},
    {"persona": "p6", "email": "hiringmanager@nxthike.com", "first": "Hema", "last": "Manager",
     "title": "Hiring Manager"},
    {"persona": "p7", "email": "interviewer@nxthike.com", "first": "Imran", "last": "Panel",
     "title": "Interviewer / Panellist"},
    {"persona": "p8", "email": "opsadmin@nxthike.com", "first": "Omar", "last": "Ops",
     "title": "Admin / Ops"},
]

#: Ambiguous characters are left out so a password can be read off a screen and
#: typed without a second attempt.
ALPHABET = "".join(c for c in string.ascii_letters + string.digits if c not in "O0oIl1")


def make_password() -> str:
    return "-".join("".join(secrets.choice(ALPHABET) for _ in range(5)) for _ in range(3))


async def ensure_schema() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await run_migrations(engine)


async def seed(dry_run: bool) -> int:
    created: list[tuple[str, str, str]] = []
    granted: list[tuple[str, str]] = []
    untouched: list[tuple[str, str]] = []

    async with async_session() as db:
        for spec in ACCOUNTS:
            persona = PERSONA_BY_ID[spec["persona"]]
            existing = (
                await db.execute(select(User).where(User.email == spec["email"]))
            ).scalar_one_or_none()

            if existing:
                # A real account may already own this address. Only fill a gap;
                # never change a password, a portal role, or a set persona.
                if not existing.persona:
                    granted.append((spec["email"], spec["persona"]))
                    if not dry_run:
                        existing.persona = spec["persona"]
                        existing.status = existing.status or "active"
                else:
                    untouched.append((spec["email"], existing.persona))
                continue

            password = make_password()
            created.append((spec["email"], password, persona["name"]))
            if not dry_run:
                db.add(
                    User(
                        email=spec["email"],
                        password_hash=hash_password(password),
                        # The portal role stays coarse on purpose. Workspace
                        # rights come from the persona, and `employer` keeps
                        # these accounts out of the public admin console.
                        role="employer",
                        first_name=spec["first"],
                        last_name=spec["last"],
                        persona=spec["persona"],
                        status="active",
                        title=spec["title"],
                        org=SEED_MARKER,
                    )
                )

        if not dry_run:
            await db.commit()

    label = "would create" if dry_run else "created"
    print(f"\n{label} {len(created)} account(s)")
    if created:
        print(f"\n{'EMAIL':<32} {'PASSWORD':<20} ROLE")
        print("-" * 78)
        for email, password, name in created:
            print(f"{email:<32} {password:<20} {name}")
        print(
            "\nThese passwords are shown once and are not stored anywhere else.\n"
            "Re-run with --reset-password <email> if one is lost."
        )

    if granted:
        print(f"\n{'would grant' if dry_run else 'granted'} a persona to {len(granted)} existing account(s):")
        for email, persona in granted:
            print(f"  {email} → {persona}")

    if untouched:
        print(f"\nleft alone ({len(untouched)} already had a persona):")
        for email, persona in untouched:
            print(f"  {email} → {persona}")

    return len(created)


async def reset_password(email: str, dry_run: bool) -> int:
    async with async_session() as db:
        user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
        if not user:
            print(f"No account with the address {email}")
            return 1
        if user.org != SEED_MARKER:
            print(
                f"Refusing: {email} was not created by this seeder "
                f"(org={user.org!r}). Reset a real user's password through the app."
            )
            return 1
        password = make_password()
        print(f"\n{email}\n  new password: {password}")
        if not dry_run:
            user.password_hash = hash_password(password)
            await db.commit()
            print("  saved")
        else:
            print("  (dry run — not saved)")
    return 0


async def remove(dry_run: bool) -> int:
    async with async_session() as db:
        rows = (await db.execute(select(User).where(User.org == SEED_MARKER))).scalars().all()
        print(f"\n{'would remove' if dry_run else 'removing'} {len(rows)} seeded account(s)")
        for u in rows:
            print(f"  {u.email} ({u.persona})")
        if not dry_run:
            for u in rows:
                await db.delete(u)
            await db.commit()
    return 0


async def main() -> None:
    parser = argparse.ArgumentParser(description="Create one sign-in account per workspace persona")
    parser.add_argument("--dry-run", action="store_true", help="report without writing")
    parser.add_argument("--remove", action="store_true", help="delete the accounts this seeder created")
    parser.add_argument("--reset-password", metavar="EMAIL", help="issue a new password for one seeded account")
    args = parser.parse_args()

    from app.config import settings

    target = settings.DATABASE_URL.split("@")[-1].split("?")[0]
    print(f"database: {target}")

    await ensure_schema()

    if args.remove:
        sys.exit(await remove(args.dry_run))
    if args.reset_password:
        sys.exit(await reset_password(args.reset_password, args.dry_run))

    await seed(args.dry_run)


if __name__ == "__main__":
    asyncio.run(main())
