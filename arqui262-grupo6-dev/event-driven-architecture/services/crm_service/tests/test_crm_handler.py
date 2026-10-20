"""Idempotency unit test on in-memory SQLite (same SQL as Postgres: ON CONFLICT)."""

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.pool import StaticPool

from crm_service.handler import make_handler
from shared.events import BookingConfirmedData, BookingConfirmedEvent

# Mirrors the CRM tables of database/init.sql (SQLite flavour).
DDL = [
    "CREATE TABLE crm_processed_events (event_id TEXT PRIMARY KEY, processed_at TEXT NOT NULL)",
    "CREATE TABLE crm_bookings (booking_id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, "
    "last_event_id TEXT NOT NULL, confirmed_at TEXT NOT NULL, times_applied INT NOT NULL DEFAULT 1)",
]


@pytest.fixture
def engine():
    eng = create_engine("sqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False})
    with eng.begin() as conn:
        for stmt in DDL:
            conn.execute(text(stmt))
    return eng


def _event(amount: float = 450.0) -> BookingConfirmedEvent:
    return BookingConfirmedEvent.new(
        BookingConfirmedData(booking_id="BK-1", customer_id="C-1", amount=amount, currency="USD"), "corr-1"
    )


def test_same_event_twice_applies_effect_once(engine):
    handle = make_handler(engine)
    event = _event()
    assert handle(event) == "processed"
    assert handle(event) == "duplicate"  # redelivery with the same event_id
    with engine.connect() as conn:
        assert conn.execute(text("SELECT times_applied FROM crm_bookings")).scalar_one() == 1
        assert conn.execute(text("SELECT count(*) FROM crm_processed_events")).scalar_one() == 1


def test_negative_amount_is_rejected_and_leaves_no_trace(engine):
    handle = make_handler(engine)
    with pytest.raises(ValueError):
        handle(_event(amount=-1))
    with engine.connect() as conn:
        assert conn.execute(text("SELECT count(*) FROM crm_bookings")).scalar_one() == 0
        assert conn.execute(text("SELECT count(*) FROM crm_processed_events")).scalar_one() == 0
