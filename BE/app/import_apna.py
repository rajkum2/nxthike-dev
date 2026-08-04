"""
Import Apna.co job application exports (CSV / XLSX) into hiring CRM.

Usage (from BE/):
  python -m app.import_apna
  python -m app.import_apna --reset
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import hashlib
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

import openpyxl
from sqlalchemy import select, func

from app.database import async_session, engine, Base
from app.models.hiring import Candidate, HiringRole

DOWNLOADS = Path.home() / "Downloads"

DEFAULT_FILES = [
    DOWNLOADS / "apna_501851_06-08-2021.xlsx",
    DOWNLOADS / "apna_501851_23-07-2021.xlsx",
    DOWNLOADS / "apna_590170_04-08-2021.xlsx",
    DOWNLOADS / "apna_759813_10-18-2021.csv",
    DOWNLOADS / "apna_872249_10-7-2021 (1).csv",
    DOWNLOADS / "apna_872249_10-7-2021_Telecallers_Outbound.xlsx",
    DOWNLOADS / "apna_872249_10-7-2021.csv",
    DOWNLOADS / "apna_402355936_12-9-2021_Counseller.xlsx",
    DOWNLOADS / "apna_465879176_12-13-2021-Fullstack.xlsx",
    DOWNLOADS / "apna_645464965_12-16-2021.csv",
    DOWNLOADS / "apna_907116390_10-25-2021.csv",
    DOWNLOADS / "apna_907116390_10-25-2021.xlsx",
    DOWNLOADS / "apna_907116390_12-13-2021-reactjs (1).csv",
    DOWNLOADS / "apna_907116390_12-13-2021-reactjs (2).csv",
    DOWNLOADS / "apna_907116390_12-13-2021-reactjs.csv",
]

# filename hint → (role_id, role_name)
ROLE_FROM_FILE: list[tuple[re.Pattern[str], str, str]] = [
    (re.compile(r"telecaller", re.I), "telecaller", "Telecaller / Outbound"),
    (re.compile(r"counsell?or", re.I), "counsellor", "Counsellor"),
    (re.compile(r"fullstack", re.I), "fullstack_developer", "Fullstack Developer"),
    (re.compile(r"reactjs|react", re.I), "reactjs_developer", "React.js Developer"),
]

DEFAULT_ROLE = ("apna_import", "Apna Import (2021)")


def infer_role(filename: str) -> tuple[str, str]:
    for pat, rid, rname in ROLE_FROM_FILE:
        if pat.search(filename):
            return rid, rname
    return DEFAULT_ROLE


def _cell(row: dict, *keys: str) -> str | None:
    for k in keys:
        # handle BOM on Name
        for rk, rv in row.items():
            clean = rk.lstrip("\ufeff").strip().strip('"')
            if clean.lower() == k.lower():
                if rv is None:
                    return None
                s = str(rv).strip()
                if s.endswith(".0") and s.replace(".0", "").isdigit():
                    s = s[:-2]
                if s and s.lower() not in {"none", "nan", "null"}:
                    return s
    return None


def _phone(raw: str | None) -> str | None:
    if not raw:
        return None
    d = re.sub(r"\D", "", raw)
    if len(d) >= 10:
        return d[-10:]
    return d or None


def _has_exp(exp: str | None) -> str | None:
    if not exp:
        return None
    if re.search(r"(?i)fresher|0\s*year|nil|none", exp):
        return "No"
    if re.search(r"(?i)\d|<1", exp):
        return "Yes"
    return None


def _status(feedback: str | None, status: str | None) -> str:
    blob = f"{status or ''} {feedback or ''}".lower()
    if "reject" in blob or "not interested" in blob:
        return "rejected"
    if "hold" in blob or "pending" in blob or "callback" in blob or "call back" in blob:
        return "on_hold"
    if "shortlist" in blob or "selected" in blob:
        return "shortlisted"
    if "interview" in blob:
        return "interview"
    return "new"


def load_xlsx(path: Path) -> list[dict]:
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    it = ws.iter_rows(values_only=True)
    headers = [str(h).strip() if h is not None else f"col{i}" for i, h in enumerate(next(it))]
    out = []
    for raw in it:
        if not raw or all(c is None or str(c).strip() == "" for c in raw):
            continue
        out.append({headers[i]: raw[i] if i < len(raw) else None for i in range(len(headers))})
    wb.close()
    return out


def load_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8-sig", errors="replace") as fh:
        # normalize possible quoted header BOM
        reader = csv.DictReader(fh)
        out = []
        for row in reader:
            # clean keys
            cleaned = {k.lstrip("\ufeff").strip().strip('"'): v for k, v in row.items() if k is not None}
            if any(str(v or "").strip() for v in cleaned.values()):
                out.append(cleaned)
        return out


def row_to_payload(row: dict, source: str, role_id: str, role_name: str) -> dict | None:
    name = _cell(row, "Name")
    phone = _phone(_cell(row, "Phone Number", "Phone"))
    if not name and not phone:
        return None
    area = _cell(row, "Area")
    company = _cell(row, "Company")
    job = _cell(row, "Current Job")
    education = _cell(row, "Education")
    experience = _cell(row, "Experience")
    status = _cell(row, "Status")
    feedback = _cell(row, "Feedback")
    applied = _cell(row, "Applied On")

    key = f"{phone or ''}|{(name or '').lower()}"
    cid = f"apna_{hashlib.sha1(key.encode()).hexdigest()[:12]}"

    notes_parts = [f"Source: {source}"]
    if feedback:
        notes_parts.append(f"Feedback: {feedback}")
    if status:
        notes_parts.append(f"Apna status: {status}")

    return {
        "id": cid,
        "role_id": role_id,
        "role_name": role_name,
        "status": _status(feedback, status),
        "tags": ["apna", "import_2021", role_id],
        "notes": "\n".join(notes_parts),
        "name": name,
        "phone": phone,
        "city": area,
        "companies": company,
        "latest_company": company,
        "job_titles": job,
        "latest_role": job,
        "degree": education,
        "experience_duration": experience,
        "has_work_experience": _has_exp(experience),
        "applied_at": applied,
        "email": None,
    }


async def ensure_role(role_id: str, role_name: str, sort_order: int) -> None:
    async with async_session() as db:
        r = await db.get(HiringRole, role_id)
        if not r:
            db.add(
                HiringRole(
                    id=role_id,
                    name=role_name,
                    description="Imported from Apna.co application exports",
                    is_active=True,
                    sort_order=sort_order,
                )
            )
            await db.commit()
            print(f"Created role {role_id} ({role_name})")


async def run(files: list[Path], reset: bool) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # roles we may create
    needed = {DEFAULT_ROLE}
    for f in files:
        needed.add(infer_role(f.name))
    for i, (rid, rname) in enumerate(sorted(needed, key=lambda x: x[0])):
        await ensure_role(rid, rname, 50 + i)

    if reset:
        async with async_session() as db:
            role_ids = {r[0] for r in needed}
            old = (
                await db.execute(select(Candidate).where(Candidate.role_id.in_(role_ids)))
            ).scalars().all()
            # only delete apna-tagged
            n = 0
            for c in old:
                tags = c.tags or []
                if "apna" in tags or (c.id or "").startswith("apna_"):
                    await db.delete(c)
                    n += 1
            await db.commit()
            print(f"Cleared {n} previous Apna candidates")

    by_id: dict[str, dict] = {}
    for path in files:
        if not path.exists():
            print(f"MISSING {path}")
            continue
        role_id, role_name = infer_role(path.name)
        try:
            rows = load_xlsx(path) if path.suffix.lower() == ".xlsx" else load_csv(path)
        except Exception as e:
            print(f"ERROR reading {path.name}: {e}")
            continue
        n = 0
        for row in rows:
            payload = row_to_payload(row, path.name, role_id, role_name)
            if not payload:
                continue
            cid = payload["id"]
            if cid in by_id:
                prev = by_id[cid]
                # prefer role from more specific file
                if role_id != DEFAULT_ROLE[0] and prev["role_id"] == DEFAULT_ROLE[0]:
                    prev["role_id"] = role_id
                    prev["role_name"] = role_name
                for k, v in payload.items():
                    if k in {"id", "role_id", "role_name"}:
                        continue
                    if v and not prev.get(k):
                        prev[k] = v
                    elif k == "notes" and v and v not in (prev.get("notes") or ""):
                        prev["notes"] = ((prev.get("notes") or "") + "\n" + v).strip()
            else:
                by_id[cid] = payload
            n += 1
        print(f"{path.name}: rows={n} unique_so_far={len(by_id)} role={role_id}")

    created = 0
    updated = 0
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    async with async_session() as db:
        for payload in by_id.values():
            cid = payload["id"]
            existing = await db.get(Candidate, cid)
            fields = {
                "role_id": payload["role_id"],
                "role_name": payload["role_name"],
                "status": payload["status"],
                "tags": payload["tags"],
                "notes": payload.get("notes") or "",
                "name": payload.get("name"),
                "phone": payload.get("phone"),
                "city": payload.get("city"),
                "companies": payload.get("companies"),
                "latest_company": payload.get("latest_company"),
                "job_titles": payload.get("job_titles"),
                "latest_role": payload.get("latest_role"),
                "degree": payload.get("degree"),
                "experience_duration": payload.get("experience_duration"),
                "has_work_experience": payload.get("has_work_experience"),
                "applied_at": payload.get("applied_at"),
                "updated_at": now,
            }
            if existing:
                for k, v in fields.items():
                    if v is not None and v != "":
                        setattr(existing, k, v)
                updated += 1
            else:
                db.add(Candidate(id=cid, created_at=now, starred=False, **fields))
                created += 1
        await db.commit()

    async with async_session() as db:
        print("\n=== Apna import done ===")
        print(f"unique: {len(by_id)}  created: {created}  updated: {updated}")
        for rid, rname in sorted(needed):
            cnt = (
                await db.execute(
                    select(func.count()).select_from(Candidate).where(Candidate.role_id == rid)
                )
            ).scalar()
            print(f"  {rname}: {cnt}")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--reset", action="store_true")
    args = p.parse_args()
    files = [f for f in DEFAULT_FILES if f.exists()]
    if not files:
        raise SystemExit("No Apna files found")
    asyncio.run(run(files, args.reset))


if __name__ == "__main__":
    main()
