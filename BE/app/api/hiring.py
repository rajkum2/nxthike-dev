import math
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.hiring import Candidate, HiringRole
from app.models.user import User
from app.services.auth import get_admin_user
from app.schemas.hiring import (
    PIPELINE_STATUSES,
    CandidateCreate,
    CandidateUpdate,
    CandidateResponse,
    PaginatedCandidateResponse,
    HiringRoleCreate,
    HiringRoleUpdate,
    HiringRoleResponse,
    BulkStatusRequest,
    BulkDeleteRequest,
    HiringDashboardStats,
)

# All hiring CRM endpoints require an authenticated admin user
router = APIRouter(
    prefix="/api/hiring",
    tags=["hiring"],
    dependencies=[Depends(get_admin_user)],
)


def _str_or_none(v) -> str | None:
    if v is None:
        return None
    return str(v)


def candidate_to_response(c: Candidate) -> CandidateResponse:
    return CandidateResponse(
        id=c.id,
        roleId=c.role_id,
        roleName=c.role_name or "",
        status=c.status or "new",
        tags=c.tags or [],
        notes=c.notes or "",
        starred=bool(c.starred),
        name=c.name,
        applicationLink=c.application_link,
        phone=c.phone,
        email=c.email,
        city=c.city,
        gender=c.gender,
        otherSkills=c.other_skills,
        aiResumeMatch=c.ai_resume_match,
        institute=c.institute,
        degree=c.degree,
        stream=c.stream,
        graduationYear=c.graduation_year,
        performancePg=c.performance_pg,
        performanceUg=c.performance_ug,
        performance12=c.performance_12,
        performance10=c.performance_10,
        chatLink=c.chat_link,
        resumeLink=c.resume_link,
        downloadLink=c.download_link,
        appliedAt=c.applied_at,
        hasWorkExperience=c.has_work_experience,
        totalRoles=c.total_roles,
        internshipCount=c.internship_count,
        fulltimeCount=c.fulltime_count,
        companies=c.companies,
        jobTitles=c.job_titles,
        workExperienceDetail=c.work_experience_detail,
        experienceDuration=c.experience_duration,
        latestRole=c.latest_role,
        latestCompany=c.latest_company,
        careerObjective=c.career_objective,
        languages=c.languages,
        certifications=c.certifications,
        projects=c.projects,
        extraCurricular=c.extra_curricular,
        additionalDetails=c.additional_details,
        relevantSkills=c.relevant_skills,
        educationFromPdf=c.education_from_pdf,
        streamFromPdf=c.stream_from_pdf,
        pdfFile=c.pdf_file,
        availability=c.availability,
        aiInterviewScores=c.ai_interview_scores or {},
        skillFlags=c.skill_flags or {},
        createdAt=c.created_at.isoformat() if c.created_at else None,
        updatedAt=c.updated_at.isoformat() if c.updated_at else None,
    )


