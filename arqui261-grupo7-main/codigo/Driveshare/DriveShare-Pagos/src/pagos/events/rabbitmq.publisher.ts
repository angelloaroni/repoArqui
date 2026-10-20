import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import amqp, { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { EventoPago } from './eventos-pago.enum';

/**
 * Publicador de eventos hacia RabbitMQ (patrón Publish-Subscribe, 8.4 Decisión 3).
 *
 * Pagos publica en un exchange tipo 'topic'; Reservas (y otros) se suscriben sin que
 * Pagos dependa de su disponibilidad. Usa amqp-connection-manager para reconexión
 * automática ante caídas temporales del broker.
 */
@Injectable()
export class RabbitMQPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQPublisher.name);
  private connection!: AmqpConnectionManager;
  private channel!: ChannelWrapper;
  private readonly exchange: string;

  constructor(private readonly config: ConfigService) {
    this.exchange = this.config.get<string>('RABBITMQ_EXCHANGE', 'pagos.eventos');
  }

  onModuleInit() {
    const url = this.config.get<string>('RABBITMQ_URL');
    this.connection = amqp.connect([url!]);
    this.channel = this.connection.createChannel({
      json: true,
      setup: (ch: ConfirmChannel) =>
        ch.assertExchange(this.exchange, 'topic', { durable: true }),
    });
    this.connection.on('connect', () => this.logger.log('✅ Conectado a RabbitMQ'));
    this.connection.on('disconnect', (e) =>
      this.logger.warn(`RabbitMQ desconectado, reintentando... ${e?.err?.message ?? ''}`),
    );
  }

  /** Publica un evento de forma persistente (durable) para no perderlo ante caídas. */
  async publicar(evento: EventoPago, payload: Record<string, any>): Promise<void> {
    try {
      await this.channel.publish(this.exchange, evento, payload, { persistent: true } as any);
      this.logger.log(`📤 Evento publicado: ${evento}`);
    } catch (err: any) {
      // El cobro ya quedó registrado de forma atómica en la BD antes de publicar,
      // así que un fallo aquí no pierde dinero; se puede reintentar la publicación.
      this.logger.error(`No se pudo publicar ${evento}: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
