from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from app.services.auth import get_admin_user
from app.models.user import User

router = APIRouter(prefix="/api/companies", tags=["companies"])


def company_to_response(c: Company) -> CompanyResponse:
    return CompanyResponse(
        id=c.id,
        name=c.name,
        logo=c.logo,
        industry=c.industry,
        location=c.location,
        openPositions=c.open_positions,
        description=c.description,
        website=c.website,
    )


@router.get("", response_model=list[CompanyResponse])
async def list_companies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company).order_by(Company.name))
    companies = result.scalars().all()
    return [company_to_response(c) for c in companies]


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company_to_response(company)


@router.post("", response_model=CompanyResponse)
async def create_company(data: CompanyCreate, user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    company = Company(
        name=data.name,
        logo=data.logo,
        industry=data.industry,
        location=data.location,
        open_positions=data.openPositions,
        description=data.description,
        website=data.website,
    )
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company_to_response(company)


@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(company_id: str, data: CompanyUpdate, user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    update_data = data.model_dump(exclude_unset=True)
    field_map = {"openPositions": "open_positions"}
    for camel, snake in field_map.items():
        if camel in update_data:
            update_data[snake] = update_data.pop(camel)

    for key, value in update_data.items():
        if hasattr(company, key):
            setattr(company, key, value)

    await db.commit()
    await db.refresh(company)
    return company_to_response(company)


@router.delete("/{company_id}")
async def delete_company(company_id: str, user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    await db.delete(company)
    await db.commit()
    return {"message": "Company deleted"}