def apply_candidate_payload(c: Candidate, data: dict) -> None:
    """Map camelCase API fields onto SQLAlchemy model."""
    mapping = {
        "roleId": "role_id",
        "roleName": "role_name",
        "status": "status",
        "tags": "tags",
        "notes": "notes",
        "starred": "starred",
        "name": "name",
        "applicationLink": "application_link",
        "phone": "phone",
        "email": "email",
        "city": "city",
        "gender": "gender",
        "otherSkills": "other_skills",
        "aiResumeMatch": "ai_resume_match",
        "institute": "institute",
        "degree": "degree",
        "stream": "stream",
        "graduationYear": "graduation_year",
        "performancePg": "performance_pg",
        "performanceUg": "performance_ug",
        "performance12": "performance_12",
        "performance10": "performance_10",
        "chatLink": "chat_link",
        "resumeLink": "resume_link",
        "downloadLink": "download_link",
        "appliedAt": "applied_at",
        "hasWorkExperience": "has_work_experience",
        "totalRoles": "total_roles",
        "internshipCount": "internship_count",
        "fulltimeCount": "fulltime_count",
        "companies": "companies",
        "jobTitles": "job_titles",
        "workExperienceDetail": "work_experience_detail",
        "experienceDuration": "experience_duration",
        "latestRole": "latest_role",
        "latestCompany": "latest_company",
        "careerObjective": "career_objective",
        "languages": "languages",
        "certifications": "certifications",
        "projects": "projects",
        "extraCurricular": "extra_curricular",
        "additionalDetails": "additional_details",
        "relevantSkills": "relevant_skills",
        "educationFromPdf": "education_from_pdf",
        "streamFromPdf": "stream_from_pdf",
        "pdfFile": "pdf_file",
        "availability": "availability",
        "aiInterviewScores": "ai_interview_scores",
        "skillFlags": "skill_flags",
    }
    for api_key, col in mapping.items():
        if api_key not in data or data[api_key] is None and api_key not in (
            "tags",
            "notes",
            "starred",
            "aiInterviewScores",
            "skillFlags",
        ):
            # still allow explicit nulls for optional fields except collections handled below
            if api_key not in data:
                continue
        val = data[api_key]
        if api_key in (
            "phone",
            "graduationYear",
            "totalRoles",
            "internshipCount",
            "fulltimeCount",
        ):
            val = _str_or_none(val)
        if api_key == "tags" and val is None:
            val = []
        if api_key in ("aiInterviewScores", "skillFlags") and val is None:
            val = {}
        setattr(c, col, val)
    c.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)


# ---------- Roles ----------


@router.get("/roles", response_model=list[HiringRoleResponse])
async def list_roles(db: AsyncSession = Depends(get_db)):
    roles = (await db.execute(select(HiringRole).order_by(HiringRole.sort_order, HiringRole.name))).scalars().all()
    result: list[HiringRoleResponse] = []
    for r in roles:
        count = (
            await db.execute(select(func.count()).select_from(Candidate).where(Candidate.role_id == r.id))
        ).scalar() or 0
        result.append(
            HiringRoleResponse(
                id=r.id,
                name=r.name,
                description=r.description,
                is_active=r.is_active,
                sort_order=r.sort_order,
                count=count,
            )
        )
    # Include roles present only on candidates (orphans)
    if not roles:
        rows = (
            await db.execute(
                select(Candidate.role_id, Candidate.role_name, func.count())
                .group_by(Candidate.role_id, Candidate.role_name)
            )
        ).all()
        for role_id, role_name, count in rows:
            result.append(
                HiringRoleResponse(
                    id=role_id,
                    name=role_name or role_id,
                    count=count,
                )
            )
    return result


