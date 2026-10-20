/** Eventos de estado que Pagos publica para el resto de la plataforma (8.4 Decisión 3). */
export enum EventoPago {
  CONFIRMADO = 'pago.confirmado',
  FALLIDO = 'pago.fallido',
  LIBERADO = 'pago.liberado',
  REEMBOLSO_PROCESADO = 'reembolso.procesado',
}
