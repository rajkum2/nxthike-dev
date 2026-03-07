import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, DateTime, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String, nullable=False)
    company: Mapped[str] = mapped_column(String, nullable=False)
    company_logo: Mapped[str | None] = mapped_column(String, nullable=True)
    location: Mapped[str] = mapped_column(String, nullable=False)
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False)
    type: Mapped[str] = mapped_column(String, nullable=False)  # internship, full-time, part-time, contract
    category: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[list] = mapped_column(JSON, default=list)
    responsibilities: Mapped[list] = mapped_column(JSON, default=list)
    salary: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # {min, max, currency}
    stipend: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # {amount, currency, period}
    duration: Mapped[str | None] = mapped_column(String, nullable=True)
    application_deadline: Mapped[str] = mapped_column(String, nullable=False)
    posted_by: Mapped[str] = mapped_column(String, nullable=False, default="admin")
    posted_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    status: Mapped[str] = mapped_column(String, default="approved")  # pending, approved, rejected
    applicants: Mapped[list] = mapped_column(JSON, default=list)
