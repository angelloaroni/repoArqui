import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { EstadoTransaccion, TipoTransaccion } from '../enums/estado-transaccion.enum';

/**
 * Fuente de verdad de cada movimiento de dinero (patrón Datos Compartidos, 8.4 Decisión 4).
 * Montos en NUMERIC para precisión exacta y respuesta del gateway en JSONB para auditoría
 * (Decisión 3 de la sección 4.4).
 */
@Entity('transacciones')
@Index(['idReserva'])
@Index(['idArrendatario'])
export class Transaccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  idReserva: number;

  @Column({ type: 'int' })
  idArrendatario: number;

  @Column({ type: 'int' })
  idArrendador: number;

  // NUMERIC(12,2) -> precisión monetaria exacta, sin errores de coma flotante
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  comision: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  montoArrendador: number; // monto - comision (lo que recibe el dueño en RF32)

  @Column({ type: 'varchar', length: 3, default: 'PEN' })
  moneda: string;

  @Column({ type: 'enum', enum: EstadoTransaccion, default: EstadoTransaccion.PENDIENTE })
  estado: EstadoTransaccion;

  @Column({ type: 'enum', enum: TipoTransaccion, default: TipoTransaccion.COBRO })
  tipo: TipoTransaccion;

  // Clave de idempotencia: evita cobros duplicados ante reintentos (RF35)
  @Column({ type: 'varchar', length: 100, unique: true })
  idempotencyKey: string;

  // Identificador del cargo devuelto por Culqi (para poder reembolsar después)
  @Column({ type: 'varchar', length: 120, nullable: true })
  gatewayChargeId: string | null;

  // Respuesta cruda del proveedor para auditoría (JSONB, Decisión 3)
  @Column({ type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  motivoFallo: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
