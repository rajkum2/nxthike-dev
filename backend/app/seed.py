"""
Seed the database with data from the frontend JSON/TS data files.

Usage:
    cd backend
    node export_data.js          # Export TS data to seed_data.json
    python -m app.seed           # Seed the database
"""
import asyncio
import json
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import engine, async_session, Base
from app.models.user import User
from app.models.job import Job
from app.models.event import Event
from app.models.course import Course
from app.models.company import Company
from app.services.auth import hash_password
from app.config import settings


async def seed():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Load seed data
    seed_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "seed_data.json")
    if not os.path.exists(seed_file):
        print("seed_data.json not found. Run 'node export_data.js' first from the backend directory.")
        return

    with open(seed_file) as f:
        data = json.load(f)

    async with async_session() as db:
        # Check if already seeded
        from sqlalchemy import select, func
        existing = (await db.execute(select(func.count()).select_from(Job))).scalar()
        if existing and existing > 0:
            print(f"Database already has {existing} jobs. Skipping seed.")
            print("To re-seed, delete nxthike.db and run again.")
            return

        # Create admin user
        admin = User(
            id="admin-1",
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role="admin",
            first_name="Admin",
            last_name="User",
        )
        db.add(admin)

        # Create demo users
        student = User(
            id="demo-student-1",
            email="student@nxthike.com",
            password_hash=hash_password("password123"),
            role="student",
            first_name="John",
            last_name="Doe",
            skills=["JavaScript", "React", "Python"],
        )
        employer = User(
            id="demo-employer-1",
            email="employer@nxthike.com",
            password_hash=hash_password("password123"),
            role="employer",
            first_name="Jane",
            last_name="Smith",
            company_name="TechCorp",
            industry="Technology",
            location="San Francisco, CA",
        )
        db.add(student)
        db.add(employer)

        # Seed Jobs
        for j in data["jobs"]:
            from datetime import datetime
            posted_at = j.get("postedAt", "2026-03-01T10:00:00Z")
            try:
                dt = datetime.fromisoformat(posted_at.replace("Z", "+00:00"))
            except Exception:
                dt = datetime.now()

            job = Job(
                id=j["id"],
                title=j["title"],
                company=j["company"],
                company_logo=j.get("companyLogo"),
                location=j["location"],
                is_remote=j.get("isRemote", False),
                type=j["type"],
                category=j["category"],
                description=j["description"],
                requirements=j.get("requirements", []),
                responsibilities=j.get("responsibilities", []),
                salary=j.get("salary"),
                stipend=j.get("stipend"),
                duration=j.get("duration"),
                application_deadline=j["applicationDeadline"],
                posted_by=j.get("postedBy", "admin-1"),
                posted_at=dt,
                status=j.get("status", "approved"),
                applicants=j.get("applicants", []),
            )
            db.add(job)
        print(f"  Seeded {len(data['jobs'])} jobs")

        # Seed Events (merge list + details)
        event_details = data.get("eventDetails", {})
        for e in data["events"]:
            detail = event_details.get(e["id"], {})
            event = Event(
                id=e["id"],
                title=e["title"],
                description=e["description"],
                type=e["type"],
                date=e["date"],
                time=e["time"],
                location=e.get("location"),
                is_online=e.get("isOnline", False),
                link=e.get("link"),
                organizer=e["organizer"],
                image=e.get("image"),
                registrations=e.get("registrations", []),
                address=detail.get("address"),
                organizer_logo=detail.get("organizerLogo"),
                attendees=detail.get("attendees", 0),
                max_attendees=detail.get("maxAttendees", 0),
                agenda=detail.get("agenda", []),
                speakers=detail.get("speakers", []),
                sponsors=detail.get("sponsors", []),
            )
            db.add(event)
        print(f"  Seeded {len(data['events'])} events")

        # Seed Courses (merge list + details)
        course_details = data.get("courseDetails", {})
        for c in data["courses"]:
            detail = course_details.get(c["id"], {})
            course = Course(
                id=c["id"],
                title=c["title"],
                description=c["description"],
                instructor=c["instructor"],
                category=c["category"],
                level=c["level"],
                duration=c["duration"],
                price=c["price"],
                discount=c.get("discount"),
                image=c.get("image"),
                enrollments=c.get("enrollments", 0),
                instructor_title=detail.get("instructorTitle"),
                instructor_avatar=detail.get("instructorAvatar"),
                instructor_bio=detail.get("instructorBio"),
                rating=detail.get("rating", 0),
                review_count=detail.get("reviewCount", 0),
                what_you_will_learn=detail.get("whatYouWillLearn", []),
                prerequisites=detail.get("prerequisites", []),
                curriculum=detail.get("curriculum", []),
                reviews=detail.get("reviews", []),
            )
            db.add(course)
        print(f"  Seeded {len(data['courses'])} courses")

        # Seed Companies
        for c in data["companies"]:
            company = Company(
                id=c["id"],
                name=c["name"],
                logo=c.get("logo"),
                industry=c["industry"],
                location=c["location"],
                open_positions=c.get("openPositions", 0),
                description=c["description"],
                website=c.get("website"),
            )
            db.add(company)
        print(f"  Seeded {len(data['companies'])} companies")

        await db.commit()
        print("\nDatabase seeded successfully!")
        print(f"  Admin login: {settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD}")
        print(f"  Student login: student@nxthike.com / password123")
        print(f"  Employer login: employer@nxthike.com / password123")


if __name__ == "__main__":
    asyncio.run(seed())
