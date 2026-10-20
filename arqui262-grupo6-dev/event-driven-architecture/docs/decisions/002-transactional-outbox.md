# ADR 002 - Transactional Outbox

- Estado: aceptada
- Problema: escribir en la BD y publicar en el broker son dos operaciones sin transacción común (dual write). Si
  una falla, la reserva queda confirmada sin evento o hay un evento sin reserva.
- Decisión: al confirmar, `UPDATE bookings` e `INSERT outbox_events` ocurren en la misma transacción local.
  Un relay separado publica las filas pendientes con publisher confirm y marca `published_at`.
- Consecuencias:
  - Se gana atomicidad entre estado de negocio y la intención de publicar.
  - Aparece un componente más (relay) y una pequeña latencia de polling (0,5 s).
  - Un crash entre publicar y marcar duplica la publicación: los consumers deben ser idempotentes (ADR 003).
  - La tabla crece y requiere limpieza periódica (fuera del alcance de la demo).
