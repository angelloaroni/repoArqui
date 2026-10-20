"""End-to-end tests against the running stack. Only stdlib + the demo helpers (scripts/_common.py)."""

import json
import sys
import uuid
from datetime import UTC, datetime
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
from _common import (  # noqa: E402
    ANALYTICS,
    BOOKING,
    CRM,
    CRM_DLQ,
    NOTIFICATION,
    create_and_confirm,
    effect,
    http,
    queue_info,
    rabbit,
    wait_until,
)

pytestmark = pytest.mark.integration


def _envelope(amount: float, booking_id: str, corr: str, event_id: str | None = None) -> dict:
    return {
        "specversion": "1.0",
        "id": event_id or str(uuid.uuid4()),
        "source": "/booking-service",
        "type": "com.arquisoft.travel.booking.confirmed.v1",
        "subject": f"booking/{booking_id}",
        "time": datetime.now(UTC).isoformat(),
        "datacontenttype": "application/json",
        "correlationid": corr,
        "data": {"booking_id": booking_id, "customer_id": "C-9", "amount": amount, "currency": "USD"},
    }


def _publish(envelope: dict) -> None:
    rabbit(
        "POST",
        "/exchanges/%2F/travel.events/publish",
        {
            "routing_key": "booking.confirmed.v1",
            "payload": json.dumps(envelope),
            "payload_encoding": "string",
            "properties": {"delivery_mode": 2, "content_type": "application/json"},
        },
    )


def test_confirm_stores_outbox_relay_publishes_and_all_consumers_process():
    booking_id, corr = create_and_confirm()
    outbox = [o for o in http("GET", f"{BOOKING}/outbox") if o["aggregate_id"] == booking_id]
    assert len(outbox) == 1 and outbox[0]["correlation_id"] == corr  # outbox row exists after confirm
    assert wait_until(
        lambda: [o for o in http("GET", f"{BOOKING}/outbox") if o["aggregate_id"] == booking_id][0]["published_at"], 15
    )
    assert wait_until(lambda: effect(f"{CRM}/crm/bookings", booking_id), 15)
    assert wait_until(lambda: effect(f"{NOTIFICATION}/notifications", booking_id), 15)
    assert wait_until(lambda: effect(f"{ANALYTICS}/analytics/facts", booking_id), 15)


def test_same_event_id_twice_produces_one_crm_effect():
    booking_id, corr = f"BK-DUP-{uuid.uuid4().hex[:4]}", f"corr-dup-{uuid.uuid4().hex[:4]}"
    envelope = _envelope(100, booking_id, corr)
    _publish(envelope)
    _publish(envelope)  # duplicate publication: same event id
    assert wait_until(lambda: any(r["action"] == "duplicate" for r in http("GET", f"{CRM}/timeline?q={corr}")), 20)
    records = effect(f"{CRM}/crm/bookings", booking_id)
    assert len(records) == 1 and records[0]["times_applied"] == 1


def test_poison_event_ends_in_dlq():
    before = queue_info(CRM_DLQ)["ready"]
    corr = f"corr-poison-{uuid.uuid4().hex[:4]}"
    _publish(_envelope(-1, f"BK-POISON-{uuid.uuid4().hex[:4]}", corr))
    assert wait_until(lambda: queue_info(CRM_DLQ)["ready"] > before, 60, 1)
    attempts = [
        r["attempt"]
        for r in http("GET", f"{CRM}/timeline?q={corr}")
        if r["action"] in {"retry_scheduled", "dead_lettered"}
    ]
    assert attempts == [1, 2, 3]
