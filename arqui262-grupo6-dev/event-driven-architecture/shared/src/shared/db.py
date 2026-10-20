"""Database helpers shared by services (one Postgres instance, tables owned per service)."""

import time
from datetime import UTC, datetime

from sqlalchemy import Connection, Engine, create_engine, text


def make_engine(url: str) -> Engine:
    return create_engine(url, pool_pre_ping=True)


def wait_for_db(engine: Engine, attempts: int = 60) -> None:
    """Startup race: Postgres may still be booting when the container starts."""
    for i in range(attempts):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return
        except Exception:
            if i == attempts - 1:
                raise
            time.sleep(1)


def already_processed(conn: Connection, table: str, event_id: str) -> bool:
    """Idempotency check, run INSIDE the same transaction as the business effect.

    Inserts the event_id marker; if the row already existed the event was handled
    before (redelivery or duplicate publication) and the caller must skip the effect.
    `table` is always an internal constant, never user input.
    """
    result = conn.execute(
        text(f"INSERT INTO {table} (event_id, processed_at) VALUES (:id, :now) ON CONFLICT (event_id) DO NOTHING"),
        {"id": event_id, "now": datetime.now(UTC)},
    )
    return result.rowcount == 0


def list_rows(engine: Engine, select_sql: str, booking_id: str | None) -> list[dict]:
    """Read-only helper behind the consumers' status endpoints (optionally filtered by booking)."""
    sql = select_sql + (" WHERE booking_id = :b" if booking_id else "")
    with engine.connect() as conn:
        rows = conn.execute(text(sql), {"b": booking_id} if booking_id else {}).mappings()
        return [{k: v.isoformat() if isinstance(v, datetime) else v for k, v in r.items()} for r in rows]
