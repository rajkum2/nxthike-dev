"""Sales CRM API — Phase 1 CRUD + Phase 2 activities timeline / approve queue."""
from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.company import Company
from app.models.sales import (
    ACTIVITY_CHANNELS, ACTIVITY_DIRECTIONS, ACTIVITY_STATUSES, ACTIVITY_TYPES,
    LEAD_STATUSES, OPPORTUNITY_STAGES, PRODUCT_LINES,
    SalesActivity, SalesContact, SalesLead, SalesOpportunity,
)
from app.schemas.sales import (
    SalesActivityResponse, SalesContactCreate, SalesContactResponse, SalesContactUpdate,
    SalesHomeStats, SalesLeadCreate, SalesLeadResponse, SalesLeadUpdate,
    SalesOpportunityCreate, SalesOpportunityResponse, SalesOpportunityUpdate,
    SalesPipelineColumn, SalesPipelineResponse,
)
from app.services.personas import WorkspaceIdentity, get_workspace_user

router = APIRouter(prefix="/api/sales", tags=["sales"], dependencies=[Depends(get_workspace_user)])
STAGE_LABELS = {s: s.replace("_", " ").title() for s in OPPORTUNITY_STAGES}
_CONTACT_MAP = {"companyId": "company_id", "linkedinUrl": "linkedin_url", "isPrimary": "is_primary", "ownerId": "owner_id"}
_LEAD_MAP = {"companyId": "company_id", "contactId": "contact_id", "productLine": "product_line", "ownerId": "owner_id"}
_OPP_MAP = {"companyId": "company_id", "contactId": "contact_id", "leadId": "lead_id", "productLine": "product_line", "expectedClose": "expected_close", "hiringRoleIds": "hiring_role_ids", "ownerId": "owner_id", "lostReason": "lost_reason"}
_ACT_MAP = {"opportunityId": "opportunity_id", "leadId": "lead_id", "contactId": "contact_id", "companyId": "company_id", "activityType": "activity_type", "bodyHtml": "body_html", "occurredAt": "occurred_at", "scheduledAt": "scheduled_at", "completedAt": "completed_at", "ownerId": "owner_id", "metadata": "metadata_"}

def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

def _apply(model, data, field_map):
    for camel, snake in field_map.items():
        if camel in data:
            data[snake] = data.pop(camel)
    for key, value in data.items():
        if hasattr(model, key):
            setattr(model, key, value)

async def _company_names(db, ids):
    ids = {i for i in ids if i}
    if not ids:
        return {}
    result = await db.execute(select(Company.id, Company.name).where(Company.id.in_(ids)))
    return {row[0]: row[1] for row in result.all()}

async def _opp_names(db, ids):
    ids = {i for i in ids if i}
    if not ids:
        return {}
    result = await db.execute(select(SalesOpportunity.id, SalesOpportunity.name).where(SalesOpportunity.id.in_(ids)))
    return {row[0]: row[1] for row in result.all()}

def _contact_out(c, names):
    return SalesContactResponse(id=c.id, companyId=c.company_id, companyName=names.get(c.company_id or ""), name=c.name, title=c.title, email=c.email, phone=c.phone, linkedinUrl=c.linkedin_url, isPrimary=bool(c.is_primary), notes=c.notes or "", ownerId=c.owner_id, createdAt=c.created_at, updatedAt=c.updated_at)

def _lead_out(lead, names):
    return SalesLeadResponse(id=lead.id, companyId=lead.company_id, companyName=names.get(lead.company_id or ""), contactId=lead.contact_id, name=lead.name, source=lead.source, status=lead.status or "new", productLine=lead.product_line or "staffing", score=lead.score, notes=lead.notes or "", ownerId=lead.owner_id, createdAt=lead.created_at, updatedAt=lead.updated_at)

def _opp_out(o, names):
    return SalesOpportunityResponse(id=o.id, companyId=o.company_id, companyName=names.get(o.company_id or ""), contactId=o.contact_id, leadId=o.lead_id, name=o.name, productLine=o.product_line or "staffing", stage=o.stage or "qualify", amount=o.amount, currency=o.currency or "INR", probability=o.probability, expectedClose=o.expected_close, hiringRoleIds=list(o.hiring_role_ids or []), notes=o.notes or "", ownerId=o.owner_id, lostReason=o.lost_reason, createdAt=o.created_at, updatedAt=o.updated_at)

