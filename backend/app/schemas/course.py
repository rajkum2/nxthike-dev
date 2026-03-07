from pydantic import BaseModel


class PriceSchema(BaseModel):
    amount: float
    currency: str = "USD"


class LessonSchema(BaseModel):
    title: str
    duration: str
    isFree: bool = False


class CurriculumSectionSchema(BaseModel):
    title: str
    lessons: list[LessonSchema]


class ReviewSchema(BaseModel):
    id: str
    name: str
    avatar: str
    rating: int
    date: str
    comment: str


class CourseCreate(BaseModel):
    title: str
    description: str
    instructor: str
    category: str
    level: str  # beginner, intermediate, advanced
    duration: str
    price: PriceSchema
    discount: PriceSchema | None = None
    image: str | None = None
    enrollments: int = 0
    instructorTitle: str | None = None
    instructorAvatar: str | None = None
    instructorBio: str | None = None
    rating: float = 0.0
    reviewCount: int = 0
    whatYouWillLearn: list[str] = []
    prerequisites: list[str] = []
    curriculum: list[CurriculumSectionSchema] = []
    reviews: list[ReviewSchema] = []


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    instructor: str | None = None
    category: str | None = None
    level: str | None = None
    duration: str | None = None
    price: PriceSchema | None = None
    discount: PriceSchema | None = None
    image: str | None = None
    enrollments: int | None = None
    instructorTitle: str | None = None
    instructorAvatar: str | None = None
    instructorBio: str | None = None
    rating: float | None = None
    reviewCount: int | None = None
    whatYouWillLearn: list[str] | None = None
    prerequisites: list[str] | None = None
    curriculum: list[CurriculumSectionSchema] | None = None
    reviews: list[ReviewSchema] | None = None


class CourseListResponse(BaseModel):
    id: str
    title: str
    description: str
    instructor: str
    category: str
    level: str
    duration: str
    price: dict
    discount: dict | None = None
    image: str | None = None
    enrollments: int

    model_config = {"from_attributes": True}


class CourseDetailResponse(CourseListResponse):
    instructorTitle: str | None = None
    instructorAvatar: str | None = None
    instructorBio: str | None = None
    rating: float
    reviewCount: int
    whatYouWillLearn: list
    prerequisites: list
    curriculum: list
    reviews: list


class PaginatedCourseResponse(BaseModel):
    items: list[CourseListResponse]
    total: int
    page: int
    per_page: int
    pages: int
