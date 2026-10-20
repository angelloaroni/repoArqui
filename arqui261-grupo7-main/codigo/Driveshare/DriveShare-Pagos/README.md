# DriveShare · Microservicio de Pagos (Módulo 4)

Microservicio independiente de pagos de DriveShare: **NestJS + TypeScript + TypeORM + PostgreSQL +
BullMQ/Redis + RabbitMQ + Stripe (patrón Adapter) + Circuit Breaker (Opossum)**.

## ▶️ Cómo levantarlo (4 pasos)

Necesitas tener instalados **Node.js 18+** y **Docker**.

```bash

npm install

docker compose up -d

npm run start:dev
```

Cuando veas `💳 Microservicio de Pagos escuchando en http://localhost:3004` ya está corriendo.
Las tablas se crean solas la primera vez (synchronize).

Para probar los endpoints abre `src/pagos/pruebas.http` con la extensión **REST Client**
de VS Code y dale a "Send Request".

## 🧩 Qué implementa

| Requisito | Dónde está |
|-----------|------------|
| RF30 Cobro de reserva | `PagoController.cobrar` → cola BullMQ → `PagoService.cobrar` |
| RF31 Retención (escrow) | estado `RETENIDO` en `PagoService` / `EscrowService` |
| RF32 Liberación al arrendador | `EscrowService.liberar` (descuenta comisión) |
| RF33 Reembolsos | `ReembolsoService.reembolsar` (valida plazo) |
| RF34 Historial | `PagoController.historial` + `TransaccionRepository.historial` |
| RF35 Manejo de errores / no duplicar | idempotencyKey + try/catch en `PagoService` |
| RF36 Comisión | `ComisionService` |
| RF37 Comprobantes | `ComprobanteService` |
| RF38 Métodos de pago tokenizados | `MetodoPagoService` (solo guarda token) |

## Decisiones de arquitectura

- **4.4 D1 / 8.4 D5 (Microservicio independiente, Multi-Tier):** proyecto autónomo con su
  propia BD y su propio `docker-compose`.
- **4.4 D2 / 8.4 D2-D3 (REST síncrono + RabbitMQ):** endpoints REST para validaciones;
  eventos `pago.confirmado`, `pago.liberado`, `reembolso.procesado` vía `RabbitMQPublisher`.
- **4.4 D3 / 8.4 D4 (PostgreSQL + Datos Compartidos):** entidades con `NUMERIC` y `JSONB`,
  acceso central por `TransaccionRepository`.
- **4.4 D4 (Cola BullMQ + Circuit Breaker):** `PagoProducer`/`PagoProcessor` + `StripeAdapter`.
- **5.4 (Circuit Breaker + Detección de intrusos):** Opossum en `StripeAdapter`, reglas de
  fraude en `FraudeService`.
- **8.4 D1 (Arquitectura en Capas):** controllers → guards → services → adapter/repository → entities.

## Estructura

```
src/
├── main.ts
├── app.module.ts
├── common/            guards (AuthGuard) y filtros de error
└── pagos/
    ├── controllers/   PagoController, ReembolsoController, MetodoPagoController
    ├── services/      PagoService, EscrowService, ReembolsoService, Comision, Fraude, Comprobante, MetodoPago
    ├── adapters/      CulqiAdapter (circuit breaker)
    ├── repositories/  TransaccionRepository
    ├── entities/      Transaccion, MetodoPago, Comprobante
    ├── dto/           validación de entradas
    ├── queue/         cola BullMQ (producer + processor)
    ├── events/        RabbitMQPublisher
    └── enums/
```


**Cambiar de proveedor** (Stripe ↔ Culqi) es una sola línea en `pagos.module.ts`:
cambia `useClass: StripeAdapter` por `useClass: CulqiAdapter`. Nada más se toca. Eso es
exactamente el escenario de mantenibilidad de 2.2.4.
