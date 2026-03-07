from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.api import auth, jobs, events, courses, companies, dashboard, uploads
from app.admin.routes import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# API routes
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(events.router)
app.include_router(courses.router)
app.include_router(companies.router)
app.include_router(dashboard.router)
app.include_router(uploads.router)

# Admin dashboard
app.include_router(admin_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
