"""
Compress local Internshala resume PDFs and upload them to Cloudflare R2,
then update candidate resume_link / download_link in the database.

Default local roots (under --docs-root):
  Internshala_AI_Agent_Development/files
  Internshala_Business_Research/files
  Internshala_Content_Social_Media_Marketing/files
  Internshala_Product_Management/files
  Internshala_Resumes_Recruitment_Consultant/files
  Internshala_Video_Editing_Making/files

Usage (from BE/):
  # Dry-run (compress stats only, no upload)
  python -m app.upload_resumes_r2 --dry-run

  # Real upload (requires R2_* env vars)
  STORAGE_BACKEND=r2 \
  R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... \
  R2_BUCKET_NAME=... R2_PUBLIC_URL=https://pub-xxx.r2.dev \
  python -m app.upload_resumes_r2

  # Only one role
  python -m app.upload_resumes_r2 --role product_management
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import select

from app.config import settings
from app.database import async_session, engine, Base
from app.models.hiring import Candidate
from app.services.storage import get_storage, R2Storage

# role_id -> folder name under docs root
ROLE_FOLDERS: dict[str, str] = {
    "ai_agent_development": "Internshala_AI_Agent_Development",
    "business_research": "Internshala_Business_Research",
    "content_social_media": "Internshala_Content_Social_Media_Marketing",
    "product_management": "Internshala_Product_Management",
    "recruitment_consultant": "Internshala_Resumes_Recruitment_Consultant",
    "video_editing": "Internshala_Video_Editing_Making",
}


@dataclass
class UploadResult:
    role_id: str
    pdf_file: str
    candidate_id: str | None
    local_path: str
    original_bytes: int
    compressed_bytes: int
    url: str | None
    status: str
    error: str | None = None


def compress_pdf(data: bytes) -> bytes:
    """
    Compress PDF bytes. Tries PyMuPDF (deflate images/fonts) then pypdf.
    Always returns the smaller valid result (or original on failure).
    """
    if not data.startswith(b"%PDF"):
        return data

    best = data

    # 1) PyMuPDF — usually best for image-heavy Internshala PDFs
    try:
        import fitz  # pymupdf

        doc = fitz.open(stream=data, filetype="pdf")
        out = doc.tobytes(
            garbage=4,
            deflate=True,
            deflate_images=True,
            deflate_fonts=True,
            clean=True,
        )
        doc.close()
        if out and len(out) < len(best):
            best = out
    except Exception:
        pass

    # 2) pypdf content-stream compression
    try:
        from pypdf import PdfReader, PdfWriter

        reader = PdfReader(BytesIO(data))
        writer = PdfWriter()
        for page in reader.pages:
            try:
                page.compress_content_streams()
            except Exception:
                pass
            writer.add_page(page)
        try:
            if reader.metadata:
                writer.add_metadata(reader.metadata)
        except Exception:
            pass
        try:
            writer.compress_identical_objects(
                remove_duplicates=True,
                remove_unreferenced=True,
            )
        except TypeError:
            try:
                writer.compress_identical_objects()
            except Exception:
                pass
        except Exception:
            pass
        buf = BytesIO()
        writer.write(buf)
        out = buf.getvalue()
        if out and len(out) < len(best):
            best = out
    except Exception:
        pass

    return best


def discover_files(docs_root: Path, role_id: str | None) -> list[tuple[str, Path]]:
    """Return list of (role_id, path) for local resume files."""
    found: list[tuple[str, Path]] = []
    roles = {role_id: ROLE_FOLDERS[role_id]} if role_id else ROLE_FOLDERS
    for rid, folder in roles.items():
        files_dir = docs_root / folder / "files"
        if not files_dir.is_dir():
            print(f"  warn: missing {files_dir}")
            continue
        for p in sorted(files_dir.iterdir()):
            if p.is_file() and p.suffix.lower() in {".pdf", ".docx", ".doc"}:
                found.append((rid, p))
    return found


async def load_candidate_index() -> dict[tuple[str, str], Candidate]:
    """Map (role_id, pdf_file basename) -> Candidate."""
    async with async_session() as db:
        rows = (await db.execute(select(Candidate))).scalars().all()
    index: dict[tuple[str, str], Candidate] = {}
    by_name: dict[str, list[Candidate]] = {}
    for c in rows:
        if c.pdf_file:
            key = (c.role_id, Path(c.pdf_file).name)
            index[key] = c
            by_name.setdefault(Path(c.pdf_file).name, []).append(c)
    return index


async def update_candidate_links(candidate_id: str, url: str, pdf_name: str) -> None:
    async with async_session() as db:
        c = await db.get(Candidate, candidate_id)
        if not c:
            return
        c.resume_link = url
        c.download_link = url
        if not c.pdf_file:
            c.pdf_file = pdf_name
        c.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await db.commit()


async def run(
    docs_root: Path,
    *,
    role_id: str | None,
    dry_run: bool,
    limit: int | None,
    skip_existing: bool,
    progress_path: Path,
) -> None:
    print(f"docs_root={docs_root}")
    print(f"dry_run={dry_run} role={role_id or 'all'} skip_existing={skip_existing}")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    files = discover_files(docs_root, role_id)
    if limit:
        files = files[:limit]
    print(f"Found {len(files)} local resume files")

    index = await load_candidate_index()
    print(f"Candidates indexed by (role, pdfFile): {len(index)}")

    done_keys: set[str] = set()
    if progress_path.exists():
        try:
            prev = json.loads(progress_path.read_text())
            for row in prev.get("results", []):
                if row.get("status") == "uploaded":
                    done_keys.add(f"{row['role_id']}:{row['pdf_file']}")
            print(f"Resuming; already uploaded: {len(done_keys)}")
        except Exception:
            pass

    storage = None
    if not dry_run:
        # Force R2
        os.environ.setdefault("STORAGE_BACKEND", "r2")
        # clear cached storage singleton
        import app.services.storage as storage_mod

        storage_mod._storage = None
        storage = get_storage()
        if not isinstance(storage, R2Storage):
            raise SystemExit(
                "STORAGE_BACKEND must be r2 with R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, "
                "R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL set"
            )
        print(f"R2 bucket={settings.R2_BUCKET_NAME} public={settings.R2_PUBLIC_URL}")

    results: list[UploadResult] = []
    orig_total = 0
    comp_total = 0
    uploaded = 0
    skipped = 0
    missing_cand = 0
    errors = 0

    for i, (rid, path) in enumerate(files, 1):
        pdf_name = path.name
        key = f"{rid}:{pdf_name}"
        if skip_existing and key in done_keys:
            skipped += 1
            continue

        raw = path.read_bytes()
        orig = len(raw)
        data = compress_pdf(raw) if path.suffix.lower() == ".pdf" else raw
        comp = len(data)
        orig_total += orig
        comp_total += comp

        cand = index.get((rid, pdf_name))
        cand_id = cand.id if cand else None
        if not cand:
            # try basename-only match for this role
            for (r, name), c in index.items():
                if r == rid and name.lower() == pdf_name.lower():
                    cand = c
                    cand_id = c.id
                    break

        if not cand_id:
            missing_cand += 1
            results.append(
                UploadResult(
                    role_id=rid,
                    pdf_file=pdf_name,
                    candidate_id=None,
                    local_path=str(path),
                    original_bytes=orig,
                    compressed_bytes=comp,
                    url=None,
                    status="no_candidate",
                )
            )
            if i % 100 == 0 or i == len(files):
                print(f"  [{i}/{len(files)}] processed…")
            continue

        if dry_run:
            results.append(
                UploadResult(
                    role_id=rid,
                    pdf_file=pdf_name,
                    candidate_id=cand_id,
                    local_path=str(path),
                    original_bytes=orig,
                    compressed_bytes=comp,
                    url=None,
                    status="dry_run",
                )
            )
            if i % 200 == 0 or i == 1:
                saved = orig - comp
                pct = (100 * saved / orig) if orig else 0
                print(
                    f"  [{i}/{len(files)}] {pdf_name}: {orig//1024}KB → {comp//1024}KB "
                    f"({pct:.0f}% smaller) cand={cand_id}"
                )
            continue

        content_type = (
            "application/pdf"
            if path.suffix.lower() == ".pdf"
            else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        # Stable R2 key: resumes/{role_id}/{filename}
        key_path = f"resumes/{rid}/{pdf_name}"
        try:
            from app.services.storage import StoredObject

            storage.client.put_object(
                Bucket=storage.bucket,
                Key=key_path,
                Body=data,
                ContentType=content_type,
                ContentDisposition=f'inline; filename="{pdf_name}"',
            )
            url = f"{storage.public_url.rstrip('/')}/{key_path}"
            stored = StoredObject(
                key=key_path,
                url=url,
                filename=pdf_name,
                content_type=content_type,
                size=comp,
                backend="r2",
            )
        except Exception as e:
            errors += 1
            results.append(
                UploadResult(
                    role_id=rid,
                    pdf_file=pdf_name,
                    candidate_id=cand_id,
                    local_path=str(path),
                    original_bytes=orig,
                    compressed_bytes=comp,
                    url=None,
                    status="error",
                    error=str(e),
                )
            )
            print(f"  ERROR {pdf_name}: {e}")
            continue

        await update_candidate_links(cand_id, stored.url, pdf_name)
        uploaded += 1
        results.append(
            UploadResult(
                role_id=rid,
                pdf_file=pdf_name,
                candidate_id=cand_id,
                local_path=str(path),
                original_bytes=orig,
                compressed_bytes=comp,
                url=stored.url,
                status="uploaded",
            )
        )
        if i % 50 == 0 or i == 1:
            print(f"  [{i}/{len(files)}] uploaded {pdf_name} → {stored.url}")

        # periodic progress save
        if i % 100 == 0:
            _save_progress(progress_path, results, orig_total, comp_total)

    _save_progress(progress_path, results, orig_total, comp_total)

    saved = orig_total - comp_total
    pct = (100 * saved / orig_total) if orig_total else 0
    print("\n=== Summary ===")
    print(f"files processed: {len(results)}")
    print(f"original:   {orig_total / 1e6:.2f} MB")
    print(f"compressed: {comp_total / 1e6:.2f} MB  (saved {saved / 1e6:.2f} MB, {pct:.1f}%)")
    print(f"uploaded:   {uploaded}")
    print(f"skipped:    {skipped}")
    print(f"no candidate match: {missing_cand}")
    print(f"errors:     {errors}")
    print(f"progress:   {progress_path}")


def _save_progress(
    path: Path,
    results: list[UploadResult],
    orig_total: int,
    comp_total: int,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "original_bytes": orig_total,
        "compressed_bytes": comp_total,
        "results": [asdict(r) for r in results],
    }
    path.write_text(json.dumps(payload, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Compress + upload candidate resumes to R2")
    parser.add_argument(
        "--docs-root",
        default=str(Path.home() / "Documents"),
        help="Parent folder containing Internshala_* directories",
    )
    parser.add_argument("--role", default=None, help="Only one role_id")
    parser.add_argument("--dry-run", action="store_true", help="Compress only; no R2/DB writes")
    parser.add_argument("--limit", type=int, default=None, help="Max files (for testing)")
    parser.add_argument(
        "--no-skip-existing",
        action="store_true",
        help="Re-upload even if progress file marks uploaded",
    )
    parser.add_argument(
        "--progress",
        default="./resume_upload_progress.json",
        help="Progress / result log path",
    )
    args = parser.parse_args()

    asyncio.run(
        run(
            Path(args.docs_root).expanduser().resolve(),
            role_id=args.role,
            dry_run=args.dry_run,
            limit=args.limit,
            skip_existing=not args.no_skip_existing,
            progress_path=Path(args.progress).resolve(),
        )
    )


if __name__ == "__main__":
    main()
