import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import CircuitBreaker from 'opossum';
import { DatosMetodo, IPaymentGateway, ResultadoCargo } from './payment-gateway';

/**
 * Adaptador del proveedor de pagos STRIPE (patrón Adapter, 8.4 Decisión 1).
 *
 * ÚNICO punto de contacto con Stripe. Implementa IPaymentGateway, así que la lógica de
 * negocio no sabe que por debajo hay Stripe (podría ser Culqi u otro).
 *
 * Táctica de disponibilidad Circuit Breaker con Opossum (5.4): ante fallos repetidos del
 * gateway, el circuito se abre y respondemos rápido al usuario (< 5 s) sin saturar recursos.
 *
 * MODO SIMULADO: si STRIPE_MOCK=true no llama a Stripe real (para demos sin llave secreta).
 */
@Injectable()
export class StripeAdapter implements IPaymentGateway {
  private readonly logger = new Logger(StripeAdapter.name);
  private readonly stripe: Stripe | null;
  private readonly mock: boolean;
  private readonly breakerCargo: CircuitBreaker<[any], ResultadoCargo>;
  private readonly breakerReembolso: CircuitBreaker<[string, number], Record<string, any>>;

  constructor(private readonly config: ConfigService) {
    this.mock = this.config.get<string>('STRIPE_MOCK', 'true') === 'true';
    const secret = this.config.get<string>('STRIPE_SECRET_KEY') ?? '';
    // Solo se instancia el cliente real cuando NO estamos en modo simulado.
    this.stripe = this.mock ? null : new Stripe(secret);

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
      this.logger.error('⚠️ Circuit breaker ABIERTO: Stripe no responde. Rechazando cobros.'));
    this.breakerCargo.on('halfOpen', () =>
      this.logger.warn('Circuit breaker HALF-OPEN: probando si Stripe se recuperó.'));
    this.breakerCargo.on('close', () =>
      this.logger.log('✅ Circuit breaker CERRADO: Stripe operativo.'));
  }

  /** Cobro real contra Stripe. Stripe trabaja en la unidad mínima (céntimos) y moneda en minúsculas. */
  private async ejecutarCargo(params: {
    monto: number; moneda: string; email: string; token: string;
  }): Promise<ResultadoCargo> {
    if (this.mock || !this.stripe) {
      const id = `ch_mock_${Date.now()}`;
      return { gatewayChargeId: id, raw: { id, ...params, status: 'succeeded', mock: true } };
    }
    const charge = await this.stripe.charges.create({
      amount: Math.round(params.monto * 100),
      currency: params.moneda.toLowerCase(),
      source: params.token,        // token de tarjeta (ej. 'tok_visa' en pruebas)
      receipt_email: params.email,
    });
    return { gatewayChargeId: charge.id, raw: charge as unknown as Record<string, any> };
  }

  private async ejecutarReembolso(chargeId: string, montoCentimos: number): Promise<Record<string, any>> {
    if (this.mock || !this.stripe) {
      return { id: `re_mock_${Date.now()}`, charge: chargeId, amount: montoCentimos, mock: true };
    }
    const refund = await this.stripe.refunds.create({ charge: chargeId, amount: montoCentimos });
    return refund as unknown as Record<string, any>;
  }

  async cobrar(params: { monto: number; moneda: string; email: string; token: string }): Promise<ResultadoCargo> {
    try {
      return await this.breakerCargo.fire(params);
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
    if (this.mock || !this.stripe) {
      return { last_four: '4242', iin: { card_brand: 'Visa' }, expiration: '09/28' };
    }
    const tok = await this.stripe.tokens.retrieve(token);
    const card = tok.card;
    return {
      last_four: card?.last4 ?? '0000',
      iin: { card_brand: card?.brand ?? 'DESCONOCIDA' },
      expiration: card ? `${card.exp_month}/${card.exp_year}` : null,
    };
  }
}
