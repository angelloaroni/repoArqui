from datetime import datetime

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    customer_id: str = "C-100"
    amount: float = Field(450.0, gt=0)  # the API rejects bad amounts; the DLQ demo bypasses it
    currency: str = "USD"


class BookingOut(BaseModel):
    id: str
    customer_id: str
    amount: float
    currency: str
    status: str
    created_at: datetime
    confirmed_at: datetime | None


class OutboxOut(BaseModel):
    id: str
    event_type: str
    aggregate_id: str
    correlation_id: str
    created_at: datetime
    published_at: datetime | None
    attempts: int
