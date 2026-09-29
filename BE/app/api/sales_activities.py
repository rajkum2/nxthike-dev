"""Phase 2 sales activities: timeline, approve queue, draft outreach."""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.company import Company
from app.models.sales import SalesActivity, SalesContact, SalesOpportunity
from app.schemas.sales import (
    SalesActivityCreate,
    SalesActivityRejectRequest,
    SalesActivityResponse,
    SalesActivityUpdate,
    SalesDraftOutreachRequest,
    SalesMarkSentResponse,
)
from app.services.personas import WorkspaceIdentity, get_workspace_user

logger = logging.getLogger(__name__)
_r = APIRouter()


def attach(parent_router: APIRouter) -> None:
    """Bind helpers from sales.py then mount activity routes."""
    from app.api import sales as s

    g = globals()
    for name in (
        "_ACT_MAP", "_apply", "_company_names", "_opp_names", "_act_out", "_utcnow",
        "_validate_activity_type", "_validate_activity_status", "_validate_direction",
        "_validate_channel", "_default_status_for_type", "_default_direction_for_type",
    ):
        g[name] = getattr(s, name)
    parent_router.include_router(_r)


# ---------------------------------------------------------------------------
# Phase 2 — timeline + draft outreach
# ---------------------------------------------------------------------------

