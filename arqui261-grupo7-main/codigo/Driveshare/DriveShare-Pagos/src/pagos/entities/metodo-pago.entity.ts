import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Método de pago guardado del usuario (RF38).
 * SEGURIDAD (2.2.4): NUNCA se almacena el número de tarjeta. Solo se guarda el
 * token que devuelve Culqi (tokenización) más datos no sensibles para mostrar.
 */
@Entity('metodos_pago')
@Index(['idUsuario'])
export class MetodoPago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  idUsuario: number;

  // Token del proveedor. Este valor reemplaza por completo al PAN de la tarjeta.
  @Column({ type: 'varchar', length: 120 })
  token: string;

  @Column({ type: 'varchar', length: 30 })
  marca: string; // Visa, Mastercard, etc.

  @Column({ type: 'varchar', length: 4 })
  ultimosCuatro: string; // solo los últimos 4 dígitos, dato no sensible

  @Column({ type: 'varchar', length: 5, nullable: true })
  vencimiento: string | null; // MM/YY

  @Column({ type: 'boolean', default: false })
  predeterminado: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
