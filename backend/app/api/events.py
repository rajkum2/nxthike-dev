import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate, EventListResponse, EventDetailResponse, PaginatedEventResponse
from app.services.auth import get_admin_user
from app.models.user import User

router = APIRouter(prefix="/api/events", tags=["events"])


def event_to_list(e: Event) -> EventListResponse:
    return EventListResponse(
        id=e.id,
        title=e.title,
        description=e.description,
        type=e.type,
        date=e.date,
        time=e.time,
        location=e.location,
        isOnline=e.is_online,
        link=e.link,
        organizer=e.organizer,
        image=e.image,
        registrations=e.registrations or [],
    )


def event_to_detail(e: Event) -> EventDetailResponse:
    return EventDetailResponse(
        id=e.id,
        title=e.title,
        description=e.description,
        type=e.type,
        date=e.date,
        time=e.time,
        location=e.location,
        isOnline=e.is_online,
        link=e.link,
        organizer=e.organizer,
        image=e.image,
        registrations=e.registrations or [],
        address=e.address,
        organizerLogo=e.organizer_logo,
        attendees=e.attendees,
        maxAttendees=e.max_attendees,
        agenda=e.agenda or [],
        speakers=e.speakers or [],
        sponsors=e.sponsors or [],
    )


@router.get("", response_model=PaginatedEventResponse)
async def list_events(
    type: str | None = None,
    is_online: bool | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(9, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Event)

    if type:
        query = query.where(Event.type == type)
    if is_online is not None:
        query = query.where(Event.is_online == is_online)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Event.date.asc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    events = result.scalars().all()

    return PaginatedEventResponse(
        items=[event_to_list(e) for e in events],
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page) if total > 0 else 0,
    )


@router.get("/{event_id}", response_model=EventDetailResponse)
async def get_event(event_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event_to_detail(event)


@router.post("", response_model=EventDetailResponse)
async def create_event(data: EventCreate, user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    event = Event(
        title=data.title,
        description=data.description,
        type=data.type,
        date=data.date,
        time=data.time,
        location=data.location,
        is_online=data.isOnline,
        link=data.link,
        organizer=data.organizer,
        image=data.image,
        address=data.address,
        organizer_logo=data.organizerLogo,
        attendees=data.attendees,
        max_attendees=data.maxAttendees,
        agenda=[a.model_dump() for a in data.agenda],
        speakers=[s.model_dump() for s in data.speakers],
        sponsors=[s.model_dump() for s in data.sponsors],
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event_to_detail(event)


@router.put("/{event_id}", response_model=EventDetailResponse)
async def update_event(event_id: str, data: EventUpdate, user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = data.model_dump(exclude_unset=True)
    field_map = {
        "isOnline": "is_online",
        "organizerLogo": "organizer_logo",
        "maxAttendees": "max_attendees",
    }
    for camel, snake in field_map.items():
        if camel in update_data:
            update_data[snake] = update_data.pop(camel)

    for key in ("agenda", "speakers", "sponsors"):
        if key in update_data and update_data[key] is not None:
            update_data[key] = [item.model_dump() if hasattr(item, "model_dump") else item for item in update_data[key]]

    for key, value in update_data.items():
        if hasattr(event, key):
            setattr(event, key, value)

    await db.commit()
    await db.refresh(event)
    return event_to_detail(event)


@router.delete("/{event_id}")
async def delete_event(event_id: str, user: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.delete(event)
    await db.commit()
    return {"message": "Event deleted"}
