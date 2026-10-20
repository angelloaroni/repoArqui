import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { COLA_PAGOS, JobCobro } from './pago.queue';
import { CobrarDto } from '../dto/cobrar.dto';

/**
 * Encola los cobros en lugar de procesarlos en el hilo de la petición (Decisión 4).
 * BullMQ ordena los pagos sin bloquear el servidor y reintenta ante fallos del proveedor.
 */
@Injectable()
export class PagoProducer {
  constructor(@InjectQueue(COLA_PAGOS) private readonly cola: Queue<JobCobro>) {}

  async encolarCobro(dto: CobrarDto) {
    return this.cola.add(
      'cobrar',
      { idempotencyKey: dto.idempotencyKey, payload: dto },
      {
        jobId: dto.idempotencyKey,       // idempotencia también a nivel de cola (RF35)
        attempts: 4,                     // reintentos automáticos
        backoff: { type: 'exponential', delay: 2000 }, // backoff exponencial
        removeOnComplete: 1000,
        removeOnFail: false,
      },
    );
  }
}
