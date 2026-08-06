"""
Workspace API: session identity, settings, users, tasks, notifications,
audit trail and the DPDP compliance queue.

Everything here is new. No existing endpoint changes behaviour.
"""

from __future__ import annotations

import math
from datetime import datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.hiring import CALL_DISPOSITIONS, CallLog, Candidate
from app.models.user import User
from app.models.workspace import (
    DEFAULT_ROLE_MATRIX,
    ErasureRequest,
    Notification,
    SETTINGS_SINGLETON_ID,
    Task,
    WorkspaceSettings,
)
from app.services.auth import hash_password
from app.services.personas import (
    WorkspaceIdentity,
    get_workspace_user,
    persona_catalogue,
    require_admin_workspace,
    require_full_admin,
)

router = APIRouter(prefix="/api/workspace", tags=["workspace"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _iso(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


# ---------------------------------------------------------------------------
# Audit helper — used by every mutating endpoint in the workspace
# ---------------------------------------------------------------------------


async def record_audit(
    db: AsyncSession,
    me: WorkspaceIdentity,
    action: str,
    object_kind: str | None = None,
    object_id: str | None = None,
    object_label: str | None = None,
    meta: dict | None = None,
) -> None:
    """Append to the immutable trail. Never raises into the caller's path."""
    from app.models.workspace import AuditEvent

    try:
        db.add(
            AuditEvent(
                actor_id=me.user.id,
                actor_name=me.name,
                actor_email=me.user.email,
                action=action,
                object_kind=object_kind,
                object_id=object_id,
                object_label=object_label,
                meta=meta or {},
            )
        )
    except Exception as e:  # pragma: no cover - defensive
        print(f"[audit] could not record {action}: {type(e).__name__}: {e}")


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------


async def get_settings_row(db: AsyncSession) -> WorkspaceSettings:
    row = await db.get(WorkspaceSettings, SETTINGS_SINGLETON_ID)
    if row is None:
        row = WorkspaceSettings(id=SETTINGS_SINGLETON_ID)
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row


class CallingWindowOut(BaseModel):
    openHour: int
    closeHour: int
    days: list[int]
    timezone: str
    isOpen: bool
    label: str


class SettingsResponse(BaseModel):
    orgName: str
    mode: str
    callingWindow: CallingWindowOut
    retentionMonths: int
    notificationToggles: dict
    roleMatrix: dict


def _window_open_now(row: WorkspaceSettings, now: datetime | None = None) -> bool:
    now = now or datetime.now()
    if now.isoweekday() not in (row.window_days or []):
        return False
    t = now.time()
    return time(row.window_open_hour) <= t < time(row.window_close_hour)


def _settings_payload(row: WorkspaceSettings) -> SettingsResponse:
    return SettingsResponse(
        orgName=row.org_name,
        mode=row.mode,
        callingWindow=CallingWindowOut(
            openHour=row.window_open_hour,
            closeHour=row.window_close_hour,
            days=list(row.window_days or []),
            timezone=row.timezone,
            isOpen=_window_open_now(row),
            label=f"{row.window_open_hour:02d}:00–{row.window_close_hour:02d}:00",
        ),
        retentionMonths=row.retention_months,
        notificationToggles=dict(row.notification_toggles or {}),
        roleMatrix=dict(row.role_matrix or DEFAULT_ROLE_MATRIX),
    )


@router.get("/settings", response_model=SettingsResponse)
async def read_settings(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    return _settings_payload(await get_settings_row(db))


class CallingWindowUpdate(BaseModel):
    openHour: int | None = Field(None, ge=0, le=23)
    closeHour: int | None = Field(None, ge=1, le=24)
    #: ISO weekday numbers — 1 = Monday … 7 = Sunday, matching `isoweekday()`.
    days: list[int] | None = None
    timezone: str | None = None


class SettingsUpdate(BaseModel):
    # Reject unknown keys. Without this an update naming a field we do not have
    # returns 200 while changing nothing, which reads as success.
    model_config = ConfigDict(extra="forbid")

    orgName: str | None = None
    mode: str | None = None
    #: Accepted both flat and nested, since the read model returns it nested.
    callingWindow: CallingWindowUpdate | None = None
    openHour: int | None = Field(None, ge=0, le=23)
    closeHour: int | None = Field(None, ge=1, le=24)
    days: list[int] | None = None
    timezone: str | None = None
    retentionMonths: int | None = Field(None, ge=1, le=120)
    notificationToggles: dict | None = None
    roleMatrix: dict | None = None


@router.patch("/settings", response_model=SettingsResponse)
async def update_settings(
    body: SettingsUpdate,
    me: WorkspaceIdentity = Depends(require_full_admin),
    db: AsyncSession = Depends(get_db),
):
    row = await get_settings_row(db)
    data = body.model_dump(exclude_unset=True)

    # Flatten the nested form onto the flat one so there is a single code path.
    nested = data.pop("callingWindow", None) or {}
    for key, value in nested.items():
        if value is not None:
            data[key] = value

    open_h = data.get("openHour", row.window_open_hour)
    close_h = data.get("closeHour", row.window_close_hour)
    if open_h >= close_h:
        raise HTTPException(status_code=400, detail="The window must open before it closes.")

    if "days" in data and data["days"] is not None:
        bad = [d for d in data["days"] if d < 1 or d > 7]
        if bad or not data["days"]:
            raise HTTPException(
                status_code=400,
                detail="Days must be ISO weekday numbers, 1 (Monday) to 7 (Sunday), and at least one day.",
            )

    mapping = {
        "orgName": "org_name", "mode": "mode", "openHour": "window_open_hour",
        "closeHour": "window_close_hour", "days": "window_days", "timezone": "timezone",
        "retentionMonths": "retention_months", "notificationToggles": "notification_toggles",
        "roleMatrix": "role_matrix",
    }
    for key, attr in mapping.items():
        if key in data and data[key] is not None:
            setattr(row, attr, data[key])

    await record_audit(db, me, "updated workspace settings", "settings", row.id, meta=data)
    await db.commit()
    await db.refresh(row)
    return _settings_payload(row)


# ---------------------------------------------------------------------------
# Session
# ---------------------------------------------------------------------------


class SessionResponse(BaseModel):
    userId: str
    email: str
    name: str
    role: str
    personaId: str
    personaName: str
    mode: str
    landing: str
    home: str
    caps: dict
    nav: list[str]
    settings: SettingsResponse
    personas: list[dict]


#: Which nav keys each capability unlocks — the server's copy of NAVCAP.
NAV_RULES: dict[str, callable] = {
    "queue": lambda c: bool(c.get("dial")),
    "callbacks": lambda c: bool(c.get("dial")),
    "history": lambda c: bool(c.get("log")),
    "cands": lambda c: c.get("db") != "none",
    "addcand": lambda c: bool(c.get("create")),
    "tags": lambda c: bool(c.get("create")),
    "jobs": lambda c: c.get("reqs") != "none",
    "kanban": lambda c: c.get("reqs") != "none",
    "clients": lambda c: c.get("reqs") == "all",
    "subs": lambda c: c.get("reqs") != "none",
    "composer": lambda c: c.get("db") != "none",
    "templates": lambda c: c.get("db") != "none",
    "scorecard": lambda c: bool(c.get("score")),
    "offers": lambda c: c.get("reqs") != "none" or bool(c.get("approve")),
    "approvals": lambda c: bool(c.get("approve")),
    "perf": lambda c: c.get("analytics") != "none",
    "team": lambda c: c.get("analytics") in ("team", "all"),
    "roles": lambda c: bool(c.get("admin")),
    "users": lambda c: bool(c.get("admin")),
    "compliance": lambda c: bool(c.get("admin")),
    "audit": lambda c: bool(c.get("admin")),
    "taxonomy": lambda c: c.get("admin") is True,
    "callwindow": lambda c: bool(c.get("admin")),
}

#: Always available to anyone with workspace access.
ALWAYS_NAV = ["home", "notifs", "tasks", "feed", "settings", "sync", "states", "intcal"]


def allowed_nav(caps: dict) -> list[str]:
    out = list(ALWAYS_NAV)
    out += [key for key, rule in NAV_RULES.items() if rule(caps)]
    return sorted(set(out))


@router.get("/session", response_model=SessionResponse)
async def read_session(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    """Everything the shell needs on boot: who you are and what you may do."""
    settings_row = await get_settings_row(db)

    # Touch last-active without blocking the response on a failure.
    try:
        me.user.last_active_at = _utcnow()
        await db.commit()
    except Exception:
        await db.rollback()

    return SessionResponse(
        userId=me.user.id,
        email=me.user.email,
        name=me.name,
        role=me.user.role,
        personaId=me.persona_id,
        personaName=me.persona_name,
        # The persona carries the workspace vocabulary (Client/Requisition vs
        # Department/Opening); switching persona switches the mode with it.
        mode=me.mode,
        landing=me.landing,
        home=me.home,
        caps=me.caps,
        nav=allowed_nav(me.caps),
        settings=_settings_payload(settings_row),
        personas=persona_catalogue(),
    )


@router.get("/personas")
async def list_personas(me: WorkspaceIdentity = Depends(get_workspace_user)):
    return persona_catalogue()


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------


class WorkspaceUserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    persona: str | None = None
    personaName: str | None = None
    status: str = "active"
    title: str | None = None
    org: str | None = None
    createdAt: str | None = None
    lastActiveAt: str | None = None
    invitedAt: str | None = None


def _user_out(u: User) -> WorkspaceUserOut:
    from app.models.workspace import PERSONA_BY_ID

    persona = getattr(u, "persona", None)
    return WorkspaceUserOut(
        id=u.id,
        email=u.email,
        name=" ".join(x for x in [u.first_name, u.last_name] if x).strip() or u.email.split("@")[0],
        role=u.role,
        persona=persona,
        personaName=PERSONA_BY_ID[persona]["name"] if persona in PERSONA_BY_ID else None,
        status=getattr(u, "status", "active") or "active",
        title=getattr(u, "title", None),
        org=getattr(u, "org", None),
        createdAt=_iso(u.created_at),
        lastActiveAt=_iso(getattr(u, "last_active_at", None)),
        invitedAt=_iso(getattr(u, "invited_at", None)),
    )


@router.get("/users", response_model=list[WorkspaceUserOut])
async def list_workspace_users(
    search: str | None = None,
    me: WorkspaceIdentity = Depends(require_admin_workspace),
    db: AsyncSession = Depends(get_db),
):
    q = select(User)
    if search:
        term = f"%{search.strip()}%"
        q = q.where(or_(User.email.ilike(term), User.first_name.ilike(term), User.last_name.ilike(term)))
    rows = (await db.execute(q.order_by(User.created_at.desc()))).scalars().all()
    return [_user_out(u) for u in rows]


class InviteRequest(BaseModel):
    email: str
    firstName: str = ""
    lastName: str = ""
    persona: str = "p1"
    title: str | None = None
    #: Temporary password. The invitee changes it on first sign-in.
    tempPassword: str = Field(..., min_length=6)


@router.post("/users/invite", response_model=WorkspaceUserOut, status_code=201)
async def invite_user(
    body: InviteRequest,
    me: WorkspaceIdentity = Depends(require_full_admin),
    db: AsyncSession = Depends(get_db),
):
    from app.models.workspace import PERSONA_BY_ID

    if body.persona not in PERSONA_BY_ID:
        raise HTTPException(status_code=400, detail="Unknown persona")

    existing = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if existing:
        # Already a portal user — grant workspace access rather than refusing.
        existing.persona = body.persona
        existing.status = "active"
        if body.title:
            existing.title = body.title
        await record_audit(db, me, "granted workspace access", "user", existing.id, existing.email,
                           {"persona": body.persona})
        await db.commit()
        await db.refresh(existing)
        return _user_out(existing)

    user = User(
        email=body.email,
        password_hash=hash_password(body.tempPassword),
        role="employer",  # portal role stays coarse; the persona carries workspace rights
        first_name=body.firstName or body.email.split("@")[0],
        last_name=body.lastName or "",
        persona=body.persona,
        status="invited",
        title=body.title,
        invited_at=_utcnow(),
    )
    db.add(user)
    await record_audit(db, me, "invited user", "user", user.id, body.email, {"persona": body.persona})
    await db.commit()
    await db.refresh(user)
    return _user_out(user)


class SelfPersona(BaseModel):
    persona: str


@router.patch("/session/persona", response_model=SessionResponse)
async def switch_own_persona(
    body: SelfPersona,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Let an account whose **portal role** is `admin` try on another persona.

    This deliberately does not go through `require_admin_workspace`, which
    reads `caps.admin` off the *current* persona. An admin who switched to,
    say, Interviewer would lose that capability and be unable to switch back —
    a one-way door out of their own workspace. The durable authority is the
    account's `role` column, so that is what is checked here.
    """
    from app.models.workspace import PERSONA_BY_ID

    if (me.user.role or "").lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only an admin account can change its own role. Ask an admin to reassign yours.",
        )
    if body.persona not in PERSONA_BY_ID:
        raise HTTPException(status_code=400, detail="Unknown persona")

    me.user.persona = body.persona
    await record_audit(db, me, "switched own persona", "user", me.user.id, me.user.email,
                       {"persona": body.persona})
    await db.commit()
    await db.refresh(me.user)
    return await read_session(await get_workspace_user(me.user), db)


class UserPatch(BaseModel):
    persona: str | None = None
    status: str | None = None
    title: str | None = None
    org: str | None = None


@router.patch("/users/{user_id}", response_model=WorkspaceUserOut)
async def patch_workspace_user(
    user_id: str,
    body: UserPatch,
    me: WorkspaceIdentity = Depends(require_full_admin),
    db: AsyncSession = Depends(get_db),
):
    from app.models.workspace import PERSONA_BY_ID

    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    data = body.model_dump(exclude_unset=True)

    if data.get("persona") is not None:
        if data["persona"] not in PERSONA_BY_ID:
            raise HTTPException(status_code=400, detail="Unknown persona")
        target.persona = data["persona"]

    if data.get("status") is not None:
        if data["status"] not in ("active", "invited", "suspended"):
            raise HTTPException(status_code=400, detail="Unknown status")
        if target.id == me.user.id and data["status"] == "suspended":
            raise HTTPException(status_code=400, detail="You cannot suspend your own account.")
        target.status = data["status"]

    for key in ("title", "org"):
        if key in data and data[key] is not None:
            setattr(target, key, data[key])

    await record_audit(db, me, "updated user", "user", target.id, target.email, data)
    await db.commit()
    await db.refresh(target)
    return _user_out(target)


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------


class TaskOut(BaseModel):
    id: str
    title: str
    detail: str = ""
    dueAt: str | None = None
    assigneeId: str | None = None
    assigneeName: str | None = None
    linkKind: str | None = None
    linkId: str | None = None
    linkLabel: str | None = None
    done: bool = False
    overdue: bool = False
    createdAt: str | None = None


def _task_out(t: Task) -> TaskOut:
    overdue = bool(t.due_at and not t.done and t.due_at < _utcnow())
    return TaskOut(
        id=t.id, title=t.title, detail=t.detail or "", dueAt=_iso(t.due_at),
        assigneeId=t.assignee_id, assigneeName=t.assignee_name,
        linkKind=t.link_kind, linkId=t.link_id, linkLabel=t.link_label,
        done=bool(t.done), overdue=overdue, createdAt=_iso(t.created_at),
    )


@router.get("/tasks", response_model=list[TaskOut])
async def list_tasks(
    mine: bool = True,
    include_done: bool = Query(False, alias="includeDone"),
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    q = select(Task)
    filters = []
    if mine:
        filters.append(or_(Task.assignee_id == me.user.id, Task.assignee_id.is_(None)))
    if not include_done:
        filters.append(Task.done.is_(False))
    if filters:
        q = q.where(and_(*filters))
    rows = (await db.execute(q.order_by(Task.due_at.asc().nullslast(), Task.created_at.desc()))).scalars().all()
    return [_task_out(t) for t in rows]


class TaskCreate(BaseModel):
    title: str
    detail: str = ""
    dueAt: datetime | None = None
    assigneeId: str | None = None
    assigneeName: str | None = None
    linkKind: str | None = None
    linkId: str | None = None
    linkLabel: str | None = None


@router.post("/tasks", response_model=TaskOut, status_code=201)
async def create_task(
    body: TaskCreate,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    t = Task(
        title=body.title, detail=body.detail, due_at=body.dueAt,
        assignee_id=body.assigneeId or me.user.id,
        assignee_name=body.assigneeName or me.name,
        link_kind=body.linkKind, link_id=body.linkId, link_label=body.linkLabel,
        created_by=me.user.id,
    )
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return _task_out(t)


class TaskPatch(BaseModel):
    done: bool | None = None
    title: str | None = None
    dueAt: datetime | None = None
    snoozedUntil: datetime | None = None
    assigneeId: str | None = None
    assigneeName: str | None = None


@router.patch("/tasks/{task_id}", response_model=TaskOut)
async def patch_task(
    task_id: str,
    body: TaskPatch,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    t = await db.get(Task, task_id)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    data = body.model_dump(exclude_unset=True)
    if "done" in data and data["done"] is not None:
        t.done = data["done"]
        t.done_at = _utcnow() if data["done"] else None
    for key, attr in (("title", "title"), ("dueAt", "due_at"), ("snoozedUntil", "snoozed_until"),
                      ("assigneeId", "assignee_id"), ("assigneeName", "assignee_name")):
        if key in data and data[key] is not None:
            setattr(t, attr, data[key])
    await db.commit()
    await db.refresh(t)
    return _task_out(t)


@router.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: str,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    t = await db.get(Task, task_id)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(t)
    await db.commit()


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------


class NotificationOut(BaseModel):
    id: str
    kind: str
    title: str
    detail: str = ""
    refKind: str | None = None
    refId: str | None = None
    read: bool = False
    createdAt: str | None = None


@router.get("/notifications", response_model=list[NotificationOut])
async def list_notifications(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Stored notifications, topped up with live ones derived from data that has
    no notification row yet — an overdue callback is news whether or not
    anything wrote it down.
    """
    stored = (
        await db.execute(
            select(Notification)
            .where(or_(Notification.user_id == me.user.id, Notification.user_id.is_(None)))
            .order_by(Notification.created_at.desc())
            .limit(50)
        )
    ).scalars().all()

    out = [
        NotificationOut(
            id=n.id, kind=n.kind, title=n.title, detail=n.detail or "",
            refKind=n.ref_kind, refId=n.ref_id, read=n.read_at is not None,
            createdAt=_iso(n.created_at),
        )
        for n in stored
    ]

    if me.can("dial"):
        soon = _utcnow() + timedelta(days=1)
        due = (
            await db.execute(
                select(CallLog)
                .where(and_(CallLog.callback_at.is_not(None), CallLog.callback_at <= soon))
                .order_by(CallLog.callback_at.asc())
                .limit(10)
            )
        ).scalars().all()
        for log in due:
            overdue = log.callback_at and log.callback_at < _utcnow()
            out.append(
                NotificationOut(
                    id=f"cb-{log.id}",
                    kind="callback",
                    title="Callback overdue" if overdue else "Callback due",
                    detail=f"{log.candidate_name or 'Candidate'} · {log.note or 'no note captured'}",
                    refKind="candidate", refId=log.candidate_id,
                    read=False, createdAt=_iso(log.callback_at),
                )
            )

    out.sort(key=lambda n: n.createdAt or "", reverse=True)
    return out[:60]


@router.post("/notifications/read-all", status_code=204)
async def mark_all_read(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(
            select(Notification).where(
                and_(Notification.user_id == me.user.id, Notification.read_at.is_(None))
            )
        )
    ).scalars().all()
    for n in rows:
        n.read_at = _utcnow()
    await db.commit()


# ---------------------------------------------------------------------------
# Audit
# ---------------------------------------------------------------------------


class AuditOut(BaseModel):
    id: str
    actorName: str | None = None
    actorEmail: str | None = None
    action: str
    objectKind: str | None = None
    objectId: str | None = None
    objectLabel: str | None = None
    createdAt: str | None = None


@router.get("/audit", response_model=list[AuditOut])
async def list_audit(
    limit: int = Query(100, ge=1, le=500),
    me: WorkspaceIdentity = Depends(require_admin_workspace),
    db: AsyncSession = Depends(get_db),
):
    from app.models.workspace import AuditEvent

    rows = (
        await db.execute(select(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit))
    ).scalars().all()
    return [
        AuditOut(
            id=a.id, actorName=a.actor_name, actorEmail=a.actor_email, action=a.action,
            objectKind=a.object_kind, objectId=a.object_id, objectLabel=a.object_label,
            createdAt=_iso(a.created_at),
        )
        for a in rows
    ]


# ---------------------------------------------------------------------------
# Compliance
# ---------------------------------------------------------------------------


class ComplianceSummary(BaseModel):
    totalCandidates: int
    withConsent: int
    missingConsent: int
    dncCount: int
    retentionMonths: int
    openErasures: int


@router.get("/compliance", response_model=ComplianceSummary)
async def compliance_summary(
    me: WorkspaceIdentity = Depends(require_admin_workspace),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(select(func.count()).select_from(Candidate))).scalar() or 0
    with_consent = (
        await db.execute(
            select(func.count()).select_from(Candidate).where(Candidate.consent_at.is_not(None))
        )
    ).scalar() or 0
    dnc = (
        await db.execute(select(func.count()).select_from(Candidate).where(Candidate.dnc.is_(True)))
    ).scalar() or 0
    open_erasures = (
        await db.execute(
            select(func.count()).select_from(ErasureRequest).where(
                ErasureRequest.status.in_(["open", "verifying", "ready"])
            )
        )
    ).scalar() or 0
    settings_row = await get_settings_row(db)

    return ComplianceSummary(
        totalCandidates=total,
        withConsent=with_consent,
        missingConsent=max(0, total - with_consent),
        dncCount=dnc,
        retentionMonths=settings_row.retention_months,
        openErasures=open_erasures,
    )


class ErasureOut(BaseModel):
    id: str
    candidateId: str
    candidateName: str | None = None
    reason: str = ""
    status: str
    raisedByName: str | None = None
    createdAt: str | None = None


@router.get("/erasures", response_model=list[ErasureOut])
async def list_erasures(
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(select(ErasureRequest).order_by(ErasureRequest.created_at.desc()).limit(100))
    ).scalars().all()
    return [
        ErasureOut(
            id=e.id, candidateId=e.candidate_id, candidateName=e.candidate_name,
            reason=e.reason or "", status=e.status, raisedByName=e.raised_by_name,
            createdAt=_iso(e.created_at),
        )
        for e in rows
    ]


class ErasureCreate(BaseModel):
    candidateId: str
    reason: str = ""


@router.post("/erasures", response_model=ErasureOut, status_code=201)
async def raise_erasure(
    body: ErasureCreate,
    me: WorkspaceIdentity = Depends(get_workspace_user),
    db: AsyncSession = Depends(get_db),
):
    cand = await db.get(Candidate, body.candidateId)
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    e = ErasureRequest(
        candidate_id=cand.id, candidate_name=cand.name, reason=body.reason,
        raised_by=me.user.id, raised_by_name=me.name,
    )
    db.add(e)
    await record_audit(db, me, "raised erasure request", "candidate", cand.id, cand.name)
    await db.commit()
    await db.refresh(e)
    return ErasureOut(
        id=e.id, candidateId=e.candidate_id, candidateName=e.candidate_name,
        reason=e.reason, status=e.status, raisedByName=e.raised_by_name,
        createdAt=_iso(e.created_at),
    )


class ErasureDecision(BaseModel):
    status: str


@router.patch("/erasures/{erasure_id}", response_model=ErasureOut)
async def decide_erasure(
    erasure_id: str,
    body: ErasureDecision,
    me: WorkspaceIdentity = Depends(require_full_admin),
    db: AsyncSession = Depends(get_db),
):
    if not me.caps.get("erasure"):
        raise HTTPException(status_code=403, detail="Your role cannot action erasure requests.")
    e = await db.get(ErasureRequest, erasure_id)
    if not e:
        raise HTTPException(status_code=404, detail="Request not found")
    if body.status not in ("open", "verifying", "ready", "purged", "rejected"):
        raise HTTPException(status_code=400, detail="Unknown status")

    e.status = body.status
    e.resolved_by = me.user.id
    if body.status in ("purged", "rejected"):
        e.resolved_at = _utcnow()

    # A purge is destructive and deliberate: the record goes, the audit stays.
    if body.status == "purged":
        cand = await db.get(Candidate, e.candidate_id)
        if cand:
            await record_audit(db, me, "purged candidate record", "candidate", cand.id, cand.name)
            await db.delete(cand)
    else:
        await record_audit(db, me, f"erasure request → {body.status}", "candidate", e.candidate_id,
                           e.candidate_name)

    await db.commit()
    await db.refresh(e)
    return ErasureOut(
        id=e.id, candidateId=e.candidate_id, candidateName=e.candidate_name,
        reason=e.reason, status=e.status, raisedByName=e.raised_by_name,
        createdAt=_iso(e.created_at),
    )


# ---------------------------------------------------------------------------
# Disposition taxonomy (read-only mirror of the enum the API enforces)
# ---------------------------------------------------------------------------


@router.get("/taxonomy")
async def read_taxonomy(me: WorkspaceIdentity = Depends(get_workspace_user)):
    from app.schemas.calls import DISPOSITION_META

    return {"dispositions": DISPOSITION_META, "enforced": list(CALL_DISPOSITIONS)}