def _act_out(a, company_names=None, opp_names=None):
    company_names = company_names or {}
    opp_names = opp_names or {}
    meta = a.metadata_ if isinstance(getattr(a, "metadata_", None), dict) else (a.metadata_ or {})
    return SalesActivityResponse(
        id=a.id, opportunityId=a.opportunity_id,
        opportunityName=opp_names.get(a.opportunity_id or "") if a.opportunity_id else None,
        leadId=a.lead_id, contactId=a.contact_id, companyId=a.company_id,
        companyName=company_names.get(a.company_id or "") if a.company_id else None,
        activityType=a.activity_type or "note", status=a.status or "done",
        direction=a.direction, channel=a.channel, subject=a.subject,
        body=a.body or "", bodyHtml=a.body_html, occurredAt=a.occurred_at,
        scheduledAt=a.scheduled_at, completedAt=a.completed_at, ownerId=a.owner_id,
        createdBy=a.created_by, approvedBy=a.approved_by, approvedAt=a.approved_at,
        rejectedReason=a.rejected_reason, metadata=dict(meta or {}),
        createdAt=a.created_at, updatedAt=a.updated_at,
    )

def _validate_product_line(v):
    if v is not None and v not in PRODUCT_LINES:
        raise HTTPException(400, detail=f"productLine must be one of {PRODUCT_LINES}")

def _validate_stage(v):
    if v is not None and v not in OPPORTUNITY_STAGES:
        raise HTTPException(400, detail=f"stage must be one of {OPPORTUNITY_STAGES}")

def _validate_lead_status(v):
    if v is not None and v not in LEAD_STATUSES:
        raise HTTPException(400, detail=f"status must be one of {LEAD_STATUSES}")

def _validate_activity_type(v):
    if v is not None and v not in ACTIVITY_TYPES:
        raise HTTPException(400, detail=f"activityType must be one of {ACTIVITY_TYPES}")

def _validate_activity_status(v):
    if v is not None and v not in ACTIVITY_STATUSES:
        raise HTTPException(400, detail=f"status must be one of {ACTIVITY_STATUSES}")

def _validate_direction(v):
    if v is not None and v not in ACTIVITY_DIRECTIONS:
        raise HTTPException(400, detail=f"direction must be one of {ACTIVITY_DIRECTIONS}")

def _validate_channel(v):
    if v is not None and v not in ACTIVITY_CHANNELS:
        raise HTTPException(400, detail=f"channel must be one of {ACTIVITY_CHANNELS}")

def _default_status_for_type(activity_type: str | None) -> str:
    if activity_type == "outreach_draft":
        return "pending_approval"
    if activity_type in ("task",):
        return "planned"
    return "done"

def _default_direction_for_type(activity_type: str | None) -> str | None:
    if activity_type in ("outreach_draft", "outreach_sent", "email"):
        return "outbound"
    if activity_type in ("note", "stage_change"):
        return "internal"
    return None

@router.get("/meta")
async def sales_meta(me: WorkspaceIdentity = Depends(get_workspace_user)):
    return {
        "productLines": list(PRODUCT_LINES),
        "stages": [{"id": s, "label": STAGE_LABELS[s]} for s in OPPORTUNITY_STAGES],
        "leadStatuses": list(LEAD_STATUSES),
        "activityTypes": list(ACTIVITY_TYPES),
        "activityStatuses": list(ACTIVITY_STATUSES),
        "activityDirections": list(ACTIVITY_DIRECTIONS),
        "activityChannels": list(ACTIVITY_CHANNELS),
        "persona": {"id": me.persona_id, "name": me.persona_name, "mode": me.mode},
        "caps": {"sales": True, "accounts": "companies", "approveQueue": True},
    }

