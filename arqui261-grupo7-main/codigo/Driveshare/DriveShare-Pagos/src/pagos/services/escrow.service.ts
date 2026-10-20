import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TransaccionRepository } from '../repositories/transaccion.repository';
import { ComprobanteService } from './comprobante.service';
import { RabbitMQPublisher } from '../events/rabbitmq.publisher';
import { EventoPago } from '../events/eventos-pago.enum';
import { EstadoTransaccion, TipoTransaccion } from '../enums/estado-transaccion.enum';
import { Transaccion } from '../entities/transaccion.entity';

/**
 * Gestiona la retención (RF31) y liberación de fondos al arrendador (RF32).
 * Solo se puede liberar una transacción que esté RETENIDA (evita liberar algo ya
 * reembolsado, coherente con Datos Compartidos, 8.4 Decisión 4).
 */
@Injectable()
export class EscrowService {
  constructor(
    private readonly transacciones: TransaccionRepository,
    private readonly comprobantes: ComprobanteService,
    private readonly eventos: RabbitMQPublisher,
  ) {}

  async liberar(idTransaccion: string): Promise<Transaccion> {
    const t = await this.transacciones.buscarPorId(idTransaccion);
    if (!t) throw new NotFoundException('Transacción no encontrada');
    if (t.estado !== EstadoTransaccion.RETENIDO) {
      throw new BadRequestException(
        `Solo se pueden liberar fondos RETENIDOS. Estado actual: ${t.estado}`,
      );
    }

    // La comisión ya se calculó en el cobro; aquí se confirma la liberación del neto.
    t.estado = EstadoTransaccion.LIBERADO;
    t.tipo = TipoTransaccion.LIBERACION;
    const actualizada = await this.transacciones.guardar(t);

    await this.comprobantes.emitir(actualizada, TipoTransaccion.LIBERACION);
    await this.eventos.publicar(EventoPago.LIBERADO, {
      idTransaccion: actualizada.id,
      idArrendador: actualizada.idArrendador,
      montoArrendador: actualizada.montoArrendador,
      comision: actualizada.comision,
    });
    return actualizada;
  }
}
