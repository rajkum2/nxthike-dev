"""
Upload Naukri_*.pdf resumes and attach to existing candidates when possible
(email first, then strong name match). Creates new ai_ml_engineer candidates if no match.

Usage (from BE/):
  STORAGE_BACKEND=r2 python -m app.link_naukri_pdfs
  STORAGE_BACKEND=r2 python -m app.link_naukri_pdfs --dir ~/Downloads/AI\\ Resumes\\ 2
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import os
import re
import sys
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

ROLE_ID = "ai_ml_engineer"
ROLE_NAME = "AI/ML Engineer (Naukri Import)"
DEFAULT_DIR = Path.home() / "Downloads" / "AI Resumes 2"
DEFAULT_TAGS = ["naukri", "pdf_import"]

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?91[\s\-]?)?[6-9]\d{9}")


def parse_filename(path: Path) -> tuple[str, str | None]:
    """Return (display_name, experience_str)."""
    stem = path.stem
    stem = re.sub(r"\s*\(\d+\)$", "", stem)  # drop (1)
    exp = None
    m = re.search(r"\[(\d+y_\d+m)\]", stem, re.I)
    if m:
        exp = m.group(1).replace("_", " ")
        stem = stem[: m.start()] + stem[m.end() :]
    stem = re.sub(r"^Naukri_", "", stem, flags=re.I)
    # CamelCase / ALLCAPS
    if stem.isupper() or re.match(r"^[A-Z0-9]+$", stem):
        # ANIMESHSHARMA → try split common patterns later from PDF
        name = stem.title()
    else:
        name = re.sub(r"([a-z])([A-Z])", r"\1 \2", stem)
        name = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1 \2", name)
    name = re.sub(r"\s+", " ", name).strip(" _-")
    return name or "Unknown", exp


def extract_pdf_meta(data: bytes) -> dict:
    text = ""
    try:
        import fitz

        doc = fitz.open(stream=data, filetype="pdf")
        text = "\n".join((p.get_text("text") or "") for p in doc[:3])
        doc.close()
    except Exception:
        try:
            from pypdf import PdfReader

            r = PdfReader(BytesIO(data))
            text = "\n".join((p.extract_text() or "") for p in r.pages[:3])
        except Exception:
            pass
    emails = EMAIL_RE.findall(text)
    email = emails[0].lower() if emails else None
    phone = None
    for m in PHONE_RE.findall(text):
        d = re.sub(r"\D", "", m)
        if len(d) >= 10:
            phone = d[-10:]
            break
    # first substantial line as name hint
    name_hint = None
    for ln in text.splitlines():
        ln = ln.strip()
        if 3 <= len(ln) <= 50 and re.match(r"^[A-Za-z][A-Za-z.\s'-]+$", ln):
            if not re.search(r"(?i)summary|experience|professional|classification|personal|email|phone|contact|skills", ln):
                name_hint = ln
                break
    return {"email": email, "phone": phone, "name_hint": name_hint, "text": text[:2000]}


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


def tokens(s: str) -> list[str]:
    return [t for t in re.split(r"[^a-z0-9]+", (s or "").lower()) if len(t) >= 2]


def name_score(cand_name: str, target_name: str) -> int:
    ct = set(tokens(cand_name))
    tt = set(tokens(target_name))
    if not ct or not tt:
        return 0
    shared = ct & tt
    if not shared:
        # contiguous collapse
        cj = "".join(sorted(ct))
        tj = "".join(tokens(target_name))
        if tj and tj in "".join(ct):
            return 4
        return 0
    score = len(shared) * 2
    if tt.issubset(ct) or ct.issubset(tt):
        score += 5
    if tokens(target_name) and tokens(target_name)[-1] in ct:
        score += 2
    if tokens(target_name) and tokens(target_name)[0] in ct:
        score += 1
    return score


def pick_match(
    candidates: list[Candidate],
    *,
    email: str | None,
    display_name: str,
) -> Candidate | None:
    if email:
        email_l = email.lower()
        email_hits = [c for c in candidates if (c.email or "").lower().split(",")[0].strip() == email_l
                      or email_l in (c.email or "").lower()]
        if email_hits:
            # prefer ai_ml then no resume then any
            email_hits.sort(
                key=lambda c: (
                    0 if c.role_id == ROLE_ID else 1,
                    0 if not c.resume_link else 1,
                )
            )
            return email_hits[0]

    scored: list[tuple[int, Candidate]] = []
    for c in candidates:
        sc = name_score(c.name or "", display_name)
        if sc >= 6:  # strong only
            # role boost
            if c.role_id == ROLE_ID:
                sc += 2
            if not c.resume_link:
                sc += 1
            scored.append((sc, c))
    if not scored:
        return None
    scored.sort(key=lambda x: -x[0])
    best_sc, best = scored[0]
    # require clear winner for common names
    if best_sc < 7:
        return None
    return best


def content_type_for(path: Path) -> str:
    ext = path.suffix.lower()
    return {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc": "application/msword",
    }.get(ext, "application/octet-stream")


def extract_docx_meta(data: bytes) -> dict:
    text = ""
    try:
        import zipfile
        from xml.etree import ElementTree as ET

        with zipfile.ZipFile(BytesIO(data)) as zf:
            xml = zf.read("word/document.xml")
        root = ET.fromstring(xml)
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        parts = [t.text for t in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t") if t.text]
        text = "\n".join(parts)
    except Exception:
        pass
    emails = EMAIL_RE.findall(text)
    email = emails[0].lower() if emails else None
    phone = None
    for m in PHONE_RE.findall(text):
        d = re.sub(r"\D", "", m)
        if len(d) >= 10:
            phone = d[-10:]
            break
    return {"email": email, "phone": phone, "name_hint": None, "text": text[:2000]}


async def ensure_role(role_id: str, role_name: str) -> None:
    async with async_session() as db:
        if not await db.get(HiringRole, role_id):
            db.add(
                HiringRole(
                    id=role_id,
                    name=role_name,
                    description=f"Candidates for {role_name} (Naukri resumes)",
                    is_active=True,
                    sort_order=6,
                )
            )
            await db.commit()


async def run(
    folder: Path,
    role_id: str = ROLE_ID,
    role_name: str = ROLE_NAME,
    tags: list[str] | None = None,
) -> None:
    os.environ.setdefault("STORAGE_BACKEND", "r2")
    import app.services.storage as storage_mod

    storage_mod._storage = None
    storage = get_storage()
    if not isinstance(storage, R2Storage):
        raise SystemExit("Need R2 storage configured")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await ensure_role(role_id, role_name)
    tag_list = tags or DEFAULT_TAGS

    files: list[Path] = []
    for pat in ("Naukri_*.pdf", "Naukri_*.docx", "Naukri_*.doc", "*.pdf", "*.docx", "*.doc"):
        files.extend(folder.glob(pat))
    # unique by resolved path
    seen_paths: set[Path] = set()
    uniq: list[Path] = []
    for p in files:
        rp = p.resolve()
        if rp in seen_paths:
            continue
        seen_paths.add(rp)
        uniq.append(p)
    files = uniq

    # de-dupe (1) copies: prefer non-(1) when same base
    by_base: dict[str, Path] = {}
    for p in files:
        base = re.sub(r"\s*\(\d+\)(?=\.(pdf|docx|doc)$)", "", p.name, flags=re.I)
        if base not in by_base or "(1)" in by_base[base].name:
            by_base[base] = p
    files = sorted(by_base.values(), key=lambda p: p.name)
    print(f"Files to process: {len(files)} (deduped from folder)", flush=True)

    async with async_session() as db:
        all_cands = (await db.execute(select(Candidate))).scalars().all()
    print(f"Candidates in DB: {len(all_cands)}", flush=True)

    linked = 0
    created = 0
    updated = 0
    errors = 0
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    for path in files:
        display_name, exp = parse_filename(path)
        raw = path.read_bytes()
        ext = path.suffix.lower()
        if ext == ".pdf":
            meta = extract_pdf_meta(raw)
            body = compress_pdf(raw)
        elif ext == ".docx":
            meta = extract_docx_meta(raw)
            body = raw
        else:
            meta = {"email": None, "phone": None, "name_hint": None, "text": ""}
            body = raw

        if meta.get("name_hint") and len(tokens(meta["name_hint"])) >= 2:
            if len(tokens(display_name)) < 2 or display_name.isupper():
                display_name = meta["name_hint"].title() if meta["name_hint"].isupper() else meta["name_hint"]

        email = meta.get("email")
        phone = meta.get("phone")
        match = pick_match(all_cands, email=email, display_name=display_name)

        safe_slug = re.sub(r"[^\w.\-]+", "_", display_name).strip("_")[:60] or "resume"
        exp_part = f"_{exp.replace(' ', '')}" if exp else ""
        fname = f"Naukri_{safe_slug}{exp_part}{ext or '.pdf'}"
        key = f"resumes/{role_id}/{fname}"

        try:
            storage.client.put_object(
                Bucket=storage.bucket,
                Key=key,
                Body=body,
                ContentType=content_type_for(path),
                ContentDisposition=f'inline; filename="{fname}"',
            )
            url = f"{storage.public_url.rstrip('/')}/{key}"
        except Exception as e:
            print(f"ERROR R2 {path.name}: {e}", flush=True)
            errors += 1
            continue

        async with async_session() as db:
            if match:
                c = await db.get(Candidate, match.id)
                if not c:
                    print(f"SKIP vanished {match.id}", flush=True)
                    continue
                c.resume_link = url
                c.download_link = url
                c.pdf_file = fname
                if exp and not c.experience_duration:
                    c.experience_duration = exp.replace("y", " Year(s) ").replace("m", " Month(s)")
                if email and not c.email:
                    c.email = email
                if phone and not c.phone:
                    c.phone = phone
                c.updated_at = now
                note = f"Resume linked from {path.name}"
                if note not in (c.notes or ""):
                    c.notes = ((c.notes or "") + "\n" + note).strip()
                await db.commit()
                print(f"LINKED  {display_name:30} → {c.id} ({c.role_id}) | {c.name}", flush=True)
                linked += 1
            else:
                cid = f"{role_id}_{hashlib.sha1((email or display_name).encode()).hexdigest()[:12]}"
                existing = await db.get(Candidate, cid)
                exp_str = exp.replace("y", " Year(s) ").replace("m", " Month(s)") if exp else None
                payload = dict(
                    role_id=role_id,
                    role_name=role_name,
                    status="new",
                    tags=list(tag_list),
                    notes=f"Created from resume {path.name}",
                    name=display_name,
                    email=email,
                    phone=phone,
                    experience_duration=exp_str,
                    has_work_experience="Yes" if exp else None,
                    resume_link=url,
                    download_link=url,
                    pdf_file=fname,
                    applied_at=now.date().isoformat(),
                    updated_at=now,
                )
                if existing:
                    for k, v in payload.items():
                        if v is not None:
                            setattr(existing, k, v)
                    updated += 1
                    print(f"UPDATED {display_name:30} → {cid}", flush=True)
                else:
                    db.add(Candidate(id=cid, created_at=now, **payload))
                    print(f"CREATED {display_name:30} → {cid} | {email or '—'} | {fname}", flush=True)
                    created += 1
                    all_cands.append(Candidate(id=cid, **payload))
                await db.commit()

    print("\n=== Resume import summary ===", flush=True)
    print(f"linked_to_existing: {linked}", flush=True)
    print(f"created_new:        {created}", flush=True)
    print(f"updated:            {updated}", flush=True)
    print(f"errors:             {errors}", flush=True)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--dir", default=str(DEFAULT_DIR))
    p.add_argument("--role-id", default=ROLE_ID)
    p.add_argument("--role-name", default=ROLE_NAME)
    p.add_argument("--tags", default="naukri,pdf_import")
    args = p.parse_args()
    tags = [t.strip() for t in args.tags.split(",") if t.strip()]
    asyncio.run(
        run(
            Path(args.dir).expanduser().resolve(),
            role_id=args.role_id,
            role_name=args.role_name,
            tags=tags,
        )
    )


if __name__ == "__main__":
    main()
