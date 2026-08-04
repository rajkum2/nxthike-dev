"""
Import AI/ML Engineer candidates from Naukri-style Excel exports.

Usage (from BE/):
  python -m app.import_ai_excel
  python -m app.import_ai_excel --dir ~/Downloads/AI\\ Resumes
  python -m app.import_ai_excel --reset
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

load_dotenv()

import openpyxl
from sqlalchemy import select, func

from app.database import async_session, engine, Base
from app.models.hiring import Candidate, HiringRole

ROLE_ID = "ai_ml_engineer"
ROLE_NAME = "AI/ML Engineer (Naukri Import)"

DEFAULT_DIR = Path.home() / "Downloads" / "AI Resumes"


def _cell(row: dict, *keys: str) -> str | None:
    for k in keys:
        v = row.get(k)
        if v is None:
            continue
        s = str(v).strip()
        if s and s.upper() not in {"NA", "N/A", "NONE", "-"}:
            return s
    return None


def _first_email(raw: str | None) -> str | None:
    if not raw:
        return None
    # may be "a@x.com, b@y.com"
    parts = re.split(r"[,;\s]+", raw)
    for p in parts:
        if "@" in p:
            return p.strip().lower()
    return raw.strip().lower() or None


def _clean_name(name: str | None) -> str | None:
    if not name:
        return None
    # "Omprakash Pullarwar 'Gen AI Engine'" → Omprakash Pullarwar
    name = re.sub(r"'[^']*'", "", name)
    name = re.sub(r"\s+", " ", name).strip(" -")
    return name or None


def _has_exp(exp: str | None) -> str | None:
    if not exp:
        return None
    if re.search(r"(?i)0\s*year|fresher|nil|none", exp) and not re.search(
        r"(?i)[1-9]\s*year|[1-9]\s*month", exp
    ):
        return "No"
    if re.search(r"(?i)\d", exp):
        return "Yes"
    return None


def row_to_payload(row: dict, source_file: str) -> dict | None:
    email = _first_email(_cell(row, "Email ID", "Email"))
    name = _clean_name(_cell(row, "Name"))
    if not name and not email:
        return None

    phone = _cell(row, "Phone Number", "Phone")
    if phone:
        phone = re.sub(r"\D", "", phone)
        if len(phone) > 10:
            phone = phone[-10:]

    city = _cell(row, "Current Location", "City")
    exp = _cell(row, "Total Experience")
    company = _cell(row, "Curr. Company name")
    designation = _cell(row, "Curr. Company Designation")
    skills = _cell(row, "Key Skills")
    summary = _cell(row, "Summary")
    headline = _cell(row, "Resume Headline")
    ug_deg = _cell(row, "Under Graduation degree")
    ug_spec = _cell(row, "UG Specialization")
    ug_inst = _cell(row, "UG University/institute Name")
    ug_year = _cell(row, "UG Graduation year")
    pg_deg = _cell(row, "Post graduation degree")
    pg_spec = _cell(row, "PG specialization")
    pg_inst = _cell(row, "PG university/institute name")
    pg_year = _cell(row, "PG graduation year")
    gender = _cell(row, "Gender")
    availability = _cell(row, "Notice period/ Availability to join")
    applied = _cell(row, "Date of application")
    job_title = _cell(row, "Job Title")
    status_raw = (_cell(row, "Status") or "new").lower()
    # map naukri status loosely
    status = "new"
    if "reject" in status_raw:
        status = "rejected"
    elif "hold" in status_raw:
        status = "on_hold"
    elif "short" in status_raw:
        status = "shortlisted"
    elif "interview" in status_raw:
        status = "interview"
    elif status_raw in {"available", "active"}:
        status = "new"

    comments = []
    for i in range(1, 6):
        c = _cell(row, f"Comment {i}")
        if c:
            comments.append(c)
    notes_parts = []
    if job_title:
        notes_parts.append(f"Job: {job_title}")
    if source_file:
        notes_parts.append(f"Source: {source_file}")
    if comments:
        notes_parts.append("Comments: " + " | ".join(comments))
    notes = "\n".join(notes_parts)

    degree = " / ".join(x for x in [ug_deg, ug_spec] if x) or None
    stream = ug_spec
    institute = ug_inst
    if pg_deg or pg_inst:
        institute = " | ".join(
            x
            for x in [
                f"UG: {ug_inst}" if ug_inst else None,
                f"PG: {pg_inst}" if pg_inst else None,
            ]
            if x
        ) or institute
        if pg_deg:
            degree = (degree + " · PG: " + " ".join(x for x in [pg_deg, pg_spec] if x)) if degree else " ".join(
                x for x in [pg_deg, pg_spec] if x
            )

    education_bits = []
    if ug_deg or ug_inst:
        education_bits.append(
            "UG: " + " · ".join(x for x in [ug_deg, ug_spec, ug_inst, ug_year] if x)
        )
    if pg_deg or pg_inst:
        education_bits.append(
            "PG: " + " · ".join(x for x in [pg_deg, pg_spec, pg_inst, pg_year] if x)
        )

    # stable id from email or name+phone
    key = email or f"{name}|{phone or ''}|{city or ''}"
    digest = hashlib.sha1(key.encode("utf-8")).hexdigest()[:12]
    cid = f"{ROLE_ID}_{digest}"

    return {
        "id": cid,
        "roleId": ROLE_ID,
        "roleName": ROLE_NAME,
        "status": status,
        "tags": ["naukri", "ai_ml", "excel_import"],
        "notes": notes,
        "starred": False,
        "name": name,
        "email": email,
        "phone": phone,
        "city": city,
        "gender": gender,
        "otherSkills": skills,
        "institute": institute,
        "degree": degree,
        "stream": stream,
        "graduationYear": ug_year or pg_year,
        "hasWorkExperience": _has_exp(exp),
        "experienceDuration": exp,
        "companies": company if company and company.upper() != "NA" else None,
        "jobTitles": designation if designation and designation.upper() != "NA" else None,
        "latestRole": designation if designation and designation.upper() != "NA" else None,
        "latestCompany": company if company and company.upper() != "NA" else None,
        "careerObjective": headline or summary,
        "workExperienceDetail": summary,
        "educationFromPdf": " | ".join(education_bits) if education_bits else None,
        "availability": availability,
        "appliedAt": applied,
        "aiResumeMatch": None,
        "resumeLink": None,
        "downloadLink": None,
        "applicationLink": None,
        "chatLink": None,
        "pdfFile": None,
    }


def load_excel(path: Path) -> list[dict]:
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    rows_iter = ws.iter_rows(values_only=True)
    headers = [str(h).strip() if h is not None else f"col_{i}" for i, h in enumerate(next(rows_iter))]
    out: list[dict] = []
    for raw in rows_iter:
        if not raw or all(c is None or str(c).strip() == "" for c in raw):
            continue
        d = {}
        for i, h in enumerate(headers):
            if i < len(raw):
                d[h] = raw[i]
        out.append(d)
    wb.close()
    return out


async def ensure_role() -> None:
    async with async_session() as db:
        role = await db.get(HiringRole, ROLE_ID)
        if not role:
            db.add(
                HiringRole(
                    id=ROLE_ID,
                    name=ROLE_NAME,
                    description="Imported from Naukri AI Resumes Excel exports",
                    is_active=True,
                    sort_order=1,
                )
            )
            await db.commit()
            print(f"Created role {ROLE_ID}")
        else:
            print(f"Role exists: {ROLE_ID}")


async def run(folder: Path, reset: bool) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await ensure_role()

    if reset:
        async with async_session() as db:
            old = (
                await db.execute(select(Candidate).where(Candidate.role_id == ROLE_ID))
            ).scalars().all()
            for c in old:
                await db.delete(c)
            await db.commit()
            print(f"Cleared {len(old)} existing {ROLE_ID} candidates")

    files = sorted(folder.glob("*.xlsx"))
    if not files:
        raise SystemExit(f"No xlsx files in {folder}")

    # email/id → payload (later files overwrite / merge)
    by_id: dict[str, dict] = {}
    for f in files:
        print(f"Reading {f.name}…")
        try:
            rows = load_excel(f)
        except Exception as e:
            print(f"  ERROR {f.name}: {e}")
            continue
        n = 0
        for row in rows:
            payload = row_to_payload(row, f.name)
            if not payload:
                continue
            cid = payload["id"]
            if cid in by_id:
                # merge: keep non-empty fields from either
                prev = by_id[cid]
                for k, v in payload.items():
                    if v and not prev.get(k):
                        prev[k] = v
                    elif k == "notes" and v and v not in (prev.get("notes") or ""):
                        prev["notes"] = ((prev.get("notes") or "") + "\n" + v).strip()
            else:
                by_id[cid] = payload
            n += 1
        print(f"  rows={n} unique_so_far={len(by_id)}")

    created = 0
    updated = 0
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    async with async_session() as db:
        for payload in by_id.values():
            cid = payload["id"]
            existing = await db.get(Candidate, cid)
            mapping = {
                "role_id": payload["roleId"],
                "role_name": payload["roleName"],
                "status": payload["status"],
                "tags": payload["tags"],
                "notes": payload.get("notes") or "",
                "starred": False,
                "name": payload.get("name"),
                "email": payload.get("email"),
                "phone": payload.get("phone"),
                "city": payload.get("city"),
                "gender": payload.get("gender"),
                "other_skills": payload.get("otherSkills"),
                "institute": payload.get("institute"),
                "degree": payload.get("degree"),
                "stream": payload.get("stream"),
                "graduation_year": payload.get("graduationYear"),
                "has_work_experience": payload.get("hasWorkExperience"),
                "experience_duration": payload.get("experienceDuration"),
                "companies": payload.get("companies"),
                "job_titles": payload.get("jobTitles"),
                "latest_role": payload.get("latestRole"),
                "latest_company": payload.get("latestCompany"),
                "career_objective": payload.get("careerObjective"),
                "work_experience_detail": payload.get("workExperienceDetail"),
                "education_from_pdf": payload.get("educationFromPdf"),
                "availability": payload.get("availability"),
                "applied_at": payload.get("appliedAt"),
                "updated_at": now,
            }
            if existing:
                for k, v in mapping.items():
                    if v is not None and v != "":
                        setattr(existing, k, v)
                updated += 1
            else:
                c = Candidate(id=cid, created_at=now, **mapping)
                db.add(c)
                created += 1
        await db.commit()

    async with async_session() as db:
        total = (
            await db.execute(
                select(func.count()).select_from(Candidate).where(Candidate.role_id == ROLE_ID)
            )
        ).scalar()
    print("\n=== AI Excel import done ===")
    print(f"unique candidates: {len(by_id)}")
    print(f"created: {created}  updated: {updated}")
    print(f"role {ROLE_ID} total in DB: {total}")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dir", default=str(DEFAULT_DIR))
    p.add_argument("--reset", action="store_true")
    args = p.parse_args()
    asyncio.run(run(Path(args.dir).expanduser().resolve(), args.reset))


if __name__ == "__main__":
    main()
