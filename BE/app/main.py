from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.api import auth, jobs, events, courses, companies, dashboard, uploads, hiring
from app.admin.routes import router as admin_router
# Ensure models are registered on Base.metadata
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if missing (safe for SQLite + Supabase). Do not crash the
    # whole process if DB is briefly unreachable — log and continue so /api/health works.
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print(f"[startup] DB ready (pooler={settings.DB_IS_POOLER}, ssl={settings.DB_NEEDS_SSL})")
    except Exception as e:
        print(f"[startup] WARNING: could not init DB: {type(e).__name__}: {e}")
    yield


app = FastAPI(title="NxtHike API", version="1.0.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
import os
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# API routes
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(events.router)
app.include_router(courses.router)
app.include_router(companies.router)
app.include_router(dashboard.router)
app.include_router(uploads.router)
app.include_router(hiring.router)

# Admin dashboard
app.include_router(admin_router)


@app.get("/api/health")
async def health():
    from sqlalchemy import select, func
    from app.database import async_session
    from app.models.hiring import Candidate, HiringRole
    from app.models.job import Job
    from app.services.storage import get_storage

    counts: dict = {}
    try:
        async with async_session() as db:
            counts["candidates"] = (
                await db.execute(select(func.count()).select_from(Candidate))
            ).scalar() or 0
            counts["hiringRoles"] = (
                await db.execute(select(func.count()).select_from(HiringRole))
            ).scalar() or 0
            counts["jobs"] = (
                await db.execute(select(func.count()).select_from(Job))
            ).scalar() or 0
    except Exception as e:
        counts["error"] = str(e)

    try:
        storage_name = get_storage().name
    except Exception as e:
        storage_name = f"error:{e}"

    return {
        "status": "ok",
        "service": "nxthike-api",
        "version": "1.1.0",
        "storage": storage_name,
        "counts": counts,
    }
