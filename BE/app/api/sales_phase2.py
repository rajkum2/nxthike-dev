"""Sales CRM Phase 2 — activities timeline + outbound approve queue."""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.company import Company
from app.models.sales import SalesActivity, SalesContact, SalesOpportunity
from app.schemas.sales import (
    SalesActivityCreate,
    SalesActivityRejectRequest,
    SalesActivityResponse,
    SalesActivityUpdate,
    SalesDraftOutreachRequest,
    SalesMarkSentResponse,
)
from app.services.personas import WorkspaceIdentity, get_workspace_user

logger = logging.getLogger(__name__)
phase2_router = APIRouter()


def register(parent_router: APIRouter) -> None:
    """Include Phase 2 routes on the parent /api/sales router."""
    # Delayed import so sales.py finishes initializing helpers first.
    from app.api import sales as s

    # Bind helpers into this module namespace for the route handlers below
    global _ACT_MAP, _apply, _company_names, _opp_names, _act_out, _utcnow
    global _validate_activity_type, _validate_activity_status, _validate_direction
    global _validate_channel, _default_status_for_type, _default_direction_for_type
    _ACT_MAP = s._ACT_MAP
    _apply = s._apply
    _company_names = s._company_names
    _opp_names = s._opp_names
    _act_out = s._act_out
    _utcnow = s._utcnow
    _validate_activity_type = s._validate_activity_type
    _validate_activity_status = s._validate_activity_status
    _validate_direction = s._validate_direction
    _validate_channel = s._validate_channel
    _default_status_for_type = s._default_status_for_type
    _default_direction_for_type = s._default_direction_for_type

    parent_router.include_router(phase2_router)
