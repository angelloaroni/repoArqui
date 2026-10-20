"""Structured JSON logs + a tiny per-service timeline table.

Every log line carries service/action/event_id/correlation_id/booking_id so a flow
can be reassembled across services. The same record is persisted in `<svc>_timeline`
so `demo_05_trace.py` can print an ordered timeline without ELK/Grafana.
"""

import json
import sys
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import Engine, text

TIMELINE_COLUMNS = ("at", "service", "action", "event_id", "correlation_id", "booking_id", "attempt", "detail")


class Logger:
    def __init__(self, service: str, engine: Engine | None = None, timeline_table: str | None = None):
        self.service = service
        self.engine = engine
        self.timeline_table = timeline_table

    def log(
        self,
        action: str,
        *,
        event_id: str | None = None,
        correlation_id: str | None = None,
        booking_id: str | None = None,
        event_type: str | None = None,
        attempt: int | None = None,
        detail: str | None = None,
    ) -> None:
        now = datetime.now(UTC)
        record: dict[str, Any] = {
            "timestamp": now.isoformat(),
            "service": self.service,
            "action": action,
            "event_id": event_id,
            "correlation_id": correlation_id,
            "booking_id": booking_id,
            "event_type": event_type,
            "attempt": attempt,
            "detail": detail,
        }
        print(json.dumps({k: v for k, v in record.items() if v is not None}), file=sys.stdout, flush=True)
        self._persist(now, record)

    def _persist(self, now: datetime, record: dict[str, Any]) -> None:
        if self.engine is None or self.timeline_table is None:
            return
        try:  # best effort: the timeline must never break the business flow
            with self.engine.begin() as conn:
                conn.execute(
                    text(
                        f"INSERT INTO {self.timeline_table} "  # internal constant
                        "(at, service, action, event_id, correlation_id, booking_id, attempt, detail) "
                        "VALUES (:at, :service, :action, :event_id, :correlation_id, "
                        ":booking_id, :attempt, :detail)"
                    ),
                    {**{c: record.get(c) for c in TIMELINE_COLUMNS}, "at": now},
                )
        except Exception as exc:
            failure = {"service": self.service, "action": "timeline_write_failed", "detail": str(exc)}
            print(json.dumps(failure), flush=True)


def read_timeline(engine: Engine, table: str, key: str) -> list[dict[str, Any]]:
    """Rows of this service's timeline matching a correlation_id or a booking_id."""
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                f"SELECT at, service, action, event_id, correlation_id, booking_id, attempt, detail "
                f"FROM {table} WHERE correlation_id = :k OR booking_id = :k ORDER BY id"
            ),
            {"k": key},
        ).mappings()
        return [{**r, "at": r["at"].isoformat()} for r in rows]
