"""Pydantic schemas for Sales CRM Phase 1."""

from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

ProductLine = Literal["staffing", "platform", "hybrid"]
OpportunityStage = Literal[
    "qualify", "discovery", "proposal", "negotiation", "won", "lost", "on_hold"
]
LeadStatus = Literal["new", "working", "qualified", "disqualified", "converted"]
ActivityType = Literal["note", "call", "email", "meeting", "task"]


# ---- Contacts ------------------------------------------------------------

class SalesContactCreate(BaseModel):
    companyId: str | None = None
    name: str
    title: str | None = None
    email: str | None = None
    phone: str | None = None
    linkedinUrl: str | None = None
    isPrimary: bool = False
    notes: str = ""
    ownerId: str | None = None


class SalesContactUpdate(BaseModel):
    companyId: str | None = None
    name: str | None = None
    title: str | None = None
    email: str | None = None
    phone: str | None = None
    linkedinUrl: str | None = None
    isPrimary: bool | None = None
    notes: str | None = None
    ownerId: str | None = None


class SalesContactResponse(BaseModel):
    id: str
    companyId: str | None = None
    companyName: str | None = None
    name: str
    title: str | None = None
    email: str | None = None
    phone: str | None = None
    linkedinUrl: str | None = None
    isPrimary: bool = False
    notes: str = ""
    ownerId: str | None = None
    createdAt: datetime | None = None
    updatedAt: datetime | None = None


# ---- Leads ---------------------------------------------------------------

class SalesLeadCreate(BaseModel):
    companyId: str | None = None
    contactId: str | None = None
    name: str
    source: str | None = None
    status: LeadStatus = "new"
    productLine: ProductLine = "staffing"
    score: int | None = None
    notes: str = ""
    ownerId: str | None = None


class SalesLeadUpdate(BaseModel):
    companyId: str | None = None
    contactId: str | None = None
    name: str | None = None
    source: str | None = None
    status: LeadStatus | None = None
    productLine: ProductLine | None = None
    score: int | None = None
    notes: str | None = None
    ownerId: str | None = None


class SalesLeadResponse(BaseModel):
    id: str
    companyId: str | None = None
    companyName: str | None = None
    contactId: str | None = None
    name: str
    source: str | None = None
    status: str
    productLine: str
    score: int | None = None
    notes: str = ""
    ownerId: str | None = None
    createdAt: datetime | None = None
    updatedAt: datetime | None = None


# ---- Opportunities -------------------------------------------------------

class SalesOpportunityCreate(BaseModel):
    companyId: str | None = None
    contactId: str | None = None
    leadId: str | None = None
    name: str
    productLine: ProductLine = "staffing"
    stage: OpportunityStage = "qualify"
    amount: float | None = None
    currency: str = "INR"
    probability: int | None = Field(default=None, ge=0, le=100)
    expectedClose: date | None = None
    hiringRoleIds: list[str] = Field(default_factory=list)
    notes: str = ""
    ownerId: str | None = None
    lostReason: str | None = None


class SalesOpportunityUpdate(BaseModel):
    companyId: str | None = None
    contactId: str | None = None
    leadId: str | None = None
    name: str | None = None
    productLine: ProductLine | None = None
    stage: OpportunityStage | None = None
    amount: float | None = None
    currency: str | None = None
    probability: int | None = Field(default=None, ge=0, le=100)
    expectedClose: date | None = None
    hiringRoleIds: list[str] | None = None
    notes: str | None = None
    ownerId: str | None = None
    lostReason: str | None = None


class SalesOpportunityResponse(BaseModel):
    id: str
    companyId: str | None = None
    companyName: str | None = None
    contactId: str | None = None
    leadId: str | None = None
    name: str
    productLine: str
    stage: str
    amount: float | None = None
    currency: str = "INR"
    probability: int | None = None
    expectedClose: date | None = None
    hiringRoleIds: list[str] = Field(default_factory=list)
    notes: str = ""
    ownerId: str | None = None
    lostReason: str | None = None
    createdAt: datetime | None = None
    updatedAt: datetime | None = None


class SalesPipelineColumn(BaseModel):
    stage: str
    label: str
    count: int
    totalAmount: float
    items: list[SalesOpportunityResponse]


class SalesPipelineResponse(BaseModel):
    columns: list[SalesPipelineColumn]
    totalOpen: int
    totalWon: int
    totalLost: int


class SalesHomeStats(BaseModel):
    contacts: int
    leads: int
    opportunities: int
    openPipeline: int
    won: int
    byProductLine: dict[str, int] = Field(default_factory=dict)
    byStage: dict[str, int] = Field(default_factory=dict)


# ---- Activities (minimal) ------------------------------------------------

class SalesActivityCreate(BaseModel):
    opportunityId: str | None = None
    leadId: str | None = None
    contactId: str | None = None
    companyId: str | None = None
    activityType: ActivityType = "note"
    subject: str | None = None
    body: str = ""
    occurredAt: datetime | None = None
    ownerId: str | None = None


class SalesActivityResponse(BaseModel):
    id: str
    opportunityId: str | None = None
    leadId: str | None = None
    contactId: str | None = None
    companyId: str | None = None
    activityType: str
    subject: str | None = None
    body: str = ""
    occurredAt: datetime | None = None
    ownerId: str | None = None
    createdAt: datetime | None = None
