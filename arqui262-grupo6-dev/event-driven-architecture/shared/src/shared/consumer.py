"""Reliable consumer loop shared by CRM / Notification / Analytics.

Delivery guarantees are decided in `_on_message` -- read it top to bottom:

  1. manual ACK (auto_ack=False): the broker keeps the message until we ACK it
  2. ACK only AFTER the handler committed its effect
  3. transient failure -> republish to the TTL retry queue with x-attempt+1, then ACK
  4. attempts exhausted, or message invalid -> reject(requeue=False) -> DLX -> DLQ
  5. crash before ACK -> broker redelivers; the handler's idempotency check absorbs it
"""

import asyncio
import os
from collections.abc import Callable
from dataclasses import dataclass

import aio_pika
from aio_pika.abc import AbstractIncomingMessage
from pydantic import ValidationError

from shared.events import BookingConfirmedEvent
from shared.logging import Logger
from shared.rabbit import SUBSCRIPTIONS, Subscription, connect, declare_topology
from shared.settings import Settings

Handler = Callable[[BookingConfirmedEvent], str]  # returns "processed" or "duplicate"


@dataclass
class DemoControls:
    """Failure injection, only reachable when DEMO_MODE=true (see consumer_app)."""

    crash_next_after_commit: bool = False
    fail_next: int = 0


class Consumer:
    def __init__(self, sub: Subscription, handler: Handler, settings: Settings, log: Logger):
        self.sub = sub
        self.handler = handler
        self.settings = settings
        self.log = log
        self.controls = DemoControls()
        self.consuming = False
        self._channel = None

    async def run(self) -> None:
        connection = await connect(self.settings.rabbitmq_url)
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=1)
        await declare_topology(channel, self.settings.retry_delay_ms)
        self._channel = channel
        queue = await channel.get_queue(self.sub.queue)
        await queue.consume(self._on_message, no_ack=False)  # manual ACK
        self.consuming = True
        await asyncio.Future()  # run until the process stops

    async def _on_message(self, message: AbstractIncomingMessage) -> None:
        attempt = int(message.headers.get("x-attempt", 1))
        try:
            event = BookingConfirmedEvent.model_validate_json(message.body)
        except ValidationError as exc:
            # A broken contract will never succeed: no retries, straight to the DLQ.
            self.log.log("dead_lettered", attempt=attempt, detail=f"invalid envelope: {exc.error_count()} errors")
            await message.reject(requeue=False)
            return

        ctx = dict(
            event_id=str(event.id),
            correlation_id=event.correlationid,
            booking_id=event.data.booking_id,
            event_type=event.type,
            attempt=attempt,
        )
        self.log.log("received", detail=f"redelivered={message.redelivered}", **ctx)

        try:
            if self.controls.fail_next > 0:  # demo only
                self.controls.fail_next -= 1
                raise RuntimeError("injected transient failure")
            outcome = await asyncio.to_thread(self.handler, event)  # commits the effect
        except Exception as exc:
            await self._retry_or_dead_letter(message, attempt, str(exc), ctx)
            return

        self.log.log(outcome, **ctx)  # "processed" or "duplicate"

        if self.controls.crash_next_after_commit:  # demo only: effect committed, ACK never sent
            self.log.log("crash_before_ack", **ctx)
            os._exit(1)  # docker `restart: unless-stopped` brings the container back

        await message.ack()  # ACK only after the effect is committed
        self.log.log("acked", **ctx)

    async def _retry_or_dead_letter(
        self, message: AbstractIncomingMessage, attempt: int, error: str, ctx: dict
    ) -> None:
        ctx = {**ctx, "attempt": attempt}
        if attempt < self.settings.max_retries:
            retry = aio_pika.Message(
                body=message.body,
                headers={"x-attempt": attempt + 1, "x-last-error": error},
                content_type=message.content_type,
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                message_id=message.message_id,
                correlation_id=message.correlation_id,
            )
            # Publisher confirm is awaited before ACK: we never lose the message in between.
            await self._channel.default_exchange.publish(retry, routing_key=self.sub.retry_queue)
            self.log.log("retry_scheduled", detail=error, **ctx)
            await message.ack()
        else:
            self.log.log("dead_lettered", detail=f"max attempts reached: {error}", **ctx)
            await message.reject(requeue=False)  # -> travel.dlx -> <svc>.booking-confirmed.dlq


__all__ = ["Consumer", "SUBSCRIPTIONS"]
