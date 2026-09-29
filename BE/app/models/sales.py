"""Sales CRM models — Phase 1 tables + Phase 2 activity / approve-queue fields."""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

PRODUCT_LINES = ("staffing", "platform", "hybrid")
OPPORTUNITY_STAGES = (
    "qualify",
    "discovery",
    "proposal",
    "negotiation",
    "won",
    "lost",
    "on_hold",
)
LEAD_STATUSES = ("new", "working", "qualified", "disqualified", "converted")
ACTIVITY_TYPES = (
    "note",
    "call",
    "email",
    "meeting",
    "task",
    "outreach_draft",
    "outreach_sent",
    "stage_change",
)
ACTIVITY_STATUSES = (
    "planned",
    "done",
    "cancelled",
    "pending_approval",
    "approved",
    "rejected",
    "sent",
)
ACTIVITY_DIRECTIONS = ("inbound", "outbound", "internal")
ACTIVITY_CHANNELS = ("email", "phone", "linkedin", "whatsapp", "other")


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _uid(prefix: str):
    def gen() -> str:
        return f"{prefix}_{uuid.uuid4().hex[:16]}"

    return gen


class SalesContact(Base):
    __tablename__ = "sales_contacts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("scon"))
    company_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str] = mapped_column(Text, default="")
    owner_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class SalesLead(Base):
    __tablename__ = "sales_leads"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("slead"))
    company_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    contact_id: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    source: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="new", index=True)
    product_line: Mapped[str] = mapped_column(String, nullable=False, default="staffing", index=True)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    owner_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class SalesOpportunity(Base):
    __tablename__ = "sales_opportunities"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("sopp"))
    company_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    contact_id: Mapped[str | None] = mapped_column(String, nullable=True)
    lead_id: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    product_line: Mapped[str] = mapped_column(String, nullable=False, default="staffing", index=True)
    stage: Mapped[str] = mapped_column(String, nullable=False, default="qualify", index=True)
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String, nullable=False, default="INR")
    probability: Mapped[int | None] = mapped_column(Integer, nullable=True)
    expected_close: Mapped[date | None] = mapped_column(Date, nullable=True)
    #: Links to hiring_roles.id for staffing / hybrid deals (stub wiring Phase 1).
    hiring_role_ids: Mapped[list] = mapped_column(JSON, default=list)
    notes: Mapped[str] = mapped_column(Text, default="")
    owner_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    lost_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class SalesActivity(Base):
    """Sales activity / outreach draft with human approval gates (Phase 2)."""

    __tablename__ = "sales_activities"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("sact"))
    opportunity_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    lead_id: Mapped[str | None] = mapped_column(String, nullable=True)
    contact_id: Mapped[str | None] = mapped_column(String, nullable=True)
    company_id: Mapped[str | None] = mapped_column(String, nullable=True)
    activity_type: Mapped[str] = mapped_column(String, nullable=False, default="note")
    status: Mapped[str] = mapped_column(String, nullable=False, default="done", index=True)
    direction: Mapped[str | None] = mapped_column(String, nullable=True)
    channel: Mapped[str | None] = mapped_column(String, nullable=True)
    subject: Mapped[str | None] = mapped_column(String, nullable=True)
    body: Mapped[str] = mapped_column(Text, default="")
    body_html: Mapped[str | None] = mapped_column(Text, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    owner_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    approved_by: Mapped[str | None] = mapped_column(String, nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    rejected_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
