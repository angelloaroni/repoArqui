from datetime import UTC, datetime

from sqlalchemy import Engine, text

from shared.db import already_processed
from shared.events import BookingConfirmedEvent


def make_handler(engine: Engine):
    def handle(event: BookingConfirmedEvent) -> str:
        with engine.begin() as conn:
            if already_processed(conn, "analytics_processed_events", str(event.id)):
                return "duplicate"
            conn.execute(
                text(
                    "INSERT INTO analytics_facts (event_id, booking_id, amount, currency, created_at) "
                    "VALUES (:e, :b, :a, :c, :t)"
                ),
                {
                    "e": str(event.id),
                    "b": event.data.booking_id,
                    "a": event.data.amount,
                    "c": event.data.currency,
                    "t": datetime.now(UTC),
                },
            )
        return "processed"

    return handle
