/**
 * Contrato del proveedor de pagos (patrón Adapter, 8.4 Decisión 1).
 *
 * La lógica de negocio (PagoService, EscrowService, etc.) depende SOLO de esta interfaz,
 * nunca de un proveedor concreto. Cambiar de Culqi a Stripe (o viceversa) implica cambiar
 * únicamente la implementación registrada en PagosModule. Esto materializa el escenario de
 * mantenibilidad de 2.2.4.
 */
export interface ResultadoCargo {
  gatewayChargeId: string;
  raw: Record<string, any>;
}

export interface DatosMetodo {
  last_four: string;
  iin: { card_brand: string };
  expiration: string | null;
}

export interface IPaymentGateway {
  cobrar(params: { monto: number; moneda: string; email: string; token: string }): Promise<ResultadoCargo>;
  reembolsar(chargeId: string, monto: number): Promise<Record<string, any>>;
  validarToken(token: string): Promise<DatosMetodo>;
}

/** Token de inyección de dependencias para el gateway activo. */
export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
