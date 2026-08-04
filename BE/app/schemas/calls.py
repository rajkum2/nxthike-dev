from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.hiring import CALL_DISPOSITIONS


class CallLogCreate(BaseModel):
    candidateId: str
    disposition: str = "no_answer"
    note: str = ""
    durationSeconds: int | None = None
    durationEstimated: bool = False
    callbackAt: datetime | None = None
    nextAction: str | None = None  # callback | whatsapp | stage | none
    # optional snapshots if candidate missing fields
    candidateName: str | None = None
    candidatePhone: str | None = None
    roleId: str | None = None
    roleName: str | None = None
    calledAt: datetime | None = None


class CallLogUpdate(BaseModel):
    disposition: str | None = None
    note: str | None = None
    durationSeconds: int | None = None
    durationEstimated: bool | None = None
    callbackAt: datetime | None = None
    nextAction: str | None = None


class CallLogResponse(BaseModel):
    id: str
    candidateId: str
    candidateName: str | None = None
    candidatePhone: str | None = None
    roleId: str | None = None
    roleName: str | None = None
    userId: str | None = None
    userEmail: str | None = None
    disposition: str
    note: str = ""
    durationSeconds: int | None = None
    durationEstimated: bool = False
    callbackAt: str | None = None
    nextAction: str | None = None
    calledAt: str | None = None
    createdAt: str | None = None
    updatedAt: str | None = None


class PaginatedCallLogResponse(BaseModel):
    items: list[CallLogResponse]
    total: int
    page: int
    pageSize: int
    totalPages: int


class CallQueueItem(BaseModel):
    candidateId: str
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    city: str | None = None
    roleId: str
    roleName: str = ""
    status: str = "new"
    notes: str = ""
    lastDisposition: str | None = None
    lastCalledAt: str | None = None
    starred: bool = False


class PaginatedCallQueueResponse(BaseModel):
    items: list[CallQueueItem]
    total: int
    page: int
    pageSize: int
    totalPages: int


class CallDispositionInfo(BaseModel):
    id: str
    label: str
    category: str


class CallStatsResponse(BaseModel):
    todayCount: int = 0
    totalCount: int = 0
    byDisposition: dict[str, int] = Field(default_factory=dict)
    callbacksDue: int = 0


DISPOSITION_META: list[dict[str, str]] = [
    {"id": "connected_interested", "label": "Connected — Interested", "category": "reached"},
    {"id": "connected_callback", "label": "Connected — Callback", "category": "reached"},
    {"id": "connected_not_interested", "label": "Connected — Not Interested", "category": "reached"},
    {"id": "screening_passed", "label": "Screening Passed", "category": "reached"},
    {"id": "screening_failed", "label": "Screening Failed", "category": "reached"},
    {"id": "no_answer", "label": "No Answer", "category": "not_reached"},
    {"id": "busy", "label": "Busy", "category": "not_reached"},
    {"id": "voicemail", "label": "Voicemail", "category": "not_reached"},
    {"id": "wrong_number", "label": "Wrong Number", "category": "data"},
    {"id": "not_reachable", "label": "Not Reachable", "category": "data"},
    {"id": "do_not_call", "label": "Do Not Call", "category": "compliance"},
]


def validate_disposition(d: str) -> bool:
    return d in CALL_DISPOSITIONS
