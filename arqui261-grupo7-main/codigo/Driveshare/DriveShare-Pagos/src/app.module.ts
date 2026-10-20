import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { PagosModule } from './pagos/pagos.module';

/**
 * Módulo raíz. Configura las conexiones a la infraestructura del tier de datos
 * (PostgreSQL, Redis) que exigen las decisiones 3 y 4 de la sección 4.4.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL (Decisión 3): base de datos relacional del microservicio.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST'),
        port: Number(cfg.get('DB_PORT')),
        username: cfg.get('DB_USER'),
        password: cfg.get('DB_PASSWORD'),
        database: cfg.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // en desarrollo crea las tablas solo. En prod usar migraciones.
      }),
    }),

    // Redis + BullMQ (Decisión 4): cola de trabajos para los cobros.
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: {
          host: cfg.get('REDIS_HOST'),
          port: Number(cfg.get('REDIS_PORT')),
        },
      }),
    }),

    PagosModule,
  ],
})
export class AppModule {}
