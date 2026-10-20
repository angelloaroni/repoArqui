"""Unit tests on in-memory SQLite: no Docker needed."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from booking_service import api, db
from booking_service.main import app
from booking_service.models import Base, Booking, DomainError, OutboxEvent
from booking_service.schemas import BookingCreate
from booking_service.service import BookingNotFound, confirm_booking, create_booking
from shared.events import EVENT_TYPE, BookingConfirmedEvent


@pytest.fixture
def engine():
    eng = create_engine("sqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False})
    Base.metadata.create_all(eng)
    return eng


@pytest.fixture
def session(engine):
    with Session(engine, expire_on_commit=False) as s:
        yield s


def test_booking_transitions_pending_to_confirmed(session):
    booking = create_booking(session, BookingCreate())
    assert booking.status == "PENDING" and booking.confirmed_at is None
    booking.confirm()
    assert booking.status == "CONFIRMED" and booking.confirmed_at is not None


def test_cannot_confirm_twice_at_domain_level():
    booking = Booking(id="BK-1", customer_id="C", amount=1, currency="USD", status="CONFIRMED")
    with pytest.raises(DomainError):
        booking.confirm()


def test_confirm_writes_booking_and_outbox_together(session):
    booking = create_booking(session, BookingCreate(amount=450))
    confirmed, changed = confirm_booking(session, booking.id, "corr-1")
    assert changed and confirmed.status == "CONFIRMED"

    outbox = session.scalars(select(OutboxEvent)).one()
    assert outbox.published_at is None  # publishing is the relay's job, never the request's
    assert outbox.correlation_id == "corr-1"
    event = BookingConfirmedEvent.model_validate(outbox.payload)  # stored payload is a valid envelope
    assert event.type == EVENT_TYPE and event.data.booking_id == booking.id


def test_confirm_is_atomic_when_outbox_insert_fails(engine, session, monkeypatch):
    booking = create_booking(session, BookingCreate())

    def boom(*_a, **_k):
        raise RuntimeError("outbox insert failed")

    monkeypatch.setattr("booking_service.service.OutboxEvent", boom)
    with pytest.raises(RuntimeError):
        confirm_booking(session, booking.id, "corr-x")
    session.rollback()
    with Session(engine) as fresh:  # nothing leaked: still PENDING, no outbox row
        assert fresh.get(Booking, booking.id).status == "PENDING"
        assert fresh.scalar(select(func.count()).select_from(OutboxEvent)) == 0


def test_confirm_twice_emits_a_single_event(session):
    booking = create_booking(session, BookingCreate())
    confirm_booking(session, booking.id, "corr-1")
    _, changed = confirm_booking(session, booking.id, "corr-2")
    assert changed is False
    assert session.scalar(select(func.count()).select_from(OutboxEvent)) == 1


def test_confirm_unknown_booking(session):
    with pytest.raises(BookingNotFound):
        confirm_booking(session, "BK-NOPE", "corr")


def test_api_confirm_creates_outbox_row(engine):
    factory = sessionmaker(engine, expire_on_commit=False)

    def override():
        with factory() as s:
            yield s

    app.dependency_overrides[db.get_session] = override
    api.log.engine = None  # skip timeline writes (no Postgres here)
    client = TestClient(app)
    try:
        created = client.post("/bookings", json={"customer_id": "C-1", "amount": 10}).json()
        r = client.post(f"/bookings/{created['id']}/confirm", headers={"X-Correlation-Id": "corr-api"})
        assert r.status_code == 200 and r.json()["status"] == "CONFIRMED"
        outbox = client.get("/outbox").json()
        assert [o["correlation_id"] for o in outbox] == ["corr-api"]
        assert client.post("/bookings/BK-NOPE/confirm").status_code == 404
        assert client.post("/bookings", json={"amount": -5}).status_code == 422
    finally:
        app.dependency_overrides.clear()
