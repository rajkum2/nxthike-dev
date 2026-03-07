import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate, CourseListResponse, CourseDetailResponse, PaginatedCourseResponse
from app.services.auth import get_admin_user
from app.models.user import User

router = APIRouter(prefix="/api/courses", tags=["courses"])


def course_to_list(c: Course) -> CourseListResponse:
    return CourseListResponse(
        id=c.id,
        title=c.title,
        description=c.description,
        instructor=c.instructor,
        category=c.category,
        level=c.level,
        duration=c.duration,
        price=c.price,
        discount=c.discount,
        image=c.image,
        enrollments=c.enrollments,
    )


def course_to_detail(c: Course) -> CourseDetailResponse:
    return CourseDetailResponse(
        id=c.id,
        title=c.title,
        description=c.description,
        instructor=c.instructor,
        category=c.category,
        level=c.level,
        duration=c.duration,
        price=c.price,
        discount=c.discount,
        image=c.image,
        enrollments=c.enrollments,
        instructorTitle=c.instructor_title,
        instructorAvatar=c.instructor_avatar,
        instructorBio=c.instructor_bio,
        rating=c.rating,
        reviewCount=c.review_count,
        whatYouWillLearn=c.what_you_will_learn or [],
        prerequisites=c.prerequisites or [],
        curriculum=c.curriculum or [],
        reviews=c.reviews or [],
    )


@router.get("", response_model=PaginatedCourseResponse)
async def list_courses(
    category: str | None = None,
    level: str | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(9, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Course)

    if category:
        query = query.where(func.lower(Course.category) == category.lower())
    if level:
        query = query.where(Course.level == level)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Course.enrollments.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    courses = result.scalars().all()

    return PaginatedCourseResponse(
        items=[course_to_list(c) for c in courses],
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total > 0 else 0,
    )


@router.get("/{course_id}", response_model=CourseDetailResponse)
async def get_course(course_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course_to_detail(course)


@router.post("", response_model=CourseDetailResponse)
async def create_course(data: CourseCreate, user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    course = Course(
        title=data.title,
        description=data.description,
        instructor=data.instructor,
        category=data.category,
        level=data.level,
        duration=data.duration,
        price=data.price.model_dump(),
        discount=data.discount.model_dump() if data.discount else None,
        image=data.image,
        enrollments=data.enrollments,
        instructor_title=data.instructorTitle,
        instructor_avatar=data.instructorAvatar,
        instructor_bio=data.instructorBio,
        rating=data.rating,
        review_count=data.reviewCount,
        what_you_will_learn=data.whatYouWillLearn,
        prerequisites=data.prerequisites,
        curriculum=[s.model_dump() for s in data.curriculum],
        reviews=[r.model_dump() for r in data.reviews],
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course_to_detail(course)


@router.put("/{course_id}", response_model=CourseDetailResponse)
async def update_course(course_id: str, data: CourseUpdate, user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = data.model_dump(exclude_unset=True)
    field_map = {
        "instructorTitle": "instructor_title",
        "instructorAvatar": "instructor_avatar",
        "instructorBio": "instructor_bio",
        "reviewCount": "review_count",
        "whatYouWillLearn": "what_you_will_learn",
    }
    for camel, snake in field_map.items():
        if camel in update_data:
            update_data[snake] = update_data.pop(camel)

    if "price" in update_data and update_data["price"]:
        update_data["price"] = update_data["price"].model_dump() if hasattr(update_data["price"], "model_dump") else update_data["price"]
    if "discount" in update_data and update_data["discount"]:
        update_data["discount"] = update_data["discount"].model_dump() if hasattr(update_data["discount"], "model_dump") else update_data["discount"]
    for key in ("curriculum", "reviews"):
        if key in update_data and update_data[key] is not None:
            update_data[key] = [item.model_dump() if hasattr(item, "model_dump") else item for item in update_data[key]]

    for key, value in update_data.items():
        if hasattr(course, key):
            setattr(course, key, value)

    await db.commit()
    await db.refresh(course)
    return course_to_detail(course)


@router.delete("/{course_id}")
async def delete_course(course_id: str, user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    await db.delete(course)
    await db.commit()
    return {"message": "Course deleted"}
