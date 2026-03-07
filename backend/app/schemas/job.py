from pydantic import BaseModel


class SalarySchema(BaseModel):
    min: int
    max: int
    currency: str = "USD"


class StipendSchema(BaseModel):
    amount: int
    currency: str = "USD"
    period: str = "monthly"  # hourly, daily, weekly, monthly


class JobCreate(BaseModel):
    title: str
    company: str
    companyLogo: str | None = None
    location: str
    isRemote: bool = False
    type: str  # internship, full-time, part-time, contract
    category: str
    description: str
    requirements: list[str] = []
    responsibilities: list[str] = []
    salary: SalarySchema | None = None
    stipend: StipendSchema | None = None
    duration: str | None = None
    applicationDeadline: str
    status: str = "approved"


class JobUpdate(BaseModel):
    title: str | None = None
    company: str | None = None
    companyLogo: str | None = None
    location: str | None = None
    isRemote: bool | None = None
    type: str | None = None
    category: str | None = None
    description: str | None = None
    requirements: list[str] | None = None
    responsibilities: list[str] | None = None
    salary: SalarySchema | None = None
    stipend: StipendSchema | None = None
    duration: str | None = None
    applicationDeadline: str | None = None
    status: str | None = None


class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    companyLogo: str | None = None
    location: str
    isRemote: bool
    type: str
    category: str
    description: str
    requirements: list[str]
    responsibilities: list[str]
    salary: dict | None = None
    stipend: dict | None = None
    duration: str | None = None
    applicationDeadline: str
    postedBy: str
    postedAt: str
    status: str
    applicants: list[str]

    model_config = {"from_attributes": True}


class PaginatedJobResponse(BaseModel):
    items: list[JobResponse]
    total: int
    page: int
    per_page: int
    pages: int
