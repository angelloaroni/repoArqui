from datetime import UTC, datetime

from sqlalchemy import Engine, text

from shared.db import already_processed
from shared.events import BookingConfirmedEvent


def make_handler(engine: Engine):
    def handle(event: BookingConfirmedEvent) -> str:
        # Business rule: the CRM cannot register a non-positive amount.
        # Retrying never helps -> this is our "poison event" (retries, then DLQ).
        if event.data.amount <= 0:
            raise ValueError(f"invalid amount {event.data.amount}")

        # One local transaction: idempotency marker + effect. Commit happens on exit;
        # the consumer loop ACKs only after this function returns.
        with engine.begin() as conn:
            if already_processed(conn, "crm_processed_events", str(event.id)):
                return "duplicate"  # same event_id seen before: skip the effect
            conn.execute(
                text(
                    "INSERT INTO crm_bookings (booking_id, customer_id, last_event_id, confirmed_at) "
                    "VALUES (:b, :c, :e, :t) "
                    "ON CONFLICT (booking_id) DO UPDATE SET last_event_id = :e, "
                    "times_applied = crm_bookings.times_applied + 1"
                ),
                {"b": event.data.booking_id, "c": event.data.customer_id, "e": str(event.id), "t": datetime.now(UTC)},
            )
        return "processed"

    return handle
