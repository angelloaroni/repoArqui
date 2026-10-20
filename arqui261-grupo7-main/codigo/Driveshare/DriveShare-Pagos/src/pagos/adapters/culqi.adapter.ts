import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import CircuitBreaker from 'opossum';
import { DatosMetodo, IPaymentGateway, ResultadoCargo } from './payment-gateway';

/**
 * ÚNICO punto de contacto con el proveedor de pagos (Culqi).
 *
 * Patrón Adapter (8.4 Decisión 1): aislar aquí toda la comunicación con el gateway
 * permite cambiar de proveedor tocando solo esta clase, cumpliendo el escenario de
 * mantenibilidad de 2.2.4.
 *
 * Táctica de disponibilidad Circuit Breaker con Opossum (5.4): si Culqi falla de forma
 * repetida, el circuito se abre y devolvemos error rápido al usuario (< 5 s).
 *
 * MODO SIMULADO: si CULQI_MOCK=true en el .env, no llama al gateway real y simula
 * cobros/reembolsos exitosos. Útil para demos sin llaves reales.
 */
@Injectable()
export class CulqiAdapter implements IPaymentGateway {
  private readonly logger = new Logger(CulqiAdapter.name);
  private readonly http: AxiosInstance;
  private readonly mock: boolean;
  private readonly breakerCargo: CircuitBreaker<[any], ResultadoCargo>;
  private readonly breakerReembolso: CircuitBreaker<[string, number], Record<string, any>>;

  constructor(private readonly config: ConfigService) {
    this.mock = this.config.get<string>('CULQI_MOCK', 'true') === 'true';
    this.http = axios.create({
      baseURL: this.config.get<string>('CULQI_API_URL'),
      timeout: 4000,
      headers: {
        Authorization: `Bearer ${this.config.get<string>('CULQI_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    const opciones: CircuitBreaker.Options = {
      timeout: 4500,
      errorThresholdPercentage: 50,
      resetTimeout: 15000,
      rollingCountTimeout: 10000,
    };

    this.breakerCargo = new CircuitBreaker<[any], ResultadoCargo>(
      (payload: any) => this.ejecutarCargo(payload), opciones,
    );
    this.breakerReembolso = new CircuitBreaker<[string, number], Record<string, any>>(
      (chargeId: string, monto: number) => this.ejecutarReembolso(chargeId, monto), opciones,
    );

    this.breakerCargo.on('open', () =>
      this.logger.error('⚠️ Circuit breaker ABIERTO: Culqi no responde. Rechazando cobros.'));
    this.breakerCargo.on('halfOpen', () =>
      this.logger.warn('Circuit breaker HALF-OPEN: probando si Culqi se recuperó.'));
    this.breakerCargo.on('close', () =>
      this.logger.log('✅ Circuit breaker CERRADO: Culqi operativo.'));
  }

  private async ejecutarCargo(payload: {
    amount: number; currency: string; email: string; source_id: string;
  }): Promise<ResultadoCargo> {
    if (this.mock) {
      const id = `chr_mock_${Date.now()}`;
      return { gatewayChargeId: id, raw: { id, ...payload, outcome: 'venta_exitosa', mock: true } };
    }
    const { data } = await this.http.post('/charges', payload);
    return { gatewayChargeId: data.id, raw: data };
  }

  private async ejecutarReembolso(chargeId: string, montoCentimos: number): Promise<Record<string, any>> {
    if (this.mock) {
      return { id: `ref_mock_${Date.now()}`, charge_id: chargeId, amount: montoCentimos, mock: true };
    }
    const { data } = await this.http.post('/refunds', {
      charge_id: chargeId, amount: montoCentimos, reason: 'solicitud_comprador',
    });
    return data;
  }

  async cobrar(params: { monto: number; moneda: string; email: string; token: string }): Promise<ResultadoCargo> {
    try {
      return await this.breakerCargo.fire({
        amount: Math.round(params.monto * 100),
        currency: params.moneda,
        email: params.email,
        source_id: params.token,
      });
    } catch (err: any) {
      if (this.breakerCargo.opened) {
        throw new ServiceUnavailableException(
          'El proveedor de pagos no está disponible. Intenta nuevamente en unos minutos.');
      }
      throw err;
    }
  }

  async reembolsar(chargeId: string, monto: number): Promise<Record<string, any>> {
    return this.breakerReembolso.fire(chargeId, Math.round(monto * 100));
  }

  async validarToken(token: string): Promise<DatosMetodo> {
    if (this.mock) {
      return { last_four: '4242', iin: { card_brand: 'Visa' }, expiration: '09/28' };
    }
    const { data } = await this.http.get(`/tokens/${token}`);
    return {
      last_four: data?.last_four ?? '0000',
      iin: { card_brand: data?.iin?.card_brand ?? 'DESCONOCIDA' },
      expiration: data?.expiration ?? null,
    };
  }
}
