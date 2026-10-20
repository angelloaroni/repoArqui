import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

import { Transaccion } from './entities/transaccion.entity';
import { MetodoPago } from './entities/metodo-pago.entity';
import { Comprobante } from './entities/comprobante.entity';

import { PagoController } from './controllers/pago.controller';
import { ReembolsoController } from './controllers/reembolso.controller';
import { MetodoPagoController } from './controllers/metodo-pago.controller';

import { PagoService } from './services/pago.service';
import { EscrowService } from './services/escrow.service';
import { ReembolsoService } from './services/reembolso.service';
import { ComisionService } from './services/comision.service';
import { FraudeService } from './services/fraude.service';
import { ComprobanteService } from './services/comprobante.service';
import { MetodoPagoService } from './services/metodo-pago.service';

import { StripeAdapter } from './adapters/stripe.adapter';
import { PAYMENT_GATEWAY } from './adapters/payment-gateway';
import { TransaccionRepository } from './repositories/transaccion.repository';
import { RabbitMQPublisher } from './events/rabbitmq.publisher';
import { PagoProducer } from './queue/pago.producer';
import { PagoProcessor } from './queue/pago.processor';
import { COLA_PAGOS } from './queue/pago.queue';

/**
 * Módulo de Pagos. Agrupa todas las capas del microservicio (8.4 Decisión 1).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Transaccion, MetodoPago, Comprobante]),
    BullModule.registerQueue({ name: COLA_PAGOS }),
  ],
  controllers: [PagoController, ReembolsoController, MetodoPagoController],
  providers: [
    PagoService,
    EscrowService,
    ReembolsoService,
    ComisionService,
    FraudeService,
    ComprobanteService,
    MetodoPagoService,
    // Adaptador activo (patrón Adapter): se puede cambiar por CulqiAdapter en una sola línea.
    StripeAdapter,
    { provide: PAYMENT_GATEWAY, useClass: StripeAdapter },
    TransaccionRepository,
    RabbitMQPublisher,
    PagoProducer,
    PagoProcessor,
  ],
})
export class PagosModule {}
