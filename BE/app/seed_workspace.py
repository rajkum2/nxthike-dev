"""
Seed the TalentDialer workspace.

    python -m app.seed_workspace              # safe seed (default)
    python -m app.seed_workspace --dry-run    # report only, write nothing
    python -m app.seed_workspace --demo       # additionally add demo business data
    python -m app.seed_workspace --remove-demo

Two hard rules, enforced by every statement below:

1. **Only ever write where the value is currently NULL or the row is absent.**
   No existing value is overwritten, so re-running changes nothing and no
   existing candidate, job or role data is disturbed.

2. **Never invent business facts.** Compensation, bill/pay rates, SLA dates,
   client margins, offers and interviews are real commercial data. The safe
   seed leaves them empty so the screens show honest empty states; `--demo`
   adds clearly-marked sample rows for evaluation, and `--remove-demo` takes
   them away again.

What the safe seed does:

* `workspace_tags`      — registers the tags already present on candidates,
                          with their real usage counts. Pure restatement.
* `candidates.source`   — derives Naukri / Internshala / Apna / Excel import
                          from the import tags each record already carries.
* `candidates.requisition_id` — mirrors the existing `role_id`.
* `workspace_message_templates` — five generic outreach templates, so the
                          Composer and Template screens have something to work
                          with. Editable in the app.
* `workspace_settings`  — the singleton config row, if missing.
"""

from __future__ import annotations

import argparse
import asyncio
import json
from collections import Counter
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, text

from app.database import async_session, engine
from app.models.recruiting import MessageTemplate, Tag
from app.models.workspace import SETTINGS_SINGLETON_ID, WorkspaceSettings

DEMO_MARKER = "[demo]"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


# ---------------------------------------------------------------------------
# Tag → source mapping
# ---------------------------------------------------------------------------

#: Ordered: the first tag a candidate carries decides the source, so a record
#: tagged both `naukri` and `excel_import` is attributed to Naukri.
SOURCE_FROM_TAG: list[tuple[str, str]] = [
    ("naukri", "Naukri"),
    ("internshala", "Internshala"),
    ("apna", "Apna"),
    ("apna_import", "Apna"),
    ("linkedin", "LinkedIn"),
    ("referral", "Referral"),
    ("open_export", "Open export"),
    ("excel_import", "Excel import"),
]

TAG_COLORS = {
    "naukri": "#1D5FBF", "internshala": "#0F7A72", "apna": "#B85C00",
    "excel_import": "#6B6975", "open_export": "#6B6975", "not_matching": "#B3261E",
}


# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------

TEMPLATES = [
    dict(
        name="First outreach", channel="whatsapp", stage="Sourced",
        body=("Hi {{name}}, {{recruiter}} here from {{org}}. We're hiring for {{role}}. "
              "Your profile looks like a strong fit — is now a good time for a quick call?"),
    ),
    dict(
        name="Screening follow-up", channel="whatsapp", stage="Screening",
        body=("Thanks for your time, {{name}}. Sharing the details for the {{role}} role. "
              "Could you confirm your current CTC, expected CTC and notice period?"),
    ),
    dict(
        name="Missed you", channel="sms", stage="Sourced",
        body=("Hi {{name}}, tried reaching you about the {{role}} role. "
              "Reply with a good time and I'll call back."),
    ),
    dict(
        name="Interview invite", channel="email", stage="Interview",
        subject="Interview confirmed — {{role}}",
        body=("Hi {{name}},\n\nYour interview for {{role}} is confirmed. "
              "Panel details and the joining link are below.\n\n{{recruiter}}\n{{org}}"),
    ),
    dict(
        name="Offer nudge", channel="whatsapp", stage="Offer",
        body=("Hi {{name}}, checking in on the offer for {{role}}. "
              "Do you need anything from us to help you decide?"),
    ),
]


# ---------------------------------------------------------------------------
# Safe seed
# ---------------------------------------------------------------------------