@router.get("/home", response_model=SalesHomeStats)
async def sales_home(me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    contacts = (await db.execute(select(func.count()).select_from(SalesContact))).scalar() or 0
    leads = (await db.execute(select(func.count()).select_from(SalesLead))).scalar() or 0
    opps = (await db.execute(select(func.count()).select_from(SalesOpportunity))).scalar() or 0
    open_n = (await db.execute(select(func.count()).select_from(SalesOpportunity).where(SalesOpportunity.stage.notin_(("won", "lost"))))).scalar() or 0
    won_n = (await db.execute(select(func.count()).select_from(SalesOpportunity).where(SalesOpportunity.stage == "won"))).scalar() or 0
    pending = (await db.execute(select(func.count()).select_from(SalesActivity).where(SalesActivity.status == "pending_approval"))).scalar() or 0
    by_pl = {(pl or "staffing"): n for pl, n in (await db.execute(select(SalesOpportunity.product_line, func.count()).group_by(SalesOpportunity.product_line))).all()}
    by_stage = {(st or "qualify"): n for st, n in (await db.execute(select(SalesOpportunity.stage, func.count()).group_by(SalesOpportunity.stage))).all()}
    return SalesHomeStats(contacts=contacts, leads=leads, opportunities=opps, openPipeline=open_n, won=won_n, byProductLine=by_pl, byStage=by_stage, pendingApprovals=pending)

@router.get("/accounts")
async def list_accounts(q: str | None = None, limit: int = Query(50, ge=1, le=200), me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    query = select(Company).order_by(Company.name).limit(limit)
    if q:
        query = query.where(Company.name.ilike(f"%{q.strip()}%"))
    rows = (await db.execute(query)).scalars().all()
    return [{"id": c.id, "name": c.name, "industry": c.industry, "location": c.location, "isClient": bool(getattr(c, "is_client", False)), "phone": getattr(c, "phone", None), "website": c.website} for c in rows]

@router.get("/contacts", response_model=list[SalesContactResponse])
async def list_contacts(companyId: str | None = None, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    query = select(SalesContact).order_by(SalesContact.updated_at.desc())
    if companyId:
        query = query.where(SalesContact.company_id == companyId)
    rows = (await db.execute(query)).scalars().all()
    names = await _company_names(db, {r.company_id for r in rows if r.company_id})
    return [_contact_out(r, names) for r in rows]

@router.post("/contacts", response_model=SalesContactResponse)
async def create_contact(data: SalesContactCreate, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    payload = data.model_dump()
    contact = SalesContact()
    if not payload.get("ownerId"):
        payload["ownerId"] = me.user.id
    _apply(contact, payload, _CONTACT_MAP)
    db.add(contact); await db.commit(); await db.refresh(contact)
    names = await _company_names(db, {contact.company_id} if contact.company_id else set())
    return _contact_out(contact, names)

@router.get("/contacts/{contact_id}", response_model=SalesContactResponse)
async def get_contact(contact_id: str, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    contact = await db.get(SalesContact, contact_id)
    if not contact:
        raise HTTPException(404, detail="Contact not found")
    names = await _company_names(db, {contact.company_id} if contact.company_id else set())
    return _contact_out(contact, names)

@router.patch("/contacts/{contact_id}", response_model=SalesContactResponse)
async def update_contact(contact_id: str, data: SalesContactUpdate, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    contact = await db.get(SalesContact, contact_id)
    if not contact:
        raise HTTPException(404, detail="Contact not found")
    _apply(contact, data.model_dump(exclude_unset=True), _CONTACT_MAP)
    contact.updated_at = _utcnow(); await db.commit(); await db.refresh(contact)
    names = await _company_names(db, {contact.company_id} if contact.company_id else set())
    return _contact_out(contact, names)

@router.get("/leads", response_model=list[SalesLeadResponse])
async def list_leads(status: str | None = None, productLine: str | None = None, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    _validate_lead_status(status); _validate_product_line(productLine)
    query = select(SalesLead).order_by(SalesLead.updated_at.desc())
    if status:
        query = query.where(SalesLead.status == status)
    if productLine:
        query = query.where(SalesLead.product_line == productLine)
    rows = (await db.execute(query)).scalars().all()
    names = await _company_names(db, {r.company_id for r in rows if r.company_id})
    return [_lead_out(r, names) for r in rows]

@router.post("/leads", response_model=SalesLeadResponse)
async def create_lead(data: SalesLeadCreate, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    payload = data.model_dump(); _validate_product_line(payload.get("productLine")); _validate_lead_status(payload.get("status"))
    lead = SalesLead()
    if not payload.get("ownerId"):
        payload["ownerId"] = me.user.id
    _apply(lead, payload, _LEAD_MAP); db.add(lead); await db.commit(); await db.refresh(lead)
    names = await _company_names(db, {lead.company_id} if lead.company_id else set())
    return _lead_out(lead, names)

@router.patch("/leads/{lead_id}", response_model=SalesLeadResponse)
async def update_lead(lead_id: str, data: SalesLeadUpdate, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    lead = await db.get(SalesLead, lead_id)
    if not lead:
        raise HTTPException(404, detail="Lead not found")
    payload = data.model_dump(exclude_unset=True); _validate_product_line(payload.get("productLine")); _validate_lead_status(payload.get("status"))
    _apply(lead, payload, _LEAD_MAP); lead.updated_at = _utcnow(); await db.commit(); await db.refresh(lead)
    names = await _company_names(db, {lead.company_id} if lead.company_id else set())
    return _lead_out(lead, names)

@router.get("/opportunities", response_model=list[SalesOpportunityResponse])
async def list_opportunities(stage: str | None = None, productLine: str | None = None, companyId: str | None = None, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    _validate_stage(stage); _validate_product_line(productLine)
    query = select(SalesOpportunity).order_by(SalesOpportunity.updated_at.desc())
    if stage:
        query = query.where(SalesOpportunity.stage == stage)
    if productLine:
        query = query.where(SalesOpportunity.product_line == productLine)
    if companyId:
        query = query.where(SalesOpportunity.company_id == companyId)
    rows = (await db.execute(query)).scalars().all()
    names = await _company_names(db, {r.company_id for r in rows if r.company_id})
    return [_opp_out(r, names) for r in rows]

@router.get("/opportunities/pipeline", response_model=SalesPipelineResponse)
async def opportunity_pipeline(productLine: str | None = None, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    _validate_product_line(productLine)
    query = select(SalesOpportunity)
    if productLine:
        query = query.where(SalesOpportunity.product_line == productLine)
    rows = (await db.execute(query)).scalars().all()
    names = await _company_names(db, {r.company_id for r in rows if r.company_id})
    by_stage = {s: [] for s in OPPORTUNITY_STAGES}
    for r in rows:
        by_stage[r.stage if r.stage in by_stage else "qualify"].append(r)
    columns = [SalesPipelineColumn(stage=stage, label=STAGE_LABELS[stage], count=len(items), totalAmount=sum(float(i.amount or 0) for i in items), items=[_opp_out(i, names) for i in items]) for stage, items in ((s, by_stage[s]) for s in OPPORTUNITY_STAGES)]
    return SalesPipelineResponse(columns=columns, totalOpen=sum(len(by_stage[s]) for s in OPPORTUNITY_STAGES if s not in ("won", "lost")), totalWon=len(by_stage["won"]), totalLost=len(by_stage["lost"]))

@router.get("/opportunities/{opp_id}", response_model=SalesOpportunityResponse)
async def get_opportunity(opp_id: str, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    opp = await db.get(SalesOpportunity, opp_id)
    if not opp:
        raise HTTPException(404, detail="Opportunity not found")
    names = await _company_names(db, {opp.company_id} if opp.company_id else set())
    return _opp_out(opp, names)

@router.post("/opportunities", response_model=SalesOpportunityResponse)
async def create_opportunity(data: SalesOpportunityCreate, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    payload = data.model_dump(); _validate_product_line(payload.get("productLine")); _validate_stage(payload.get("stage"))
    opp = SalesOpportunity()
    if not payload.get("ownerId"):
        payload["ownerId"] = me.user.id
    _apply(opp, payload, _OPP_MAP); db.add(opp); await db.commit(); await db.refresh(opp)
    names = await _company_names(db, {opp.company_id} if opp.company_id else set())
    return _opp_out(opp, names)

@router.patch("/opportunities/{opp_id}", response_model=SalesOpportunityResponse)
async def update_opportunity(opp_id: str, data: SalesOpportunityUpdate, me: WorkspaceIdentity = Depends(get_workspace_user), db: AsyncSession = Depends(get_db)):
    opp = await db.get(SalesOpportunity, opp_id)
    if not opp:
        raise HTTPException(404, detail="Opportunity not found")
    payload = data.model_dump(exclude_unset=True); _validate_product_line(payload.get("productLine")); _validate_stage(payload.get("stage"))
    _apply(opp, payload, _OPP_MAP); opp.updated_at = _utcnow(); await db.commit(); await db.refresh(opp)
    names = await _company_names(db, {opp.company_id} if opp.company_id else set())
    return _opp_out(opp, names)

def _mount_activities() -> None:
    from app.api.sales_activities import attach
    attach(router)

_mount_activities()
