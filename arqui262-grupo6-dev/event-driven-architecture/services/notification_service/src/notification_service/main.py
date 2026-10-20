from fastapi import Query

from notification_service.handler import make_handler
from shared.consumer_app import create_consumer_app
from shared.db import list_rows
from shared.rabbit import SUBSCRIPTIONS

app, engine = create_consumer_app(
    service="notification-consumer",
    sub=SUBSCRIPTIONS["notification"],
    make_handler=make_handler,
    reset_tables=["notifications"],
)


@app.get("/notifications")
def notifications(booking_id: str | None = Query(default=None)) -> list[dict]:
    return list_rows(
        engine,
        "SELECT event_id::text AS event_id, booking_id, message, created_at FROM notifications",
        booking_id,
    )
