"""Event contract: a CloudEvents 1.0-like envelope validated with Pydantic.

Producer (booking-service / outbox-relay) and every consumer validate against the
same model, so a contract change breaks loudly instead of silently.
"""

import uuid
from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel

EVENT_TYPE = "com.arquisoft.travel.booking.confirmed.v1"
ROUTING_KEY = "booking.confirmed.v1"


class BookingConfirmedData(BaseModel):
    booking_id: str
    customer_id: str
    # No `gt=0` here on purpose: a negative amount is a valid envelope that the CRM
    # rejects as a business rule. That is our "poison event" for the DLQ demo.
    amount: float
    currency: str


class BookingConfirmedEvent(BaseModel):
    specversion: Literal["1.0"] = "1.0"
    id: uuid.UUID
    source: str = "/booking-service"
    type: Literal["com.arquisoft.travel.booking.confirmed.v1"] = EVENT_TYPE
    subject: str
    time: datetime
    datacontenttype: Literal["application/json"] = "application/json"
    correlationid: str  # our own extension attribute, not part of CloudEvents core
    data: BookingConfirmedData

    @classmethod
    def new(cls, data: BookingConfirmedData, correlation_id: str) -> "BookingConfirmedEvent":
        return cls(
            id=uuid.uuid4(),
            subject=f"booking/{data.booking_id}",
            time=datetime.now(UTC),
            correlationid=correlation_id,
            data=data,
        )
