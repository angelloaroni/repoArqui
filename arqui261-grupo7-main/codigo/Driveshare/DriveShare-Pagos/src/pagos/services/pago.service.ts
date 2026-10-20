import {
  BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { CobrarDto } from '../dto/cobrar.dto';
import { TransaccionRepository } from '../repositories/transaccion.repository';
import { IPaymentGateway, PAYMENT_GATEWAY } from '../adapters/payment-gateway';
import { FraudeService } from './fraude.service';
import { ComisionService } from './comision.service';
import { ComprobanteService } from './comprobante.service';
import { RabbitMQPublisher } from '../events/rabbitmq.publisher';
import { EventoPago } from '../events/eventos-pago.enum';
import { EstadoTransaccion, TipoTransaccion } from '../enums/estado-transaccion.enum';
import { Transaccion } from '../entities/transaccion.entity';

/**
 * Orquesta el flujo de cobro (RF30) y el manejo de errores (RF35).
 *
 * Secuencia (coincide con el diagrama de 8.4):
 *  1) idempotencia -> 2) detección de fraude -> 3) cobro en Culqi (circuit breaker)
 *  -> 4) registro atómico en estado RETENIDO -> 5) comprobante -> 6) evento pago.confirmado.
 */
@Injectable()
export class PagoService {
  private readonly logger = new Logger(PagoService.name);

  constructor(
    private readonly transacciones: TransaccionRepository,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
    private readonly fraude: FraudeService,
    private readonly comision: ComisionService,
    private readonly comprobantes: ComprobanteService,
    private readonly eventos: RabbitMQPublisher,
  ) {}

  async cobrar(dto: CobrarDto): Promise<Transaccion> {
    // 1) Idempotencia: si ya existe un cobro con esta clave, se devuelve el mismo (RF35).
    const existente = await this.transacciones.buscarPorIdempotencyKey(dto.idempotencyKey);
    if (existente) {
      this.logger.warn(`Cobro idempotente reutilizado: ${dto.idempotencyKey}`);
      return existente;
    }

    // 2) Detección de fraude ANTES de tocar el gateway (táctica de seguridad 5.4).
    const analisis = await this.fraude.evaluar(dto);
    if (analisis.sospechoso) {
      throw new ForbiddenException(
        `Pago bloqueado por seguridad: ${analisis.razones.join(', ')}`,
      );
    }

    const moneda = dto.moneda ?? 'PEN';
    const { comision, montoArrendador } = this.comision.calcular(dto.monto);

    // Se registra primero como PENDIENTE (reserva la clave de idempotencia).
    let transaccion = this.transacciones.crear({
      idReserva: dto.idReserva,
      idArrendatario: dto.idArrendatario,
      idArrendador: dto.idArrendador,
      monto: dto.monto,
      comision,
      montoArrendador,
      moneda,
      estado: EstadoTransaccion.PENDIENTE,
      tipo: TipoTransaccion.COBRO,
      idempotencyKey: dto.idempotencyKey,
    });
    transaccion = await this.transacciones.guardar(transaccion);

    // 3) Cobro real en Culqi (pasa por el circuit breaker).
    try {
      const resultado = await this.gateway.cobrar({
        monto: dto.monto,
        moneda,
        email: dto.email ?? 'sin-email@driveshare.pe',
        token: dto.token,
      });

      // 4) Éxito: fondos RETENIDOS en escrow (RF31). Escritura atómica.
      transaccion.estado = EstadoTransaccion.RETENIDO;
      transaccion.gatewayChargeId = resultado.gatewayChargeId;
      transaccion.gatewayResponse = resultado.raw;
      transaccion = await this.transacciones.guardar(transaccion);

      // 5) Comprobante (RF37).
      await this.comprobantes.emitir(transaccion, TipoTransaccion.COBRO);

      // 6) Evento asíncrono para que Reservas confirme la reserva (Pub/Sub).
      await this.eventos.publicar(EventoPago.CONFIRMADO, {
        idTransaccion: transaccion.id,
        idReserva: transaccion.idReserva,
        monto: transaccion.monto,
      });

      return transaccion;
    } catch (err: any) {
      // 3b) Manejo de error de pago sin cobro duplicado (RF35).
      transaccion.estado = EstadoTransaccion.FALLIDO;
      transaccion.motivoFallo = err.message;
      await this.transacciones.guardar(transaccion);
      await this.eventos.publicar(EventoPago.FALLIDO, {
        idTransaccion: transaccion.id,
        idReserva: transaccion.idReserva,
        motivo: err.message,
      });
      // Mensaje claro para el usuario (RF35).
      throw new BadRequestException(
        `No se pudo procesar el pago: ${err.message}. Puedes reintentar con seguridad.`,
      );
    }
  }

  async obtener(id: string): Promise<Transaccion> {
    const t = await this.transacciones.buscarPorId(id);
    if (!t) throw new NotFoundException('Transacción no encontrada');
    return t;
  }
}
