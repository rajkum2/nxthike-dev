"""
Recruiting API for the TalentDialer web workspace.

Additive by design. The existing `/api/hiring/*` and `/api/calls/*` routes keep
their exact behaviour and admin gate; these endpoints sit alongside them and add
the requisition, client, submission, interview, offer and approval surfaces the
web design needs.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.workspace import record_audit
from app.database import get_db
from app.models.company import Company
from app.models.hiring import Candidate, HiringRole
from app.models.recruiting import (
    Approval,
    CandidateNote,
    Interview,
    MessageTemplate,
    Offer,
    SavedSearch,
    Scorecard,
    Submission,
    Tag,
)
from app.services.personas import (
    WorkspaceIdentity,
    apply_pii_policy,
    get_workspace_user,
    require_cap,
)

router = APIRouter(prefix="/api/workspace", tags=["recruiting"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _iso(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


# ===========================================================================
# Requisitions  (HiringRole, with the requisition columns)
# ===========================================================================


class RequisitionOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    clientId: str | None = None
    clientName: str | None = None
    department: str | None = None
    priority: str = "P2"
    openings: int = 1
    filled: int = 0
    slaDue: str | None = None
    slaLabel: str | None = None
    slaBreached: bool = False
    compMin: float | None = None
    compMax: float | None = None
    compLabel: str | None = None
    #: Only present for roles with the `rates` capability.
    billRate: str | None = None
    payRate: str | None = None
    ownerId: str | None = None
    location: str | None = None
    skills: list[str] = []
    status: str = "open"
    isActive: bool = True
    pipelineTotal: int = 0
    byStage: dict = {}


def _sla_fields(row: HiringRole) -> tuple[str | None, bool]:
    if not row.sla_due:
        return None, False
    delta = row.sla_due - _utcnow()
    days = delta.days
    if days < 0:
        return f"{abs(days)}d overdue", True
    return f"{days}d left", days <= 3


def _comp_label(row: HiringRole) -> str | None:
    if row.comp_min and row.comp_max:
        return f"₹{row.comp_min:g}–{row.comp_max:g} LPA"
    if row.comp_min:
        return f"₹{row.comp_min:g} LPA +"
    return None


def _req_out(
    row: HiringRole, me: WorkspaceIdentity, client_name: str | None = None,
    total: int = 0, by_stage: dict | None = None,
) -> RequisitionOut:
    sla_label, breached = _sla_fields(row)
    out = RequisitionOut(
        id=row.id, title=row.name, description=row.description,
        clientId=row.client_id, clientName=client_name, department=row.department,
        priority=row.priority or "P2", openings=row.openings or 1, filled=row.filled or 0,
        slaDue=_iso(row.sla_due), slaLabel=sla_label, slaBreached=breached,
        compMin=row.comp_min, compMax=row.comp_max, compLabel=_comp_label(row),
        ownerId=row.owner_id, location=row.location, skills=list(row.skills or []),
        status=row.status or "open", isActive=bool(row.is_active),
        pipelineTotal=total, byStage=by_stage or {},
    )
    # Commercials are role-gated: withheld at the API, not hidden in the UI.
    if me.sees_rates:
        out.billRate = row.bill_rate
        out.payRate = row.pay_rate
    return out


@router.get("/requisitions", response_model=list[RequisitionOut])
async def list_requisitions(
    include_counts: bool = Query(True, alias="includeCounts"),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    if me.caps.get("reqs") == "none":
        return []

    rows = (await db.execute(select(HiringRole).order_by(HiringRole.sort_order, HiringRole.name))).scalars().all()

    # A hiring manager sees only their own openings.
    if me.caps.get("reqs") == "own":
        rows = [r for r in rows if r.owner_id in (None, me.user.id)]

    names: dict[str, str] = {}
    client_ids = {r.client_id for r in rows if r.client_id}
    if client_ids:
        companies = (await db.execute(select(Company).where(Company.id.in_(client_ids)))).scalars().all()
        names = {c.id: c.name for c in companies}

    counts: dict[str, dict] = {}
    if include_counts and rows:
        stage_rows = (
            await db.execute(
                select(Candidate.role_id, Candidate.status, func.count())
                .where(Candidate.role_id.in_([r.id for r in rows]))
                .group_by(Candidate.role_id, Candidate.status)
            )
        ).all()
        for role_id, status_val, n in stage_rows:
            bucket = counts.setdefault(role_id, {"_total": 0})
            bucket[status_val] = n
            bucket["_total"] += n

    out = []
    for r in rows:
        bucket = counts.get(r.id, {})
        total = bucket.get("_total", 0)
        by_stage = {k: v for k, v in bucket.items() if k != "_total"}
        out.append(_req_out(r, me, names.get(r.client_id or ""), total, by_stage))
    return out


@router.get("/requisitions/{req_id}", response_model=RequisitionOut)
async def read_requisition(
    req_id: str,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    row = await db.get(HiringRole, req_id)
    if not row:
        raise HTTPException(status_code=404, detail="Requisition not found")

    client_name = None
    if row.client_id:
        c = await db.get(Company, row.client_id)
        client_name = c.name if c else None

    stage_rows = (
        await db.execute(
            select(Candidate.status, func.count())
            .where(Candidate.role_id == row.id)
            .group_by(Candidate.status)
        )
    ).all()
    by_stage = {s: n for s, n in stage_rows}
    return _req_out(row, me, client_name, sum(by_stage.values()), by_stage)


class RequisitionWrite(BaseModel):
    id: str | None = None
    title: str
    description: str | None = None
    clientId: str | None = None
    department: str | None = None
    priority: str = "P2"
    openings: int = 1
    slaDue: datetime | None = None
    compMin: float | None = None
    compMax: float | None = None
    billRate: str | None = None
    payRate: str | None = None
    location: str | None = None
    skills: list[str] = []
    status: str = "open"


@router.post("/requisitions", response_model=RequisitionOut, status_code=201)
async def create_requisition(
    body: RequisitionWrite,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    if me.caps.get("reqs") not in ("all", "own"):
        raise HTTPException(status_code=403, detail="Your role cannot create requisitions.")

    slug = (body.id or body.title).lower()
    slug = "".join(ch if ch.isalnum() else "_" for ch in slug).strip("_") or "requisition"
    if await db.get(HiringRole, slug):
        slug = f"{slug}_{_utcnow().strftime('%H%M%S')}"

    row = HiringRole(
        id=slug, name=body.title, description=body.description,
        client_id=body.clientId, department=body.department, priority=body.priority,
        openings=body.openings, sla_due=body.slaDue, comp_min=body.compMin, comp_max=body.compMax,
        location=body.location, skills=body.skills, status=body.status,
        owner_id=me.user.id,
    )
    # Rates are only accepted from a role entitled to see them.
    if me.sees_rates:
        row.bill_rate = body.billRate
        row.pay_rate = body.payRate

    db.add(row)
    await record_audit(db, me, "created requisition", "requisition", row.id, row.name)
    await db.commit()
    await db.refresh(row)
    return _req_out(row, me)


@router.patch("/requisitions/{req_id}", response_model=RequisitionOut)
async def update_requisition(
    req_id: str,
    body: RequisitionWrite,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    if me.caps.get("reqs") != "all" and me.caps.get("reqs") != "own":
        raise HTTPException(status_code=403, detail="Your role cannot edit requisitions.")
    row = await db.get(HiringRole, req_id)
    if not row:
        raise HTTPException(status_code=404, detail="Requisition not found")

    data = body.model_dump(exclude_unset=True)
    mapping = {
        "title": "name", "description": "description", "clientId": "client_id",
        "department": "department", "priority": "priority", "openings": "openings",
        "slaDue": "sla_due", "compMin": "comp_min", "compMax": "comp_max",
        "location": "location", "skills": "skills", "status": "status",
    }
    for key, attr in mapping.items():
        if key in data and data[key] is not None:
            setattr(row, attr, data[key])
    if me.sees_rates:
        for key, attr in (("billRate", "bill_rate"), ("payRate", "pay_rate")):
            if key in data:
                setattr(row, attr, data[key])

    await record_audit(db, me, "updated requisition", "requisition", row.id, row.name, data)
    await db.commit()
    await db.refresh(row)
    return _req_out(row, me)


# ===========================================================================
# Clients
# ===========================================================================


class ClientOut(BaseModel):
    id: str
    name: str
    industry: str | None = None
    location: str | None = None
    health: str = "good"
    #: Only for roles with the `rates` capability.
    marginPct: float | None = None
    terms: str | None = None
    contacts: list = []
    openRequisitions: int = 0
    submissions: int = 0
    placements: int = 0
    website: str | None = None
    logo: str | None = None


@router.get("/clients", response_model=list[ClientOut])
async def list_clients(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (await db.execute(select(Company).order_by(Company.name))).scalars().all()

    req_counts = dict(
        (
            await db.execute(
                select(HiringRole.client_id, func.count())
                .where(HiringRole.client_id.is_not(None))
                .group_by(HiringRole.client_id)
            )
        ).all()
    )
    sub_counts = dict(
        (
            await db.execute(
                select(Submission.client_id, func.count())
                .where(Submission.client_id.is_not(None))
                .group_by(Submission.client_id)
            )
        ).all()
    )
    placed_counts = dict(
        (
            await db.execute(
                select(Submission.client_id, func.count())
                .where(and_(Submission.client_id.is_not(None), Submission.status == "placed"))
                .group_by(Submission.client_id)
            )
        ).all()
    )

    out = []
    for c in rows:
        item = ClientOut(
            id=c.id, name=c.name, industry=c.industry, location=c.location,
            health=getattr(c, "health", "good") or "good",
            terms=getattr(c, "terms", None), contacts=list(getattr(c, "contacts", None) or []),
            openRequisitions=req_counts.get(c.id, 0),
            submissions=sub_counts.get(c.id, 0),
            placements=placed_counts.get(c.id, 0),
            website=c.website, logo=c.logo,
        )
        if me.sees_rates:
            item.marginPct = getattr(c, "margin_pct", None)
        out.append(item)
    return out


@router.get("/clients/{client_id}", response_model=ClientOut)
async def read_client(
    client_id: str,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    c = await db.get(Company, client_id)
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")
    reqs = (
        await db.execute(select(func.count()).select_from(HiringRole).where(HiringRole.client_id == c.id))
    ).scalar() or 0
    subs = (
        await db.execute(select(func.count()).select_from(Submission).where(Submission.client_id == c.id))
    ).scalar() or 0
    placed = (
        await db.execute(
            select(func.count()).select_from(Submission).where(
                and_(Submission.client_id == c.id, Submission.status == "placed")
            )
        )
    ).scalar() or 0

    item = ClientOut(
        id=c.id, name=c.name, industry=c.industry, location=c.location,
        health=getattr(c, "health", "good") or "good", terms=getattr(c, "terms", None),
        contacts=list(getattr(c, "contacts", None) or []),
        openRequisitions=reqs, submissions=subs, placements=placed,
        website=c.website, logo=c.logo,
    )
    if me.sees_rates:
        item.marginPct = getattr(c, "margin_pct", None)
    return item


class ClientPatch(BaseModel):
    health: str | None = None
    marginPct: float | None = None
    terms: str | None = None
    contacts: list | None = None
    isClient: bool | None = None
    ownerId: str | None = None


@router.patch("/clients/{client_id}", response_model=ClientOut)
async def patch_client(
    client_id: str,
    body: ClientPatch,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    if me.caps.get("reqs") != "all":
        raise HTTPException(status_code=403, detail="Your role cannot edit client accounts.")
    c = await db.get(Company, client_id)
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")

    data = body.model_dump(exclude_unset=True)
    if "health" in data and data["health"] not in (None, "good", "watch", "risk"):
        raise HTTPException(status_code=400, detail="Unknown health value")
    for key, attr in (("health", "health"), ("terms", "terms"), ("contacts", "contacts"),
                      ("isClient", "is_client"), ("ownerId", "owner_id")):
        if key in data and data[key] is not None:
            setattr(c, attr, data[key])
    if "marginPct" in data and me.sees_rates:
        c.margin_pct = data["marginPct"]

    await record_audit(db, me, "updated client", "client", c.id, c.name, data)
    await db.commit()
    await db.refresh(c)
    return await read_client(client_id, me, db)


# ===========================================================================
# Submissions
# ===========================================================================


class SubmissionOut(BaseModel):
    id: str
    candidateId: str
    candidateName: str | None = None
    requisitionId: str | None = None
    requisitionName: str | None = None
    clientId: str | None = None
    clientName: str | None = None
    status: str
    submittedCtc: float | None = None
    note: str = ""
    submittedByName: str | None = None
    submittedAt: str | None = None


def _sub_out(s: Submission) -> SubmissionOut:
    return SubmissionOut(
        id=s.id, candidateId=s.candidate_id, candidateName=s.candidate_name,
        requisitionId=s.requisition_id, requisitionName=s.requisition_name,
        clientId=s.client_id, clientName=s.client_name, status=s.status,
        submittedCtc=s.submitted_ctc, note=s.note or "",
        submittedByName=s.submitted_by_name, submittedAt=_iso(s.submitted_at),
    )


@router.get("/submissions", response_model=list[SubmissionOut])
async def list_submissions(
    client_id: str | None = Query(None, alias="clientId"),
    requisition_id: str | None = Query(None, alias="requisitionId"),
    candidate_id: str | None = Query(None, alias="candidateId"),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Submission)
    filters = []
    if client_id:
        filters.append(Submission.client_id == client_id)
    if requisition_id:
        filters.append(Submission.requisition_id == requisition_id)
    if candidate_id:
        filters.append(Submission.candidate_id == candidate_id)
    if filters:
        q = q.where(and_(*filters))
    rows = (await db.execute(q.order_by(Submission.submitted_at.desc()).limit(200))).scalars().all()
    return [_sub_out(s) for s in rows]


class SubmissionCreate(BaseModel):
    candidateId: str
    requisitionId: str | None = None
    clientId: str | None = None
    submittedCtc: float | None = None
    note: str = ""


@router.post("/submissions", response_model=SubmissionOut, status_code=201)
async def create_submission(
    body: SubmissionCreate,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    cand = await db.get(Candidate, body.candidateId)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    req = await db.get(HiringRole, body.requisitionId or cand.role_id)
    client_id = body.clientId or (req.client_id if req else None)
    client = await db.get(Company, client_id) if client_id else None

    s = Submission(
        candidate_id=cand.id, candidate_name=cand.name,
        requisition_id=req.id if req else None, requisition_name=req.name if req else None,
        client_id=client.id if client else None, client_name=client.name if client else None,
        submitted_ctc=body.submittedCtc, note=body.note,
        submitted_by=me.user.id, submitted_by_name=me.name,
    )
    db.add(s)

    # Submitting is a stage move; keep the pipeline honest.
    if cand.status in ("new", "reviewing"):
        cand.status = "shortlisted"

    await record_audit(db, me, "submitted candidate", "candidate", cand.id, cand.name,
                       {"requisition": s.requisition_name, "client": s.client_name})
    await db.commit()
    await db.refresh(s)
    return _sub_out(s)


class SubmissionPatch(BaseModel):
    status: str | None = None
    note: str | None = None


@router.patch("/submissions/{sub_id}", response_model=SubmissionOut)
async def patch_submission(
    sub_id: str,
    body: SubmissionPatch,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    s = await db.get(Submission, sub_id)
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    data = body.model_dump(exclude_unset=True)
    if data.get("status"):
        s.status = data["status"]
    if data.get("note") is not None:
        s.note = data["note"]
    await db.commit()
    await db.refresh(s)
    return _sub_out(s)


# ===========================================================================
# Interviews & scorecards
# ===========================================================================


class InterviewOut(BaseModel):
    id: str
    candidateId: str
    candidateName: str | None = None
    requisitionId: str | None = None
    requisitionName: str | None = None
    kind: str
    roundLabel: str | None = None
    scheduledAt: str | None = None
    durationMinutes: int = 45
    mode: str | None = None
    location: str | None = None
    panel: list = []
    status: str
    hasScorecard: bool = False


def _int_out(i: Interview, has_scorecard: bool = False) -> InterviewOut:
    return InterviewOut(
        id=i.id, candidateId=i.candidate_id, candidateName=i.candidate_name,
        requisitionId=i.requisition_id, requisitionName=i.requisition_name,
        kind=i.kind, roundLabel=i.round_label, scheduledAt=_iso(i.scheduled_at),
        durationMinutes=i.duration_minutes or 45, mode=i.mode, location=i.location,
        panel=list(i.panel or []), status=i.status, hasScorecard=has_scorecard,
    )


@router.get("/interviews", response_model=list[InterviewOut])
async def list_interviews(
    candidate_id: str | None = Query(None, alias="candidateId"),
    mine: bool = False,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Interview)
    if candidate_id:
        q = q.where(Interview.candidate_id == candidate_id)
    rows = (await db.execute(q.order_by(Interview.scheduled_at.asc().nullslast()).limit(200))).scalars().all()

    # A panellist sees only the interviews they are on.
    if mine or me.caps.get("db") == "ownInterviews":
        rows = [
            i for i in rows
            if any((p or {}).get("id") == me.user.id or (p or {}).get("email") == me.user.email
                   for p in (i.panel or []))
        ]

    scored = set()
    if rows:
        scored = {
            r[0]
            for r in (
                await db.execute(
                    select(Scorecard.interview_id).where(
                        and_(
                            Scorecard.interview_id.in_([i.id for i in rows]),
                            Scorecard.panellist_id == me.user.id,
                        )
                    )
                )
            ).all()
        }
    return [_int_out(i, i.id in scored) for i in rows]


class InterviewCreate(BaseModel):
    candidateId: str
    requisitionId: str | None = None
    kind: str = "technical"
    roundLabel: str | None = None
    scheduledAt: datetime | None = None
    durationMinutes: int = 45
    mode: str | None = None
    location: str | None = None
    panel: list = []


@router.post("/interviews", response_model=InterviewOut, status_code=201)
async def create_interview(
    body: InterviewCreate,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    cand = await db.get(Candidate, body.candidateId)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    req = await db.get(HiringRole, body.requisitionId or cand.role_id)

    i = Interview(
        candidate_id=cand.id, candidate_name=cand.name,
        requisition_id=req.id if req else None, requisition_name=req.name if req else None,
        kind=body.kind, round_label=body.roundLabel, scheduled_at=body.scheduledAt,
        duration_minutes=body.durationMinutes, mode=body.mode, location=body.location,
        panel=body.panel, created_by=me.user.id,
    )
    db.add(i)
    if cand.status in ("new", "reviewing", "shortlisted"):
        cand.status = "interview"
    await record_audit(db, me, "scheduled interview", "candidate", cand.id, cand.name,
                       {"kind": body.kind, "at": _iso(body.scheduledAt)})
    await db.commit()
    await db.refresh(i)
    return _int_out(i)


class InterviewPatch(BaseModel):
    status: str | None = None
    scheduledAt: datetime | None = None
    mode: str | None = None
    location: str | None = None
    panel: list | None = None


@router.patch("/interviews/{interview_id}", response_model=InterviewOut)
async def patch_interview(
    interview_id: str,
    body: InterviewPatch,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    i = await db.get(Interview, interview_id)
    if not i:
        raise HTTPException(status_code=404, detail="Interview not found")
    data = body.model_dump(exclude_unset=True)
    for key, attr in (("status", "status"), ("scheduledAt", "scheduled_at"), ("mode", "mode"),
                      ("location", "location"), ("panel", "panel")):
        if key in data and data[key] is not None:
            setattr(i, attr, data[key])
    await db.commit()
    await db.refresh(i)
    return _int_out(i)


class ScorecardOut(BaseModel):
    id: str
    interviewId: str | None = None
    candidateId: str
    panellistId: str | None = None
    panellistName: str | None = None
    scores: dict = {}
    recommendation: str | None = None
    evidence: str = ""
    isDraft: bool = False
    createdAt: str | None = None


def _score_out(s: Scorecard) -> ScorecardOut:
    return ScorecardOut(
        id=s.id, interviewId=s.interview_id, candidateId=s.candidate_id,
        panellistId=s.panellist_id, panellistName=s.panellist_name,
        scores=dict(s.scores or {}), recommendation=s.recommendation,
        evidence=s.evidence or "", isDraft=bool(s.is_draft), createdAt=_iso(s.created_at),
    )


@router.get("/scorecards", response_model=list[ScorecardOut])
async def list_scorecards(
    candidate_id: str | None = Query(None, alias="candidateId"),
    interview_id: str | None = Query(None, alias="interviewId"),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Scorecard)
    filters = []
    if candidate_id:
        filters.append(Scorecard.candidate_id == candidate_id)
    if interview_id:
        filters.append(Scorecard.interview_id == interview_id)
    if filters:
        q = q.where(and_(*filters))
    rows = (await db.execute(q.order_by(Scorecard.created_at.desc()).limit(200))).scalars().all()
    return [_score_out(s) for s in rows]


class ScorecardWrite(BaseModel):
    candidateId: str
    interviewId: str | None = None
    scores: dict = {}
    recommendation: str | None = None
    evidence: str = ""
    isDraft: bool = False


@router.post("/scorecards", response_model=ScorecardOut, status_code=201)
async def submit_scorecard(
    body: ScorecardWrite,
    me: WorkspaceIdentity = Depends(require_cap("score", "Your role cannot submit scorecards.")),
    db: AsyncSession = Depends(get_db),
):
    cand = await db.get(Candidate, body.candidateId)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    s = Scorecard(
        interview_id=body.interviewId, candidate_id=cand.id,
        panellist_id=me.user.id, panellist_name=me.name,
        scores=body.scores, recommendation=body.recommendation,
        evidence=body.evidence, is_draft=body.isDraft,
    )
    db.add(s)

    # A submitted recommendation moves the pipeline; a draft does not.
    if not body.isDraft and body.recommendation:
        if body.recommendation in ("strong_hire", "hire"):
            cand.status = "offer"
        elif body.recommendation == "strong_no":
            cand.status = "rejected"
        await record_audit(db, me, f"submitted scorecard · {body.recommendation}",
                           "candidate", cand.id, cand.name)

    await db.commit()
    await db.refresh(s)
    return _score_out(s)


# ===========================================================================
# Offers & approvals
# ===========================================================================


class OfferOut(BaseModel):
    id: str
    reference: str | None = None
    candidateId: str
    candidateName: str | None = None
    requisitionId: str | None = None
    requisitionName: str | None = None
    clientId: str | None = None
    clientName: str | None = None
    status: str
    ctcTotal: float | None = None
    breakup: list = []
    bandNote: str | None = None
    joiningDate: str | None = None
    expiresAt: str | None = None
    noticeDays: int | None = None
    buyoutCost: float | None = None
    letterBody: str | None = None
    letterSentAt: str | None = None
    signedAt: str | None = None
    createdAt: str | None = None
    approvals: list = []


def _offer_out(o: Offer, approvals: list[Approval] | None = None) -> OfferOut:
    return OfferOut(
        id=o.id, reference=o.reference, candidateId=o.candidate_id, candidateName=o.candidate_name,
        requisitionId=o.requisition_id, requisitionName=o.requisition_name,
        clientId=o.client_id, clientName=o.client_name, status=o.status,
        ctcTotal=o.ctc_total, breakup=list(o.breakup or []), bandNote=o.band_note,
        joiningDate=_iso(o.joining_date), expiresAt=_iso(o.expires_at),
        noticeDays=o.notice_days, buyoutCost=o.buyout_cost,
        letterBody=o.letter_body, letterSentAt=_iso(o.letter_sent_at), signedAt=_iso(o.signed_at),
        createdAt=_iso(o.created_at),
        approvals=[
            {
                "id": a.id, "approverName": a.approver_name, "approverRole": a.approver_role,
                "status": a.status, "comment": a.comment, "sequence": a.sequence,
                "decidedAt": _iso(a.decided_at),
            }
            for a in sorted(approvals or [], key=lambda x: x.sequence)
        ],
    )


@router.get("/offers", response_model=list[OfferOut])
async def list_offers(
    status_filter: str | None = Query(None, alias="status"),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Offer)
    if status_filter and status_filter != "all":
        q = q.where(Offer.status == status_filter)
    rows = (await db.execute(q.order_by(Offer.created_at.desc()).limit(200))).scalars().all()
    if not rows:
        return []
    chains = (
        await db.execute(
            select(Approval).where(
                and_(Approval.kind == "offer", Approval.ref_id.in_([o.id for o in rows]))
            )
        )
    ).scalars().all()
    by_ref: dict[str, list[Approval]] = {}
    for a in chains:
        by_ref.setdefault(a.ref_id, []).append(a)
    return [_offer_out(o, by_ref.get(o.id)) for o in rows]


@router.get("/offers/{offer_id}", response_model=OfferOut)
async def read_offer(
    offer_id: str,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    o = await db.get(Offer, offer_id)
    if not o:
        raise HTTPException(status_code=404, detail="Offer not found")
    chain = (
        await db.execute(
            select(Approval).where(and_(Approval.kind == "offer", Approval.ref_id == o.id))
        )
    ).scalars().all()
    return _offer_out(o, chain)


class OfferCreate(BaseModel):
    candidateId: str
    requisitionId: str | None = None
    ctcTotal: float | None = None
    breakup: list = []
    bandNote: str | None = None
    joiningDate: datetime | None = None
    expiresAt: datetime | None = None
    noticeDays: int | None = None
    buyoutCost: float | None = None
    #: [{approverId, approverName, approverRole}] in decision order.
    approvers: list = []


@router.post("/offers", response_model=OfferOut, status_code=201)
async def create_offer(
    body: OfferCreate,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    if me.caps.get("reqs") == "none" and not me.can("approve"):
        raise HTTPException(status_code=403, detail="Your role cannot raise offers.")

    cand = await db.get(Candidate, body.candidateId)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    req = await db.get(HiringRole, body.requisitionId or cand.role_id)
    client = await db.get(Company, req.client_id) if req and req.client_id else None

    seq = (await db.execute(select(func.count()).select_from(Offer))).scalar() or 0
    o = Offer(
        reference=f"OFF-{_utcnow().year}-{seq + 1:04d}",
        candidate_id=cand.id, candidate_name=cand.name,
        requisition_id=req.id if req else None, requisition_name=req.name if req else None,
        client_id=client.id if client else None, client_name=client.name if client else None,
        status="pending_approval" if body.approvers else "draft",
        ctc_total=body.ctcTotal, breakup=body.breakup, band_note=body.bandNote,
        joining_date=body.joiningDate, expires_at=body.expiresAt,
        notice_days=body.noticeDays, buyout_cost=body.buyoutCost,
        created_by=me.user.id,
    )
    db.add(o)
    await db.flush()

    for idx, ap in enumerate(body.approvers or []):
        db.add(
            Approval(
                kind="offer", ref_id=o.id, ref_label=f"Offer · {cand.name}",
                detail=f"{o.requisition_name or ''} · ₹{body.ctcTotal or 0:g} LPA".strip(" ·"),
                requested_by=me.user.id, requested_by_name=me.name,
                approver_id=ap.get("approverId"), approver_name=ap.get("approverName"),
                approver_role=ap.get("approverRole"), sequence=idx,
            )
        )

    cand.status = "offer"
    await record_audit(db, me, "raised offer", "candidate", cand.id, cand.name,
                       {"ctc": body.ctcTotal, "reference": o.reference})
    await db.commit()
    await db.refresh(o)
    return await read_offer(o.id, me, db)


class OfferPatch(BaseModel):
    status: str | None = None
    ctcTotal: float | None = None
    breakup: list | None = None
    joiningDate: datetime | None = None
    expiresAt: datetime | None = None
    letterBody: str | None = None
    markLetterSent: bool | None = None
    markSigned: bool | None = None


@router.patch("/offers/{offer_id}", response_model=OfferOut)
async def patch_offer(
    offer_id: str,
    body: OfferPatch,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    o = await db.get(Offer, offer_id)
    if not o:
        raise HTTPException(status_code=404, detail="Offer not found")

    data = body.model_dump(exclude_unset=True)
    for key, attr in (("status", "status"), ("ctcTotal", "ctc_total"), ("breakup", "breakup"),
                      ("joiningDate", "joining_date"), ("expiresAt", "expires_at"),
                      ("letterBody", "letter_body")):
        if key in data and data[key] is not None:
            setattr(o, attr, data[key])

    if data.get("markLetterSent"):
        o.letter_sent_at = _utcnow()
        if o.status in ("approved", "draft"):
            o.status = "extended"
        await record_audit(db, me, "sent offer letter", "offer", o.id, o.candidate_name)
    if data.get("markSigned"):
        o.signed_at = _utcnow()
        o.status = "accepted"
        await record_audit(db, me, "offer signed", "offer", o.id, o.candidate_name)

    await db.commit()
    return await read_offer(offer_id, me, db)


class ApprovalOut(BaseModel):
    id: str
    kind: str
    refId: str
    refLabel: str | None = None
    detail: str | None = None
    requestedByName: str | None = None
    approverName: str | None = None
    approverRole: str | None = None
    status: str
    comment: str = ""
    createdAt: str | None = None
    decidedAt: str | None = None


def _apr_out(a: Approval) -> ApprovalOut:
    return ApprovalOut(
        id=a.id, kind=a.kind, refId=a.ref_id, refLabel=a.ref_label, detail=a.detail,
        requestedByName=a.requested_by_name, approverName=a.approver_name,
        approverRole=a.approver_role, status=a.status, comment=a.comment or "",
        createdAt=_iso(a.created_at), decidedAt=_iso(a.decided_at),
    )


@router.get("/approvals", response_model=list[ApprovalOut])
async def list_approvals(
    mine: bool = True,
    status_filter: str = Query("pending", alias="status"),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Approval)
    filters = []
    if status_filter != "all":
        filters.append(Approval.status == status_filter)
    if mine and not me.is_admin:
        filters.append(or_(Approval.approver_id == me.user.id, Approval.approver_id.is_(None)))
    if filters:
        q = q.where(and_(*filters))
    rows = (await db.execute(q.order_by(Approval.created_at.desc()).limit(200))).scalars().all()
    return [_apr_out(a) for a in rows]


class ApprovalDecision(BaseModel):
    approve: bool
    comment: str = ""


@router.post("/approvals/{approval_id}/decide", response_model=ApprovalOut)
async def decide_approval(
    approval_id: str,
    body: ApprovalDecision,
    me: WorkspaceIdentity = Depends(require_cap("approve", "Your role cannot approve.")),
    db: AsyncSession = Depends(get_db),
):
    a = await db.get(Approval, approval_id)
    if not a:
        raise HTTPException(status_code=404, detail="Approval not found")
    if a.status != "pending":
        raise HTTPException(status_code=400, detail="This has already been decided.")

    a.status = "approved" if body.approve else "rejected"
    a.comment = body.comment
    a.decided_at = _utcnow()
    if not a.approver_id:
        a.approver_id = me.user.id
        a.approver_name = me.name

    # Roll the decision up to the offer once the chain resolves.
    if a.kind == "offer":
        offer = await db.get(Offer, a.ref_id)
        if offer:
            chain = (
                await db.execute(
                    select(Approval).where(
                        and_(Approval.kind == "offer", Approval.ref_id == offer.id)
                    )
                )
            ).scalars().all()
            if any(x.status == "rejected" for x in chain):
                offer.status = "rejected"
            elif all(x.status == "approved" for x in chain):
                offer.status = "approved"

    await record_audit(db, me, f"{'approved' if body.approve else 'rejected'} {a.kind}",
                       a.kind, a.ref_id, a.ref_label, {"comment": body.comment})
    await db.commit()
    await db.refresh(a)
    return _apr_out(a)


# ===========================================================================
# Candidate notes
# ===========================================================================


class NoteOut(BaseModel):
    id: str
    candidateId: str
    authorName: str | None = None
    body: str
    visibility: str
    createdAt: str | None = None


@router.get("/notes", response_model=list[NoteOut])
async def list_notes(
    candidate_id: str = Query(..., alias="candidateId"),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(
            select(CandidateNote)
            .where(CandidateNote.candidate_id == candidate_id)
            .order_by(CandidateNote.created_at.desc())
        )
    ).scalars().all()
    # A private note belongs to its author alone.
    visible = [n for n in rows if n.visibility == "shared" or n.author_id == me.user.id]
    return [
        NoteOut(id=n.id, candidateId=n.candidate_id, authorName=n.author_name,
                body=n.body, visibility=n.visibility, createdAt=_iso(n.created_at))
        for n in visible
    ]


class NoteCreate(BaseModel):
    candidateId: str
    body: str
    visibility: str = "shared"


@router.post("/notes", response_model=NoteOut, status_code=201)
async def create_note(
    body: NoteCreate,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    if body.visibility not in ("shared", "private"):
        raise HTTPException(status_code=400, detail="Unknown visibility")
    n = CandidateNote(
        candidate_id=body.candidateId, author_id=me.user.id, author_name=me.name,
        body=body.body, visibility=body.visibility,
    )
    db.add(n)
    await db.commit()
    await db.refresh(n)
    return NoteOut(id=n.id, candidateId=n.candidate_id, authorName=n.author_name,
                   body=n.body, visibility=n.visibility, createdAt=_iso(n.created_at))


# ===========================================================================
# Tags, saved searches, templates
# ===========================================================================


class TagOut(BaseModel):
    id: str
    name: str
    kind: str
    color: str | None = None
    description: str | None = None
    count: int = 0


@router.get("/tags", response_model=list[TagOut])
async def list_tags(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (await db.execute(select(Tag).order_by(Tag.name))).scalars().all()
    return [
        TagOut(id=t.id, name=t.name, kind=t.kind, color=t.color, description=t.description)
        for t in rows
    ]


class TagCreate(BaseModel):
    name: str
    kind: str = "list"
    color: str | None = None
    description: str | None = None


@router.post("/tags", response_model=TagOut, status_code=201)
async def create_tag(
    body: TagCreate,
    me: WorkspaceIdentity = Depends(require_cap("create", "Your role cannot create tags.")),
    db: AsyncSession = Depends(get_db),
):
    t = Tag(name=body.name, kind=body.kind, color=body.color,
            description=body.description, created_by=me.user.id)
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return TagOut(id=t.id, name=t.name, kind=t.kind, color=t.color, description=t.description)


class BulkTagRequest(BaseModel):
    candidateIds: list[str]
    add: list[str] = []
    remove: list[str] = []
    #: Optional hand-off — assigns the long-list to a recruiter in one move.
    ownerId: str | None = None


@router.post("/tags/apply")
async def apply_tags(
    body: BulkTagRequest,
    me: WorkspaceIdentity = Depends(require_cap("create", "Your role cannot edit tags.")),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(select(Candidate).where(Candidate.id.in_(body.candidateIds)))
    ).scalars().all()
    for c in rows:
        tags = list(c.tags or [])
        for t in body.add:
            if t not in tags:
                tags.append(t)
        tags = [t for t in tags if t not in body.remove]
        c.tags = tags
        if body.ownerId:
            c.owner_id = body.ownerId
    await record_audit(db, me, "applied tags", "candidate", None,
                       f"{len(rows)} record(s)", {"add": body.add, "remove": body.remove})
    await db.commit()
    return {"updated": len(rows)}


class SavedSearchOut(BaseModel):
    id: str
    name: str
    filters: dict = {}
    shared: bool = False
    ownerName: str | None = None


@router.get("/saved-searches", response_model=list[SavedSearchOut])
async def list_saved_searches(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(
            select(SavedSearch).where(
                or_(SavedSearch.owner_id == me.user.id, SavedSearch.shared.is_(True))
            ).order_by(SavedSearch.created_at.desc())
        )
    ).scalars().all()
    return [
        SavedSearchOut(id=s.id, name=s.name, filters=dict(s.filters or {}),
                       shared=bool(s.shared), ownerName=s.owner_name)
        for s in rows
    ]


class SavedSearchCreate(BaseModel):
    name: str
    filters: dict = {}
    shared: bool = False


@router.post("/saved-searches", response_model=SavedSearchOut, status_code=201)
async def create_saved_search(
    body: SavedSearchCreate,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    s = SavedSearch(name=body.name, filters=body.filters, shared=body.shared,
                    owner_id=me.user.id, owner_name=me.name)
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return SavedSearchOut(id=s.id, name=s.name, filters=dict(s.filters or {}),
                          shared=bool(s.shared), ownerName=s.owner_name)


class TemplateOut(BaseModel):
    id: str
    name: str
    channel: str
    stage: str | None = None
    subject: str | None = None
    body: str
    isActive: bool = True


@router.get("/templates", response_model=list[TemplateOut])
async def list_templates(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(select(MessageTemplate).where(MessageTemplate.is_active.is_(True)).order_by(MessageTemplate.name))
    ).scalars().all()
    return [
        TemplateOut(id=t.id, name=t.name, channel=t.channel, stage=t.stage,
                    subject=t.subject, body=t.body, isActive=bool(t.is_active))
        for t in rows
    ]


class TemplateWrite(BaseModel):
    name: str
    channel: str = "whatsapp"
    stage: str | None = None
    subject: str | None = None
    body: str


@router.post("/templates", response_model=TemplateOut, status_code=201)
async def create_template(
    body: TemplateWrite,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    t = MessageTemplate(name=body.name, channel=body.channel, stage=body.stage,
                        subject=body.subject, body=body.body, created_by=me.user.id)
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return TemplateOut(id=t.id, name=t.name, channel=t.channel, stage=t.stage,
                       subject=t.subject, body=t.body, isActive=True)


@router.patch("/templates/{template_id}", response_model=TemplateOut)
async def update_template(
    template_id: str,
    body: TemplateWrite,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    t = await db.get(MessageTemplate, template_id)
    if not t:
        raise HTTPException(status_code=404, detail="Template not found")
    t.name, t.channel, t.stage = body.name, body.channel, body.stage
    t.subject, t.body = body.subject, body.body
    await db.commit()
    await db.refresh(t)
    return TemplateOut(id=t.id, name=t.name, channel=t.channel, stage=t.stage,
                       subject=t.subject, body=t.body, isActive=bool(t.is_active))
