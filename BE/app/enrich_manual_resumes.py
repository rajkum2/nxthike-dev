"""
Re-parse PDFs for manual_import candidates (and optional role) and fill all CRM fields.

Usage (from BE/):
  python -m app.enrich_manual_resumes
  python -m app.enrich_manual_resumes --role manual_import_aug2026
"""

from __future__ import annotations

import argparse
import asyncio
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import urlopen

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from sqlalchemy import select

from app.database import async_session
from app.models.hiring import Candidate
from app.resume_parse import extract_text_from_pdf_bytes, parse_resume_text

ROLE_DEFAULT = "manual_import_aug2026"
DOWNLOADS = Path.home() / "Downloads"


def _download(url: str) -> bytes | None:
    try:
        from urllib.request import Request

        req = Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; NxtHikeEnrich/1.0)",
                "Accept": "application/pdf,*/*",
            },
        )
        with urlopen(req, timeout=60) as r:
            return r.read()
    except Exception as e:
        # fallback curl (R2 sometimes blocks bare urllib)
        try:
            import subprocess

            data = subprocess.check_output(
                ["curl", "-fsSL", "-A", "Mozilla/5.0", url],
                timeout=60,
            )
            return data
        except Exception as e2:
            print(f"  download fail: {e} / {e2}")
            return None


def _local_from_notes(notes: str | None) -> Path | None:
    if not notes:
        return None
    m = re.search(r"Imported from local file:\s*(.+)$", notes, re.M)
    if not m:
        return None
    name = m.group(1).strip()
    # try Downloads
    for base in [DOWNLOADS, DOWNLOADS / "AI Resumes 2"]:
        p = base / name
        if p.exists():
            return p
        # fuzzy
        for f in base.glob("*"):
            if f.name == name or name in f.name:
                return f
    return None


async def enrich(role_id: str) -> None:
    async with async_session() as db:
        rows = (
            await db.execute(select(Candidate).where(Candidate.role_id == role_id))
        ).scalars().all()
    print(f"Enriching {len(rows)} candidates in role={role_id}")

    updated = 0
    failed = 0
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    for c in rows:
        data = None
        source = None
        if c.resume_link and c.resume_link.lower().endswith(".pdf") or (
            c.resume_link and "/resumes/" in (c.resume_link or "")
        ):
            data = _download(c.resume_link)
            source = "r2"
        if not data and c.resume_link and not (c.resume_link or "").lower().endswith(".docx"):
            data = _download(c.resume_link)
            source = "r2"
        if not data:
            local = _local_from_notes(c.notes)
            if local and local.suffix.lower() == ".pdf":
                data = local.read_bytes()
                source = str(local)
            elif local and local.suffix.lower() in {".docx", ".doc"}:
                # text via docx
                try:
                    import docx

                    d = docx.Document(str(local))
                    text = "\n".join(p.text for p in d.paragraphs)
                    fields = parse_resume_text(text, c.name)
                    await _apply(c.id, fields, now)
                    updated += 1
                    print(f"OK  {c.name} (docx {local.name})")
                    continue
                except Exception as e:
                    print(f"FAIL docx {c.name}: {e}")
                    failed += 1
                    continue

        if not data:
            print(f"SKIP no file {c.name} | {c.resume_link}")
            failed += 1
            continue

        if not data.startswith(b"%PDF"):
            print(f"SKIP non-pdf {c.name}")
            failed += 1
            continue

        text = extract_text_from_pdf_bytes(data)
        if len(text.strip()) < 40:
            print(f"SKIP thin text {c.name} ({len(text)} chars) via {source}")
            failed += 1
            continue

        fields = parse_resume_text(text, c.name)
        await _apply(c.id, fields, now)
        updated += 1
        print(
            f"OK  {fields.get('name') or c.name:25} | city={fields.get('city') or '—'} | "
            f"skills={(fields.get('other_skills') or '—')[:40]} | via {source}"
        )

    print(f"\nDone: updated={updated} failed/skip={failed}")


_GARBAGE_NAMES = {
    "resume",
    "contact",
    "summary",
    "curriculum vitae",
    "cv",
    "objective",
    "education",
    "experience",
    "skills",
    "completed",
    "assessment",
    "is",
    "professional career.",
    "scholastic record",
    "gujarat",
    "kolkata",
    "tiruvallur",
    "sonal",
    "background",
}


def _is_garbage_name(n: str | None) -> bool:
    if not n or len(n.strip()) < 2:
        return True
    low = n.strip().lower()
    if low in _GARBAGE_NAMES:
        return True
    if len(n.split()) == 1 and low in {"contact", "resume", "cv", "sonal", "completed"}:
        return True
    # city-like or sentence-like
    if low.endswith(".") or "career" in low or "determination" in low:
        return True
    return False


def _is_plausible_city(city: str | None) -> bool:
    if not city or len(city) > 40:
        return False
    low = city.lower()
    if low in _GARBAGE_NAMES or "marketer" in low or "examination" in low:
        return False
    if re.search(r"(?i)engineer|developer|student|degree|university|assignment", city):
        return False
    return bool(re.match(r"^[A-Za-z][A-Za-z\s.'-]{1,38}$", city))


async def _apply(cid: str, fields: dict, now) -> None:
    async with async_session() as db:
        c = await db.get(Candidate, cid)
        if not c:
            return

        new_name = fields.get("name")
        if new_name and not _is_garbage_name(new_name):
            if _is_garbage_name(c.name) or (len(new_name.split()) >= 2 and len((c.name or "").split()) <= 1):
                c.name = new_name
            elif len(new_name.split()) >= 2 and new_name.lower() != (c.name or "").lower():
                # only replace if existing looks incomplete
                if not c.name or len(c.name) < 4:
                    c.name = new_name

        # email / phone: fill if missing
        if fields.get("email") and not c.email:
            c.email = fields["email"]
        if fields.get("phone") and not c.phone:
            c.phone = fields["phone"]

        city = fields.get("city")
        if city and _is_plausible_city(city):
            c.city = city

        mapping = {
            "degree": "degree",
            "stream": "stream",
            "institute": "institute",
            "graduation_year": "graduation_year",
            "education_from_pdf": "education_from_pdf",
            "has_work_experience": "has_work_experience",
            "work_experience_detail": "work_experience_detail",
            "experience_duration": "experience_duration",
            "companies": "companies",
            "job_titles": "job_titles",
            "latest_role": "latest_role",
            "latest_company": "latest_company",
            "other_skills": "other_skills",
            "languages": "languages",
            "certifications": "certifications",
            "projects": "projects",
            "career_objective": "career_objective",
            "additional_details": "additional_details",
            "relevant_skills": "relevant_skills",
        }
        for src, col in mapping.items():
            val = fields.get(src)
            if val:
                setattr(c, col, val)
        c.updated_at = now
        await db.commit()


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--role", default=ROLE_DEFAULT)
    args = p.parse_args()
    asyncio.run(enrich(args.role))


if __name__ == "__main__":
    main()
