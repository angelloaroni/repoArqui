# Runbook de la demo (10 minutos)

## Antes de exponer

```bash
cd event-driven-architecture
docker compose up -d --build
python scripts/healthcheck.py --wait 90      # los 7 componentes con ✅
python scripts/reset_demo.py
```

Pestañas abiertas: http://localhost:8000/docs, RabbitMQ -> Queues, una terminal con
`docker compose logs -f crm-consumer`, y otra terminal para comandos.

## Orden de la demo

| # | Comando | Qué decir | Qué mostrar |
|---|---|---|---|
| A | `python scripts/demo_01_happy_path.py` | "Booking no conoce a CRM, Notification ni Analytics. Solo publica un hecho." | BOOKING/OUTBOX/CRM/NOTIFICATION/ANALYTICS con ✅; 3 colas en RabbitMQ |
| B | `python scripts/demo_02_consumer_down.py` (o a mano: `docker compose stop crm-consumer`, nueva reserva, `docker compose start crm-consumer`) | "CRM no forma parte de la transacción crítica." | Cola CRM `Ready=1`, `Consumers=0`; luego `Ready=0` |
| C | `python scripts/demo_03_redelivery.py` | "At-least-once no significa una sola entrega." | `crash_before_ack`, `received redelivered=True (RabbitMQ reentrega: no recibió ACK)`, `duplicate`, `times_applied=1` |
| D | `python scripts/demo_04_poison_dlq.py` | "Retry sirve para fallas temporales; lo imposible no debe bloquear al sistema." | intentos 1, 2, 3 y 1 mensaje en `crm.booking-confirmed.dlq` |
| E | `python scripts/demo_05_trace.py --new` | "Ya no hay un solo call stack; reconstruyo la transacción con IDs." | Línea de tiempo con `retry (transient failure simulada)` y luego `processed`; la nota sobre el orden del log |
| F (opcional) | `python scripts/demo_06_outbox.py` | "Si el broker o el relay no están, la reserva no se pierde: el event espera en el outbox." | OUTBOX con `published_at` vacío y CRM sin recibir; luego `published_at` con fecha y los 3 consumers `PROCESADO` |

Todo seguido: `sh scripts/demo-all.sh` o `./scripts/demo-all.ps1`.

## Código a mostrar (máximo tres fragmentos)

1. Transacción de Booking: `services/booking_service/src/booking_service/service.py` líneas 41-61 (`booking.confirm()`, `session.add(OutboxEvent(...))`, `session.commit()`).
2. Idempotencia: `services/crm_service/src/crm_service/handler.py` línea 19 (`if already_processed(...): return "duplicate"`).
3. ACK: `shared/src/shared/consumer.py` líneas 80-93 (handler, luego `await message.ack()`).

## Si algo falla

- `python scripts/reset_demo.py`; si persiste, `docker compose down -v && docker compose up -d --build`.
- Si Docker no está accesible desde el script de las demos B y F, ejecutar `docker compose stop|start crm-consumer` (B) o `outbox-relay` (F) a mano cuando el script lo pida.
- Los logs de cada servicio: `docker compose logs <servicio>`; filtrar por `correlation_id`.
- Plan B: mostrar los logs y la UI de RabbitMQ de una corrida previa y la salida de `demo_05_trace.py`.
