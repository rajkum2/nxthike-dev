import math
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_, and_, cast, Float, case, literal, literal_column, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.hiring import Candidate, HiringRole
from app.models.user import User
from app.services.auth import get_admin_user  # noqa: F401  (kept for per-route use)
from app.services.personas import (
    WorkspaceIdentity,
    apply_pii_policy,
    get_workspace_user,
    refuse_if_unassigned,
    require_cap,
    require_cap_in,
    require_full_admin,
)
from app.config import settings
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
    BulkAssignRequest,
    BulkAssignQuery,
    BulkRoleRequest,
    BulkUpdateRequest,
    HiringDashboardStats,
)


def _assigned_clause(me: WorkspaceIdentity):
    """SQL filter for recruiters who may only see their own book."""
    if me.sees_assigned_only:
        return Candidate.owner_id == me.user.id
    return None


def _cap_bulk_ids(ids: list[str]) -> list[str]:
    """Reject oversized bulk payloads (scrape / wipe protection)."""
    if len(ids) > settings.MAX_BULK_IDS:
        raise HTTPException(
            status_code=400,
            detail=f"Too many ids (max {settings.MAX_BULK_IDS} per request).",
        )
    # De-dupe while preserving order
    seen: set[str] = set()
    out: list[str] = []
    for i in ids:
        if i and i not in seen:
            seen.add(i)
            out.append(i)
    return out

#: Anyone with a workspace persona — not only `role == "admin"`.
#:
#: This used to be `get_admin_user`, which pre-dated personas and meant a
#: recruiter (portal role `employer`, persona `p1`) was refused their own
#: candidate list. `get_workspace_user` still refuses every portal-only
#: account, so the public site's students and employers stay locked out.
router = APIRouter(
    prefix="/api/hiring",
    tags=["hiring"],
    dependencies=[Depends(get_workspace_user)],
)


def _str_or_none(v) -> str | None:
    if v is None:
        return None
    return str(v)


def _to_datetime(v) -> datetime | None:
    """Accept an ISO string (what the browser sends) or a datetime, or None."""
    if v is None or isinstance(v, datetime):
        return v
    try:
        return datetime.fromisoformat(str(v).replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Not a valid timestamp: {v!r}")


#: Fields a role that only sees masked contact details must never write, so a
#: masked value cannot be echoed back and overwrite the real one.
MASKED_FIELDS = ("phone", "email")


def candidate_for(c: Candidate, me: WorkspaceIdentity | None) -> CandidateResponse:
    """
    Serialise a candidate for one caller, masking contact details for roles that
    may see the record but not how to reach the person.

    Masking happens here, on the way out, rather than in the browser — a client
    that is not entitled to a phone number never receives it.
    """
    payload = candidate_to_response(c)
    if me is None:
        return payload
    return CandidateResponse(**apply_pii_policy(payload.model_dump(), me))


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
        photoUrl=getattr(c, "photo_url", None),
        availability=c.availability,
        aiInterviewScores=c.ai_interview_scores or {},
        skillFlags=c.skill_flags or {},
        # TalentDialer workspace columns
        ownerId=c.owner_id,
        source=c.source,
        currentCtc=c.current_ctc,
        expectedCtc=c.expected_ctc,
        noticeDays=c.notice_days,
        buyout=c.buyout,
        consentAt=c.consent_at.isoformat() if c.consent_at else None,
        consentChannel=c.consent_channel,
        dnc=bool(c.dnc) if c.dnc is not None else None,
        requisitionId=c.requisition_id,
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
        "photoUrl": "photo_url",
        "availability": "availability",
        "aiInterviewScores": "ai_interview_scores",
        "skillFlags": "skill_flags",
        # TalentDialer workspace columns
        "ownerId": "owner_id",
        "source": "source",
        "currentCtc": "current_ctc",
        "expectedCtc": "expected_ctc",
        "noticeDays": "notice_days",
        "buyout": "buyout",
        "consentAt": "consent_at",
        "consentChannel": "consent_channel",
        "dnc": "dnc",
        "requisitionId": "requisition_id",
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
        if api_key == "consentAt":
            val = _to_datetime(val)
        setattr(c, col, val)
    c.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)


