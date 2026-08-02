import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.config import settings
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("/resume")
async def upload_resume(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    if file.content_type not in ("application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")

    ext = file.filename.split(".")[-1] if file.filename else "pdf"
    filename = f"{user.id}-{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, "resumes", filename)

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    return {"url": f"/uploads/resumes/{filename}", "filename": filename}


@router.post("/image")
async def upload_image(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    ext = file.filename.split(".")[-1] if file.filename else "png"
    filename = f"{uuid.uuid4().hex[:12]}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, "images", filename)

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    return {"url": f"/uploads/images/{filename}", "filename": filename}
