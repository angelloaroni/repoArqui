# ADR 003 - At-least-once e idempotencia (sin exactly-once)

- Estado: aceptada
- Contexto: con ACK manual, un crash antes del ACK provoca redelivery; el relay también puede duplicar. No se promete exactly-once de extremo a extremo.
- Decisión: diseñar para duplicados.
  - Cada consumer tiene una tabla `<svc>_processed_events (event_id PK)`.
  - La marca del `event_id` y el efecto se confirman en la misma transacción local; después se hace ACK.
  - Si el `event_id` ya existe: se registra `duplicate`, no se repite el efecto y se hace ACK.
- Retry y DLQ: fallos transitorios vuelven por una cola con TTL (`MAX_RETRIES=3` intentos en total);
  agotados los intentos, o ante un envelope inválido, el mensaje se rechaza hacia `travel.dlx` y termina en la DLQ.
- Consecuencias: el orden entre eventos no está garantizado tras un retry; las tablas de eventos procesados crecen y necesitan retención.
