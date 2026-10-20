import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from booking_service.models import Booking, DomainError, OutboxEvent
from booking_service.schemas import BookingCreate
from shared.events import BookingConfirmedData, BookingConfirmedEvent


class BookingNotFound(Exception):
    pass


def create_booking(session: Session, body: BookingCreate) -> Booking:
    booking = Booking(
        id=f"BK-{uuid.uuid4().hex[:6].upper()}",
        customer_id=body.customer_id,
        amount=body.amount,
        currency=body.currency,
        status="PENDING",
        created_at=datetime.now(UTC),
    )
    session.add(booking)
    session.commit()
    return booking


def confirm_booking(session: Session, booking_id: str, correlation_id: str) -> tuple[Booking, bool]:
    """Confirm a booking and record BookingConfirmed in the outbox, ATOMICALLY.

    Returns (booking, changed). Nothing is published here: no dual write.
    Booking never calls CRM/Notification/Analytics.
    """
    booking = session.get(Booking, booking_id, with_for_update=True)
    if booking is None:
        raise BookingNotFound(booking_id)
    if booking.status == "CONFIRMED":  # confirming twice must not emit a second event
        return booking, False

    booking.confirm()
    event = BookingConfirmedEvent.new(
        BookingConfirmedData(
            booking_id=booking.id,
            customer_id=booking.customer_id,
            amount=booking.amount,
            currency=booking.currency,
        ),
        correlation_id,
    )
    session.add(
        OutboxEvent(
            id=event.id,
            event_type=event.type,
            aggregate_id=booking.id,
            payload=event.model_dump(mode="json"),
            correlation_id=correlation_id,
            created_at=datetime.now(UTC),
        )
    )
    session.commit()  # booking state + outbox row: one local transaction
    return booking, True


__all__ = ["BookingNotFound", "DomainError", "confirm_booking", "create_booking"]
