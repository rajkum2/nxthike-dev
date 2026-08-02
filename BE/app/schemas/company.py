from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str
    logo: str | None = None
    industry: str
    location: str
    openPositions: int = 0
    description: str
    website: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    logo: str | None = None
    industry: str | None = None
    location: str | None = None
    openPositions: int | None = None
    description: str | None = None
    website: str | None = None


class CompanyResponse(BaseModel):
    id: str
    name: str
    logo: str | None = None
    industry: str
    location: str
    openPositions: int
    description: str
    website: str | None = None

    model_config = {"from_attributes": True}
