import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comprobante } from '../entities/comprobante.entity';
import { Transaccion } from '../entities/transaccion.entity';
import { TipoTransaccion } from '../enums/estado-transaccion.enum';

/** Genera comprobantes digitales de cobros, liberaciones y reembolsos (RF37). */
@Injectable()
export class ComprobanteService {
  constructor(
    @InjectRepository(Comprobante)
    private readonly repo: Repository<Comprobante>,
  ) {}

  async emitir(t: Transaccion, tipo: TipoTransaccion): Promise<Comprobante> {
    const numero = `CMP-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
    const comprobante = this.repo.create({
      idTransaccion: t.id,
      numero,
      tipo,
      monto: tipo === TipoTransaccion.LIBERACION ? t.montoArrendador : t.monto,
      detalle: {
        idReserva: t.idReserva,
        estado: t.estado,
        comision: t.comision,
        moneda: t.moneda,
        fecha: new Date().toISOString(),
      },
    });
    return this.repo.save(comprobante);
  }
}
