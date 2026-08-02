from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.event import Event
from app.models.course import Course
from app.models.company import Company
from app.services.auth import get_admin_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_stats(user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    jobs_count = (await db.execute(select(func.count()).select_from(Job))).scalar() or 0
    events_count = (await db.execute(select(func.count()).select_from(Event))).scalar() or 0
    courses_count = (await db.execute(select(func.count()).select_from(Course))).scalar() or 0
    companies_count = (await db.execute(select(func.count()).select_from(Company))).scalar() or 0
    users_count = (await db.execute(select(func.count()).select_from(User))).scalar() or 0

    # Counts by type
    internships = (await db.execute(select(func.count()).select_from(Job).where(Job.type == "internship"))).scalar() or 0
    fulltime = (await db.execute(select(func.count()).select_from(Job).where(Job.type == "full-time"))).scalar() or 0

    return {
        "jobs": jobs_count,
        "internships": internships,
        "fulltime": fulltime,
        "events": events_count,
        "courses": courses_count,
        "companies": companies_count,
        "users": users_count,
    }