async def seed_safe(dry_run: bool = False) -> dict:
    report: dict = {}

    async with async_session() as db:
        # -- settings singleton -------------------------------------------
        existing = await db.get(WorkspaceSettings, SETTINGS_SINGLETON_ID)
        if existing is None:
            report["settings"] = "would create" if dry_run else "created"
            if not dry_run:
                db.add(WorkspaceSettings(id=SETTINGS_SINGLETON_ID))
                await db.commit()
        else:
            report["settings"] = "already present"

        # -- tag registry, from tags candidates actually carry ------------
        rows = (await db.execute(text("SELECT tags FROM candidates WHERE tags IS NOT NULL"))).scalars().all()
        counter: Counter = Counter()
        for raw in rows:
            value = raw
            if isinstance(value, str):
                try:
                    value = json.loads(value)
                except Exception:
                    value = []
            for tag in value or []:
                counter[str(tag)] += 1

        known = {t.name for t in (await db.execute(select(Tag))).scalars().all()}
        to_add = [name for name in counter if name not in known]
        report["tags"] = {"in_use": len(counter), "already_registered": len(known), "added": len(to_add)}
        if not dry_run and to_add:
            for name in to_add:
                db.add(
                    Tag(
                        name=name,
                        kind="source" if name in SOURCE_FROM_TAG_KEYS else "list",
                        color=TAG_COLORS.get(name),
                        description=f"{counter[name]:,} candidate(s) at seed time",
                    )
                )
            await db.commit()

        # -- outreach templates -------------------------------------------
        have = {t.name for t in (await db.execute(select(MessageTemplate))).scalars().all()}
        missing = [t for t in TEMPLATES if t["name"] not in have]
        report["templates"] = {"existing": len(have), "added": len(missing)}
        if not dry_run and missing:
            for t in missing:
                db.add(MessageTemplate(**t))
            await db.commit()

    # -- candidate.source, derived from import tags (NULL rows only) ------
    #
    # Applied in SOURCE_FROM_TAG order, so a record tagged both `naukri` and
    # `excel_import` is attributed to Naukri: each pass only touches rows still
    # NULL after the previous one.
    async with engine.begin() as conn:
        if dry_run:
            # Count DISTINCT candidates matching any mapped tag. Summing the
            # per-tag counts would double-count multi-tagged records — the real
            # UPDATE cannot, because each pass narrows `source IS NULL`.
            any_tag = " OR ".join(
                f"CAST(tags AS jsonb) @> CAST(:t{i} AS jsonb)" for i in range(len(SOURCE_FROM_TAG))
            )
            params = {f"t{i}": json.dumps([tag]) for i, (tag, _) in enumerate(SOURCE_FROM_TAG)}
            n = (
                await conn.execute(
                    text(
                        "SELECT count(*) FROM candidates "
                        f"WHERE source IS NULL AND tags IS NOT NULL AND ({any_tag})"
                    ),
                    params,
                )
            ).scalar() or 0
            report["candidate_source"] = {"would_fill": n}
        else:
            filled = 0
            for tag, source in SOURCE_FROM_TAG:
                n = (
                    await conn.execute(
                        text(
                            "UPDATE candidates SET source = :source "
                            "WHERE source IS NULL AND tags IS NOT NULL "
                            "AND CAST(tags AS jsonb) @> CAST(:probe AS jsonb)"
                        ),
                        {"source": source, "probe": json.dumps([tag])},
                    )
                ).rowcount or 0
                filled += n
            report["candidate_source"] = {"filled": filled}

        # -- candidate.requisition_id mirrors the existing role_id --------
        if dry_run:
            n = (
                await conn.execute(
                    text("SELECT count(*) FROM candidates WHERE requisition_id IS NULL AND role_id IS NOT NULL")
                )
            ).scalar() or 0
        else:
            n = (
                await conn.execute(
                    text("UPDATE candidates SET requisition_id = role_id "
                         "WHERE requisition_id IS NULL AND role_id IS NOT NULL")
                )
            ).rowcount or 0
        report["candidate_requisition"] = {"would_link" if dry_run else "linked": n}

    return report


SOURCE_FROM_TAG_KEYS = {t for t, _ in SOURCE_FROM_TAG}


# ---------------------------------------------------------------------------
# Demo seed — opt-in, clearly marked, fully removable
# ---------------------------------------------------------------------------