@_r.get("/opportunities/{opp_id}/timeline", response_model=list[SalesActivityResponse])
async def opportunity_timeline(
    opp_id: str,
    limit: int = Query(100, ge=1, le=500),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    opp = await db.get(SalesOpportunity, opp_id)
    if not opp:
        raise HTTPException(404, detail="Opportunity not found")
    rows = (
        await db.execute(
            select(SalesActivity)
            .where(SalesActivity.opportunity_id == opp_id)
            .order_by(SalesActivity.occurred_at.desc(), SalesActivity.created_at.desc())
            .limit(limit)
        )
    ).scalars().all()
    company_names = await _company_names(db, {r.company_id for r in rows if r.company_id})
    opp_names = {opp.id: opp.name}
    return [_act_out(r, company_names, opp_names) for r in rows]


@_r.post("/opportunities/{opp_id}/draft-outreach", response_model=SalesActivityResponse)
async def draft_outreach(
    opp_id: str,
    data: SalesDraftOutreachRequest | None = None,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    """Deterministic outreach draft stub — always pending_approval (human gate)."""
    opp = await db.get(SalesOpportunity, opp_id)
    if not opp:
        raise HTTPException(404, detail="Opportunity not found")
    req = data or SalesDraftOutreachRequest()
    _validate_channel(req.channel)

    company_name = None
    if opp.company_id:
        company = await db.get(Company, opp.company_id)
        company_name = company.name if company else None

    contact = None
    contact_id = req.contactId or opp.contact_id
    if contact_id:
        contact = await db.get(SalesContact, contact_id)

    contact_name = contact.name if contact else "there"
    contact_title = f", {contact.title}" if contact and contact.title else ""
    account = company_name or "your team"
    product = (opp.product_line or "staffing").replace("_", " ")
    amount_bit = ""
    if opp.amount is not None:
        amount_bit = f" around {opp.currency or 'INR'} {opp.amount:,.0f}"

    subject = f"NxtHike — {product} partnership for {account}"
    body = (
        f"Hi {contact_name}{contact_title},\n\n"
        f"I hope this finds you well. I'm reaching out regarding "
        f"{opp.name} with {account}.\n\n"
        f"At NxtHike we help teams with {product} engagements"
        f"{amount_bit}. Based on where this opportunity sits "
        f"(stage: {(opp.stage or 'qualify').replace('_', ' ')}), "
        f"I'd love to share a short overview and see if a brief call would help.\n\n"
        f"Would you have 20 minutes this week?\n\n"
        f"Best regards,\n"
        f"{me.persona_name or 'NxtHike Sales'}"
    )

    act = SalesActivity(
        opportunity_id=opp.id,
        lead_id=opp.lead_id,
        contact_id=contact_id,
        company_id=opp.company_id,
        activity_type="outreach_draft",
        status="pending_approval",
        direction="outbound",
        channel=req.channel or "email",
        subject=subject,
        body=body,
        occurred_at=_utcnow(),
        owner_id=me.user.id,
        created_by=me.user.id,
        metadata_={
            "model": "template",
            "prompt_version": "phase2-deterministic-v1",
            "icp_score": None,
            "source": "draft-outreach",
            "product_line": opp.product_line,
            "stage": opp.stage,
        },
    )
    db.add(act)
    await db.commit()
    await db.refresh(act)
    company_names = await _company_names(db, {act.company_id} if act.company_id else set())
    return _act_out(act, company_names, {opp.id: opp.name})


# ---------------------------------------------------------------------------
# Phase 2 — activities CRUD + approve queue
# ---------------------------------------------------------------------------

@_r.get("/approve-queue", response_model=list[SalesActivityResponse])
async def approve_queue(
    limit: int = Query(100, ge=1, le=500),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(
            select(SalesActivity)
            .where(SalesActivity.status == "pending_approval")
            .order_by(SalesActivity.created_at.desc())
            .limit(limit)
        )
    ).scalars().all()
    company_names = await _company_names(db, {r.company_id for r in rows if r.company_id})
    opp_names = await _opp_names(db, {r.opportunity_id for r in rows if r.opportunity_id})
    return [_act_out(r, company_names, opp_names) for r in rows]


@_r.get("/activities", response_model=list[SalesActivityResponse])
async def list_activities(
    opportunity_id: str | None = Query(None, alias="opportunity_id"),
    opportunityId: str | None = None,
    status: str | None = None,
    type: str | None = Query(None, alias="type"),
    activityType: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    opp_filter = opportunity_id or opportunityId
    type_filter = type or activityType
    _validate_activity_status(status)
    _validate_activity_type(type_filter)
    query = select(SalesActivity).order_by(SalesActivity.occurred_at.desc()).limit(limit)
    if opp_filter:
        query = query.where(SalesActivity.opportunity_id == opp_filter)
    if status:
        query = query.where(SalesActivity.status == status)
    if type_filter:
        query = query.where(SalesActivity.activity_type == type_filter)
    rows = (await db.execute(query)).scalars().all()
    company_names = await _company_names(db, {r.company_id for r in rows if r.company_id})
    opp_names = await _opp_names(db, {r.opportunity_id for r in rows if r.opportunity_id})
    return [_act_out(r, company_names, opp_names) for r in rows]


@_r.post("/activities", response_model=SalesActivityResponse)
async def create_activity(
    data: SalesActivityCreate,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    payload = data.model_dump()
    _validate_activity_type(payload.get("activityType"))
    _validate_activity_status(payload.get("status"))
    _validate_direction(payload.get("direction"))
    _validate_channel(payload.get("channel"))

    act = SalesActivity()
    atype = payload.get("activityType") or "note"
    if not payload.get("status"):
        payload["status"] = _default_status_for_type(atype)
    if not payload.get("direction"):
        payload["direction"] = _default_direction_for_type(atype)
    if not payload.get("ownerId"):
        payload["ownerId"] = me.user.id
    if not payload.get("occurredAt"):
        payload["occurredAt"] = _utcnow()

    # Human gate: outreach_draft always pending_approval
    if atype == "outreach_draft":
        payload["status"] = "pending_approval"
        payload["direction"] = payload.get("direction") or "outbound"

    _apply(act, payload, _ACT_MAP)
    act.created_by = me.user.id
    if act.metadata_ is None:
        act.metadata_ = {}
    db.add(act)
    await db.commit()
    await db.refresh(act)
    company_names = await _company_names(db, {act.company_id} if act.company_id else set())
    opp_names = await _opp_names(db, {act.opportunity_id} if act.opportunity_id else set())
    return _act_out(act, company_names, opp_names)


@_r.patch("/activities/{activity_id}", response_model=SalesActivityResponse)
async def update_activity(
    activity_id: str,
    data: SalesActivityUpdate,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    act = await db.get(SalesActivity, activity_id)
    if not act:
        raise HTTPException(404, detail="Activity not found")
    payload = data.model_dump(exclude_unset=True)
    _validate_activity_type(payload.get("activityType"))
    _validate_activity_status(payload.get("status"))
    _validate_direction(payload.get("direction"))
    _validate_channel(payload.get("channel"))
    # Do not allow PATCH to jump straight to sent — use mark-sent after approve
    if payload.get("status") == "sent" and act.status != "sent":
        raise HTTPException(
            400,
            detail="Use POST /activities/{id}/mark-sent after approve; cannot set sent via PATCH",
        )
    _apply(act, payload, _ACT_MAP)
    act.updated_at = _utcnow()
    await db.commit()
    await db.refresh(act)
    company_names = await _company_names(db, {act.company_id} if act.company_id else set())
    opp_names = await _opp_names(db, {act.opportunity_id} if act.opportunity_id else set())
    return _act_out(act, company_names, opp_names)


@_r.post("/activities/{activity_id}/approve", response_model=SalesActivityResponse)
async def approve_activity(
    activity_id: str,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    act = await db.get(SalesActivity, activity_id)
    if not act:
        raise HTTPException(404, detail="Activity not found")
    if act.status not in ("pending_approval", "rejected"):
        raise HTTPException(
            400,
            detail=f"Only pending_approval/rejected activities can be approved (got {act.status})",
        )
    act.status = "approved"
    act.approved_by = me.user.id
    act.approved_at = _utcnow()
    act.rejected_reason = None
    act.updated_at = _utcnow()
    await db.commit()
    await db.refresh(act)
    company_names = await _company_names(db, {act.company_id} if act.company_id else set())
    opp_names = await _opp_names(db, {act.opportunity_id} if act.opportunity_id else set())
    return _act_out(act, company_names, opp_names)


@_r.post("/activities/{activity_id}/reject", response_model=SalesActivityResponse)
async def reject_activity(
    activity_id: str,
    data: SalesActivityRejectRequest,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    act = await db.get(SalesActivity, activity_id)
    if not act:
        raise HTTPException(404, detail="Activity not found")
    if act.status not in ("pending_approval", "approved"):
        raise HTTPException(
            400,
            detail=f"Only pending_approval/approved activities can be rejected (got {act.status})",
        )
    act.status = "rejected"
    act.rejected_reason = data.reason.strip()
    act.approved_by = None
    act.approved_at = None
    act.updated_at = _utcnow()
    await db.commit()
    await db.refresh(act)
    company_names = await _company_names(db, {act.company_id} if act.company_id else set())
    opp_names = await _opp_names(db, {act.opportunity_id} if act.opportunity_id else set())
    return _act_out(act, company_names, opp_names)


@_r.post("/activities/{activity_id}/mark-sent", response_model=SalesMarkSentResponse)
async def mark_activity_sent(
    activity_id: str,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    """Safe no-op send stub: logs 'would send' and marks status=sent. No external providers."""
    act = await db.get(SalesActivity, activity_id)
    if not act:
        raise HTTPException(404, detail="Activity not found")
    if act.status != "approved":
        raise HTTPException(
            400,
            detail="Activity must be approved before mark-sent (human gate)",
        )
    log_message = (
        f"[sales outreach stub] would send activity={act.id} "
        f"channel={act.channel or 'email'} opportunity={act.opportunity_id} "
        f"to_contact={act.contact_id} subject={act.subject!r} by={me.user.id}"
    )
    logger.info(log_message)
    act.status = "sent"
    if act.activity_type == "outreach_draft":
        act.activity_type = "outreach_sent"
    act.completed_at = _utcnow()
    act.updated_at = _utcnow()
    meta = dict(act.metadata_ or {})
    meta["send_stub"] = {
        "would_send": True,
        "logged_at": _utcnow().isoformat() + "Z",
        "by": me.user.id,
    }
    act.metadata_ = meta
    await db.commit()
    await db.refresh(act)
    company_names = await _company_names(db, {act.company_id} if act.company_id else set())
    opp_names = await _opp_names(db, {act.opportunity_id} if act.opportunity_id else set())
    return SalesMarkSentResponse(
        activity=_act_out(act, company_names, opp_names),
        wouldSend=True,
        logMessage=log_message,
    )
