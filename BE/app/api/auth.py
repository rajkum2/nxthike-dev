from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    ProfileUpdateRequest,
    ChangePasswordRequest,
    AdminUserRoleUpdate,
)
from app.services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_admin_user,
)

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

    # Never allow self-registration as admin
    safe_role = req.role if req.role in ("student", "employer") else "student"

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        role=safe_role,
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


@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = body.model_dump(exclude_unset=True)
    field_map = {
        "firstName": "first_name",
        "lastName": "last_name",
        "profilePicture": "profile_picture",
        "companyName": "company_name",
        "companyDescription": "company_description",
        "industry": "industry",
        "location": "location",
        "website": "website",
        "resume": "resume",
        "skills": "skills",
    }
    for api_key, col in field_map.items():
        if api_key in data:
            setattr(user, col, data[api_key])
    await db.commit()
    await db.refresh(user)
    return user_to_response(user)


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.currentPassword, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.newPassword) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    user.password_hash = hash_password(body.newPassword)
    await db.commit()
    return {"ok": True}


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (await db.execute(select(User).order_by(User.created_at.desc()))).scalars().all()
    return [user_to_response(u) for u in rows]


@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    body: AdminUserRoleUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    if body.role not in ("student", "employer", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == admin.id and body.role != "admin":
        raise HTTPException(status_code=400, detail="Cannot demote your own admin account")
    target.role = body.role
    await db.commit()
    await db.refresh(target)
    return user_to_response(target)
