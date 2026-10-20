from fastapi import Query

from crm_service.handler import make_handler
from shared.consumer_app import create_consumer_app
from shared.db import list_rows
from shared.rabbit import SUBSCRIPTIONS

app, engine = create_consumer_app(
    service="crm-consumer",
    sub=SUBSCRIPTIONS["crm"],
    make_handler=make_handler,
    reset_tables=["crm_bookings"],
)


@app.get("/crm/bookings")
def crm_bookings(booking_id: str | None = Query(default=None)) -> list[dict]:
    return list_rows(
        engine,
        "SELECT booking_id, customer_id, last_event_id::text AS last_event_id, "
        "confirmed_at, times_applied FROM crm_bookings",
        booking_id,
    )
