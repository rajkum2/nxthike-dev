import uuid

from sqlalchemy import String, Boolean, Integer, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String, nullable=False)  # webinar, hackathon, workshop, networking
    date: Mapped[str] = mapped_column(String, nullable=False)
    time: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    is_online: Mapped[bool] = mapped_column(Boolean, default=False)
    link: Mapped[str | None] = mapped_column(String, nullable=True)
    organizer: Mapped[str] = mapped_column(String, nullable=False)
    image: Mapped[str | None] = mapped_column(String, nullable=True)
    registrations: Mapped[list] = mapped_column(JSON, default=list)

    # Detail fields (stored on same table)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    organizer_logo: Mapped[str | None] = mapped_column(String, nullable=True)
    attendees: Mapped[int] = mapped_column(Integer, default=0)
    max_attendees: Mapped[int] = mapped_column(Integer, default=0)
    agenda: Mapped[list] = mapped_column(JSON, default=list)  # [{time, title}]
    speakers: Mapped[list] = mapped_column(JSON, default=list)  # [{name, role, avatar, bio}]
    sponsors: Mapped[list] = mapped_column(JSON, default=list)  # [{name, logo}]
