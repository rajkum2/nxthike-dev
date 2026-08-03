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
from sqlalchemy.exc import DBAPIError, OperationalError

from app.config import settings
from app.database import async_session, engine, Base
from app.models.hiring import Candidate
from app.services.storage import get_storage, R2Storage

# Transient DB / pooler failures worth retrying
_RETRY_ATTEMPTS = 3
_RETRY_BASE_DELAY_SEC = 0.5

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


def _is_transient_db_error(exc: BaseException) -> bool:
    """True for pooler disconnects / timeouts that often succeed on retry."""
    if isinstance(exc, (OperationalError, ConnectionError, TimeoutError, OSError)):
        return True
    if isinstance(exc, DBAPIError) and getattr(exc, "connection_invalidated", False):
        return True
    name = type(exc).__name__
    if name in {
        "ConnectionDoesNotExistError",
        "InterfaceError",
        "CannotConnectNowError",
        "ConnectionResetError",
    }:
        return True
    msg = str(exc).lower()
    needles = (
        "connection was closed",
        "connection does not exist",
        "connection reset",
        "server closed the connection",
        "ssl",
        "timeout",
        "too many connections",
        "pool",
    )
    return any(n in msg for n in needles)


async def load_candidate_index() -> dict[tuple[str, str], str]:
    """
    Map (role_id, pdf_file basename) -> candidate id.

    Selects only the three columns needed. Loading full ORM entities pulls
    ~50 columns across 3.6k rows (including large free-text fields), which
    the Supabase pooler drops mid-result.
    """
    async with async_session() as db:
        rows = (
            await db.execute(select(Candidate.id, Candidate.role_id, Candidate.pdf_file))
        ).all()
    index: dict[tuple[str, str], str] = {}
    for cid, role_id, pdf_file in rows:
        if pdf_file:
            index[(role_id, Path(pdf_file).name)] = cid
    return index


async def _update_candidate_links_once(
    candidate_id: str, url: str, pdf_name: str
) -> str:
    """
    Apply resume/download links. Returns:
      'updated'  — wrote new values
      'skipped'  — already had the same resume_link (idempotent no-op)
      'missing'  — candidate id not found
    """
    async with async_session() as db:
        c = await db.get(Candidate, candidate_id)
        if not c:
            return "missing"
        if c.resume_link == url and c.download_link == url:
            if not c.pdf_file:
                c.pdf_file = pdf_name
                c.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
                await db.commit()
            return "skipped"
        c.resume_link = url
        c.download_link = url
        if not c.pdf_file:
            c.pdf_file = pdf_name
        c.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await db.commit()
        return "updated"


async def update_candidate_links(
    candidate_id: str,
    url: str,
    pdf_name: str,
    *,
    attempts: int = _RETRY_ATTEMPTS,
    base_delay: float = _RETRY_BASE_DELAY_SEC,
) -> str:
    """
    Update candidate links with retries on transient pooler/DB errors.

    Does not change the happy path: one successful open/commit when the DB is healthy.
    """
    last_exc: BaseException | None = None
    for attempt in range(1, attempts + 1):
        try:
            return await _update_candidate_links_once(candidate_id, url, pdf_name)
        except Exception as e:
            last_exc = e
            if attempt >= attempts or not _is_transient_db_error(e):
                raise
            delay = base_delay * (2 ** (attempt - 1))
            print(
                f"  DB retry {attempt}/{attempts} for {candidate_id} "
                f"after {type(e).__name__}: {e} (sleep {delay:.1f}s)"
            )
            await asyncio.sleep(delay)
    assert last_exc is not None
    raise last_exc


