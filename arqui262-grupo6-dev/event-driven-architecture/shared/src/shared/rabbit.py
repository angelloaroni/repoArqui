"""RabbitMQ topology and connection helpers.

THE messaging decisions of the demo live here:

  exchange  travel.events (topic, durable)   -- producers only know this + a routing key
  binding   booking.confirmed.v1             -- one queue per subscribing capability
  queues    <svc>.booking-confirmed.v1       -- each consumer gets its OWN copy
  retry     <svc>.booking-confirmed.retry    -- TTL queue, dead-letters back to the main queue
  DLX       travel.dlx (direct)              -- rejected messages end in <svc>.booking-confirmed.dlq

Topology is declared idempotently by every process on start (relay and consumers),
so start order does not matter and unrouted messages cannot be lost.
"""

import asyncio
from dataclasses import dataclass

import aio_pika
from aio_pika import ExchangeType
from aio_pika.abc import AbstractChannel, AbstractExchange, AbstractRobustConnection

from shared.events import ROUTING_KEY

EXCHANGE = "travel.events"
DLX = "travel.dlx"


@dataclass(frozen=True)
class Subscription:
    key: str
    queue: str
    retry_queue: str
    dlq: str

    @property
    def retry_done_key(self) -> str:  # retry queue -> DLX -> main queue
        return f"{self.key}.retry-done"

    @property
    def dead_key(self) -> str:  # main queue reject -> DLX -> DLQ
        return f"{self.key}.dead"


def _sub(key: str) -> Subscription:
    base = f"{key}.booking-confirmed"
    return Subscription(key, f"{base}.v1", f"{base}.retry", f"{base}.dlq")


SUBSCRIPTIONS = {k: _sub(k) for k in ("crm", "notification", "analytics")}


async def connect(url: str, attempts: int = 60) -> AbstractRobustConnection:
    """Startup race: RabbitMQ can take ~10-20 s to accept connections."""
    for i in range(attempts):
        try:
            return await aio_pika.connect_robust(url)
        except Exception:
            if i == attempts - 1:
                raise
            await asyncio.sleep(2)
    raise RuntimeError("unreachable")


async def declare_topology(channel: AbstractChannel, retry_delay_ms: int) -> AbstractExchange:
    exchange = await channel.declare_exchange(EXCHANGE, ExchangeType.TOPIC, durable=True)
    dlx = await channel.declare_exchange(DLX, ExchangeType.DIRECT, durable=True)
    for s in SUBSCRIPTIONS.values():
        main = await channel.declare_queue(
            s.queue,
            durable=True,
            arguments={"x-dead-letter-exchange": DLX, "x-dead-letter-routing-key": s.dead_key},
        )
        await main.bind(exchange, ROUTING_KEY)
        await main.bind(dlx, s.retry_done_key)

        retry = await channel.declare_queue(
            s.retry_queue,
            durable=True,
            arguments={
                "x-message-ttl": retry_delay_ms,
                "x-dead-letter-exchange": DLX,
                "x-dead-letter-routing-key": s.retry_done_key,
            },
        )
        del retry  # consumed by nobody: messages only wait for the TTL

        dlq = await channel.declare_queue(s.dlq, durable=True)
        await dlq.bind(dlx, s.dead_key)
    return exchange
