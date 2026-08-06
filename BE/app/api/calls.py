"""
Basic call log + dialer queue APIs.

Users place calls manually via the device dialer; outcomes are logged here.
Advanced telephony / auto call-log capture can be layered later.
"""

from __future__ import annotations

import math
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.hiring import Candidate, CallLog, CALL_DISPOSITIONS
from app.models.user import User
from app.services.auth import get_admin_user, get_current_user  # noqa: F401
from app.services.personas import WorkspaceIdentity, get_workspace_user, require_cap
from app.schemas.calls import (
    CallLogCreate,
    CallLogUpdate,
    CallLogResponse,
    PaginatedCallLogResponse,
    CallQueueItem,
    PaginatedCallQueueResponse,
    CallDispositionInfo,
    CallStatsResponse,
    DISPOSITION_META,
    validate_disposition,
)

#: Anyone with a workspace persona — see the note on the hiring router.
#: Dialling and logging are gated per-capability below, not by portal role.
router = APIRouter(
    prefix="/api/calls",
    tags=["calls"],
    dependencies=[Depends(get_workspace_user)],
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _iso(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


def call_to_response(c: CallLog) -> CallLogResponse:
    return CallLogResponse(
        id=c.id,
        candidateId=c.candidate_id,
        candidateName=c.candidate_name,
        candidatePhone=c.candidate_phone,
        roleId=c.role_id,
        roleName=c.role_name,
        userId=c.user_id,
        userEmail=c.user_email,
        disposition=c.disposition,
        note=c.note or "",
        durationSeconds=c.duration_seconds,
        durationEstimated=bool(c.duration_estimated),
        callbackAt=_iso(c.callback_at),
        nextAction=c.next_action,
        calledAt=_iso(c.called_at),
        createdAt=_iso(c.created_at),
        updatedAt=_iso(c.updated_at),
    )


@router.get("/dispositions", response_model=list[CallDispositionInfo])
async def list_dispositions():
    return [CallDispositionInfo(**m) for m in DISPOSITION_META]


@router.get("/stats", response_model=CallStatsResponse)
async def call_stats(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    now = _utcnow()
    start_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    total = (await db.execute(select(func.count()).select_from(CallLog))).scalar() or 0
    today = (
        await db.execute(
            select(func.count()).select_from(CallLog).where(CallLog.called_at >= start_today)
        )
    ).scalar() or 0
    by_rows = (
        await db.execute(select(CallLog.disposition, func.count()).group_by(CallLog.disposition))
    ).all()
    by_disp = {d: n for d, n in by_rows}
    callbacks_due = (
        await db.execute(
            select(func.count())
            .select_from(CallLog)
            .where(
                and_(
                    CallLog.callback_at.is_not(None),
                    CallLog.callback_at <= now + timedelta(days=1),
                    CallLog.disposition == "connected_callback",
                )
            )
        )
    ).scalar() or 0
    return CallStatsResponse(
        todayCount=today,
        totalCount=total,
        byDisposition=by_disp,
        callbacksDue=callbacks_due,
    )


@router.get("/queue", response_model=PaginatedCallQueueResponse)
async def call_queue(
    role_id: str | None = Query(None, alias="roleId"),
    status: str | None = None,
    search: str | None = None,
    has_phone: bool = Query(True, alias="hasPhone"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200, alias="pageSize"),
    db: AsyncSession = Depends(get_db),
):
    """Candidates ready to call (have phone). Sorted by least-recently called."""
    q = select(Candidate)
    filters = []
    if has_phone:
        filters.append(and_(Candidate.phone.is_not(None), Candidate.phone != ""))
    if role_id and role_id != "all":
        filters.append(Candidate.role_id == role_id)
    if status and status != "all":
        filters.append(Candidate.status == status)
    else:
        # default: active pipeline stages
        filters.append(
            Candidate.status.in_(
                ["new", "reviewing", "shortlisted", "interview", "on_hold"]
            )
        )
    if search:
        term = f"%{search.strip()}%"
        filters.append(
            or_(
                Candidate.name.ilike(term),
                Candidate.phone.ilike(term),
                Candidate.email.ilike(term),
                Candidate.city.ilike(term),
            )
        )
    if filters:
        q = q.where(and_(*filters))

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    q = q.order_by(Candidate.updated_at.desc().nullslast()).offset((page - 1) * page_size).limit(page_size)
    candidates = (await db.execute(q)).scalars().all()

    # last call per candidate (batch)
    ids = [c.id for c in candidates]
    last_map: dict[str, CallLog] = {}
    if ids:
        # simple approach: load recent logs for these ids
        logs = (
            await db.execute(
                select(CallLog)
                .where(CallLog.candidate_id.in_(ids))
                .order_by(CallLog.called_at.desc())
            )
        ).scalars().all()
        for log in logs:
            if log.candidate_id not in last_map:
                last_map[log.candidate_id] = log

    items = [
        CallQueueItem(
            candidateId=c.id,
            name=c.name,
            phone=c.phone,
            email=c.email,
            city=c.city,
            roleId=c.role_id,
            roleName=c.role_name or "",
            status=c.status or "new",
            notes=(c.notes or "")[:400],
            lastDisposition=last_map[c.id].disposition if c.id in last_map else None,
            lastCalledAt=_iso(last_map[c.id].called_at) if c.id in last_map else None,
            starred=bool(c.starred),
        )
        for c in candidates
    ]
    pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedCallQueueResponse(
        items=items, total=total, page=page, pageSize=page_size, totalPages=pages
    )


@router.get("", response_model=PaginatedCallLogResponse)
async def list_calls(
    candidate_id: str | None = Query(None, alias="candidateId"),
    disposition: str | None = None,
    role_id: str | None = Query(None, alias="roleId"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200, alias="pageSize"),
    db: AsyncSession = Depends(get_db),
):
    q = select(CallLog)
    filters = []
    if candidate_id:
        filters.append(CallLog.candidate_id == candidate_id)
    if disposition and disposition != "all":
        filters.append(CallLog.disposition == disposition)
    if role_id and role_id != "all":
        filters.append(CallLog.role_id == role_id)
    if filters:
        q = q.where(and_(*filters))
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    q = q.order_by(CallLog.called_at.desc()).offset((page - 1) * page_size).limit(page_size)
    rows = (await db.execute(q)).scalars().all()
    pages = max(1, math.ceil(total / page_size)) if total else 1
    return PaginatedCallLogResponse(
        items=[call_to_response(r) for r in rows],
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=pages,
    )


@router.get("/{call_id}", response_model=CallLogResponse)
async def get_call(call_id: str, db: AsyncSession = Depends(get_db)):
    c = await db.get(CallLog, call_id)
    if not c:
        raise HTTPException(status_code=404, detail="Call log not found")
    return call_to_response(c)


@router.post("", response_model=CallLogResponse, status_code=201)
async def create_call(
    body: CallLogCreate,
    me: WorkspaceIdentity = Depends(require_cap("log", "Your role cannot log calls.")),
    db: AsyncSession = Depends(get_db),
):
    if not validate_disposition(body.disposition):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid disposition. Allowed: {', '.join(CALL_DISPOSITIONS)}",
        )
    cand = await db.get(Candidate, body.candidateId)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    now = _utcnow()
    entry = CallLog(
        id=f"call_{uuid.uuid4().hex[:16]}",
        candidate_id=cand.id,
        candidate_name=body.candidateName or cand.name,
        candidate_phone=body.candidatePhone or cand.phone,
        role_id=body.roleId or cand.role_id,
        role_name=body.roleName or cand.role_name,
        user_id=me.user.id,
        user_email=me.user.email,
        disposition=body.disposition,
        note=body.note or "",
        duration_seconds=body.durationSeconds,
        duration_estimated=body.durationEstimated,
        callback_at=body.callbackAt,
        next_action=body.nextAction,
        called_at=body.calledAt or now,
        created_at=now,
        updated_at=now,
    )
    db.add(entry)

    # light side-effects on candidate
    note_line = f"[{now.isoformat(sep=' ', timespec='minutes')}] Call: {body.disposition}"
    if body.note:
        note_line += f" — {body.note}"
    cand.notes = ((cand.notes or "").rstrip() + "\n" + note_line).strip()
    cand.updated_at = now
    if body.disposition == "do_not_call":
        tags = list(cand.tags or [])
        if "dnc" not in tags:
            tags.append("dnc")
        cand.tags = tags
    if body.disposition in ("screening_passed", "connected_interested") and cand.status in (
        "new",
        "reviewing",
    ):
        cand.status = "shortlisted"
    if body.disposition in ("screening_failed", "connected_not_interested"):
        # do not auto-reject; leave status, just log
        pass

    await db.commit()
    await db.refresh(entry)
    return call_to_response(entry)


@router.patch("/{call_id}", response_model=CallLogResponse)
async def update_call(
    call_id: str,
    body: CallLogUpdate,
    db: AsyncSession = Depends(get_db),
):
    c = await db.get(CallLog, call_id)
    if not c:
        raise HTTPException(status_code=404, detail="Call log not found")
    data = body.model_dump(exclude_unset=True)
    if "disposition" in data and data["disposition"] is not None:
        if not validate_disposition(data["disposition"]):
            raise HTTPException(status_code=400, detail="Invalid disposition")
        c.disposition = data["disposition"]
    if "note" in data and data["note"] is not None:
        c.note = data["note"]
    if "durationSeconds" in data:
        c.duration_seconds = data["durationSeconds"]
    if "durationEstimated" in data and data["durationEstimated"] is not None:
        c.duration_estimated = data["durationEstimated"]
    if "callbackAt" in data:
        c.callback_at = data["callbackAt"]
    if "nextAction" in data:
        c.next_action = data["nextAction"]
    c.updated_at = _utcnow()
    await db.commit()
    await db.refresh(c)
    return call_to_response(c)


@router.delete("/{call_id}", status_code=204)
async def delete_call(call_id: str, db: AsyncSession = Depends(get_db)):
    c = await db.get(CallLog, call_id)
    if not c:
        raise HTTPException(status_code=404, detail="Call log not found")
    await db.delete(c)
    await db.commit()
