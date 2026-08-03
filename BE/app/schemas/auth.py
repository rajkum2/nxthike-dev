from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str = "student"
    # Employer fields
    company_name: str | None = None
    company_description: str | None = None
    industry: str | None = None
    location: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    firstName: str
    lastName: str
    profilePicture: str | None = None
    createdAt: str
    # Student fields
    resume: str | None = None
    skills: list = []
    education: list = []
    experience: list = []
    savedJobs: list = []
    appliedJobs: list = []
    # Employer fields
    companyName: str | None = None
    companyLogo: str | None = None
    companyDescription: str | None = None
    industry: str | None = None
    location: str | None = None
    website: str | None = None

    model_config = {"from_attributes": True}


class ProfileUpdateRequest(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    profilePicture: str | None = None
    # Employer-oriented fields (optional for any user)
    companyName: str | None = None
    companyDescription: str | None = None
    industry: str | None = None
    location: str | None = None
    website: str | None = None
    resume: str | None = None
    skills: list | None = None


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


class AdminUserRoleUpdate(BaseModel):
    role: str  # student | employer | admin
