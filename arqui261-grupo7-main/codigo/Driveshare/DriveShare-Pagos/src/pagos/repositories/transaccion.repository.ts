import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Transaccion } from '../entities/transaccion.entity';
import { FiltroHistorialDto } from '../dto/filtro-historial.dto';

/**
 * Repositorio central de transacciones (patrón Datos Compartidos, 8.4 Decisión 4).
 * Única fuente de verdad; PagoService, EscrowService y ReembolsoService pasan por aquí.
 */
@Injectable()
export class TransaccionRepository {
  constructor(
    @InjectRepository(Transaccion)
    private readonly repo: Repository<Transaccion>,
  ) {}

  crear(data: Partial<Transaccion>): Transaccion {
    return this.repo.create(data);
  }

  guardar(t: Transaccion): Promise<Transaccion> {
    return this.repo.save(t);
  }

  buscarPorId(id: string): Promise<Transaccion | null> {
    return this.repo.findOne({ where: { id } });
  }

  buscarPorIdempotencyKey(key: string): Promise<Transaccion | null> {
    return this.repo.findOne({ where: { idempotencyKey: key } });
  }

  /** Historial filtrable por usuario, estado, tipo, rango de fecha y monto (RF34). */
  async historial(f: FiltroHistorialDto): Promise<Transaccion[]> {
    const where: FindOptionsWhere<Transaccion>[] = [
      { idArrendatario: f.idUsuario },
      { idArrendador: f.idUsuario },
    ];
    const filtroComun: FindOptionsWhere<Transaccion> = {};
    if (f.estado) filtroComun.estado = f.estado;
    if (f.tipo) filtroComun.tipo = f.tipo;
    if (f.desde && f.hasta) {
      filtroComun.createdAt = Between(new Date(f.desde), new Date(f.hasta));
    }
    return this.repo.find({
      where: where.map((w) => ({ ...w, ...filtroComun })),
      order: { createdAt: 'DESC' },
    });
  }
}
