"""
Import ad-hoc resumes from a folder (or explicit file list):
  - clean/normalize filenames
  - extract name/email/phone (+ light experience text)
  - create HiringRole if needed
  - upload PDF to R2
  - insert Candidate rows

Usage (from BE/):
  STORAGE_BACKEND=r2 python -m app.import_manual_resumes
"""

from __future__ import annotations

import asyncio
import os
import re
import sys
import unicodedata
import uuid
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import select

from app.database import async_session, engine, Base
from app.models.hiring import Candidate, HiringRole
from app.services.storage import get_storage, R2Storage

ROLE_ID = "manual_import_aug2026"
ROLE_NAME = "Manual Import (Aug 2026)"

# Source paths (Downloads)
DOWNLOADS = Path.home() / "Downloads"

SOURCE_FILES = [
    DOWNLOADS / "Yash's Resume - Girija Kumari.pdf",
    DOWNLOADS / "vaishnavi Reddy_fresher - Kiranmai P.pdf",
    DOWNLOADS / "TiyashaKarmakar_InternshalaResume-1 - Girija Kumari.pdf",
    DOWNLOADS / "Swapnali_Resume - Girija Kumari.pdf",
    DOWNLOADS / "srujan.updated.resume 1 - Kiranmai P.pdf",
    DOWNLOADS / "Sohini’s resume - Girija Kumari.pdf",
    DOWNLOADS / "Sohan Singh Chouhan-(1)-4 - Kiranmai P.pdf",
    DOWNLOADS / "Siddhesh Jondhale Resume - Girija Kumari.pdf",
    DOWNLOADS / "shyam's Resume (3) - Kiranmai P.pdf",
    DOWNLOADS / "SHRESTHA BHADRA CV - Girija Kumari.pdf",
    DOWNLOADS / "SEO Resume Lucky1 - Kiranmai P.docx",
    DOWNLOADS / "Sakshi's Resume (1) - Girija Kumari.pdf",
    DOWNLOADS / "Romil Shah Resume - Girija Kumari.pdf",
    DOWNLOADS / "SaharMurad_InternshalaResume - Girija Kumari.pdf",
    DOWNLOADS / "Resume - Girija Kumari.pdf",
    DOWNLOADS / "Resume Nishi Parekh.docx(1) - Girija Kumari.pdf",
    DOWNLOADS / "Resume_Sushmita - Kiranmai P.pdf",
    DOWNLOADS / "resume - Girija Kumari (1).pdf",
    DOWNLOADS / "J Deepak Reddy - Kiranmai P.pdf",
    DOWNLOADS / "JhalakSharma_InternshalaResume - Girija Kumari.pdf",
    DOWNLOADS / "MaanaviSingh_InternshalaResume - Girija Kumari.pdf",
    DOWNLOADS / "Manisha - Kiranmai P.pdf",
    DOWNLOADS / "MANISHA 3 - Kiranmai P.pdf",
    DOWNLOADS / "Mayuri_Swain_UI_Devloper - Kiranmai P.docx",
    DOWNLOADS / "Mrudhula _Digital Marketing - Kiranmai P.pdf",
    DOWNLOADS / "Namrata Marketing - Girija Kumari.pdf",
    DOWNLOADS / "Neeladri Mukherjee resume1 - Kiranmai P.pdf",
    DOWNLOADS / "Neetu Resume A-converted - Kiranmai P.pdf",
    DOWNLOADS / "NishaArora_InternshalaResume - Girija Kumari.pdf",
    DOWNLOADS / "PranaySharma_jobResume - Girija Kumari.pdf",
    DOWNLOADS / "Prerna's resume - Girija Kumari.pdf",
    DOWNLOADS / "raja__resume - Kiranmai P.pdf",
    DOWNLOADS / "RajatAgarwal_InternshalaResume - Girija Kumari.pdf",
    # Manish Kumar resume image (from user screenshot set)
    DOWNLOADS / "Resume Manish 22 pdf-page-001 - Girija Kumari.jpg",
]

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(
    r"(?:\+?91[\s\-]?)?(?:\(?0?\d{2,5}\)?[\s\-]?)?\d{5}[\s\-]?\d{5}|\b\d{10}\b"
)
RECRUITER_SUFFIX = re.compile(
    r"\s*[-–—]\s*(Girija\s*Kumari|Kiranmai\s*P)\s*$",
    re.I,
)
NOISE = re.compile(
    r"(?i)\b(resume|cv|internshala|fresher|updated|job|docx?|pdf|page-\d+|converted)\b"
)


