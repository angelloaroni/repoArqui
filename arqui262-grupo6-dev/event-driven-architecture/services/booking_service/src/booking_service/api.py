import uuid

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from booking_service import db
from booking_service.models import Booking, OutboxEvent
from booking_service.schemas import BookingCreate, BookingOut, OutboxOut
from booking_service.service import BookingNotFound, confirm_booking, create_booking
from shared.logging import Logger, read_timeline

router = APIRouter()
log = Logger("booking-api", db.engine, "booking_timeline")


@router.get("/health")
def health() -> dict:
    with db.engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ok", "db": True}


@router.post("/bookings", response_model=BookingOut, status_code=201)
def post_booking(body: BookingCreate, session: Session = Depends(db.get_session)):
    booking = create_booking(session, body)
    log.log("booking_created", booking_id=booking.id)
    return booking


@router.get("/bookings/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: str, session: Session = Depends(db.get_session)):
    booking = session.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(404, "booking not found")
    return booking


@router.post("/bookings/{booking_id}/confirm", response_model=BookingOut)
def post_confirm(
    booking_id: str,
    session: Session = Depends(db.get_session),
    x_correlation_id: str | None = Header(default=None),
):
    correlation_id = x_correlation_id or f"corr-{uuid.uuid4().hex[:8]}"
    try:
        booking, changed = confirm_booking(session, booking_id, correlation_id)
    except BookingNotFound:
        raise HTTPException(404, "booking not found") from None
    if changed:
        log.log("confirmed", booking_id=booking.id, correlation_id=correlation_id)
        log.log("outbox_stored", booking_id=booking.id, correlation_id=correlation_id)
    return booking


@router.get("/outbox", response_model=list[OutboxOut])
def get_outbox(limit: int = 50, session: Session = Depends(db.get_session)):
    rows = session.scalars(select(OutboxEvent).order_by(OutboxEvent.created_at.desc()).limit(limit))
    return [
        OutboxOut(
            id=str(r.id),
            event_type=r.event_type,
            aggregate_id=r.aggregate_id,
            correlation_id=r.correlation_id,
            created_at=r.created_at,
            published_at=r.published_at,
            attempts=r.attempts,
        )
        for r in rows
    ]


@router.get("/timeline")
def get_timeline(q: str) -> list[dict]:
    return read_timeline(db.engine, "booking_timeline", q)


if db.settings.demo_mode:

    @router.post("/debug/reset")
    def reset() -> dict:
        with db.engine.begin() as conn:
            conn.execute(text("TRUNCATE bookings, outbox_events, booking_timeline"))
        return {"reset": True}
