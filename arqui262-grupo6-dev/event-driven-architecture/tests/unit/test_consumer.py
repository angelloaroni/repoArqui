"""Consumer delivery decisions (ACK / retry / DLQ / crash) tested with fakes, no broker needed."""

import asyncio

import pytest

from shared.consumer import Consumer
from shared.events import BookingConfirmedData, BookingConfirmedEvent
from shared.rabbit import SUBSCRIPTIONS
from shared.settings import Settings


class FakeMessage:
    def __init__(self, body: bytes, headers: dict | None = None):
        self.body, self.headers = body, headers or {}
        self.redelivered, self.content_type, self.message_id, self.correlation_id = (
            False,
            "application/json",
            "m1",
            "c1",
        )
        self.calls: list[str] = []

    async def ack(self):
        self.calls.append("ack")

    async def reject(self, requeue: bool = False):
        self.calls.append(f"reject(requeue={requeue})")


class FakeExchange:
    def __init__(self):
        self.published: list = []

    async def publish(self, message, routing_key):
        self.published.append((routing_key, message))


class FakeChannel:
    default_exchange = None


class FakeLog:
    def __init__(self):
        self.actions: list[str] = []

    def log(self, action, **_):
        self.actions.append(action)


def _body() -> bytes:
    data = BookingConfirmedData(booking_id="BK-1", customer_id="C-1", amount=10, currency="USD")
    return BookingConfirmedEvent.new(data, "corr-1").model_dump_json().encode()


def _consumer(handler):
    settings = Settings("t", "", "", True, max_retries=3, retry_delay_ms=1)
    consumer = Consumer(SUBSCRIPTIONS["crm"], handler, settings, FakeLog())
    consumer._channel = FakeChannel()
    consumer._channel.default_exchange = FakeExchange()
    return consumer


def _run(consumer, message):
    asyncio.run(consumer._on_message(message))


def test_success_acks_after_handler_ran():
    order = []
    consumer = _consumer(lambda e: order.append("handled") or "processed")
    message = FakeMessage(_body())
    message.ack = lambda: order.append("ack") or asyncio.sleep(0)
    _run(consumer, message)
    assert order == ["handled", "ack"]
    assert consumer.log.actions == ["received", "processed", "acked"]


def test_duplicate_is_acked_without_error():
    consumer = _consumer(lambda e: "duplicate")
    message = FakeMessage(_body())
    _run(consumer, message)
    assert message.calls == ["ack"] and "duplicate" in consumer.log.actions


def test_transient_failure_goes_to_retry_queue_with_incremented_attempt():
    def boom(_):
        raise RuntimeError("db down")

    consumer = _consumer(boom)
    message = FakeMessage(_body(), {"x-attempt": 1})
    _run(consumer, message)
    routing_key, retry = consumer._channel.default_exchange.published[0]
    assert routing_key == SUBSCRIPTIONS["crm"].retry_queue
    assert retry.headers["x-attempt"] == 2
    assert message.calls == ["ack"]  # original acked only after the retry copy was confirmed
    assert consumer.log.actions[-1] == "retry_scheduled"


def test_max_attempts_rejects_to_dlq():
    def boom(_):
        raise ValueError("bad amount")

    consumer = _consumer(boom)
    message = FakeMessage(_body(), {"x-attempt": 3})
    _run(consumer, message)
    assert message.calls == ["reject(requeue=False)"]  # dead-letter exchange routes it to the DLQ
    assert consumer._channel.default_exchange.published == []
    assert consumer.log.actions[-1] == "dead_lettered"


def test_invalid_envelope_skips_retries_and_dead_letters():
    consumer = _consumer(lambda e: "processed")
    message = FakeMessage(b'{"not": "an event"}')
    _run(consumer, message)
    assert message.calls == ["reject(requeue=False)"]


def test_injected_failures_are_consumed_one_by_one():
    consumer = _consumer(lambda e: "processed")
    consumer.controls.fail_next = 1
    first = FakeMessage(_body())
    _run(consumer, first)
    assert consumer.log.actions.count("retry_scheduled") == 1
    second = FakeMessage(_body())
    _run(consumer, second)
    assert second.calls == ["ack"] and consumer.controls.fail_next == 0


def test_crash_after_commit_happens_before_ack(monkeypatch):
    exits = []

    def fake_exit(code):
        exits.append(code)
        raise SystemExit(code)

    monkeypatch.setattr("shared.consumer.os._exit", fake_exit)
    consumer = _consumer(lambda e: "processed")
    consumer.controls.crash_next_after_commit = True
    message = FakeMessage(_body())
    with pytest.raises(SystemExit):
        _run(consumer, message)
    assert exits == [1] and message.calls == []  # effect committed, ACK never sent
    assert consumer.log.actions == ["received", "processed", "crash_before_ack"]
