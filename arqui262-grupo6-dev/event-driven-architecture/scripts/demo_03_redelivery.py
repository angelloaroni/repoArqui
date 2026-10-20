"""Demo C: crash after the DB commit but before ACK -> redelivery -> idempotency absorbs it."""

from _common import CRM, conclusion, create_and_confirm, effect, header, http, note, row, step, wait_until

REDELIVERY_NOTE = "RabbitMQ reentrega: no recibió ACK"


def main() -> int:
    header(
        "Demo 03 - Redelivery + idempotencia",
        "at-least-once puede entregar el mismo event dos veces; la idempotencia evita duplicar el efecto.",
    )
    step(1, "Armo un fallo: el CRM se caerá justo después del commit y antes del ACK")
    http("POST", f"{CRM}/debug/crash-next-after-commit")
    step(2, "Confirmo una reserva")
    booking_id, corr = create_and_confirm()
    note(f"booking={booking_id} correlation_id={corr}")
    step(3, "Espero: effect guardado -> crash -> reinicio del contenedor -> redelivery del broker")

    duplicate = wait_until(
        lambda: any(r["action"] == "duplicate" for r in http("GET", f"{CRM}/timeline?q={corr}")), 90, 1
    )
    acked = wait_until(lambda: any(r["action"] == "acked" for r in http("GET", f"{CRM}/timeline?q={corr}")), 15)
    records = effect(f"{CRM}/crm/bookings", booking_id) or []

    step(4, "Línea de tiempo del CRM")
    timeline = http("GET", f"{CRM}/timeline?q={corr}")
    for r in timeline:
        detail = r["detail"] or ""
        if detail == "redelivered=True":
            detail += f" ({REDELIVERY_NOTE})"
        elif detail == "redelivered=False":
            detail += " (primera entrega)"
        note_text = {
            "crash_before_ack": "(commit hecho, el proceso muere antes de enviar el ACK)",
            "duplicate": "(event_id ya procesado: se ignora, sin segundo efecto)",
        }.get(r["action"], "")
        print(f"   {r['action']:<18} attempt={r['attempt']} {detail}{note_text}".rstrip())
    print("   Leyenda: attempt = nuestros retries por error · redelivered = reentrega del broker por falta de ACK\n")

    crashed = any(r["action"] == "crash_before_ack" for r in timeline)
    row("EFECTO CRM", "guardado (commit) y crash antes del ACK — simulado" if crashed else "no hubo crash", crashed)
    row("REDELIVERY", "duplicado detectado, sin segundo efecto" if duplicate else "no observado", bool(duplicate))
    single = len(records) == 1 and records[0]["times_applied"] == 1
    row(
        "REGISTROS CRM",
        f"{len(records)} registro, times_applied={records[0]['times_applied'] if records else 0}",
        single,
    )
    conclusion(
        "At-least-once significa que un event puede llegar más de una vez.",
        "Sin ACK, el broker reentrega; el consumer lo detecta por event_id y no repite el efecto.",
        "La idempotencia del consumer es obligatoria, no opcional.",
    )
    return 0 if all([crashed, duplicate, acked, single]) else 1


if __name__ == "__main__":
    raise SystemExit(main())
