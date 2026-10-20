import { Injectable, Logger } from '@nestjs/common';
import { CobrarDto } from '../dto/cobrar.dto';
import { TransaccionRepository } from '../repositories/transaccion.repository';
import { EstadoTransaccion } from '../enums/estado-transaccion.enum';

export interface ResultadoFraude {
  sospechoso: boolean;
  score: number;
  razones: string[];
}

/**
 * Detección de intrusos por reglas + scoring (táctica de Seguridad, 5.4).
 *
 * Analiza cada transacción ANTES de enviarla al gateway. Si supera el umbral de riesgo,
 * se bloquea y se alerta al administrador, cumpliendo el escenario de 2.2.4
 * ("100% de pagos fraudulentos bloqueados antes de procesarse").
 */
@Injectable()
export class FraudeService {
  private readonly logger = new Logger(FraudeService.name);
  private readonly UMBRAL = 70; // score >= 70 => se bloquea

  constructor(private readonly transacciones: TransaccionRepository) {}

  async evaluar(dto: CobrarDto): Promise<ResultadoFraude> {
    const razones: string[] = [];
    let score = 0;

    // Regla 1: monto atípicamente alto
    if (dto.monto > 5000) {
      score += 30;
      razones.push('Monto inusualmente alto');
    }

    // Regla 2: velocidad de transacciones (varios cobros del mismo usuario en poco tiempo)
    const historial = await this.transacciones.historial({ idUsuario: dto.idArrendatario } as any);
    const ultimaHora = historial.filter(
      (t) => Date.now() - new Date(t.createdAt).getTime() < 3600_000,
    );
    if (ultimaHora.length >= 5) {
      score += 25;
      razones.push('Demasiadas transacciones en la última hora');
    }

    // Regla 3: intentos fallidos recientes (posible fuerza bruta con tarjetas robadas)
    const fallidosRecientes = ultimaHora.filter((t) => t.estado === EstadoTransaccion.FALLIDO);
    if (fallidosRecientes.length >= 3) {
      score += 35;
      razones.push('Múltiples intentos de pago fallidos recientes');
    }

    // Regla 4: arrendatario y arrendador son el mismo usuario (autopréstamo sospechoso)
    if (dto.idArrendatario === dto.idArrendador) {
      score += 40;
      razones.push('Arrendatario y arrendador coinciden');
    }

    const sospechoso = score >= this.UMBRAL;
    if (sospechoso) {
      this.logger.warn(
        `🚨 ALERTA FRAUDE (score ${score}) usuario ${dto.idArrendatario}: ${razones.join(', ')}`,
      );
      // Aquí se notificaría al administrador (correo / evento).
    }
    return { sospechoso, score, razones };
  }
}