# ---------- Roles ----------


async def _role_candidate_count(db: AsyncSession, role_id: str, me: WorkspaceIdentity | None) -> int:
    filters = [Candidate.role_id == role_id]
    if me is not None and (scope := _assigned_clause(me)) is not None:
        filters.append(scope)
    return (
        await db.execute(select(func.count()).select_from(Candidate).where(and_(*filters)))
    ).scalar() or 0


@router.get("/roles", response_model=list[HiringRoleResponse])
async def list_roles(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    roles = (await db.execute(select(HiringRole).order_by(HiringRole.sort_order, HiringRole.name))).scalars().all()
    result: list[HiringRoleResponse] = []
    for r in roles:
        count = await _role_candidate_count(db, r.id, me)
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
        orphan_q = select(Candidate.role_id, Candidate.role_name, func.count()).group_by(
            Candidate.role_id, Candidate.role_name
        )
        if (scope := _assigned_clause(me)) is not None:
            orphan_q = orphan_q.where(scope)
        rows = (await db.execute(orphan_q)).all()
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
async def create_role(
    body: HiringRoleCreate,
    me: WorkspaceIdentity = Depends(
        require_cap_in("reqs", ("all", "own"), "Your role cannot create requisitions.")
    ),
    db: AsyncSession = Depends(get_db),
):
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
async def update_role(
    role_id: str,
    body: HiringRoleUpdate,
    me: WorkspaceIdentity = Depends(
        require_cap_in("reqs", ("all", "own"), "Your role cannot edit requisitions.")
    ),
    db: AsyncSession = Depends(get_db),
):
    role = await db.get(HiringRole, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    data = body.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(role, k, v)
    await db.commit()
    await db.refresh(role)
    count = await _role_candidate_count(db, role.id, me)
    return HiringRoleResponse(
        id=role.id,
        name=role.name,
        description=role.description,
        is_active=role.is_active,
        sort_order=role.sort_order,
        count=count,
    )


@router.delete("/roles/{role_id}", status_code=204)
async def delete_role(
    role_id: str,
    me: WorkspaceIdentity = Depends(require_cap("admin", "Only admins can delete requisitions.")),
    db: AsyncSession = Depends(get_db),
):
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
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Aggregate stats via SQL — do not load all candidate rows into memory
    (tens of thousands in production).
    """
    scope = []
    if role_id and role_id != "all":
        scope.append(Candidate.role_id == role_id)
    if (owner := _assigned_clause(me)) is not None:
        scope.append(owner)

    def _where(extra=None):
        parts = list(scope)
        if extra is not None:
            parts.append(extra)
        return and_(*parts) if parts else True

    base = select(Candidate).where(_where())
    total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar() or 0

    starred = (
        await db.execute(select(func.count()).select_from(Candidate).where(_where(Candidate.starred.is_(True))))
    ).scalar() or 0

    with_exp = (
        await db.execute(
            select(func.count()).select_from(Candidate).where(
                _where(func.lower(Candidate.has_work_experience) == "yes")
            )
        )
    ).scalar() or 0

    status_q = select(Candidate.status, func.count()).where(_where()).group_by(Candidate.status)
    by_status: dict[str, int] = {s: 0 for s in PIPELINE_STATUSES}
    for st, n in (await db.execute(status_q)).all():
        by_status[st or "new"] = n

    role_q = select(Candidate.role_id, func.count()).where(_where()).group_by(Candidate.role_id)
    by_role = {rid: n for rid, n in (await db.execute(role_q)).all() if rid}

    roles = await list_roles(me, db)
    return HiringDashboardStats(
        total=total,
        starred=starred,
        withExp=with_exp,
        byStatus=by_status,
        byRole=by_role,
        roles=roles,
    )


# ---------- Candidates CRUD ----------


def _split_csv(values: list[str] | None) -> list[str]:
    """Normalize multi-select query params: ?city=A&city=B or ?city=A,B."""
    if not values:
        return []
    out: list[str] = []
    seen: set[str] = set()
    for raw in values:
        for part in str(raw).split(","):
            p = part.strip()
            if not p or p.lower() == "all":
                continue
            key = p.lower()
            if key in seen:
                continue
            seen.add(key)
            out.append(p)
    return out


def _pg_substring(col, pattern: str):
    """PostgreSQL SUBSTRING(col FROM 'regex') — pattern must be a SQL string literal."""
    # Escape single quotes in pattern for safety (patterns are code constants).
    safe = pattern.replace("'", "''")
    return func.substring(col, literal_column(f"'{safe}'"))


def _experience_total_years_expr():
    """
    Approximate total years from free-text `experience_duration`.

    Handles Naukri-style strings:
      '2 Year(s) 6 Month(s)', '11 Year(s) 0 Month(s)', '3 months', 'Fresher', '5 yrs'

    Returns NULL when the field cannot be parsed (so numeric buckets do not
    accidentally match unknowns via a 0 default).
    """
    col = Candidate.experience_duration
    lower = func.lower(func.coalesce(col, ""))
    is_fresher = or_(
        lower.like("%fresher%"),
        lower.like("%no experience%"),
        lower.like("%not applicable%"),
        lower.in_(("na", "n/a", "-", "nil", "none")),
    )
    # Capture number before Year / Yr (not bare digits inside other tokens)
    y_raw = _pg_substring(col, r"([0-9]+)\s*[Yy]ear")
    y2_raw = _pg_substring(col, r"([0-9]+)\s*[Yy]r")
    m_raw = _pg_substring(col, r"([0-9]+)\s*[Mm]onth")

    y = cast(func.nullif(func.coalesce(y_raw, y2_raw), ""), Float)
    m = cast(func.nullif(m_raw, ""), Float)

    # When year is missing, months alone still count (e.g. "6 months" → 0.5y).
    # When year is present, months are additive.
    parsed = case(
        (is_fresher, literal(0.0)),
        (
            or_(y.is_not(None), m.is_not(None)),
            func.coalesce(y, 0.0) + func.coalesce(m, 0.0) / 12.0,
        ),
        else_=None,
    )
    return parsed


def _exp_bucket_clause(bucket: str):
    """
    Map an experience-year bucket to a SQLAlchemy clause.

    Ranges are half-open so multi-select does not double-count boundaries:
      0–1   → [0, 1)
      1–3   → [1, 3)
      3–5   → [3, 5)
      5–7   → [5, 7)
      7–10  → [7, 10)
      10+   → [10, ∞)
      5+    → [5, ∞)  (legacy saved searches)

    Previously used ILIKE '%1%' which wrongly matched 11y, 12y, 19y, etc.
    """
    b = bucket.strip().lower().replace("–", "-").replace("—", "-")
    years = _experience_total_years_expr()
    # Explicit "no experience" flag with empty duration (do NOT treat blank/unknown as 0–1)
    marked_no_exp = and_(
        or_(Candidate.experience_duration.is_(None), Candidate.experience_duration == ""),
        func.lower(Candidate.has_work_experience) == "no",
    )

    if b in ("0", "fresher", "0-1"):
        return or_(marked_no_exp, and_(years.is_not(None), years < 1.0))
    if b == "1-3":
        return and_(years.is_not(None), years >= 1.0, years < 3.0)
    if b == "3-5":
        return and_(years.is_not(None), years >= 3.0, years < 5.0)
    if b == "5-7":
        return and_(years.is_not(None), years >= 5.0, years < 7.0)
    if b in ("7-10", "7-10yrs", "7to10"):
        return and_(years.is_not(None), years >= 7.0, years < 10.0)
    if b in ("10+", "10-plus", "10plus"):
        return and_(years.is_not(None), years >= 10.0)
    # Legacy umbrella still works for older saved filters
    if b in ("5+", "5-plus", "5plus"):
        return and_(years.is_not(None), years >= 5.0)
    return None


@router.get("/candidates/facets")
async def candidate_facets(
    q: str | None = None,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Distinct cities (and top graduation years) for multi-select filter UIs.
    Optional `q` narrows cities by substring.
    """
    city_filters = [
        Candidate.city.is_not(None),
        Candidate.city != "",
    ]
    if (scope := _assigned_clause(me)) is not None:
        city_filters.append(scope)
    if q and q.strip():
        city_filters.append(Candidate.city.ilike(f"%{q.strip()}%"))
    city_rows = (
        await db.execute(
            select(Candidate.city, func.count().label("n"))
            .where(and_(*city_filters))
            .group_by(Candidate.city)
            .order_by(func.count().desc())
            .limit(250)
        )
    ).all()
    year_filters = [
        Candidate.graduation_year.is_not(None),
        Candidate.graduation_year != "",
    ]
    if (scope := _assigned_clause(me)) is not None:
        year_filters.append(scope)
    year_rows = (
        await db.execute(
            select(Candidate.graduation_year, func.count().label("n"))
            .where(and_(*year_filters))
            .group_by(Candidate.graduation_year)
            .order_by(func.count().desc())
            .limit(40)
        )
    ).all()
    return {
        "cities": [{"value": c, "count": int(n)} for c, n in city_rows if c],
        "graduationYears": [{"value": y, "count": int(n)} for y, n in year_rows if y],
    }


def _candidate_filters(
    me: WorkspaceIdentity,
    *,
    search: str | None = None,
    role_id: str | None = None,
    status: str | None = None,
    city: list[str] | None = None,
    source: str | None = None,
    gender: str | None = None,
    experience: str | None = None,
    graduation_year: list[str] | None = None,
    exp_years: list[str] | None = None,
    ai_match: str | None = None,
    starred_only: bool = False,
    has_notes: bool = False,
    has_phone: bool = False,
    has_resume: bool = False,
    has_email: bool = False,
    dnc_only: bool = False,
    no_consent: bool = False,
    owner: str | None = None,
    degree: str | None = None,
    company: str | None = None,
    institute: str | None = None,
    english: str | None = None,
    uploaded_from: str | None = None,
    uploaded_to: str | None = None,
) -> list:
    """Shared by the candidate list and 'assign everyone matching these filters'."""
    filters = []
    if (scope := _assigned_clause(me)) is not None:
        filters.append(scope)

    if role_id and role_id != "all":
        filters.append(Candidate.role_id == role_id)
    if status and status != "all":
        filters.append(Candidate.status == status)
    cities = _split_csv(city)
    if cities:
        filters.append(or_(*[Candidate.city.ilike(f"%{c}%") for c in cities]))
    if source:
        filters.append(Candidate.source.ilike(f"%{source.strip()}%"))
    if gender and gender != "all":
        filters.append(func.lower(Candidate.gender) == gender.lower())
    years = _split_csv(graduation_year)
    if years:
        filters.append(or_(*[Candidate.graduation_year.ilike(f"%{y}%") for y in years]))
    buckets = _split_csv(exp_years)
    if buckets:
        clauses = [c for b in buckets if (c := _exp_bucket_clause(b)) is not None]
        if clauses:
            filters.append(or_(*clauses))
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
    if has_phone:
        filters.append(and_(Candidate.phone.is_not(None), Candidate.phone != ""))
    if has_email:
        filters.append(and_(Candidate.email.is_not(None), Candidate.email != ""))
    if has_resume:
        filters.append(
            or_(
                and_(Candidate.resume_link.is_not(None), Candidate.resume_link != ""),
                and_(Candidate.download_link.is_not(None), Candidate.download_link != ""),
            )
        )
    if dnc_only:
        filters.append(Candidate.dnc.is_(True))
    if no_consent:
        filters.append(Candidate.consent_at.is_(None))

    owner_key = (owner or "").strip()
    if owner_key == "unassigned":
        filters.append(or_(Candidate.owner_id.is_(None), Candidate.owner_id == ""))
    elif owner_key == "assigned":
        filters.append(and_(Candidate.owner_id.is_not(None), Candidate.owner_id != ""))
    elif owner_key and owner_key != "all":
        filters.append(Candidate.owner_id == owner_key)

    def _contains(column, raw: str | None):
        text = (raw or "").strip()
        if text:
            filters.append(column.ilike(f"%{text}%"))

    _contains(Candidate.degree, degree)
    _contains(Candidate.institute, institute)
    if (company or "").strip():
        text = f"%{company.strip()}%"
        filters.append(or_(Candidate.latest_company.ilike(text), Candidate.companies.ilike(text)))
    if (english or "").strip() and english.strip().lower() != "all":
        filters.append(Candidate.languages.ilike(f"%English: {english.strip()}%"))

    # Upload dates are calendar days in India; created_at is stored as naive UTC.
    ist = timezone(timedelta(hours=5, minutes=30))

    def _uploaded_bound(raw: str | None, *, end: bool) -> datetime | None:
        text = (raw or "").strip()[:10]
        if not text:
            return None
        try:
            day = datetime.strptime(text, "%Y-%m-%d")
        except ValueError:
            return None
        start = day.replace(tzinfo=ist)
        if end:
            start = start + timedelta(days=1)
        return start.astimezone(timezone.utc).replace(tzinfo=None)

    start = _uploaded_bound(uploaded_from, end=False)
    end = _uploaded_bound(uploaded_to, end=True)
    if start is not None:
        filters.append(Candidate.created_at >= start)
    if end is not None:
        filters.append(Candidate.created_at < end)

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
                Candidate.latest_company.ilike(term),
                Candidate.degree.ilike(term),
                Candidate.source.ilike(term),
            )
        )
    return filters


