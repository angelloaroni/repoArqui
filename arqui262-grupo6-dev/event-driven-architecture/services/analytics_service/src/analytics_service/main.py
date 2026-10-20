from fastapi import Query

from analytics_service.handler import make_handler
from shared.consumer_app import create_consumer_app
from shared.db import list_rows
from shared.rabbit import SUBSCRIPTIONS

app, engine = create_consumer_app(
    service="analytics-consumer",
    sub=SUBSCRIPTIONS["analytics"],
    make_handler=make_handler,
    reset_tables=["analytics_facts"],
)


@app.get("/analytics/facts")
def facts(booking_id: str | None = Query(default=None)) -> list[dict]:
    return list_rows(
        engine,
        "SELECT event_id::text AS event_id, booking_id, amount, currency, created_at FROM analytics_facts",
        booking_id,
    )
