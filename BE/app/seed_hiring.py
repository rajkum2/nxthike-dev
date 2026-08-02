"""
Seed hiring roles + candidates from FE/public/seed JSON files.

Usage (from BE/):
  python -m app.seed_hiring
  python -m app.seed_hiring --seed-dir ../FE/public/seed
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

from sqlalchemy import select

# Allow running as script
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings
from app.database import async_session, engine, Base
from app.models.hiring import Candidate, HiringRole
from app.api.hiring import apply_candidate_payload


def _load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


async def seed(seed_dir: Path, reset: bool = False) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    roles_path = seed_dir / "roles.json"
    if not roles_path.exists():
        raise FileNotFoundError(f"roles.json not found in {seed_dir}")

    roles_data = _load_json(roles_path)
    roles_meta = roles_data.get("roles") or []

    async with async_session() as db:
        if reset:
            # Clear existing hiring data
            for row in (await db.execute(select(Candidate))).scalars().all():
                await db.delete(row)
            for row in (await db.execute(select(HiringRole))).scalars().all():
                await db.delete(row)
            await db.commit()

        created_roles = 0
        for i, r in enumerate(roles_meta):
            rid = r["id"]
            existing = await db.get(HiringRole, rid)
            if existing:
                existing.name = r.get("name") or existing.name
                existing.sort_order = i
            else:
                db.add(
                    HiringRole(
                        id=rid,
                        name=r.get("name") or rid,
                        description=None,
                        is_active=True,
                        sort_order=i,
                    )
                )
                created_roles += 1
        await db.commit()

        created = 0
        updated = 0
        for r in roles_meta:
            file_name = r.get("file")
            if not file_name:
                continue
            fpath = seed_dir / file_name
            if not fpath.exists():
                print(f"  skip missing file: {fpath}")
                continue
            payload = _load_json(fpath)
            candidates = payload.get("candidates") or []
            print(f"  loading {r['id']}: {len(candidates)} candidates from {file_name}")
            for raw in candidates:
                cid = raw.get("id") or f"{r['id']}_{created + updated}"
                body = {
                    "roleId": raw.get("roleId") or r["id"],
                    "roleName": raw.get("roleName") or r.get("name") or r["id"],
                    "status": raw.get("status") or "new",
                    "tags": raw.get("tags") or [],
                    "notes": raw.get("notes") or "",
                    "starred": bool(raw.get("starred")),
                    "name": raw.get("name"),
                    "applicationLink": raw.get("applicationLink"),
                    "phone": raw.get("phone"),
                    "email": raw.get("email"),
                    "city": raw.get("city"),
                    "gender": raw.get("gender"),
                    "otherSkills": raw.get("otherSkills"),
                    "aiResumeMatch": raw.get("aiResumeMatch"),
                    "institute": raw.get("institute"),
                    "degree": raw.get("degree"),
                    "stream": raw.get("stream"),
                    "graduationYear": raw.get("graduationYear"),
                    "performancePg": raw.get("performancePg"),
                    "performanceUg": raw.get("performanceUg"),
                    "performance12": raw.get("performance12"),
                    "performance10": raw.get("performance10"),
                    "chatLink": raw.get("chatLink"),
                    "resumeLink": raw.get("resumeLink"),
                    "downloadLink": raw.get("downloadLink"),
                    "appliedAt": raw.get("appliedAt"),
                    "hasWorkExperience": raw.get("hasWorkExperience"),
                    "totalRoles": raw.get("totalRoles"),
                    "internshipCount": raw.get("internshipCount"),
                    "fulltimeCount": raw.get("fulltimeCount"),
                    "companies": raw.get("companies"),
                    "jobTitles": raw.get("jobTitles"),
                    "workExperienceDetail": raw.get("workExperienceDetail"),
                    "experienceDuration": raw.get("experienceDuration"),
                    "latestRole": raw.get("latestRole"),
                    "latestCompany": raw.get("latestCompany"),
                    "careerObjective": raw.get("careerObjective"),
                    "languages": raw.get("languages"),
                    "certifications": raw.get("certifications"),
                    "projects": raw.get("projects"),
                    "extraCurricular": raw.get("extraCurricular"),
                    "additionalDetails": raw.get("additionalDetails"),
                    "relevantSkills": raw.get("relevantSkills"),
                    "educationFromPdf": raw.get("educationFromPdf"),
                    "streamFromPdf": raw.get("streamFromPdf"),
                    "pdfFile": raw.get("pdfFile"),
                    "availability": raw.get("availability"),
                    "aiInterviewScores": raw.get("aiInterviewScores") or {},
                    "skillFlags": raw.get("skillFlags") or {},
                }
                existing = await db.get(Candidate, cid)
                if existing:
                    apply_candidate_payload(existing, body)
                    updated += 1
                else:
                    c = Candidate(id=cid)
                    apply_candidate_payload(c, body)
                    db.add(c)
                    created += 1
            await db.commit()

        print(f"Done. roles+={created_roles} candidates created={created} updated={updated}")


def main():
    parser = argparse.ArgumentParser(description="Seed hiring CRM data")
    parser.add_argument(
        "--seed-dir",
        default=settings.SEED_DIR,
        help="Directory containing roles.json and role seed files",
    )
    parser.add_argument("--reset", action="store_true", help="Wipe hiring tables first")
    args = parser.parse_args()
    seed_dir = Path(args.seed_dir).resolve()
    print(f"Seeding from {seed_dir}")
    print(f"DATABASE_URL={settings.DATABASE_URL[:40]}...")
    asyncio.run(seed(seed_dir, reset=args.reset))


if __name__ == "__main__":
    main()
