"""Demo A: BookingConfirmed reaches three independent consumers."""

from _common import (
    ANALYTICS,
    BOOKING,
    CRM,
    NOTIFICATION,
    conclusion,
    create_and_confirm,
    effect,
    header,
    http,
    note,
    row,
    step,
    wait_until,
)


def main() -> int:
    header(
        "Demo 01 - Happy path",
        "un solo event (BookingConfirmed) llega a tres consumers independientes; Booking no los conoce.",
    )
    step(1, "Creo una reserva y la confirmo (POST /bookings y POST /bookings/{id}/confirm)")
    booking_id, corr = create_and_confirm()
    note(f"booking={booking_id} correlation_id={corr}")
    step(2, "Booking guarda la reserva y el event en el outbox (misma transacción); el relay lo publica al broker")
    step(3, "El broker entrega una copia a cada consumer: CRM, Notification y Analytics\n")

    booking = http("GET", f"{BOOKING}/bookings/{booking_id}")
    published = wait_until(
        lambda: any(o["aggregate_id"] == booking_id and o["published_at"] for o in http("GET", f"{BOOKING}/outbox")), 15
    )
    crm = wait_until(lambda: effect(f"{CRM}/crm/bookings", booking_id), 15)
    notification = wait_until(lambda: effect(f"{NOTIFICATION}/notifications", booking_id), 15)
    analytics = wait_until(lambda: effect(f"{ANALYTICS}/analytics/facts", booking_id), 15)

    confirmed = booking["status"] == "CONFIRMED"
    row("BOOKING", "CONFIRMADA" if confirmed else booking["status"], confirmed)
    row("OUTBOX", "PUBLICADO por el relay" if published else "PENDIENTE", bool(published))
    row("CRM", "PROCESADO" if crm else "FALTA", bool(crm))
    row("NOTIFICATION", "PROCESADO" if notification else "FALTA", bool(notification))
    row("ANALYTICS", "PROCESADO" if analytics else "FALTA", bool(analytics))
    conclusion(
        "Booking solo publica un hecho; no llama a ningún consumer.",
        "Cada consumer tiene su propia queue y procesa a su ritmo.",
        "Agregar un consumer nuevo no cambia el código de Booking.",
    )
    print(f"\nTraza completa: python3 scripts/demo_05_trace.py {corr}")
    return 0 if all([published, crm, notification, analytics]) else 1


if __name__ == "__main__":
    raise SystemExit(main())
