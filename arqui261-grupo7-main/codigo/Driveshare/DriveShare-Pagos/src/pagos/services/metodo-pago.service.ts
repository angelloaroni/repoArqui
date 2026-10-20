import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoPago } from '../entities/metodo-pago.entity';
import { GuardarMetodoDto } from '../dto/guardar-metodo.dto';
import { IPaymentGateway, PAYMENT_GATEWAY } from '../adapters/payment-gateway';

/**
 * Almacena métodos de pago de forma segura (RF38).
 * Tokenización: valida el token con el proveedor y guarda SOLO datos no sensibles.
 * Nunca se persiste el número completo de la tarjeta (escenario de seguridad 2.2.4).
 */
@Injectable()
export class MetodoPagoService {
  constructor(
    @InjectRepository(MetodoPago)
    private readonly repo: Repository<MetodoPago>,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: IPaymentGateway,
  ) {}

  async guardar(dto: GuardarMetodoDto): Promise<MetodoPago> {
    const info = await this.gateway.validarToken(dto.token);
    const metodo = this.repo.create({
      idUsuario: dto.idUsuario,
      token: dto.token,
      marca: info?.iin?.card_brand ?? 'DESCONOCIDA',
      ultimosCuatro: info?.last_four ?? '0000',
      vencimiento: info?.expiration ?? null,
    });
    return this.repo.save(metodo);
  }

  listar(idUsuario: number): Promise<MetodoPago[]> {
    return this.repo.find({ where: { idUsuario } });
  }

  async eliminar(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
