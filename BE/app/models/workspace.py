"""
Workspace-level tables: settings, tasks, notifications and the audit trail.

All new tables — nothing here alters an existing one.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _uid(prefix: str):
    def gen() -> str:
        return f"{prefix}_{uuid.uuid4().hex[:16]}"

    return gen


# ---------------------------------------------------------------------------
# Personas
# ---------------------------------------------------------------------------

#: The eight product personas, with the capability set each one implies.
#:
#: This is the server's copy of the design's CAPS matrix. It is the authority —
#: the browser uses it to shape navigation, but every gated endpoint checks it
#: again, because a hidden nav item is a courtesy and not a control.
PERSONA_DEFS: list[dict] = [
    {
        "id": "p1", "name": "Senior Recruiter (360)", "short": "Recruiter", "mode": "AGENCY",
        "landing": "queue", "home": "dialer",
        "caps": {"db": "assigned", "create": True, "dial": True, "log": True, "reqs": "view",
                 "rates": False, "stage": True, "score": "ifPanel", "approve": False,
                 "eeo": False, "analytics": "own", "admin": False, "erasure": False},
    },
    {
        "id": "p2", "name": "Sourcer", "short": "Sourcer", "mode": "AGENCY",
        "landing": "cands", "home": "sourcer",
        "caps": {"db": "yes", "create": True, "dial": True, "log": True, "reqs": "none",
                 "rates": False, "stage": False, "score": False, "approve": False,
                 "eeo": False, "analytics": "own", "admin": False, "erasure": False},
    },
    {
        "id": "p3", "name": "In-house TA Specialist", "short": "In-house TA", "mode": "IN_HOUSE",
        "landing": "kanban", "home": "ta",
        "caps": {"db": "yes", "create": True, "dial": True, "log": True, "reqs": "own",
                 "rates": False, "stage": True, "score": True, "approve": "config",
                 "eeo": "gated", "analytics": "own", "admin": False, "erasure": False},
    },
    {
        "id": "p4", "name": "Recruitment Team Lead", "short": "Team Lead", "mode": "AGENCY",
        "landing": "team", "home": "lead",
        "caps": {"db": "all", "create": True, "dial": True, "log": True, "reqs": "all",
                 "rates": True, "stage": True, "score": True, "approve": True,
                 "eeo": "gated", "analytics": "team", "admin": "partial", "erasure": False},
    },
    {
        "id": "p5", "name": "Account Manager", "short": "Acct Mgr", "mode": "AGENCY",
        "landing": "clients", "home": "am",
        "caps": {"db": "limitedPII", "create": False, "dial": True, "log": True, "reqs": "all",
                 "rates": True, "stage": False, "score": False, "approve": "config",
                 "eeo": False, "analytics": "team", "admin": False, "erasure": False},
    },
    {
        "id": "p6", "name": "Hiring Manager", "short": "Hiring Mgr", "mode": "IN_HOUSE",
        "landing": "approvals", "home": "hm",
        "caps": {"db": "ownReqs", "create": False, "dial": False, "log": False, "reqs": "own",
                 "rates": False, "stage": True, "score": True, "approve": True,
                 "eeo": False, "analytics": "none", "admin": False, "erasure": False},
    },
    {
        "id": "p7", "name": "Interviewer / Panellist", "short": "Interviewer", "mode": "IN_HOUSE",
        "landing": "intcal", "home": "panel",
        "caps": {"db": "ownInterviews", "create": False, "dial": False, "log": False, "reqs": "none",
                 "rates": False, "stage": False, "score": True, "approve": False,
                 "eeo": False, "analytics": "none", "admin": False, "erasure": False},
    },
    {
        "id": "p8", "name": "Admin / Ops", "short": "Admin", "mode": "AGENCY",
        "landing": "users", "home": "admin",
        "caps": {"db": "all", "create": True, "dial": True, "log": True, "reqs": "all",
                 "rates": True, "stage": True, "score": True, "approve": True,
                 "eeo": True, "analytics": "all", "admin": True, "erasure": True},
    },
]

PERSONA_IDS = tuple(p["id"] for p in PERSONA_DEFS)
PERSONA_BY_ID = {p["id"]: p for p in PERSONA_DEFS}

#: Anyone whose account predates personas, or who has no persona set, behaves as
#: a full admin if their coarse role says so, and as a recruiter otherwise.
DEFAULT_PERSONA_FOR_ROLE = {"admin": "p8", "employer": "p5", "student": "p1"}


def resolve_persona(persona: str | None, role: str | None) -> dict:
    if persona and persona in PERSONA_BY_ID:
        return PERSONA_BY_ID[persona]
    return PERSONA_BY_ID[DEFAULT_PERSONA_FOR_ROLE.get(role or "", "p1")]


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

SETTINGS_SINGLETON_ID = "default"

DEFAULT_ROLE_MATRIX: dict = {
    # capability -> {persona short key -> level}
    # Levels: none | view | yes | all. Seeded from the design's starting matrix.
    "See candidate phone / email": {"sourcer": "view", "recruiter": "all", "lead": "all", "admin": "all"},
    "Log call outcomes": {"sourcer": "yes", "recruiter": "yes", "lead": "yes", "admin": "yes"},
    "Move pipeline stages": {"sourcer": "none", "recruiter": "yes", "lead": "yes", "admin": "yes"},
    "Create requisitions": {"sourcer": "none", "recruiter": "none", "lead": "yes", "admin": "yes"},
    "Approve offers": {"sourcer": "none", "recruiter": "none", "lead": "yes", "admin": "yes"},
    "See client commercials": {"sourcer": "none", "recruiter": "none", "lead": "view", "admin": "all"},
    "Export reports": {"sourcer": "none", "recruiter": "none", "lead": "yes", "admin": "yes"},
    "Purge candidate records": {"sourcer": "none", "recruiter": "none", "lead": "none", "admin": "yes"},
    "Edit the disposition taxonomy": {"sourcer": "none", "recruiter": "none", "lead": "none", "admin": "yes"},
}


class WorkspaceSettings(Base):
    """Single-row workspace configuration."""

    __tablename__ = "workspace_settings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=SETTINGS_SINGLETON_ID)
    org_name: Mapped[str] = mapped_column(String, default="Zenith Talent Solutions")
    mode: Mapped[str] = mapped_column(String, default="AGENCY")  # AGENCY | IN_HOUSE

    # TCCCPR calling window. Enforced by the API, not merely displayed.
    window_open_hour: Mapped[int] = mapped_column(Integer, default=9)
    window_close_hour: Mapped[int] = mapped_column(Integer, default=21)
    #: ISO weekday numbers, Monday = 1.
    window_days: Mapped[list] = mapped_column(JSON, default=lambda: [1, 2, 3, 4, 5, 6])
    timezone: Mapped[str] = mapped_column(String, default="Asia/Kolkata")

    retention_months: Mapped[int] = mapped_column(Integer, default=24)
    notification_toggles: Mapped[dict] = mapped_column(JSON, default=dict)
    role_matrix: Mapped[dict] = mapped_column(JSON, default=lambda: dict(DEFAULT_ROLE_MATRIX))

    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------


class Task(Base):
    # Namespaced: this Supabase project is shared with another application that
    # already owns generic names like `audit_events` and `close_tasks`.
    __tablename__ = "workspace_tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("task"))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    detail: Mapped[str] = mapped_column(Text, default="")
    due_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)

    assignee_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    assignee_name: Mapped[str | None] = mapped_column(String, nullable=True)

    #: What the task points at, so the UI can deep-link.
    link_kind: Mapped[str | None] = mapped_column(String, nullable=True)  # candidate | requisition | client
    link_id: Mapped[str | None] = mapped_column(String, nullable=True)
    link_label: Mapped[str | None] = mapped_column(String, nullable=True)

    done: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    done_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    snoozed_until: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_by: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

NOTIFICATION_KINDS = ("callback", "mention", "approval", "interview", "system", "data")


class Notification(Base):
    __tablename__ = "workspace_notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("notif"))
    user_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    kind: Mapped[str] = mapped_column(String, nullable=False, default="system", index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    detail: Mapped[str] = mapped_column(Text, default="")

    ref_kind: Mapped[str | None] = mapped_column(String, nullable=True)
    ref_id: Mapped[str | None] = mapped_column(String, nullable=True)

    read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)


# ---------------------------------------------------------------------------
# Audit
# ---------------------------------------------------------------------------


class AuditEvent(Base):
    """
    Append-only record of who changed what. Written by the API, never edited by
    it — the compliance screen presents this as immutable and means it.
    """

    #: NOT `audit_events` — that table already exists in this Supabase project
    #: and belongs to a different application.
    __tablename__ = "workspace_audit_events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("aud"))
    actor_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    actor_name: Mapped[str | None] = mapped_column(String, nullable=True)
    actor_email: Mapped[str | None] = mapped_column(String, nullable=True)

    action: Mapped[str] = mapped_column(String, nullable=False, index=True)
    object_kind: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    object_id: Mapped[str | None] = mapped_column(String, nullable=True)
    object_label: Mapped[str | None] = mapped_column(String, nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)


# ---------------------------------------------------------------------------
# Erasure requests (DPDP)
# ---------------------------------------------------------------------------

ERASURE_STATUSES = ("open", "verifying", "ready", "purged", "rejected")


class ErasureRequest(Base):
    __tablename__ = "workspace_erasure_requests"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("era"))
    candidate_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    candidate_name: Mapped[str | None] = mapped_column(String, nullable=True)
    reason: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String, nullable=False, default="open", index=True)

    raised_by: Mapped[str | None] = mapped_column(String, nullable=True)
    raised_by_name: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    resolved_by: Mapped[str | None] = mapped_column(String, nullable=True)
