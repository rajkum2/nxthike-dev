from pydantic import BaseModel


class AgendaItemSchema(BaseModel):
    time: str
    title: str


class SpeakerSchema(BaseModel):
    name: str
    role: str
    avatar: str
    bio: str


class SponsorSchema(BaseModel):
    name: str
    logo: str


class EventCreate(BaseModel):
    title: str
    description: str
    type: str  # webinar, hackathon, workshop, networking
    date: str
    time: str
    location: str | None = None
    isOnline: bool = False
    link: str | None = None
    organizer: str
    image: str | None = None
    address: str | None = None
    organizerLogo: str | None = None
    attendees: int = 0
    maxAttendees: int = 0
    agenda: list[AgendaItemSchema] = []
    speakers: list[SpeakerSchema] = []
    sponsors: list[SponsorSchema] = []


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    type: str | None = None
    date: str | None = None
    time: str | None = None
    location: str | None = None
    isOnline: bool | None = None
    link: str | None = None
    organizer: str | None = None
    image: str | None = None
    address: str | None = None
    organizerLogo: str | None = None
    attendees: int | None = None
    maxAttendees: int | None = None
    agenda: list[AgendaItemSchema] | None = None
    speakers: list[SpeakerSchema] | None = None
    sponsors: list[SponsorSchema] | None = None


class EventListResponse(BaseModel):
    id: str
    title: str
    description: str
    type: str
    date: str
    time: str
    location: str | None = None
    isOnline: bool
    link: str | None = None
    organizer: str
    image: str | None = None
    registrations: list[str]

    model_config = {"from_attributes": True}


class EventDetailResponse(EventListResponse):
    address: str | None = None
    organizerLogo: str | None = None
    attendees: int
    maxAttendees: int
    agenda: list[dict]
    speakers: list[dict]
    sponsors: list[dict]


class PaginatedEventResponse(BaseModel):
    items: list[EventListResponse]
    total: int
    page: int
    per_page: int
    pages: int
