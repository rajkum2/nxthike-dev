"""
Recruiting domain the TalentDialer web workspace needs beyond the original CRM.

Everything here is a new table, so it is created by `create_all` without
touching a single existing row. Foreign keys are stored as plain strings to
match the conventions already used across this codebase (and to stay tolerant
of the seeded string ids like `admin-1`).
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _uid(prefix: str):
    def gen() -> str:
        return f"{prefix}_{uuid.uuid4().hex[:16]}"

    return gen


# ---------------------------------------------------------------------------
# Notes
# ---------------------------------------------------------------------------

NOTE_VISIBILITIES = ("shared", "private")


class CandidateNote(Base):
    """
    A note against a candidate.

    The original CRM appended notes into one growing text blob on the candidate
    row, which cannot express an author or a visibility. That blob is left
    exactly as it is; new notes land here.
    """

    __tablename__ = "workspace_candidate_notes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("note"))
    candidate_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    author_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    author_name: Mapped[str | None] = mapped_column(String, nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    visibility: Mapped[str] = mapped_column(String, nullable=False, default="shared")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)


# ---------------------------------------------------------------------------
# Submissions
# ---------------------------------------------------------------------------

SUBMISSION_STATUSES = (
    "submitted",
    "client_review",
    "interview_scheduled",
    "rejected",
    "placed",
    "withdrawn",
)


class Submission(Base):
    """A candidate put forward to a client against a requisition."""

    __tablename__ = "workspace_submissions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("sub"))
    candidate_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    candidate_name: Mapped[str | None] = mapped_column(String, nullable=True)
    requisition_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    requisition_name: Mapped[str | None] = mapped_column(String, nullable=True)
    client_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    client_name: Mapped[str | None] = mapped_column(String, nullable=True)

    status: Mapped[str] = mapped_column(String, nullable=False, default="submitted", index=True)
    submitted_ctc: Mapped[float | None] = mapped_column(Float, nullable=True)
    note: Mapped[str] = mapped_column(Text, default="")

    submitted_by: Mapped[str | None] = mapped_column(String, nullable=True)
    submitted_by_name: Mapped[str | None] = mapped_column(String, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ---------------------------------------------------------------------------
# Interviews & scorecards
# ---------------------------------------------------------------------------

INTERVIEW_TYPES = ("screening", "technical", "panel", "culture", "hr")
INTERVIEW_STATUSES = ("scheduled", "completed", "cancelled", "no_show")


class Interview(Base):
    __tablename__ = "workspace_interviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("int"))
    candidate_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    candidate_name: Mapped[str | None] = mapped_column(String, nullable=True)
    requisition_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    requisition_name: Mapped[str | None] = mapped_column(String, nullable=True)

    kind: Mapped[str] = mapped_column(String, nullable=False, default="technical")
    round_label: Mapped[str | None] = mapped_column(String, nullable=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=45)
    mode: Mapped[str | None] = mapped_column(String, nullable=True)  # Google Meet, office, phone
    location: Mapped[str | None] = mapped_column(Text, nullable=True)

    #: [{id, name, email}] — the panel, denormalised so the kit renders offline.
    panel: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String, nullable=False, default="scheduled", index=True)

    created_by: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


RECOMMENDATIONS = ("strong_hire", "hire", "no_hire", "strong_no")


class Scorecard(Base):
    __tablename__ = "workspace_scorecards"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("score"))
    interview_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    candidate_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    panellist_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    panellist_name: Mapped[str | None] = mapped_column(String, nullable=True)

    #: {competency: 1..4}
    scores: Mapped[dict] = mapped_column(JSON, default=dict)
    recommendation: Mapped[str | None] = mapped_column(String, nullable=True)
    evidence: Mapped[str] = mapped_column(Text, default="")
    is_draft: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


# ---------------------------------------------------------------------------
# Offers
# ---------------------------------------------------------------------------

OFFER_STATUSES = (
    "draft",
    "pending_approval",
    "approved",
    "extended",
    "accepted",
    "joined",
    "declined",
    "dropped",
    "rejected",
)


class Offer(Base):
    __tablename__ = "workspace_offers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("off"))
    reference: Mapped[str | None] = mapped_column(String, nullable=True)
    candidate_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    candidate_name: Mapped[str | None] = mapped_column(String, nullable=True)
    requisition_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    requisition_name: Mapped[str | None] = mapped_column(String, nullable=True)
    client_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    client_name: Mapped[str | None] = mapped_column(String, nullable=True)

    status: Mapped[str] = mapped_column(String, nullable=False, default="draft", index=True)
    ctc_total: Mapped[float | None] = mapped_column(Float, nullable=True)
    #: [{label, amount}] — fixed, bonus, retention, ESOP…
    breakup: Mapped[list] = mapped_column(JSON, default=list)
    band_note: Mapped[str | None] = mapped_column(String, nullable=True)

    joining_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notice_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    buyout_cost: Mapped[float | None] = mapped_column(Float, nullable=True)

    #: Rendered letter, produced by merging the template with this offer.
    letter_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    letter_sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    signed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_by: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


APPROVAL_KINDS = ("offer", "requisition", "rate_exception")
APPROVAL_STATUSES = ("pending", "approved", "rejected")


class Approval(Base):
    """One decision in an approval chain. Several rows form the chain."""

    __tablename__ = "workspace_approvals"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("apr"))
    kind: Mapped[str] = mapped_column(String, nullable=False, default="offer", index=True)
    ref_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    ref_label: Mapped[str | None] = mapped_column(String, nullable=True)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)

    requested_by: Mapped[str | None] = mapped_column(String, nullable=True)
    requested_by_name: Mapped[str | None] = mapped_column(String, nullable=True)
    approver_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    approver_name: Mapped[str | None] = mapped_column(String, nullable=True)
    approver_role: Mapped[str | None] = mapped_column(String, nullable=True)
    sequence: Mapped[int] = mapped_column(Integer, default=0)

    status: Mapped[str] = mapped_column(String, nullable=False, default="pending", index=True)
    comment: Mapped[str] = mapped_column(Text, default="")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, index=True)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


# ---------------------------------------------------------------------------
# Tags, long-lists and saved searches
# ---------------------------------------------------------------------------

TAG_KINDS = ("list", "skill", "source", "status")


class Tag(Base):
    """
    Registry of tags. Assignment still lives in `candidates.tags` (a JSON list
    of names) so no existing candidate data has to be rewritten — this table
    gives those names a colour, a kind and an owner.
    """

    __tablename__ = "workspace_tags"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("tag"))
    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    kind: Mapped[str] = mapped_column(String, nullable=False, default="list")
    color: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


class SavedSearch(Base):
    __tablename__ = "workspace_saved_searches"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("srch"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    owner_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    owner_name: Mapped[str | None] = mapped_column(String, nullable=True)
    #: Whatever the candidate list filter bar produced.
    filters: Mapped[dict] = mapped_column(JSON, default=dict)
    shared: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)


# ---------------------------------------------------------------------------
# Outreach templates
# ---------------------------------------------------------------------------

TEMPLATE_CHANNELS = ("whatsapp", "sms", "email")


class MessageTemplate(Base):
    __tablename__ = "workspace_message_templates"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uid("tmpl"))
    name: Mapped[str] = mapped_column(String, nullable=False)
    channel: Mapped[str] = mapped_column(String, nullable=False, default="whatsapp", index=True)
    stage: Mapped[str | None] = mapped_column(String, nullable=True)
    subject: Mapped[str | None] = mapped_column(String, nullable=True)
    #: Uses {{name}}, {{role}}, {{client}}, {{comp}}, {{recruiter}} tokens.
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
