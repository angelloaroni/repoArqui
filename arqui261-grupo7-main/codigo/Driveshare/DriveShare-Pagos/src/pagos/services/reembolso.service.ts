import {
  BadRequestException, Inject, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransaccionRepository } from '../repositories/transaccion.repository';
import { IPaymentGateway, PAYMENT_GATEWAY } from '../adapters/payment-gateway';
import { ComprobanteService } from './comprobante.service';
import { RabbitMQPublisher } from '../events/rabbitmq.publisher';
import { EventoPago } from '../events/eventos-pago.enum';
import { EstadoTransaccion, TipoTransaccion } from '../enums/estado-transaccion.enum';
import { Transaccion } from '../entities/transaccion.entity';

/**
 * Gestiona los reembolsos por cancelación dentro del plazo permitido (RF33).
 * Valida la ventana de cancelación configurable (PLAZO_REEMBOLSO_HORAS).
 */
@Injectable()
export class ReembolsoService {
  private readonly logger = new Logger(ReembolsoService.name);
  private readonly plazoHoras: number;

  constructor(
    config: ConfigService,
    private readonly transacciones: TransaccionRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
    private readonly comprobantes: ComprobanteService,
    private readonly eventos: RabbitMQPublisher,
  ) {
    this.plazoHoras = parseInt(config.get<string>('PLAZO_REEMBOLSO_HORAS', '48'), 10);
  }

  async reembolsar(idTransaccion: string, motivo?: string): Promise<Transaccion> {
    const t = await this.transacciones.buscarPorId(idTransaccion);
    if (!t) throw new NotFoundException('Transacción no encontrada');

    if (t.estado !== EstadoTransaccion.RETENIDO) {
      throw new BadRequestException(
        `Solo se puede reembolsar un cobro RETENIDO. Estado actual: ${t.estado}`,
      );
    }

    // Validación de la ventana de cancelación (RF33).
    const horas = (Date.now() - new Date(t.createdAt).getTime()) / 3600_000;
    if (horas > this.plazoHoras) {
      throw new BadRequestException(
        `El plazo de reembolso (${this.plazoHoras}h) ya venció. No aplica devolución.`,
      );
    }

    if (!t.gatewayChargeId) {
      throw new BadRequestException('La transacción no tiene un cargo asociado en el gateway.');
    }

    // Reembolso en Culqi.
    const respuesta = await this.gateway.reembolsar(t.gatewayChargeId, Number(t.monto));

    t.estado = EstadoTransaccion.REEMBOLSADO;
    t.tipo = TipoTransaccion.REEMBOLSO;
    t.motivoFallo = null;
    t.gatewayResponse = { ...(t.gatewayResponse ?? {}), reembolso: respuesta, motivo };
    const actualizada = await this.transacciones.guardar(t);

    await this.comprobantes.emitir(actualizada, TipoTransaccion.REEMBOLSO);
    await this.eventos.publicar(EventoPago.REEMBOLSO_PROCESADO, {
      idTransaccion: actualizada.id,
      idReserva: actualizada.idReserva,
      monto: actualizada.monto,
    });
    return actualizada;
  }
}
