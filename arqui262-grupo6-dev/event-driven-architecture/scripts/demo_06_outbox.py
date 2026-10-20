"""Demo F: Transactional Outbox when publishing is not possible (the relay is down)."""

import time

from _common import (
    ANALYTICS,
    BOOKING,
    CRM,
    NOTIFICATION,
    ask_manual,
    compose,
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


def outbox_row(booking_id: str) -> dict | None:
    return next((o for o in http("GET", f"{BOOKING}/outbox?limit=50") if o["aggregate_id"] == booking_id), None)


def main() -> int:
    header(
        "Demo 06 - Transactional Outbox",
        "si no se puede publicar al broker, la reserva igual se confirma y el event espera en el outbox.",
    )
    step(1, "Detengo el Outbox Relay (docker compose stop outbox-relay)")
    if not compose("stop", "outbox-relay"):
        ask_manual("docker compose stop outbox-relay")
    time.sleep(2)

    step(2, "Confirmo una reserva con el relay detenido (nada puede llegar al broker)")
    booking_id, corr = create_and_confirm()
    note(f"booking={booking_id} correlation_id={corr}")
    time.sleep(3)
    pending = outbox_row(booking_id)
    not_received = not effect(f"{CRM}/crm/bookings", booking_id)
    stored = bool(pending) and not pending["published_at"]
    row("BOOKING", "CONFIRMADA (la API respondió 200)", True)
    row("OUTBOX", "GUARDADO, published_at vacío" if stored else "estado inesperado", stored)
    row("CRM", "NO LO RECIBIÓ (nadie publicó el event)", not_received)
    note("El event está a salvo en la misma transacción (commit) que la reserva.")

    step(3, "Levanto el Outbox Relay (docker compose start outbox-relay)")
    if not compose("start", "outbox-relay"):
        ask_manual("docker compose start outbox-relay")
    published = wait_until(lambda: (o := outbox_row(booking_id)) and o["published_at"] and o, 60)
    crm = wait_until(lambda: effect(f"{CRM}/crm/bookings", booking_id), 30)
    notification = wait_until(lambda: effect(f"{NOTIFICATION}/notifications", booking_id), 30)
    analytics = wait_until(lambda: effect(f"{ANALYTICS}/analytics/facts", booking_id), 30)
    status = f"PUBLICADO, published_at={published['published_at']}" if published else "SIGUE PENDIENTE"
    row("OUTBOX", status, bool(published))
    row("CRM", "PROCESADO" if crm else "FALTA", bool(crm))
    row("NOTIFICATION", "PROCESADO" if notification else "FALTA", bool(notification))
    row("ANALYTICS", "PROCESADO" if analytics else "FALTA", bool(analytics))
    conclusion(
        "La reserva no depende del broker ni del relay: se confirma igual.",
        "El event no se pierde: quedó guardado en el outbox junto con la reserva.",
        "Se publica cuando el relay vuelve; los consumers procesan con at-least-once.",
    )
    print(f"\nTraza completa: python3 scripts/demo_05_trace.py {corr}")
    return 0 if all([stored, not_received, published, crm, notification, analytics]) else 1


if __name__ == "__main__":
    raise SystemExit(main())
