import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from pydantic import BaseModel

from app.config import settings
from app.services.auth import get_current_user, get_current_user_optional
from app.models.user import User
from app.services.storage import get_storage, unique_filename, R2Storage

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_RESUME = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_RESUME_EXT = {"pdf", "docx"}
MAX_BYTES = settings.MAX_UPLOAD_MB * 1024 * 1024


class PresignRequest(BaseModel):
    folder: str = "uploads"
    filename: str
    contentType: str | None = None


async def _read_limited(file: UploadFile) -> bytes:
    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large (max {settings.MAX_UPLOAD_MB}MB)",
        )
    return content


@router.get("/status")
async def storage_status():
    """Report active storage backend (no secrets)."""
    try:
        storage = get_storage()
        info = {
            "backend": storage.name,
            "maxUploadMb": settings.MAX_UPLOAD_MB,
        }
        if storage.name == "r2":
            info["bucket"] = settings.R2_BUCKET_NAME
            info["publicUrl"] = settings.R2_PUBLIC_URL
        else:
            info["uploadDir"] = settings.UPLOAD_DIR
        return info
    except Exception as e:
        return {"backend": "error", "error": str(e)}


@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    user: User | None = Depends(get_current_user_optional),
):
    """Upload a resume to local disk or Cloudflare R2."""
    ct = file.content_type or ""
    ext = (file.filename or "resume.pdf").rsplit(".", 1)[-1].lower()
    if ct not in ALLOWED_RESUME and ext not in ALLOWED_RESUME_EXT:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")

    content = await _read_limited(file)
    owner = user.id if user else "anon"
    filename = f"{owner}-{uuid.uuid4().hex[:8]}.{ext if ext in ALLOWED_RESUME_EXT else 'pdf'}"

    try:
        stored = get_storage().upload(
            content,
            folder="resumes",
            filename=filename,
            content_type=ct or "application/pdf",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}") from e

    return {
        "url": stored.url,
        "key": stored.key,
        "filename": stored.filename,
        "backend": stored.backend,
        "size": stored.size,
    }


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    user: User | None = Depends(get_current_user_optional),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    content = await _read_limited(file)
    filename = unique_filename(file.filename, "png")
    try:
        stored = get_storage().upload(
            content,
            folder="images",
            filename=filename,
            content_type=file.content_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}") from e

    return {
        "url": stored.url,
        "key": stored.key,
        "filename": stored.filename,
        "backend": stored.backend,
        "size": stored.size,
    }


@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Query("uploads", pattern=r"^[a-zA-Z0-9_\-/]{1,64}$"),
    user: User = Depends(get_current_user),
):
    """Generic authenticated upload (any reasonable type)."""
    content = await _read_limited(file)
    filename = unique_filename(file.filename)
    try:
        stored = get_storage().upload(
            content,
            folder=folder.strip("/"),
            filename=filename,
            content_type=file.content_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}") from e

    return {
        "url": stored.url,
        "key": stored.key,
        "filename": stored.filename,
        "backend": stored.backend,
        "size": stored.size,
    }


@router.post("/presign")
async def presign_upload(body: PresignRequest, user: User = Depends(get_current_user)):
    """
    Return a presigned PUT URL for direct browser → R2 upload.
    Only available when STORAGE_BACKEND=r2.
    """
    storage = get_storage()
    if not isinstance(storage, R2Storage):
        raise HTTPException(
            status_code=400,
            detail="Presigned uploads require STORAGE_BACKEND=r2",
        )
    safe_folder = "".join(c for c in body.folder if c.isalnum() or c in "-_/")[:64] or "uploads"
    name = unique_filename(body.filename)
    key = f"{safe_folder.strip('/')}/{user.id}-{name}"
    url = storage.presigned_put(key, content_type=body.contentType)
    public = f"{settings.R2_PUBLIC_URL.rstrip('/')}/{key}"
    return {
        "uploadUrl": url,
        "key": key,
        "publicUrl": public,
        "method": "PUT",
        "headers": {"Content-Type": body.contentType} if body.contentType else {},
        "backend": "r2",
    }