def slug_name(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("’", "'")
    # possessives: Yash's / Sohini's → Yash / Sohini
    s = re.sub(r"'s\b", "", s, flags=re.I)
    s = s.replace("'", "")
    s = re.sub(r"[^\w\s.\-]", " ", s)
    s = re.sub(r"[\s.]+", "_", s.strip())
    s = re.sub(r"_+", "_", s).strip("_")
    return s[:80] or "candidate"


def clean_display_name_from_filename(path: Path) -> str:
    stem = path.stem
    # strip weird docx remnants
    stem = stem.replace(".docx(1)", "").replace(".docx", "").replace(".pdf", "")
    stem = RECRUITER_SUFFIX.sub("", stem)
    stem = re.sub(r"\(\d+\)", " ", stem)
    stem = re.sub(r"-\d+$", "", stem)
    # keep personal names; only drop pure noise tokens
    stem = re.sub(
        r"(?i)\b(internshala|fresher|updated|jobresume|job\s*resume|docx?|pdf|page-\d+|converted|resume1)\b",
        " ",
        stem,
    )
    # trailing/leading "Resume" / "CV" only
    stem = re.sub(r"(?i)^(?:resume|cv)\s+", "", stem)
    stem = re.sub(r"(?i)\s+(?:resume|cv)$", "", stem)
    stem = re.sub(r"[_\-]+", " ", stem)
    stem = re.sub(r"\s+", " ", stem).strip(" .-_")
    # title case if mostly lower
    if stem and stem == stem.lower():
        stem = stem.title()
    return stem or "Unknown Candidate"


def extract_text_pdf(data: bytes) -> str:
    try:
        import fitz

        doc = fitz.open(stream=data, filetype="pdf")
        parts = []
        for page in doc:
            parts.append(page.get_text("text") or "")
        doc.close()
        return "\n".join(parts)
    except Exception:
        try:
            from pypdf import PdfReader

            r = PdfReader(BytesIO(data))
            return "\n".join((p.extract_text() or "") for p in r.pages)
        except Exception:
            return ""


def extract_text_docx(path: Path) -> str:
    try:
        import docx

        d = docx.Document(str(path))
        return "\n".join(p.text for p in d.paragraphs if p.text)
    except Exception as e:
        print(f"  warn: docx text failed {path.name}: {e}")
        return ""


def docx_to_pdf_bytes(path: Path) -> bytes | None:
    """Best-effort: macOS textutil/html not great; try libreoffice or skip and upload original.
    We upload as PDF when possible via fitz simple text PDF fallback.
    """
    text = extract_text_docx(path)
    if not text.strip():
        return None
    try:
        import fitz

        doc = fitz.open()
        page = doc.new_page()
        # simple text dump
        rect = fitz.Rect(50, 50, 545, 792)
        page.insert_textbox(rect, text[:8000], fontsize=10, fontname="helv")
        out = doc.tobytes()
        doc.close()
        return out
    except Exception:
        return None


def image_to_pdf_bytes(path: Path) -> bytes:
    import fitz

    img = path.read_bytes()
    doc = fitz.open()
    # open image
    img_doc = fitz.open(stream=img, filetype=path.suffix.lstrip(".").lower())
    rect = img_doc[0].rect
    page = doc.new_page(width=rect.width, height=rect.height)
    page.insert_image(page.rect, stream=img)
    out = doc.tobytes()
    doc.close()
    img_doc.close()
    return out


def compress_pdf(data: bytes) -> bytes:
    if not data.startswith(b"%PDF"):
        return data
    try:
        import fitz

        doc = fitz.open(stream=data, filetype="pdf")
        out = doc.tobytes(garbage=4, deflate=True, deflate_images=True, deflate_fonts=True, clean=True)
        doc.close()
        if out and len(out) < len(data):
            return out
    except Exception:
        pass
    return data


def parse_fields(text: str, fallback_name: str) -> dict:
    emails = EMAIL_RE.findall(text or "")
    # prefer non-generic emails
    email = None
    for e in emails:
        if "example.com" in e.lower():
            continue
        email = e
        break
    phones = PHONE_RE.findall(text or "")
    phone = None
    for p in phones:
        digits = re.sub(r"\D", "", p)
        if len(digits) >= 10:
            phone = digits[-10:] if len(digits) > 10 else digits
            break

    name = fallback_name
    # first non-empty lines for name
    lines = [ln.strip() for ln in (text or "").splitlines() if ln.strip()]
    for ln in lines[:12]:
        if len(ln) < 3 or len(ln) > 60:
            continue
        if EMAIL_RE.search(ln) or PHONE_RE.search(ln):
            continue
        if re.search(r"(?i)objective|education|experience|resume|curriculum|mobile|email|phone", ln):
            continue
        # looks like a name
        if re.match(r"^[A-Za-z][A-Za-z.\s'-]{1,50}$", ln):
            name = ln.strip()
            break

    # experience heuristic
    has_exp = "Yes" if re.search(r"(?i)\b(experience|worked|intern|months?|years?)\b", text or "") else None
    companies = None
    # grab a few lines under experience
    exp_snip = None
    m = re.search(
        r"(?is)(professional\s+experience|work\s+experience|experience)(.{0,800})",
        text or "",
    )
    if m:
        exp_snip = re.sub(r"\s+", " ", m.group(2)).strip()[:500]

    objective = None
    m2 = re.search(r"(?is)(objective|career\s+objective|summary)(.{0,400})", text or "")
    if m2:
        objective = re.sub(r"\s+", " ", m2.group(2)).strip(" :-")[:400]

    education = None
    m3 = re.search(
        r"(?is)(education(?:al)?\s+qualifications?|education)(.{0,400})",
        text or "",
    )
    if m3:
        education = re.sub(r"\s+", " ", m3.group(2)).strip(" :-")[:400]

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "has_work_experience": has_exp,
        "work_experience_detail": exp_snip,
        "career_objective": objective,
        "education_from_pdf": education,
    }


