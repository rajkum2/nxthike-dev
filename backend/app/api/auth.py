from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


def user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        firstName=user.first_name,
        lastName=user.last_name,
        profilePicture=user.profile_picture,
        createdAt=user.created_at.isoformat() if user.created_at else "",
        resume=user.resume,
        skills=user.skills or [],
        education=user.education or [],
        experience=user.experience or [],
        savedJobs=user.saved_jobs or [],
        appliedJobs=user.applied_jobs or [],
        companyName=user.company_name,
        companyLogo=user.company_logo,
        companyDescription=user.company_description,
        industry=user.industry,
        location=user.location,
        website=user.website,
    )


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        role=req.role,
        first_name=req.first_name,
        last_name=req.last_name,
        company_name=req.company_name,
        company_description=req.company_description,
        industry=req.industry,
        location=req.location,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=user_to_response(user))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=user_to_response(user))


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user_to_response(user)
