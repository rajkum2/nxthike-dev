from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.migrations import run_migrations
from app.middleware.security import SecurityHeadersMiddleware
from app.api import (
    auth, jobs, events, courses, companies, dashboard, uploads, hiring, calls,
    workspace, recruiting,
)
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
        # create_all adds missing tables but never missing columns; this adds
        # those, idempotently, without touching existing data.
        await run_migrations(engine)
        print(f"[startup] DB ready (pooler={settings.DB_IS_POOLER}, ssl={settings.DB_NEEDS_SSL})")
        if settings.SECRET_KEY in ("change-me", "secret", "changeme", ""):
            print("[startup] WARNING: SECRET_KEY is insecure — set a strong secret in production")
    except Exception as e:
        print(f"[startup] WARNING: could not init DB: {type(e).__name__}: {e}")
    yield


app = FastAPI(title="NxtHike API", version="1.0.0", lifespan=lifespan)

# Security headers + auth rate limits (outermost after reverse proxy)
app.add_middleware(SecurityHeadersMiddleware)

# CORS — explicit methods only (no wildcard when credentials are used)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
    max_age=600,
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
app.include_router(calls.router)
# TalentDialer recruiting workspace (additive; existing routes unchanged)
app.include_router(workspace.router)
app.include_router(recruiting.router)

# Admin dashboard
app.include_router(admin_router)


@app.get("/api/health")
async def health():
    """
    Lightweight liveness probe.

    Avoid full-table COUNTs on every health check (expensive at 20k+ rows and
    leaks approximate business size to the public internet). Use
    `/api/dashboard/stats` (admin) for operational counts.
    """
    from sqlalchemy import text
    from app.database import async_session
    from app.services.storage import get_storage

    db_ok = False
    try:
        async with async_session() as db:
            await db.execute(text("SELECT 1"))
            db_ok = True
    except Exception as e:
        return {
            "status": "degraded",
            "service": "nxthike-api",
            "version": "1.2.0",
            "db": f"error:{type(e).__name__}",
        }

    try:
        storage_name = get_storage().name
    except Exception as e:
        storage_name = f"error:{e}"

    return {
        "status": "ok" if db_ok else "degraded",
        "service": "nxthike-api",
        "version": "1.2.0",
        "db": "ok" if db_ok else "down",
        "storage": storage_name,
    }