@router.get("/candidates", response_model=PaginatedCandidateResponse)
async def list_candidates(
    search: str | None = None,
    role_id: str | None = Query(None, alias="roleId"),
    status: str | None = None,
    city: list[str] | None = Query(None),
    source: str | None = None,
    gender: str | None = None,
    experience: str | None = None,
    graduation_year: list[str] | None = Query(None, alias="graduationYear"),
    exp_years: list[str] | None = Query(None, alias="expYears"),
    ai_match: str | None = Query(None, alias="aiMatch"),
    starred_only: bool = Query(False, alias="starredOnly"),
    has_notes: bool = Query(False, alias="hasNotes"),
    has_phone: bool = Query(False, alias="hasPhone"),
    has_resume: bool = Query(False, alias="hasResume"),
    has_email: bool = Query(False, alias="hasEmail"),
    dnc_only: bool = Query(False, alias="dncOnly"),
    no_consent: bool = Query(False, alias="noConsent"),
    owner: str | None = None,
    degree: str | None = None,
    company: str | None = None,
    institute: str | None = None,
    english: str | None = None,
    uploaded_from: str | None = Query(None, alias="uploadedFrom"),
    uploaded_to: str | None = Query(None, alias="uploadedTo"),
    sort_key: str = Query("name", alias="sortKey"),
    sort_dir: str = Query("asc", alias="sortDir"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100, alias="pageSize"),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Candidate)
    filters = _candidate_filters(
        me,
        search=search,
        role_id=role_id,
        status=status,
        city=city,
        source=source,
        gender=gender,
        experience=experience,
        graduation_year=graduation_year,
        exp_years=exp_years,
        ai_match=ai_match,
        starred_only=starred_only,
        has_notes=has_notes,
        has_phone=has_phone,
        has_resume=has_resume,
        has_email=has_email,
        dnc_only=dnc_only,
        no_consent=no_consent,
        owner=owner,
        degree=degree,
        company=company,
        institute=institute,
        english=english,
        uploaded_from=uploaded_from,
        uploaded_to=uploaded_to,
    )

    if filters:
        query = query.where(and_(*filters))

    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar() or 0

    sort_map = {
        "name": Candidate.name,
        "phone": Candidate.phone,
        "email": Candidate.email,
        "city": Candidate.city,
        "status": Candidate.status,
        "role": Candidate.role_name,
        "roleName": Candidate.role_name,
        "aiResumeMatch": Candidate.ai_resume_match,
        "hasWorkExperience": Candidate.has_work_experience,
        "experience": Candidate.experience_duration,
        "experienceDuration": Candidate.experience_duration,
        "latestRole": Candidate.latest_role,
        "company": Candidate.latest_company,
        "companies": Candidate.companies,
        "institute": Candidate.institute,
        "degree": Candidate.degree,
        "source": Candidate.source,
        "gender": Candidate.gender,
        "starred": Candidate.starred,
        "dnc": Candidate.dnc,
        "currentCtc": Candidate.current_ctc,
        "expectedCtc": Candidate.expected_ctc,
        "notice": Candidate.notice_days,
        "skills": Candidate.relevant_skills,
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
        items=[candidate_for(c, me) for c in items],
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=total_pages,
    )


