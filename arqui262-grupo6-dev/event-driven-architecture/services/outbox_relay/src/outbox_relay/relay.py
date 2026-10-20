"""Outbox relay: infrastructure that moves committed outbox rows to the broker.

poll unpublished rows -> publish (persistent, publisher confirm) -> mark published_at.
A crash between publish and mark re-publishes the row on restart: at-least-once.
That duplicate is intentional; consumers are idempotent (see shared.db.already_processed).
"""

import asyncio
from datetime import UTC, datetime

import aio_pika
from sqlalchemy import Engine, text

from shared.events import ROUTING_KEY, BookingConfirmedEvent
from shared.logging import Logger
from shared.rabbit import connect, declare_topology
from shared.settings import Settings

BATCH = 10


class Relay:
    def __init__(self, settings: Settings, engine: Engine, log: Logger):
        self.settings = settings
        self.engine = engine
        self.log = log
        self.connected = False

    async def run(self) -> None:
        connection = await connect(self.settings.rabbitmq_url)
        channel = await connection.channel()  # publisher confirms are on by default
        exchange = await declare_topology(channel, self.settings.retry_delay_ms)
        self.connected = True
        while True:
            if not await self.publish_pending(exchange):
                await asyncio.sleep(0.5)

    async def publish_pending(self, exchange) -> int:
        published = 0
        with self.engine.connect() as conn:
            rows = (
                conn.execute(
                    text(
                        "SELECT id, payload, correlation_id, aggregate_id FROM outbox_events "
                        "WHERE published_at IS NULL ORDER BY created_at LIMIT :n "
                        "FOR UPDATE SKIP LOCKED"
                    ),
                    {"n": BATCH},
                )
                .mappings()
                .all()
            )
            for row in rows:
                ctx = dict(
                    event_id=str(row["id"]),
                    correlation_id=row["correlation_id"],
                    booking_id=row["aggregate_id"],
                )
                try:
                    event = BookingConfirmedEvent.model_validate(row["payload"])  # contract check
                    message = aio_pika.Message(
                        body=event.model_dump_json().encode(),
                        content_type="application/json",
                        delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                        message_id=str(event.id),
                        correlation_id=event.correlationid,
                        type=event.type,
                    )
                    # Awaiting publish == waiting for the broker's publisher confirm.
                    # mandatory=True: an unroutable message raises instead of vanishing.
                    await exchange.publish(message, routing_key=ROUTING_KEY, mandatory=True)
                except Exception as exc:
                    conn.execute(
                        text("UPDATE outbox_events SET attempts = attempts + 1 WHERE id = :id"),
                        {"id": row["id"]},
                    )
                    conn.commit()
                    self.log.log("publish_failed", detail=str(exc), **ctx)
                    break  # keep order, back off, retry on next poll

                self.log.log("published", event_type=event.type, **ctx)
                # <-- a crash exactly here duplicates the publication (by design)
                conn.execute(
                    text("UPDATE outbox_events SET published_at = :now WHERE id = :id"),
                    {"now": datetime.now(UTC), "id": row["id"]},
                )
                conn.commit()
                published += 1
            conn.rollback()  # release the SKIP LOCKED locks of unprocessed rows
        return published
