import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Calcula la comisión de la plataforma sobre cada transacción (RF36).
 * El porcentaje es configurable por variable de entorno.
 */
@Injectable()
export class ComisionService {
  private readonly porcentaje: number;

  constructor(config: ConfigService) {
    this.porcentaje = parseFloat(config.get<string>('COMISION_PLATAFORMA', '0.10'));
  }

  /** Devuelve la comisión y el neto que recibe el arrendador (RF32). */
  calcular(monto: number): { comision: number; montoArrendador: number } {
    const comision = this.redondear(monto * this.porcentaje);
    const montoArrendador = this.redondear(monto - comision);
    return { comision, montoArrendador };
  }

  private redondear(n: number): number {
    return Math.round(n * 100) / 100;
  }
}
