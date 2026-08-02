import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime, JSON, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class HiringRole(Base):
    """Internship / job role buckets for hiring CRM."""

    __tablename__ = "hiring_roles"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)


class Candidate(Base):
    """Applicant / candidate in the hiring pipeline."""

    __tablename__ = "candidates"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    role_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    role_name: Mapped[str] = mapped_column(String, nullable=False, default="")
    status: Mapped[str] = mapped_column(String, nullable=False, default="new", index=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    notes: Mapped[str] = mapped_column(Text, default="")
    starred: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    name: Mapped[str | None] = mapped_column(String, nullable=True)
    application_link: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    gender: Mapped[str | None] = mapped_column(String, nullable=True)
    other_skills: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_resume_match: Mapped[str | None] = mapped_column(String, nullable=True)

    institute: Mapped[str | None] = mapped_column(Text, nullable=True)
    degree: Mapped[str | None] = mapped_column(String, nullable=True)
    stream: Mapped[str | None] = mapped_column(String, nullable=True)
    graduation_year: Mapped[str | None] = mapped_column(String, nullable=True)
    performance_pg: Mapped[str | None] = mapped_column(String, nullable=True)
    performance_ug: Mapped[str | None] = mapped_column(String, nullable=True)
    performance_12: Mapped[str | None] = mapped_column(String, nullable=True)
    performance_10: Mapped[str | None] = mapped_column(String, nullable=True)

    chat_link: Mapped[str | None] = mapped_column(Text, nullable=True)
    resume_link: Mapped[str | None] = mapped_column(Text, nullable=True)
    download_link: Mapped[str | None] = mapped_column(Text, nullable=True)
    applied_at: Mapped[str | None] = mapped_column(String, nullable=True)

    has_work_experience: Mapped[str | None] = mapped_column(String, nullable=True)
    total_roles: Mapped[str | None] = mapped_column(String, nullable=True)
    internship_count: Mapped[str | None] = mapped_column(String, nullable=True)
    fulltime_count: Mapped[str | None] = mapped_column(String, nullable=True)
    companies: Mapped[str | None] = mapped_column(Text, nullable=True)
    job_titles: Mapped[str | None] = mapped_column(Text, nullable=True)
    work_experience_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    experience_duration: Mapped[str | None] = mapped_column(String, nullable=True)
    latest_role: Mapped[str | None] = mapped_column(String, nullable=True)
    latest_company: Mapped[str | None] = mapped_column(String, nullable=True)

    career_objective: Mapped[str | None] = mapped_column(Text, nullable=True)
    languages: Mapped[str | None] = mapped_column(Text, nullable=True)
    certifications: Mapped[str | None] = mapped_column(Text, nullable=True)
    projects: Mapped[str | None] = mapped_column(Text, nullable=True)
    extra_curricular: Mapped[str | None] = mapped_column(Text, nullable=True)
    additional_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    relevant_skills: Mapped[str | None] = mapped_column(Text, nullable=True)
    education_from_pdf: Mapped[str | None] = mapped_column(Text, nullable=True)
    stream_from_pdf: Mapped[str | None] = mapped_column(String, nullable=True)
    pdf_file: Mapped[str | None] = mapped_column(String, nullable=True)
    availability: Mapped[str | None] = mapped_column(Text, nullable=True)

    ai_interview_scores: Mapped[dict] = mapped_column(JSON, default=dict)
    skill_flags: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)
