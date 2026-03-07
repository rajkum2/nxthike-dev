import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False, default="student")  # student, employer, admin
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    profile_picture: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Student-specific fields
    resume: Mapped[str | None] = mapped_column(String, nullable=True)
    skills: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    education: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    experience: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    saved_jobs: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    applied_jobs: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)

    # Employer-specific fields
    company_name: Mapped[str | None] = mapped_column(String, nullable=True)
    company_logo: Mapped[str | None] = mapped_column(String, nullable=True)
    company_description: Mapped[str | None] = mapped_column(String, nullable=True)
    industry: Mapped[str | None] = mapped_column(String, nullable=True)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    website: Mapped[str | None] = mapped_column(String, nullable=True)