async def run(
    docs_root: Path,
    *,
    role_id: str | None,
    dry_run: bool,
    limit: int | None,
    max_new: int | None,
    skip_existing: bool,
    progress_path: Path,
) -> None:
    print(f"docs_root={docs_root}")
    print(
        f"dry_run={dry_run} role={role_id or 'all'} skip_existing={skip_existing} "
        f"max_new={max_new or '∞'}"
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    files = discover_files(docs_root, role_id)
    if limit:
        files = files[:limit]
    print(f"Found {len(files)} local resume files")

    index = await load_candidate_index()
    print(f"Candidates indexed by (role, pdfFile): {len(index)}")

    # Merge prior progress so restarts keep history and skip completed work.
    results_by_key: dict[str, UploadResult] = {}
    done_keys: set[str] = set()
    orig_total = 0
    comp_total = 0
    if progress_path.exists():
        try:
            prev = json.loads(progress_path.read_text())
            orig_total = int(prev.get("original_bytes") or 0)
            comp_total = int(prev.get("compressed_bytes") or 0)
            for row in prev.get("results", []):
                rid = row.get("role_id")
                pdf = row.get("pdf_file")
                if not rid or not pdf:
                    continue
                key = f"{rid}:{pdf}"
                results_by_key[key] = UploadResult(
                    role_id=rid,
                    pdf_file=pdf,
                    candidate_id=row.get("candidate_id"),
                    local_path=row.get("local_path") or "",
                    original_bytes=int(row.get("original_bytes") or 0),
                    compressed_bytes=int(row.get("compressed_bytes") or 0),
                    url=row.get("url"),
                    status=row.get("status") or "unknown",
                    error=row.get("error"),
                )
                # Treat R2-done rows as skippable on re-run (DB may still need repair).
                if row.get("status") in {"uploaded", "uploaded_r2_db_pending"}:
                    done_keys.add(key)
            print(
                f"Resuming; prior results={len(results_by_key)} "
                f"already uploaded/pending={len(done_keys)}"
            )
        except Exception as e:
            print(f"  warn: could not load progress file: {e}")

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

    uploaded = 0
    db_pending = 0
    skipped = 0
    missing_cand = 0
    errors = 0
    new_attempts = 0  # non-skip work units this run (for --max-new batches)

    def _flush() -> None:
        _save_progress(
            progress_path,
            list(results_by_key.values()),
            orig_total,
            comp_total,
        )

    for i, (rid, path) in enumerate(files, 1):
        pdf_name = path.name
        key = f"{rid}:{pdf_name}"
        if skip_existing and key in done_keys:
            prior = results_by_key.get(key)
            # Re-attempt DB link only when R2 already succeeded last run.
            if (
                prior
                and prior.status == "uploaded_r2_db_pending"
                and prior.url
                and prior.candidate_id
                and not dry_run
            ):
                if max_new is not None and new_attempts >= max_new:
                    print(
                        f"\nStopped: reached --max-new={max_new} "
                        f"(remaining files left for next batch)"
                    )
                    break
                try:
                    await update_candidate_links(
                        prior.candidate_id, prior.url, pdf_name
                    )
                    prior.status = "uploaded"
                    prior.error = None
                    uploaded += 1
                    new_attempts += 1
                    print(
                        f"  [{i}/{len(files)}] DB repaired {pdf_name} → {prior.url}"
                    )
                    _flush()
                except Exception as e:
                    prior.error = str(e)
                    db_pending += 1
                    new_attempts += 1
                    print(f"  DB repair still failing {pdf_name}: {e}")
                    _flush()
                continue
            skipped += 1
            continue

        if max_new is not None and new_attempts >= max_new:
            print(
                f"\nStopped: reached --max-new={max_new} "
                f"(remaining files left for next batch)"
            )
            break

        new_attempts += 1
        raw = path.read_bytes()
        orig = len(raw)
        data = compress_pdf(raw) if path.suffix.lower() == ".pdf" else raw
        comp = len(data)
        orig_total += orig
        comp_total += comp

        cand_id = index.get((rid, pdf_name))
        if not cand_id:
            # try basename-only match for this role
            for (r, name), c in index.items():
                if r == rid and name.lower() == pdf_name.lower():
                    cand_id = c
                    break

        if not cand_id:
            missing_cand += 1
            results_by_key[key] = UploadResult(
                role_id=rid,
                pdf_file=pdf_name,
                candidate_id=None,
                local_path=str(path),
                original_bytes=orig,
                compressed_bytes=comp,
                url=None,
                status="no_candidate",
            )
            if i % 100 == 0 or i == len(files):
                print(f"  [{i}/{len(files)}] processed…")
                _flush()
            continue

        if dry_run:
            results_by_key[key] = UploadResult(
                role_id=rid,
                pdf_file=pdf_name,
                candidate_id=cand_id,
                local_path=str(path),
                original_bytes=orig,
                compressed_bytes=comp,
                url=None,
                status="dry_run",
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
            results_by_key[key] = UploadResult(
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
            print(f"  ERROR {pdf_name}: {e}")
            _flush()
            continue

        # R2 succeeded — always record URL; never let a DB blip abort the run.
        try:
            await update_candidate_links(cand_id, stored.url, pdf_name)
            uploaded += 1
            results_by_key[key] = UploadResult(
                role_id=rid,
                pdf_file=pdf_name,
                candidate_id=cand_id,
                local_path=str(path),
                original_bytes=orig,
                compressed_bytes=comp,
                url=stored.url,
                status="uploaded",
            )
            done_keys.add(key)
            if i % 50 == 0 or i == 1:
                print(f"  [{i}/{len(files)}] uploaded {pdf_name} → {stored.url}")
        except Exception as e:
            db_pending += 1
            results_by_key[key] = UploadResult(
                role_id=rid,
                pdf_file=pdf_name,
                candidate_id=cand_id,
                local_path=str(path),
                original_bytes=orig,
                compressed_bytes=comp,
                url=stored.url,
                status="uploaded_r2_db_pending",
                error=str(e),
            )
            # Skip re-upload on resume; operator can re-run DB repair later.
            done_keys.add(key)
            print(
                f"  DB FAIL after R2 OK {pdf_name}: {e} "
                f"(url kept in progress as uploaded_r2_db_pending)"
            )

        # Flush after every R2 put + DB outcome so a crash loses at most one file.
        _flush()

    _flush()

    saved = orig_total - comp_total
    pct = (100 * saved / orig_total) if orig_total else 0
    print("\n=== Summary ===")
    print(f"files in progress log: {len(results_by_key)}")
    print(f"original:   {orig_total / 1e6:.2f} MB")
    print(f"compressed: {comp_total / 1e6:.2f} MB  (saved {saved / 1e6:.2f} MB, {pct:.1f}%)")
    print(f"uploaded:   {uploaded}")
    print(f"r2 ok / db pending: {db_pending}")
    print(f"skipped:    {skipped}")
    print(f"no candidate match: {missing_cand}")
    print(f"errors:     {errors}")
    print(f"new attempts this batch: {new_attempts}")
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
    # Atomic-ish write so a crash mid-write does not wipe progress.
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(payload, indent=2))
    tmp.replace(path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Compress + upload candidate resumes to R2")
    parser.add_argument(
        "--docs-root",
        default=str(Path.home() / "Documents"),
        help="Parent folder containing Internshala_* directories",
    )
    parser.add_argument("--role", default=None, help="Only one role_id")
    parser.add_argument("--dry-run", action="store_true", help="Compress only; no R2/DB writes")
    parser.add_argument("--limit", type=int, default=None, help="Max files from discover list (prefix)")
    parser.add_argument(
        "--max-new",
        type=int,
        default=None,
        help=(
            "Stop after this many non-skipped files this run (batch size). "
            "Use for step-by-step uploads; re-run to continue from progress."
        ),
    )
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
            max_new=args.max_new,
            skip_existing=not args.no_skip_existing,
            progress_path=Path(args.progress).resolve(),
        )
    )


if __name__ == "__main__":
    main()
