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
    #: True for an account the agency actually works with — a client. False for
    #: a prospect imported from a directory (Google Maps and similar), which is
    #: desk-only and never surfaces on the public portal.
    is_client: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    #: [{name, role, phone, email}]
    contacts: Mapped[list] = mapped_column(JSON, default=list)

    # --- Local-business / directory fields --------------------------------
    # Client accounts sourced from listings (Google Maps and similar) carry
    # storefront detail the portal companies never had: a dialable number, a
    # street address, and the public rating the desk screens accounts by.
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    #: Business WhatsApp, when it differs from the landline. Blank falls back to
    #: `phone` if that looks like a mobile.
    whatsapp: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    pincode: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True, index=True)
    reviews_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    maps_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    #: Where the account came from — "Google Maps", "Referral", manual entry.
    source: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    #: {"monday": "9 am–9 pm", ...} as published by the listing.
    hours: Mapped[dict] = mapped_column(JSON, default=dict)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)
