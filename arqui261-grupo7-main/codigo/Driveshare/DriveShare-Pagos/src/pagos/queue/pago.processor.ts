import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { COLA_PAGOS, JobCobro } from './pago.queue';
import { PagoService } from '../services/pago.service';

/**
 * Worker que consume la cola y ejecuta el cobro real (Decisión 4 / Multi-Tier).
 * Corre en el tier de aplicación y puede escalarse de forma independiente.
 */
@Processor(COLA_PAGOS)
export class PagoProcessor extends WorkerHost {
  private readonly logger = new Logger(PagoProcessor.name);

  constructor(private readonly pagoService: PagoService) {
    super();
  }

  async process(job: Job<JobCobro>): Promise<any> {
    this.logger.log(`Procesando cobro (job ${job.id}, intento ${job.attemptsMade + 1})`);
    const transaccion = await this.pagoService.cobrar(job.data.payload);
    return { idTransaccion: transaccion.id, estado: transaccion.estado };
  }
}
