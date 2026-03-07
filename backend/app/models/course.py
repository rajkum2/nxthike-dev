import uuid

from sqlalchemy import String, Integer, Float, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    instructor: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    level: Mapped[str] = mapped_column(String, nullable=False)  # beginner, intermediate, advanced
    duration: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[dict] = mapped_column(JSON, nullable=False)  # {amount, currency}
    discount: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # {amount, currency}
    image: Mapped[str | None] = mapped_column(String, nullable=True)
    enrollments: Mapped[int] = mapped_column(Integer, default=0)

    # Detail fields
    instructor_title: Mapped[str | None] = mapped_column(String, nullable=True)
    instructor_avatar: Mapped[str | None] = mapped_column(String, nullable=True)
    instructor_bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    what_you_will_learn: Mapped[list] = mapped_column(JSON, default=list)
    prerequisites: Mapped[list] = mapped_column(JSON, default=list)
    curriculum: Mapped[list] = mapped_column(JSON, default=list)  # [{title, lessons: [{title, duration, isFree}]}]
    reviews: Mapped[list] = mapped_column(JSON, default=list)  # [{id, name, avatar, rating, date, comment}]
