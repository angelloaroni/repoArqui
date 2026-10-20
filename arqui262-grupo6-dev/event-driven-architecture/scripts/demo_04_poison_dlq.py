"""Demo D: a poison event is retried a bounded number of times, then dead-lettered."""

import json
import uuid
from datetime import UTC, datetime

from _common import CRM, CRM_DLQ, conclusion, header, http, note, queue_info, rabbit, row, step, wait_until


def main() -> int:
    header(
        "Demo 04 - Poison message -> retry -> DLQ",
        "un mensaje que siempre falla no bloquea al sistema: se reintenta pocas veces y termina en la DLQ.",
    )
    corr = f"corr-poison-{uuid.uuid4().hex[:4]}"
    booking_id = f"BK-POISON-{uuid.uuid4().hex[:4].upper()}"
    before = queue_info(CRM_DLQ)["ready"]

    # Valid CloudEvents envelope, but amount < 0: CRM's business rule rejects it every time.
    event_id = str(uuid.uuid4())
    envelope = {
        "specversion": "1.0",
        "id": event_id,
        "source": "/booking-service",
        "type": "com.arquisoft.travel.booking.confirmed.v1",
        "subject": f"booking/{booking_id}",
        "time": datetime.now(UTC).isoformat(),
        "datacontenttype": "application/json",
        "correlationid": corr,
        "data": {"booking_id": booking_id, "customer_id": "C-666", "amount": -450.0, "currency": "USD"},
    }
    step(1, "Publico un poison message: es un event válido, pero con amount negativo (-450.0)")
    note("El CRM lo rechaza siempre por regla de negocio; reintentar nunca lo va a arreglar.")
    # Published straight to the exchange through the management API: no booking-api endpoint is needed.
    result = rabbit(
        "POST",
        "/exchanges/%2F/travel.events/publish",
        {
            "routing_key": "booking.confirmed.v1",
            "payload": json.dumps(envelope),
            "payload_encoding": "string",
            "properties": {
                "delivery_mode": 2,
                "content_type": "application/json",
                "message_id": event_id,
                "correlation_id": corr,
            },
        },
    )
    note(f"booking={booking_id} correlation_id={corr} routed={result['routed']}")
    step(2, "El CRM falla y aplica retry: el mensaje espera en la retry queue (TTL de ~2 s) y vuelve")
    step(3, "Al llegar a MAX_RETRIES=3, el CRM lo rechaza: el exchange travel.dlx lo manda a la DLQ\n")

    in_dlq = wait_until(lambda: queue_info(CRM_DLQ)["ready"] > before, 60, 1)
    timeline = http("GET", f"{CRM}/timeline?q={corr}")
    for r in timeline:
        if r["action"] == "retry_scheduled":
            print(f"attempt {r['attempt']} ❌  {r['detail']}  -> retry queue (TTL), vuelve a intentarse")
        elif r["action"] == "dead_lettered":
            print(f"attempt {r['attempt']} ❌  {r['detail']}  -> reject -> travel.dlx -> DLQ")
    dlq = queue_info(CRM_DLQ)
    print()
    row("DLQ", f"{CRM_DLQ} ready={dlq['ready']}", bool(in_dlq))
    conclusion(
        "Retry sirve para fallas temporales (transient failure); un poison message nunca se arregla solo.",
        "Los reintentos son acotados (MAX_RETRIES=3): así no hay un loop infinito.",
        "La DLQ aparta el mensaje para inspeccionarlo; el resto de los events sigue fluyendo.",
    )
    print(f"\nRabbitMQ UI -> Queues -> {CRM_DLQ} -> Get messages.")
    print(f"Traza completa: python3 scripts/demo_05_trace.py {corr}")
    return 0 if in_dlq else 1


if __name__ == "__main__":
    raise SystemExit(main())
