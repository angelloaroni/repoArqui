import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CobrarDto } from '../dto/cobrar.dto';
import { FiltroHistorialDto } from '../dto/filtro-historial.dto';
import { PagoService } from '../services/pago.service';
import { EscrowService } from '../services/escrow.service';
import { PagoProducer } from '../queue/pago.producer';
import { TransaccionRepository } from '../repositories/transaccion.repository';

/**
 * Capa web del microservicio (Arquitectura en Capas, 8.4 Decisión 1).
 * Expone las operaciones de cobro/escrow como servicio central (Cliente-Servidor, Decisión 2).
 */
@Controller('pagos')
@UseGuards(AuthGuard)
export class PagoController {
  constructor(
    private readonly pagoService: PagoService,
    private readonly escrowService: EscrowService,
    private readonly producer: PagoProducer,
    private readonly transacciones: TransaccionRepository,
  ) {}

  /** RF30 — Cobra una reserva. Encola el cobro en BullMQ (Decisión 4) y responde 202. */
  @Post('cobrar')
  async cobrar(@Body() dto: CobrarDto) {
    const job = await this.producer.encolarCobro(dto);
    return {
      ok: true,
      mensaje: 'Pago encolado para procesamiento',
      jobId: job.id,
      idempotencyKey: dto.idempotencyKey,
    };
  }

  /** Alternativa síncrona: cobra sin pasar por la cola (útil para pruebas rápidas). */
  @Post('cobrar-directo')
  async cobrarDirecto(@Body() dto: CobrarDto) {
    return this.pagoService.cobrar(dto);
  }

  /** RF32 — Libera los fondos al arrendador descontando la comisión. */
  @Post(':id/liberar')
  liberar(@Param('id') id: string) {
    return this.escrowService.liberar(id);
  }

  /** RF34 — Historial de transacciones con filtros. */
  @Get('historial')
  historial(@Query() filtro: FiltroHistorialDto) {
    return this.transacciones.historial(filtro);
  }

  /** Consulta una transacción puntual. */
  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.pagoService.obtener(id);
  }
}