def guess_tags(name: str, text: str, filename: str) -> list[str]:
    tags = ["manual_import", "aug_2026"]
    blob = f"{filename} {text}".lower()
    if "seo" in blob or "marketing" in blob or "digital" in blob:
        tags.append("marketing")
    if "ui" in blob or "developer" in blob or "devloper" in blob or "react" in blob:
        tags.append("tech")
    if "girija" in filename.lower():
        tags.append("recruiter:girija")
    if "kiranmai" in filename.lower():
        tags.append("recruiter:kiranmai")
    return tags


async def ensure_role() -> None:
    async with async_session() as db:
        role = await db.get(HiringRole, ROLE_ID)
        if not role:
            db.add(
                HiringRole(
                    id=ROLE_ID,
                    name=ROLE_NAME,
                    description="Resumes imported manually from Downloads (Girija / Kiranmai batch)",
                    is_active=True,
                    sort_order=99,
                )
            )
            await db.commit()
            print(f"Created role {ROLE_ID}")
        else:
            print(f"Role exists: {ROLE_ID}")


async def import_all() -> None:
    os.environ.setdefault("STORAGE_BACKEND", "r2")
    import app.services.storage as storage_mod

    storage_mod._storage = None
    storage = get_storage()
    if not isinstance(storage, R2Storage):
        raise SystemExit("STORAGE_BACKEND must be r2 with credentials set")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await ensure_role()

    # Wipe previous import for this role so re-runs are clean
    async with async_session() as db:
        old = (
            await db.execute(select(Candidate).where(Candidate.role_id == ROLE_ID))
        ).scalars().all()
        for c in old:
            await db.delete(c)
        await db.commit()
        print(f"Cleared {len(old)} previous {ROLE_ID} candidates")

    used_slugs: set[str] = set()
    created = 0
    skipped = 0
    errors = 0

    for src in SOURCE_FILES:
        if not src.exists():
            print(f"MISSING {src}")
            errors += 1
            continue

        display_name = clean_display_name_from_filename(src)
        slug = slug_name(display_name)
        base_slug = slug
        n = 2
        while slug.lower() in used_slugs:
            slug = f"{base_slug}_{n}"
            n += 1
        used_slugs.add(slug.lower())
        clean_pdf_name = f"{slug}.pdf"

        suffix = src.suffix.lower()
        text = ""
        pdf_bytes: bytes | None = None

        try:
            if suffix == ".pdf":
                raw = src.read_bytes()
                text = extract_text_pdf(raw)
                pdf_bytes = compress_pdf(raw)
            elif suffix in {".docx", ".doc"}:
                text = extract_text_docx(src)
                pdf_bytes = docx_to_pdf_bytes(src)
                if not pdf_bytes:
                    # upload original docx as fallback with .docx name
                    clean_pdf_name = f"{slug}.docx"
                    pdf_bytes = src.read_bytes()
            elif suffix in {".jpg", ".jpeg", ".png", ".webp"}:
                # OCR-less: filename name + image as PDF
                pdf_bytes = compress_pdf(image_to_pdf_bytes(src))
                # Manish known from image content if filename has Manish
                if "manish" in src.name.lower() and display_name.lower() in {"resume manish 22", "unknown candidate"}:
                    display_name = "Manish Kumar"
                    slug = slug_name(display_name)
                    clean_pdf_name = f"{slug}.pdf"
                text = f"Name: {display_name}\n(Scanned image resume)"
            else:
                print(f"SKIP unsupported {src.name}")
                skipped += 1
                continue
        except Exception as e:
            print(f"ERROR reading {src.name}: {e}")
            errors += 1
            continue

        fields = parse_fields(text, display_name)
        # Prefer richer name from parse if filename was generic
        if display_name.lower() in {"resume", "cv", "unknown candidate"} and fields["name"]:
            display_name = fields["name"]
            slug = slug_name(display_name)
            if not clean_pdf_name.endswith(".docx"):
                clean_pdf_name = f"{slug}.pdf"

        # Known fix from provided Manish Kumar image only (not Manisha)
        is_manish_scan = bool(
            re.search(r"(?i)manish\s*22|manish\s+kumar", src.name)
            or (src.suffix.lower() in {".jpg", ".jpeg", ".png"} and re.search(r"(?i)\bmanish\b", src.name))
        )
        if is_manish_scan:
            display_name = "Manish Kumar"
            fields["name"] = display_name
            fields["email"] = fields.get("email") or "Manishkumarbjp628723@gmail.com"
            fields["phone"] = fields.get("phone") or "9709703038"
            fields["has_work_experience"] = "Yes"
            fields["work_experience_detail"] = (
                "One Year Data Entry In SBI Bank; Eight Month Work in Turbo Company in Punjab; "
                "Six Month Teaching Experience ADCA Computer"
            )
            fields["career_objective"] = (
                "Secure a responsible carrier opportunity to fully Utilize My training and Skills"
            )
            fields["education_from_pdf"] = (
                "10th Bihar Board; 12th Bihar Board; Bachelor in English; Computer ADCA Course 1 Year"
            )
            slug = "Manish_Kumar"
            clean_pdf_name = "Manish_Kumar.pdf"

        # Unique candidate id + file key (index prefix avoids collisions)
        idx = SOURCE_FILES.index(src) + 1
        cid = f"{ROLE_ID}_{idx:03d}_{slug}".lower()[:100]
        # ensure unique object name on R2
        if not is_manish_scan:
            ext = ".pdf" if clean_pdf_name.lower().endswith(".pdf") else Path(clean_pdf_name).suffix or ".pdf"
            clean_pdf_name = f"{idx:03d}_{slug}{ext}"
        tags = guess_tags(display_name, text, src.name)

        content_type = (
            "application/pdf"
            if clean_pdf_name.lower().endswith(".pdf")
            else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        key_path = f"resumes/{ROLE_ID}/{clean_pdf_name}"

        try:
            storage.client.put_object(
                Bucket=storage.bucket,
                Key=key_path,
                Body=pdf_bytes,
                ContentType=content_type,
                ContentDisposition=f'inline; filename="{clean_pdf_name}"',
            )
            url = f"{storage.public_url.rstrip('/')}/{key_path}"
        except Exception as e:
            print(f"ERROR R2 {src.name}: {e}")
            errors += 1
            continue

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        async with async_session() as db:
            existing = await db.get(Candidate, cid)
            payload = dict(
                role_id=ROLE_ID,
                role_name=ROLE_NAME,
                status="new",
                tags=tags,
                notes=f"Imported from local file: {src.name}",
                starred=False,
                name=fields.get("name") or display_name,
                email=fields.get("email"),
                phone=fields.get("phone"),
                has_work_experience=fields.get("has_work_experience"),
                work_experience_detail=fields.get("work_experience_detail"),
                career_objective=fields.get("career_objective"),
                education_from_pdf=fields.get("education_from_pdf"),
                resume_link=url,
                download_link=url,
                pdf_file=clean_pdf_name,
                applied_at=now.date().isoformat(),
                updated_at=now,
            )
            if existing:
                for k, v in payload.items():
                    setattr(existing, k, v)
                print(f"UPDATED {display_name} → {clean_pdf_name}")
            else:
                c = Candidate(id=cid, created_at=now, **payload)
                db.add(c)
                print(f"CREATED {display_name} → {clean_pdf_name} | {fields.get('email') or '—'} | {fields.get('phone') or '—'}")
                created += 1
            await db.commit()

    print("\n=== Import summary ===")
    print(f"created/updated batch done; new creates counted≈{created} errors={errors} skipped={skipped}")
    async with async_session() as db:
        n = (
            await db.execute(select(Candidate).where(Candidate.role_id == ROLE_ID))
        ).scalars().all()
        print(f"candidates with role {ROLE_ID}: {len(n)}")


def main() -> None:
    asyncio.run(import_all())


if __name__ == "__main__":
    main()