async def seed_demo() -> dict:
    """
    Sample business data so every screen can be evaluated end to end.

    Everything created here carries [DEMO_MARKER] in a text field and is removed
    by `--remove-demo`. It never modifies an existing candidate, role or company.
    """
    from app.models.hiring import Candidate, HiringRole
    from app.models.recruiting import Approval, Interview, Offer, Submission
    from app.models.workspace import Task

    report: dict = {}
    async with async_session() as db:
        cands = (
            await db.execute(
                select(Candidate).where(Candidate.name.is_not(None)).limit(6)
            )
        ).scalars().all()
        if not cands:
            return {"error": "no candidates to build demo rows from"}

        roles = (await db.execute(select(HiringRole).limit(3))).scalars().all()
        role = roles[0] if roles else None
        now = _utcnow()

        made = Counter()

        # Submissions
        for c in cands[:3]:
            db.add(Submission(
                candidate_id=c.id, candidate_name=c.name,
                requisition_id=role.id if role else None,
                requisition_name=role.name if role else None,
                status="client_review", note=f"{DEMO_MARKER} sample submission",
                submitted_at=now - timedelta(days=2),
            ))
            made["submissions"] += 1

        # Interviews
        for i, c in enumerate(cands[:2]):
            db.add(Interview(
                candidate_id=c.id, candidate_name=c.name,
                requisition_id=role.id if role else None,
                requisition_name=role.name if role else None,
                kind="technical", round_label=f"{DEMO_MARKER} Technical round {i + 1}",
                scheduled_at=now + timedelta(days=i, hours=3),
                mode="Google Meet", panel=[{"name": "Panel member", "email": "panel@example.com"}],
            ))
            made["interviews"] += 1

        # Offer + approval chain
        c = cands[0]
        offer = Offer(
            reference="OFF-DEMO-0001", candidate_id=c.id, candidate_name=c.name,
            requisition_id=role.id if role else None,
            requisition_name=role.name if role else None,
            status="pending_approval", ctc_total=18.0,
            breakup=[{"label": "Fixed base", "amount": 1500000},
                     {"label": "Performance bonus", "amount": 300000}],
            band_note=f"{DEMO_MARKER} sample offer",
            joining_date=now + timedelta(days=45), expires_at=now + timedelta(days=7),
        )
        db.add(offer)
        await db.flush()
        db.add(Approval(
            kind="offer", ref_id=offer.id, ref_label=f"Offer · {c.name}",
            detail=f"{DEMO_MARKER} awaiting decision", approver_role="Finance", sequence=0,
        ))
        made["offers"] += 1
        made["approvals"] += 1

        # Tasks
        for title in ("Submit 3 profiles for the open requisition",
                      "Chase outstanding scorecard",
                      "Clean up flagged wrong-number records"):
            db.add(Task(title=f"{DEMO_MARKER} {title}", due_at=now + timedelta(days=1)))
            made["tasks"] += 1

        await db.commit()
        report["created"] = dict(made)
    return report


async def remove_demo() -> dict:
    async with engine.begin() as conn:
        removed = {}
        for table, column in [
            ("workspace_submissions", "note"),
            ("workspace_interviews", "round_label"),
            ("workspace_approvals", "detail"),
            ("workspace_offers", "band_note"),
            ("workspace_tasks", "title"),
        ]:
            n = (
                await conn.execute(
                    text(f"DELETE FROM {table} WHERE {column} LIKE :m"), {"m": f"%{DEMO_MARKER}%"}
                )
            ).rowcount or 0
            removed[table] = n
    return removed


# ---------------------------------------------------------------------------


async def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the TalentDialer workspace")
    parser.add_argument("--dry-run", action="store_true", help="report without writing")
    parser.add_argument("--demo", action="store_true", help="also add removable demo business data")
    parser.add_argument("--remove-demo", action="store_true", help="remove demo data and exit")
    args = parser.parse_args()

    from app.config import settings

    where = settings.DATABASE_URL.split("@")[-1].split("/")[0]
    print(f"target: {where}\n")

    if args.remove_demo:
        print("removing demo data…")
        for k, v in (await remove_demo()).items():
            print(f"  {k}: {v} removed")
        await engine.dispose()
        return

    print("DRY RUN — nothing will be written\n" if args.dry_run else "seeding…\n")
    for key, value in (await seed_safe(args.dry_run)).items():
        print(f"  {key}: {value}")

    if args.demo and not args.dry_run:
        print("\nadding demo data (removable with --remove-demo)…")
        for key, value in (await seed_demo()).items():
            print(f"  {key}: {value}")

    print("\nleft empty on purpose (real commercial data — enter these in the app):")
    print("  requisitions: comp range, bill/pay rate, SLA date, priority, client link")
    print("  clients:      health, margin, contract terms, contacts")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