@router.get("/candidates/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(
    candidate_id: str,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    c = await db.get(Candidate, candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    refuse_if_unassigned(me, c.owner_id)
    return candidate_for(c, me)


@router.post("/candidates", response_model=CandidateResponse, status_code=201)
async def create_candidate(
    body: CandidateCreate,
    me: WorkspaceIdentity = Depends(require_cap("create", "Your role cannot add candidates.")),
    db: AsyncSession = Depends(get_db),
):
    cid = body.id or f"custom_{uuid.uuid4().hex[:12]}"
    if await db.get(Candidate, cid):
        raise HTTPException(status_code=400, detail="Candidate id already exists")
    c = Candidate(id=cid)
    apply_candidate_payload(c, body.model_dump())
    if not c.role_name and c.role_id:
        role = await db.get(HiringRole, c.role_id)
        if role:
            c.role_name = role.name
    # A recruiter's own adds land on their book; they cannot claim someone else's.
    if me.sees_assigned_only:
        c.owner_id = me.user.id
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return candidate_to_response(c)


@router.put("/candidates/{candidate_id}", response_model=CandidateResponse)
async def replace_candidate(
    candidate_id: str,
    body: CandidateCreate,
    me: WorkspaceIdentity = Depends(require_cap("create", "Your role cannot edit candidates.")),
    db: AsyncSession = Depends(get_db),
):
    c = await db.get(Candidate, candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    refuse_if_unassigned(me, c.owner_id)
    payload = body.model_dump()
    if not me.is_admin:
        payload.pop("ownerId", None)
    if me.sees_assigned_only:
        payload["ownerId"] = me.user.id
    apply_candidate_payload(c, payload)
    await db.commit()
    await db.refresh(c)
    return candidate_to_response(c)


@router.patch("/candidates/{candidate_id}", response_model=CandidateResponse)
async def patch_candidate(
    candidate_id: str,
    body: CandidateUpdate,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    c = await db.get(Candidate, candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    refuse_if_unassigned(me, c.owner_id)

    data = body.model_dump(exclude_unset=True)
    if not me.is_admin:
        data.pop("ownerId", None)

    # A stage move needs `stage`; editing anything else needs `create`.
    if "status" in data and not me.can("stage"):
        raise HTTPException(
            status_code=403,
            detail=f"Your role ({me.persona_name}) cannot move candidates between stages.",
        )
    if any(k != "status" for k in data) and not me.can("create"):
        raise HTTPException(
            status_code=403,
            detail=f"Your role ({me.persona_name}) cannot edit candidate records.",
        )
    # A caller who only ever saw a masked number must not be able to write one
    # back — that would replace the real value with bullets.
    if me.masks_pii and any(k in data for k in MASKED_FIELDS):
        raise HTTPException(
            status_code=403,
            detail="Contact details are masked for your role and cannot be edited.",
        )

    apply_candidate_payload(c, data)
    await db.commit()
    await db.refresh(c)
    return candidate_for(c, me)


@router.delete("/candidates/{candidate_id}", status_code=204)
async def delete_candidate(
    candidate_id: str,
    me: WorkspaceIdentity = Depends(require_cap("admin", "Only admins can delete candidate records.")),
    db: AsyncSession = Depends(get_db),
):
    c = await db.get(Candidate, candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    refuse_if_unassigned(me, c.owner_id)
    await db.delete(c)
    await db.commit()


@router.post("/candidates/bulk-status")
async def bulk_status(
    body: BulkStatusRequest,
    me: WorkspaceIdentity = Depends(require_cap("stage", "Your role cannot move candidates between stages.")),
    db: AsyncSession = Depends(get_db),
):
    if body.status not in PIPELINE_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {body.status}")
    ids = _cap_bulk_ids(body.ids or [])
    if not ids:
        return {"updated": 0}
    result = await db.execute(select(Candidate).where(Candidate.id.in_(ids)))
    rows = [c for c in result.scalars().all() if not me.sees_assigned_only or c.owner_id == me.user.id]
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for c in rows:
        c.status = body.status
        c.updated_at = now
    await db.commit()
    return {"updated": len(rows)}


@router.post("/candidates/bulk-role")
async def bulk_role(
    body: BulkRoleRequest,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    if not (me.can("create") or me.can("admin") or me.can("stage")):
        raise HTTPException(status_code=403, detail="Your role cannot change hiring roles.")
    ids = _cap_bulk_ids(body.ids or [])
    if not ids:
        return {"updated": 0}
    role_name = body.roleName
    if not role_name:
        role = await db.get(HiringRole, body.roleId)
        role_name = role.name if role else body.roleId
    result = await db.execute(select(Candidate).where(Candidate.id.in_(ids)))
    rows = [c for c in result.scalars().all() if not me.sees_assigned_only or c.owner_id == me.user.id]
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for c in rows:
        c.role_id = body.roleId
        c.role_name = role_name or c.role_name
        c.updated_at = now
    await db.commit()
    return {"updated": len(rows)}


@router.post("/candidates/bulk-update")
async def bulk_update(
    body: BulkUpdateRequest,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Bulk-set fields that were provided (non-null) on every selected candidate.
    Contact PII (phone/email) is intentionally not bulk-writable.
    """
    if not (me.can("create") or me.can("admin") or me.can("stage")):
        raise HTTPException(status_code=403, detail="Your role cannot bulk-edit candidates.")
    ids = _cap_bulk_ids(body.ids or [])
    if not ids:
        return {"updated": 0}
    if body.status is not None and body.status not in PIPELINE_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {body.status}")
    if body.status is not None and not me.can("stage") and not me.can("admin"):
        raise HTTPException(status_code=403, detail="Your role cannot change pipeline stage.")
    if me.masks_pii:
        raise HTTPException(status_code=403, detail="Bulk edit is not available while PII is masked for your role.")

    result = await db.execute(select(Candidate).where(Candidate.id.in_(ids)))
    rows = [c for c in result.scalars().all() if not me.sees_assigned_only or c.owner_id == me.user.id]
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    role_name = body.roleName
    if body.roleId and not role_name:
        role = await db.get(HiringRole, body.roleId)
        role_name = role.name if role else body.roleId

    for c in rows:
        if body.status is not None:
            c.status = body.status
        if body.roleId is not None:
            c.role_id = body.roleId
            c.role_name = role_name or c.role_name
        if body.city is not None:
            c.city = body.city or None
        if body.source is not None:
            c.source = body.source or None
        if body.gender is not None:
            c.gender = body.gender or None
        if body.starred is not None:
            c.starred = body.starred
        if body.dnc is not None:
            c.dnc = body.dnc
        if body.hasWorkExperience is not None:
            c.has_work_experience = body.hasWorkExperience or None
        if body.experienceDuration is not None:
            c.experience_duration = body.experienceDuration or None
        if body.noticeDays is not None:
            c.notice_days = body.noticeDays
        if body.availability is not None:
            c.availability = body.availability or None
        if body.tagsAdd or body.tagsRemove:
            tags = list(c.tags or [])
            if body.tagsRemove:
                remove = set(body.tagsRemove)
                tags = [t for t in tags if t not in remove]
            if body.tagsAdd:
                for t in body.tagsAdd:
                    if t and t not in tags:
                        tags.append(t)
            c.tags = tags
        if body.notesAppend:
            existing = (c.notes or "").rstrip()
            c.notes = f"{existing}\n{body.notesAppend}".strip() if existing else body.notesAppend
        c.updated_at = now

    await db.commit()
    return {"updated": len(rows)}


@router.post("/candidates/bulk-delete")
async def bulk_delete(
    body: BulkDeleteRequest,
    me: WorkspaceIdentity = Depends(require_cap("admin", "Only admins can delete candidate records.")),
    db: AsyncSession = Depends(get_db),
):
    ids = _cap_bulk_ids(body.ids or [])
    if not ids:
        return {"deleted": 0}
    result = await db.execute(select(Candidate).where(Candidate.id.in_(ids)))
    rows = [c for c in result.scalars().all() if not me.sees_assigned_only or c.owner_id == me.user.id]
    for c in rows:
        await db.delete(c)
    await db.commit()
    return {"deleted": len(rows)}


@router.get("/recruiters")
async def list_recruiters(
    me: WorkspaceIdentity = Depends(require_full_admin),
    db: AsyncSession = Depends(get_db),
):
    """Active Senior Recruiters an admin can hand candidates to."""
    rows = (
        await db.execute(
            select(User)
            .where(User.persona == "p1", User.status != "suspended")
            .order_by(User.first_name, User.email)
        )
    ).scalars().all()
    return [
        {
            "id": u.id,
            "name": " ".join(x for x in [u.first_name, u.last_name] if x).strip() or u.email.split("@")[0],
            "email": u.email,
        }
        for u in rows
    ]


@router.post("/candidates/bulk-assign")
async def bulk_assign(
    body: BulkAssignRequest,
    me: WorkspaceIdentity = Depends(require_full_admin),
    db: AsyncSession = Depends(get_db),
):
    """Assign many candidates to one recruiter in a single request."""
    ids = _cap_bulk_ids(body.ids or [])
    if not ids:
        return {"updated": 0}
    owner = None
    if body.ownerId:
        owner = await db.get(User, body.ownerId)
        if not owner or (owner.status or "active") == "suspended":
            raise HTTPException(status_code=400, detail="That recruiter account is not available.")
        if owner.persona != "p1":
            raise HTTPException(status_code=400, detail="Candidates can only be assigned to a recruiter.")
    rows = (await db.execute(select(Candidate).where(Candidate.id.in_(ids)))).scalars().all()
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for c in rows:
        c.owner_id = owner.id if owner else None
        c.updated_at = now
    await db.commit()
    return {"updated": len(rows), "ownerId": owner.id if owner else None}


@router.post("/candidates/bulk-assign-query")
async def bulk_assign_query(
    body: BulkAssignQuery,
    me: WorkspaceIdentity = Depends(require_full_admin),
    db: AsyncSession = Depends(get_db),
):
    """Assign every candidate that matches the list filters. Capped so a blank filter cannot wipe the book."""
    owner = None
    if body.ownerId:
        owner = await db.get(User, body.ownerId)
        if not owner or (owner.status or "active") == "suspended":
            raise HTTPException(status_code=400, detail="That recruiter account is not available.")
        if owner.persona != "p1":
            raise HTTPException(status_code=400, detail="Candidates can only be assigned to a recruiter.")
    filters = _candidate_filters(
        me,
        search=body.search,
        role_id=body.roleId,
        status=body.status,
        city=body.city,
        source=body.source,
        gender=body.gender,
        experience=body.experience,
        graduation_year=body.graduationYear,
        exp_years=body.expYears,
        ai_match=body.aiMatch,
        starred_only=body.starredOnly,
        has_notes=body.hasNotes,
        has_phone=body.hasPhone,
        has_resume=body.hasResume,
        has_email=body.hasEmail,
        dnc_only=body.dncOnly,
        no_consent=body.noConsent,
        owner=body.owner,
        degree=body.degree,
        company=body.company,
        institute=body.institute,
        english=body.english,
        uploaded_from=body.uploadedFrom,
        uploaded_to=body.uploadedTo,
    )
    count_q = select(func.count()).select_from(Candidate)
    if filters:
        count_q = count_q.where(and_(*filters))
    total = (await db.execute(count_q)).scalar() or 0
    if total > 10000:
        raise HTTPException(
            status_code=400,
            detail=f"{total} candidates match. Narrow the filters below 10,000 before assigning them all.",
        )
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    stmt = update(Candidate).values(owner_id=owner.id if owner else None, updated_at=now)
    if filters:
        stmt = stmt.where(and_(*filters))
    result = await db.execute(stmt)
    await db.commit()
    return {"updated": result.rowcount or total, "ownerId": owner.id if owner else None}


@router.post("/candidates/bulk-import")
async def bulk_import(
    candidates: list[CandidateCreate],
    me: WorkspaceIdentity = Depends(require_cap("create", "Your role cannot import candidates.")),
    db: AsyncSession = Depends(get_db),
):
    """Import many candidates (upsert by id)."""
    if len(candidates) > settings.MAX_BULK_IMPORT:
        raise HTTPException(
            status_code=400,
            detail=f"Too many rows (max {settings.MAX_BULK_IMPORT} per import request).",
        )
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
