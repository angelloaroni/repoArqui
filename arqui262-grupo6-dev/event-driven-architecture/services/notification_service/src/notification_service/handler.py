from datetime import UTC, datetime

from sqlalchemy import Engine, text

from shared.db import already_processed
from shared.events import BookingConfirmedEvent


def make_handler(engine: Engine):
    def handle(event: BookingConfirmedEvent) -> str:
        with engine.begin() as conn:
            if already_processed(conn, "notification_processed_events", str(event.id)):
                return "duplicate"
            # Simulated notification: we only record it, nothing is really sent.
            conn.execute(
                text("INSERT INTO notifications (event_id, booking_id, message, created_at) VALUES (:e, :b, :m, :t)"),
                {
                    "e": str(event.id),
                    "b": event.data.booking_id,
                    "m": f"Booking {event.data.booking_id} confirmed for {event.data.customer_id} (simulated e-mail)",
                    "t": datetime.now(UTC),
                },
            )
        return "processed"

    return handle
