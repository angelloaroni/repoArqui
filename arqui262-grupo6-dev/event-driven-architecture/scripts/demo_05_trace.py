"""Demo E: rebuild one flow from per-service timelines.

Usage: python3 scripts/demo_05_trace.py [correlation_id | booking_id]
       python3 scripts/demo_05_trace.py --new     (injects one CRM failure first, so a retry shows up)
"""

import sys

from _common import (
    ANALYTICS,
    BOOKING,
    CRM,
    NOTIFICATION,
    RELAY,
    conclusion,
    create_and_confirm,
    header,
    http,
    note,
    parse_ts,
    step,
    wait_until,
)

SERVICES = [
    ("Booking", BOOKING),
    ("Relay", RELAY),
    ("CRM", CRM),
    ("Notification", NOTIFICATION),
    ("Analytics", ANALYTICS),
]
LABELS = {
    "confirmed": "confirmed",
    "outbox_stored": "outbox stored",
    "published": "published (confirmado por el broker)",
    "retry_scheduled": "retry",
    "crash_before_ack": "crash before ack",
}
HIDDEN = {"booking_created"}


def main() -> int:
    header(
        "Demo 05 - Traza por correlation_id",
        "sin un solo call stack, se reconstruye el flujo juntando los logs de cada servicio por correlation_id.",
    )
    arg = sys.argv[1] if len(sys.argv) > 1 else None
    if arg == "--new":
        step(1, "Simulo una transient failure en el CRM (por ejemplo, un timeout)")
        http("POST", f"{CRM}/debug/fail-next/1")
        step(2, "Creo y confirmo una reserva; el CRM falla una vez y hace retry")
        booking_id, key = create_and_confirm()
        step(3, "Junto los timelines de los 5 servicios y los ordeno por tiempo\n")
        wait_until(lambda: any(r["action"] == "acked" for r in http("GET", f"{CRM}/timeline?q={key}")), 30)
        wait_until(lambda: any(r["action"] == "acked" for r in http("GET", f"{ANALYTICS}/timeline?q={key}")), 30)
    elif arg:
        key = arg
        step(1, f"Junto los timelines de los 5 servicios para {key} y los ordeno por tiempo\n")
    else:
        outbox = http("GET", f"{BOOKING}/outbox?limit=1")
        if not outbox:
            print("No events yet. Run demo_01_happy_path.py first.")
            return 1
        key = outbox[0]["correlation_id"]
        step(1, f"Tomo el último event del outbox y junto los timelines de los 5 servicios para {key}\n")

    rows = []
    for name, url in SERVICES:
        rows += [{**r, "svc": name} for r in http("GET", f"{url}/timeline?q={key}")]
    rows.sort(key=lambda r: parse_ts(r["at"]))
    if not rows:
        print(f"Nothing found for {key}")
        return 1

    corr = next(r["correlation_id"] for r in rows if r["correlation_id"])
    print(f"correlation_id={corr}\n")
    t0 = parse_ts(rows[0]["at"])
    for r in rows:
        if r["action"] in HIDDEN:
            continue
        dt = (parse_ts(r["at"]) - t0).total_seconds()
        attempt = (
            f" (attempt {r['attempt']})" if r["svc"] in {"CRM", "Notification", "Analytics"} and r["attempt"] else ""
        )
        label = LABELS.get(r["action"], r["action"])
        if r["action"] == "retry_scheduled" and arg == "--new":
            label = "retry (transient failure simulada)"
        print(f"+{dt:6.3f}s  {r['svc']:<13} {label}{attempt}")
    print()
    note("Nota: el orden del log no siempre es el orden real.")
    note("El broker entrega el event a los consumers mientras el relay espera el publisher confirm;")
    note("por eso 'Relay published' puede aparecer después de 'received', aunque en la realidad ocurrió antes.")
    conclusion(
        "El correlation_id une los logs de todos los servicios en una sola historia.",
        "El retry se ve en el tiempo: CRM falla, espera el TTL y reintenta (attempt 2).",
        "Notification y Analytics no se ven afectados por el fallo del CRM.",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
