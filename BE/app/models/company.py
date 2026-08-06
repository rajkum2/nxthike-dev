import uuid

from sqlalchemy import Boolean, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    logo: Mapped[str | None] = mapped_column(String, nullable=True)
    industry: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    open_positions: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    website: Mapped[str | None] = mapped_column(String, nullable=True)

    # --- Client-account fields for the recruiting workspace ---
    #: good | watch | risk
    health: Mapped[str] = mapped_column(String, default="good")
    margin_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    terms: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    #: Separates CRM client accounts from the public portal's company listings.
    is_client: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    #: [{name, role, phone, email}]
    contacts: Mapped[list] = mapped_column(JSON, default=list)
