from typing import Any

from pydantic import BaseModel, Field


PIPELINE_STATUSES = (
    "new",
    "reviewing",
    "shortlisted",
    "interview",
    "offer",
    "hired",
    "rejected",
    "on_hold",
)


class HiringRoleCreate(BaseModel):
    id: str
    name: str
    description: str | None = None
    is_active: bool = True
    sort_order: int = 0


class HiringRoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class HiringRoleResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    is_active: bool = True
    sort_order: int = 0
    count: int = 0

    model_config = {"from_attributes": True}


class CandidateBase(BaseModel):
    roleId: str
    roleName: str = ""
    status: str = "new"
    tags: list[str] = Field(default_factory=list)
    notes: str = ""
    starred: bool = False
    name: str | None = None
    applicationLink: str | None = None
    phone: str | None = None
    email: str | None = None
    city: str | None = None
    gender: str | None = None
    otherSkills: str | None = None
    aiResumeMatch: str | None = None
    institute: str | None = None
    degree: str | None = None
    stream: str | None = None
    graduationYear: str | int | None = None
    performancePg: str | None = None
    performanceUg: str | None = None
    performance12: str | None = None
    performance10: str | None = None
    chatLink: str | None = None
    resumeLink: str | None = None
    downloadLink: str | None = None
    appliedAt: str | None = None
    hasWorkExperience: str | None = None
    totalRoles: str | int | None = None
    internshipCount: str | int | None = None
    fulltimeCount: str | int | None = None
    companies: str | None = None
    jobTitles: str | None = None
    workExperienceDetail: str | None = None
    experienceDuration: str | None = None
    latestRole: str | None = None
    latestCompany: str | None = None
    careerObjective: str | None = None
    languages: str | None = None
    certifications: str | None = None
    projects: str | None = None
    extraCurricular: str | None = None
    additionalDetails: str | None = None
    relevantSkills: str | None = None
    educationFromPdf: str | None = None
    streamFromPdf: str | None = None
    pdfFile: str | None = None
    availability: str | None = None
    aiInterviewScores: dict[str, Any] = Field(default_factory=dict)
    skillFlags: dict[str, Any] = Field(default_factory=dict)

    # --- TalentDialer workspace columns -----------------------------------
    # Added by migrations, all nullable. They are read here so the dashboard
    # sees the same record the compliance and call screens are counting.
    ownerId: str | None = None
    source: str | None = None
    currentCtc: float | None = None
    expectedCtc: float | None = None
    noticeDays: int | None = None
    buyout: bool | None = None
    consentAt: str | None = None
    consentChannel: str | None = None
    dnc: bool | None = None
    requisitionId: str | None = None
    #: True when phone/email were masked for this caller's role.
    piiMasked: bool = False


class CandidateCreate(CandidateBase):
    id: str | None = None


class CandidateUpdate(BaseModel):
    roleId: str | None = None
    roleName: str | None = None
    status: str | None = None
    tags: list[str] | None = None
    notes: str | None = None
    starred: bool | None = None
    name: str | None = None
    applicationLink: str | None = None
    phone: str | None = None
    email: str | None = None
    city: str | None = None
    gender: str | None = None
    otherSkills: str | None = None
    aiResumeMatch: str | None = None
    institute: str | None = None
    degree: str | None = None
    stream: str | None = None
    graduationYear: str | int | None = None
    performancePg: str | None = None
    performanceUg: str | None = None
    performance12: str | None = None
    performance10: str | None = None
    chatLink: str | None = None
    resumeLink: str | None = None
    downloadLink: str | None = None
    appliedAt: str | None = None
    hasWorkExperience: str | None = None
    totalRoles: str | int | None = None
    internshipCount: str | int | None = None
    fulltimeCount: str | int | None = None
    companies: str | None = None
    jobTitles: str | None = None
    workExperienceDetail: str | None = None
    experienceDuration: str | None = None
    latestRole: str | None = None
    latestCompany: str | None = None
    careerObjective: str | None = None
    languages: str | None = None
    certifications: str | None = None
    projects: str | None = None
    extraCurricular: str | None = None
    additionalDetails: str | None = None
    relevantSkills: str | None = None
    educationFromPdf: str | None = None
    streamFromPdf: str | None = None
    pdfFile: str | None = None
    availability: str | None = None
    aiInterviewScores: dict[str, Any] | None = None
    skillFlags: dict[str, Any] | None = None

    ownerId: str | None = None
    source: str | None = None
    currentCtc: float | None = None
    expectedCtc: float | None = None
    noticeDays: int | None = None
    buyout: bool | None = None
    consentAt: str | None = None
    consentChannel: str | None = None
    dnc: bool | None = None
    requisitionId: str | None = None


class CandidateResponse(CandidateBase):
    id: str
    createdAt: str | None = None
    updatedAt: str | None = None

    model_config = {"from_attributes": True}


class PaginatedCandidateResponse(BaseModel):
    items: list[CandidateResponse]
    total: int
    page: int
    pageSize: int
    totalPages: int


class BulkStatusRequest(BaseModel):
    ids: list[str]
    status: str


class BulkDeleteRequest(BaseModel):
    ids: list[str]


class HiringDashboardStats(BaseModel):
    total: int
    starred: int
    withExp: int
    byStatus: dict[str, int]
    byRole: dict[str, int]
    roles: list[HiringRoleResponse]
