import math
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate, JobResponse, PaginatedJobResponse
from app.services.auth import get_current_user, get_admin_user
from app.models.user import User

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def job_to_response(job: Job) -> JobResponse:
    return JobResponse(
        id=job.id,
        title=job.title,
        company=job.company,
        companyLogo=job.company_logo,
        location=job.location,
        isRemote=job.is_remote,
        type=job.type,
        category=job.category,
        description=job.description,
        requirements=job.requirements or [],
        responsibilities=job.responsibilities or [],
        salary=job.salary,
        stipend=job.stipend,
        duration=job.duration,
        applicationDeadline=job.application_deadline,
        postedBy=job.posted_by,
        postedAt=job.posted_at.isoformat() if isinstance(job.posted_at, datetime) else str(job.posted_at),
        status=job.status,
        applicants=job.applicants or [],
    )


@router.get("", response_model=PaginatedJobResponse)
async def list_jobs(
    search: str | None = None,
    location: str | None = None,
    category: str | None = None,
    type: str | None = None,
    is_remote: bool | None = None,
    status: str = "approved",
    page: int = Query(1, ge=1),
    per_page: int = Query(9, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Job).where(Job.status == status)

    if search:
        term = f"%{search}%"
        query = query.where(or_(Job.title.ilike(term), Job.company.ilike(term), Job.description.ilike(term)))
    if location:
        query = query.where(Job.location.ilike(f"%{location}%"))
    if category:
        query = query.where(func.lower(Job.category) == category.lower())
    if type:
        query = query.where(Job.type == type)
    if is_remote is not None:
        query = query.where(Job.is_remote == is_remote)

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = query.order_by(Job.posted_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    jobs = result.scalars().all()

    return PaginatedJobResponse(
        items=[job_to_response(j) for j in jobs],
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total > 0 else 0,
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_to_response(job)


@router.post("", response_model=JobResponse)
async def create_job(data: JobCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if user.role not in ("admin", "employer"):
        raise HTTPException(status_code=403, detail="Not authorized to create jobs")

    job = Job(
        title=data.title,
        company=data.company,
        company_logo=data.companyLogo,
        location=data.location,
        is_remote=data.isRemote,
        type=data.type,
        category=data.category,
        description=data.description,
        requirements=data.requirements,
        responsibilities=data.responsibilities,
        salary=data.salary.model_dump() if data.salary else None,
        stipend=data.stipend.model_dump() if data.stipend else None,
        duration=data.duration,
        application_deadline=data.applicationDeadline,
        posted_by=user.id,
        posted_at=datetime.now(timezone.utc),
        status=data.status if user.role == "admin" else "pending",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job_to_response(job)


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(job_id: str, data: JobUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if user.role != "admin" and job.posted_by != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = data.model_dump(exclude_unset=True)
    field_map = {
        "companyLogo": "company_logo",
        "isRemote": "is_remote",
        "applicationDeadline": "application_deadline",
    }
    for camel, snake in field_map.items():
        if camel in update_data:
            update_data[snake] = update_data.pop(camel)

    if "salary" in update_data and update_data["salary"]:
        update_data["salary"] = update_data["salary"].model_dump() if hasattr(update_data["salary"], "model_dump") else update_data["salary"]
    if "stipend" in update_data and update_data["stipend"]:
        update_data["stipend"] = update_data["stipend"].model_dump() if hasattr(update_data["stipend"], "model_dump") else update_data["stipend"]

    for key, value in update_data.items():
        if hasattr(job, key):
            setattr(job, key, value)

    await db.commit()
    await db.refresh(job)
    return job_to_response(job)


@router.delete("/{job_id}")
async def delete_job(job_id: str, user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    await db.delete(job)
    await db.commit()
    return {"message": "Job deleted"}
