import os
from fastapi import APIRouter, Request, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.event import Event
from app.models.course import Course
from app.models.company import Company
from app.services.auth import verify_password, create_access_token, decode_token

router = APIRouter(prefix="/admin", tags=["admin"])
templates = Jinja2Templates(directory=os.path.join(os.path.dirname(__file__), "templates"))


async def get_admin_from_cookie(request: Request, db: AsyncSession) -> User | None:
    token = request.cookies.get("admin_token")
    if not token:
        return None
    user_id = decode_token(token)
    if not user_id:
        return None
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user and user.role == "admin":
        return user
    return None


# --- Login ---
@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request, "error": None})


@router.post("/login", response_class=HTMLResponse)
async def login_submit(request: Request, email: str = Form(...), password: str = Form(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash) or user.role != "admin":
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid credentials or not an admin"})

    token = create_access_token(user.id)
    response = RedirectResponse(url="/admin/", status_code=303)
    response.set_cookie("admin_token", token, httponly=True, max_age=60 * 60 * 24 * 7)
    return response


@router.get("/logout")
async def logout():
    response = RedirectResponse(url="/admin/login", status_code=303)
    response.delete_cookie("admin_token")
    return response


# --- Dashboard ---
@router.get("/", response_class=HTMLResponse)
async def dashboard_page(request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    stats = {
        "jobs": (await db.execute(select(func.count()).select_from(Job))).scalar() or 0,
        "events": (await db.execute(select(func.count()).select_from(Event))).scalar() or 0,
        "courses": (await db.execute(select(func.count()).select_from(Course))).scalar() or 0,
        "companies": (await db.execute(select(func.count()).select_from(Company))).scalar() or 0,
        "users": (await db.execute(select(func.count()).select_from(User))).scalar() or 0,
    }
    return templates.TemplateResponse("dashboard.html", {"request": request, "admin": admin, "stats": stats})


# --- Jobs ---
@router.get("/jobs", response_class=HTMLResponse)
async def jobs_page(request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Job).order_by(Job.posted_at.desc()))
    jobs = result.scalars().all()
    return templates.TemplateResponse("jobs.html", {"request": request, "admin": admin, "jobs": jobs})


@router.get("/jobs/new", response_class=HTMLResponse)
async def job_new_page(request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)
    return templates.TemplateResponse("job_form.html", {"request": request, "admin": admin, "job": None})


@router.get("/jobs/{job_id}/edit", response_class=HTMLResponse)
async def job_edit_page(job_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404)
    return templates.TemplateResponse("job_form.html", {"request": request, "admin": admin, "job": job})


@router.post("/jobs/save", response_class=HTMLResponse)
async def job_save(
    request: Request,
    db: AsyncSession = Depends(get_db),
    job_id: str = Form(""),
    title: str = Form(...),
    company: str = Form(...),
    company_logo: str = Form(""),
    location: str = Form(...),
    is_remote: str = Form("off"),
    job_type: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    requirements: str = Form(""),
    responsibilities: str = Form(""),
    application_deadline: str = Form(...),
    status: str = Form("approved"),
    salary_min: str = Form(""),
    salary_max: str = Form(""),
    salary_currency: str = Form("USD"),
    stipend_amount: str = Form(""),
    stipend_currency: str = Form("USD"),
    stipend_period: str = Form("monthly"),
    duration: str = Form(""),
):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    salary = None
    if salary_min and salary_max:
        salary = {"min": int(salary_min), "max": int(salary_max), "currency": salary_currency}

    stipend = None
    if stipend_amount:
        stipend = {"amount": int(stipend_amount), "currency": stipend_currency, "period": stipend_period}

    req_list = [r.strip() for r in requirements.split("\n") if r.strip()]
    resp_list = [r.strip() for r in responsibilities.split("\n") if r.strip()]

    if job_id:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if job:
            job.title = title
            job.company = company
            job.company_logo = company_logo or None
            job.location = location
            job.is_remote = is_remote == "on"
            job.type = job_type
            job.category = category
            job.description = description
            job.requirements = req_list
            job.responsibilities = resp_list
            job.application_deadline = application_deadline
            job.status = status
            job.salary = salary
            job.stipend = stipend
            job.duration = duration or None
    else:
        from datetime import datetime, timezone
        job = Job(
            title=title, company=company, company_logo=company_logo or None,
            location=location, is_remote=is_remote == "on", type=job_type,
            category=category, description=description, requirements=req_list,
            responsibilities=resp_list, application_deadline=application_deadline,
            posted_by=admin.id, posted_at=datetime.now(timezone.utc),
            status=status, salary=salary, stipend=stipend, duration=duration or None,
        )
        db.add(job)

    await db.commit()
    return RedirectResponse(url="/admin/jobs", status_code=303)


@router.post("/jobs/{job_id}/delete")
async def job_delete(job_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if job:
        await db.delete(job)
        await db.commit()
    return RedirectResponse(url="/admin/jobs", status_code=303)


# --- Events ---
@router.get("/events", response_class=HTMLResponse)
async def events_page(request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Event).order_by(Event.date.asc()))
    events = result.scalars().all()
    return templates.TemplateResponse("events.html", {"request": request, "admin": admin, "events": events})


@router.get("/events/new", response_class=HTMLResponse)
async def event_new_page(request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)
    return templates.TemplateResponse("event_form.html", {"request": request, "admin": admin, "event": None})


@router.get("/events/{event_id}/edit", response_class=HTMLResponse)
async def event_edit_page(event_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404)
    return templates.TemplateResponse("event_form.html", {"request": request, "admin": admin, "event": event})


@router.post("/events/save")
async def event_save(
    request: Request,
    db: AsyncSession = Depends(get_db),
    event_id: str = Form(""),
    title: str = Form(...),
    description: str = Form(...),
    event_type: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    location: str = Form(""),
    is_online: str = Form("off"),
    link: str = Form(""),
    organizer: str = Form(...),
    image: str = Form(""),
    address: str = Form(""),
    organizer_logo: str = Form(""),
    attendees: str = Form("0"),
    max_attendees: str = Form("0"),
):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    if event_id:
        result = await db.execute(select(Event).where(Event.id == event_id))
        event = result.scalar_one_or_none()
        if event:
            event.title = title
            event.description = description
            event.type = event_type
            event.date = date
            event.time = time
            event.location = location or None
            event.is_online = is_online == "on"
            event.link = link or None
            event.organizer = organizer
            event.image = image or None
            event.address = address or None
            event.organizer_logo = organizer_logo or None
            event.attendees = int(attendees)
            event.max_attendees = int(max_attendees)
    else:
        event = Event(
            title=title, description=description, type=event_type,
            date=date, time=time, location=location or None,
            is_online=is_online == "on", link=link or None,
            organizer=organizer, image=image or None,
            address=address or None, organizer_logo=organizer_logo or None,
            attendees=int(attendees), max_attendees=int(max_attendees),
        )
        db.add(event)

    await db.commit()
    return RedirectResponse(url="/admin/events", status_code=303)


@router.post("/events/{event_id}/delete")
async def event_delete(event_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if event:
        await db.delete(event)
        await db.commit()
    return RedirectResponse(url="/admin/events", status_code=303)


# --- Courses ---
@router.get("/courses", response_class=HTMLResponse)
async def courses_page(request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Course).order_by(Course.title))
    courses = result.scalars().all()
    return templates.TemplateResponse("courses.html", {"request": request, "admin": admin, "courses": courses})


@router.get("/courses/new", response_class=HTMLResponse)
async def course_new_page(request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)
    return templates.TemplateResponse("course_form.html", {"request": request, "admin": admin, "course": None})


@router.get("/courses/{course_id}/edit", response_class=HTMLResponse)
async def course_edit_page(course_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404)
    return templates.TemplateResponse("course_form.html", {"request": request, "admin": admin, "course": course})


@router.post("/courses/save")
async def course_save(
    request: Request,
    db: AsyncSession = Depends(get_db),
    course_id: str = Form(""),
    title: str = Form(...),
    description: str = Form(...),
    instructor: str = Form(...),
    category: str = Form(...),
    level: str = Form(...),
    duration: str = Form(...),
    price_amount: str = Form(...),
    price_currency: str = Form("USD"),
    discount_amount: str = Form(""),
    discount_currency: str = Form("USD"),
    image: str = Form(""),
    enrollments: str = Form("0"),
    instructor_title: str = Form(""),
    instructor_avatar: str = Form(""),
    instructor_bio: str = Form(""),
    rating: str = Form("0"),
    review_count: str = Form("0"),
):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    price = {"amount": float(price_amount), "currency": price_currency}
    discount = None
    if discount_amount:
        discount = {"amount": float(discount_amount), "currency": discount_currency}

    if course_id:
        result = await db.execute(select(Course).where(Course.id == course_id))
        course = result.scalar_one_or_none()
        if course:
            course.title = title
            course.description = description
            course.instructor = instructor
            course.category = category
            course.level = level
            course.duration = duration
            course.price = price
            course.discount = discount
            course.image = image or None
            course.enrollments = int(enrollments)
            course.instructor_title = instructor_title or None
            course.instructor_avatar = instructor_avatar or None
            course.instructor_bio = instructor_bio or None
            course.rating = float(rating)
            course.review_count = int(review_count)
    else:
        course = Course(
            title=title, description=description, instructor=instructor,
            category=category, level=level, duration=duration,
            price=price, discount=discount, image=image or None,
            enrollments=int(enrollments), instructor_title=instructor_title or None,
            instructor_avatar=instructor_avatar or None, instructor_bio=instructor_bio or None,
            rating=float(rating), review_count=int(review_count),
        )
        db.add(course)

    await db.commit()
    return RedirectResponse(url="/admin/courses", status_code=303)


@router.post("/courses/{course_id}/delete")
async def course_delete(course_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if course:
        await db.delete(course)
        await db.commit()
    return RedirectResponse(url="/admin/courses", status_code=303)


# --- Companies ---
@router.get("/companies", response_class=HTMLResponse)
async def companies_page(request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Company).order_by(Company.name))
    companies = result.scalars().all()
    return templates.TemplateResponse("companies.html", {"request": request, "admin": admin, "companies": companies})


@router.get("/companies/new", response_class=HTMLResponse)
async def company_new_page(request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)
    return templates.TemplateResponse("company_form.html", {"request": request, "admin": admin, "company": None})


@router.get("/companies/{company_id}/edit", response_class=HTMLResponse)
async def company_edit_page(company_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404)
    return templates.TemplateResponse("company_form.html", {"request": request, "admin": admin, "company": company})


@router.post("/companies/save")
async def company_save(
    request: Request,
    db: AsyncSession = Depends(get_db),
    company_id: str = Form(""),
    name: str = Form(...),
    logo: str = Form(""),
    industry: str = Form(...),
    location: str = Form(...),
    open_positions: str = Form("0"),
    description: str = Form(...),
    website: str = Form(""),
):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    if company_id:
        result = await db.execute(select(Company).where(Company.id == company_id))
        company = result.scalar_one_or_none()
        if company:
            company.name = name
            company.logo = logo or None
            company.industry = industry
            company.location = location
            company.open_positions = int(open_positions)
            company.description = description
            company.website = website or None
    else:
        company = Company(
            name=name, logo=logo or None, industry=industry,
            location=location, open_positions=int(open_positions),
            description=description, website=website or None,
        )
        db.add(company)

    await db.commit()
    return RedirectResponse(url="/admin/companies", status_code=303)


@router.post("/companies/{company_id}/delete")
async def company_delete(company_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if company:
        await db.delete(company)
        await db.commit()
    return RedirectResponse(url="/admin/companies", status_code=303)


# --- Users ---
@router.get("/users", response_class=HTMLResponse)
async def users_page(request: Request, db: AsyncSession = Depends(get_db)):
    admin = await get_admin_from_cookie(request, db)
    if not admin:
        return RedirectResponse(url="/admin/login", status_code=303)

    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return templates.TemplateResponse("users.html", {"request": request, "admin": admin, "users": users})
