"""Demo B: temporal decoupling. CRM is down, Booking still succeeds, CRM catches up later."""

import time

from _common import (
    ANALYTICS,
    CRM,
    CRM_QUEUE,
    NOTIFICATION,
    ask_manual,
    compose,
    conclusion,
    create_and_confirm,
    effect,
    header,
    note,
    queue_info,
    row,
    step,
    wait_until,
)


def main() -> int:
    header(
        "Demo 02 - Consumer caído",
        "desacoplamiento temporal: si CRM está caído, la reserva igual se confirma y CRM se pone al día después.",
    )
    step(1, "Detengo el CRM Service (docker compose stop crm-consumer)")
    if not compose("stop", "crm-consumer"):
        ask_manual("docker compose stop crm-consumer")
    time.sleep(2)

    step(2, "Confirmo una reserva con el CRM caído")
    booking_id, corr = create_and_confirm()
    note(f"booking={booking_id} correlation_id={corr}")
    notification = wait_until(lambda: effect(f"{NOTIFICATION}/notifications", booking_id), 15)
    analytics = wait_until(lambda: effect(f"{ANALYTICS}/analytics/facts", booking_id), 15)
    queue = wait_until(
        lambda: (q := queue_info(CRM_QUEUE))["ready"] >= 1 and q["consumers"] == 0 and q, 40
    ) or queue_info(CRM_QUEUE)

    row("BOOKING", "CONFIRMADA (la API respondió 200)", True)
    row("NOTIFICATION", "PROCESADO", bool(notification))
    row("ANALYTICS", "PROCESADO", bool(analytics))
    row("CRM", "EN ESPERA (mensaje en la queue)", None)
    note(f"RabbitMQ {CRM_QUEUE}: ready={queue['ready']} consumers={queue['consumers']}")
    note("Ese mensaje acumulado es el backlog: el broker lo guarda hasta que CRM vuelva.")

    step(3, "Levanto el CRM Service (docker compose start crm-consumer)")
    if not compose("start", "crm-consumer"):
        ask_manual("docker compose start crm-consumer")
    crm = wait_until(lambda: effect(f"{CRM}/crm/bookings", booking_id), 60)
    queue = wait_until(
        lambda: (q := queue_info(CRM_QUEUE))["ready"] == 0 and q["consumers"] == 1 and q, 40
    ) or queue_info(CRM_QUEUE)
    row("CRM", "AL DÍA (backlog procesado)" if crm else "SIGUE SIN RECIBIRLO", bool(crm))
    note(f"RabbitMQ {CRM_QUEUE}: ready={queue['ready']} consumers={queue['consumers']}")
    conclusion(
        "Booking no depende de que CRM esté disponible: la reserva se confirma igual.",
        "Consistencia eventual: durante la caída CRM está desactualizado; al volver converge solo.",
        "El broker guarda el backlog en la queue; no se pierde ningún event.",
    )
    print(f"\nTraza completa: python3 scripts/demo_05_trace.py {corr}")
    return 0 if all([notification, analytics, crm, queue["ready"] == 0]) else 1


if __name__ == "__main__":
    raise SystemExit(main())
