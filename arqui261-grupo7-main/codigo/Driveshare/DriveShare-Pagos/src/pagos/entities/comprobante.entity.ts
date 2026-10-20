import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoTransaccion } from '../enums/estado-transaccion.enum';

/**
 * Comprobante digital de cada operación: cobro, reembolso o liberación (RF37).
 */
@Entity('comprobantes')
export class Comprobante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  idTransaccion: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  numero: string; // p.ej. CMP-2026-000123

  @Column({ type: 'enum', enum: TipoTransaccion })
  tipo: TipoTransaccion;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto: number;

  @Column({ type: 'jsonb' })
  detalle: Record<string, any>;

  @CreateDateColumn()
  emitidoEn: Date;
}