@router.post("/roles", response_model=HiringRoleResponse, status_code=201)
async def create_role(body: HiringRoleCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.get(HiringRole, body.id)
    if existing:
        raise HTTPException(status_code=400, detail="Role id already exists")
    role = HiringRole(
        id=body.id,
        name=body.name,
        description=body.description,
        is_active=body.is_active,
        sort_order=body.sort_order,
    )
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return HiringRoleResponse(
        id=role.id,
        name=role.name,
        description=role.description,
        is_active=role.is_active,
        sort_order=role.sort_order,
        count=0,
    )


@router.patch("/roles/{role_id}", response_model=HiringRoleResponse)
async def update_role(role_id: str, body: HiringRoleUpdate, db: AsyncSession = Depends(get_db)):
    role = await db.get(HiringRole, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(role, k, v)
    await db.commit()
    await db.refresh(role)
    count = (
        await db.execute(select(func.count()).select_from(Candidate).where(Candidate.role_id == role.id))
    ).scalar() or 0
    return HiringRoleResponse(
        id=role.id,
        name=role.name,
        description=role.description,
        is_active=role.is_active,
        sort_order=role.sort_order,
        count=count,
    )


@router.delete("/roles/{role_id}", status_code=204)
async def delete_role(role_id: str, db: AsyncSession = Depends(get_db)):
    role = await db.get(HiringRole, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    count = (
        await db.execute(select(func.count()).select_from(Candidate).where(Candidate.role_id == role_id))
    ).scalar() or 0
    if count:
        raise HTTPException(status_code=400, detail=f"Cannot delete role with {count} candidates")
    await db.delete(role)
    await db.commit()


# ---------- Dashboard ----------


@router.get("/dashboard", response_model=HiringDashboardStats)
async def hiring_dashboard(
    role_id: str | None = Query(None, alias="roleId"),
    db: AsyncSession = Depends(get_db),
):
    q = select(Candidate)
    if role_id and role_id != "all":
        q = q.where(Candidate.role_id == role_id)
    candidates = (await db.execute(q)).scalars().all()

    by_status: dict[str, int] = {s: 0 for s in PIPELINE_STATUSES}
    by_role: dict[str, int] = {}
    starred = 0
    with_exp = 0
    for c in candidates:
        by_status[c.status] = by_status.get(c.status, 0) + 1
        by_role[c.role_id] = by_role.get(c.role_id, 0) + 1
        if c.starred:
            starred += 1
        if (c.has_work_experience or "").lower() == "yes":
            with_exp += 1

    roles = await list_roles(db)
    return HiringDashboardStats(
        total=len(candidates),
        starred=starred,
        withExp=with_exp,
        byStatus=by_status,
        byRole=by_role,
        roles=roles,
    )


# ---------- Candidates CRUD ----------


@router.get("/candidates", response_model=PaginatedCandidateResponse)
async def list_candidates(
    search: str | None = None,
    role_id: str | None = Query(None, alias="roleId"),
    status: str | None = None,
    city: str | None = None,
    experience: str | None = None,
    ai_match: str | None = Query(None, alias="aiMatch"),
    starred_only: bool = Query(False, alias="starredOnly"),
    has_notes: bool = Query(False, alias="hasNotes"),
    sort_key: str = Query("name", alias="sortKey"),
    sort_dir: str = Query("asc", alias="sortDir"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200, alias="pageSize"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Candidate)
    filters = []

    if role_id and role_id != "all":
        filters.append(Candidate.role_id == role_id)
    if status and status != "all":
        filters.append(Candidate.status == status)
    if city:
        filters.append(func.lower(Candidate.city) == city.lower())
    if experience == "yes":
        filters.append(func.lower(Candidate.has_work_experience) == "yes")
    elif experience == "no":
        filters.append(
            or_(
                Candidate.has_work_experience.is_(None),
                func.lower(Candidate.has_work_experience) != "yes",
            )
        )
    if ai_match:
        filters.append(func.lower(Candidate.ai_resume_match) == ai_match.lower())
    if starred_only:
        filters.append(Candidate.starred.is_(True))
    if has_notes:
        filters.append(and_(Candidate.notes.is_not(None), Candidate.notes != ""))
    if search:
        term = f"%{search.strip()}%"
        filters.append(
            or_(
                Candidate.name.ilike(term),
                Candidate.email.ilike(term),
                Candidate.phone.ilike(term),
                Candidate.city.ilike(term),
                Candidate.institute.ilike(term),
                Candidate.companies.ilike(term),
                Candidate.job_titles.ilike(term),
                Candidate.other_skills.ilike(term),
                Candidate.notes.ilike(term),
                Candidate.latest_role.ilike(term),
            )
        )

    if filters:
        query = query.where(and_(*filters))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0

    sort_map = {
        "name": Candidate.name,
        "city": Candidate.city,
        "status": Candidate.status,
        "aiResumeMatch": Candidate.ai_resume_match,
        "hasWorkExperience": Candidate.has_work_experience,
        "experienceDuration": Candidate.experience_duration,
        "latestRole": Candidate.latest_role,
        "companies": Candidate.companies,
        "institute": Candidate.institute,
        "updatedAt": Candidate.updated_at,
        "createdAt": Candidate.created_at,
    }
    sort_col = sort_map.get(sort_key, Candidate.name)
    if sort_dir.lower() == "desc":
        query = query.order_by(sort_col.desc().nullslast())
    else:
        query = query.order_by(sort_col.asc().nullslast())

    query = query.offset((page - 1) * page_size).limit(page_size)
    items = (await db.execute(query)).scalars().all()
    total_pages = max(1, math.ceil(total / page_size)) if total else 1

    return PaginatedCandidateResponse(
        items=[candidate_to_response(c) for c in items],
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=total_pages,
    )


@router.get("/candidates/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(candidate_id: str, db: AsyncSession = Depends(get_db)):
    c = await db.get(Candidate, candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate_to_response(c)


@router.post("/candidates", response_model=CandidateResponse, status_code=201)
async def create_candidate(body: CandidateCreate, db: AsyncSession = Depends(get_db)):
    cid = body.id or f"custom_{uuid.uuid4().hex[:12]}"
    if await db.get(Candidate, cid):
        raise HTTPException(status_code=400, detail="Candidate id already exists")
    c = Candidate(id=cid)
    apply_candidate_payload(c, body.model_dump())
    if not c.role_name and c.role_id:
        role = await db.get(HiringRole, c.role_id)
        if role:
            c.role_name = role.name
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return candidate_to_response(c)


@router.put("/candidates/{candidate_id}", response_model=CandidateResponse)
async def replace_candidate(candidate_id: str, body: CandidateCreate, db: AsyncSession = Depends(get_db)):
    c = await db.get(Candidate, candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    apply_candidate_payload(c, body.model_dump())
    await db.commit()
    await db.refresh(c)
    return candidate_to_response(c)


@router.patch("/candidates/{candidate_id}", response_model=CandidateResponse)
async def patch_candidate(candidate_id: str, body: CandidateUpdate, db: AsyncSession = Depends(get_db)):
    c = await db.get(Candidate, candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    apply_candidate_payload(c, body.model_dump(exclude_unset=True))
    await db.commit()
    await db.refresh(c)
    return candidate_to_response(c)


@router.delete("/candidates/{candidate_id}", status_code=204)
async def delete_candidate(candidate_id: str, db: AsyncSession = Depends(get_db)):
    c = await db.get(Candidate, candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    await db.delete(c)
    await db.commit()


@router.post("/candidates/bulk-status")
async def bulk_status(body: BulkStatusRequest, db: AsyncSession = Depends(get_db)):
    if body.status not in PIPELINE_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {body.status}")
    if not body.ids:
        return {"updated": 0}
    result = await db.execute(select(Candidate).where(Candidate.id.in_(body.ids)))
    rows = result.scalars().all()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for c in rows:
        c.status = body.status
        c.updated_at = now
    await db.commit()
    return {"updated": len(rows)}


@router.post("/candidates/bulk-delete")
async def bulk_delete(body: BulkDeleteRequest, db: AsyncSession = Depends(get_db)):
    if not body.ids:
        return {"deleted": 0}
    result = await db.execute(select(Candidate).where(Candidate.id.in_(body.ids)))
    rows = result.scalars().all()
    for c in rows:
        await db.delete(c)
    await db.commit()
    return {"deleted": len(rows)}


@router.post("/candidates/bulk-import")
async def bulk_import(candidates: list[CandidateCreate], db: AsyncSession = Depends(get_db)):
    """Import many candidates (upsert by id)."""
    created = 0
    updated = 0
    for body in candidates:
        cid = body.id or f"import_{uuid.uuid4().hex[:12]}"
        existing = await db.get(Candidate, cid)
        if existing:
            apply_candidate_payload(existing, body.model_dump())
            updated += 1
        else:
            c = Candidate(id=cid)
            apply_candidate_payload(c, body.model_dump())
            db.add(c)
            created += 1
    await db.commit()
    return {"created": created, "updated": updated, "total": created + updated}
