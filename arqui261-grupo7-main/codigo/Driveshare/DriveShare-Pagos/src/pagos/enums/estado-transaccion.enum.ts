/**
 * Estados por los que pasa una transacción de pago.
 * Refleja el flujo escrow del módulo: se cobra y RETIENE, luego se LIBERA
 * al arrendador o se REEMBOLSA al arrendatario (RF31, RF32, RF33).
 */
export enum EstadoTransaccion {
  PENDIENTE = 'PENDIENTE',       // encolada, aún no enviada al gateway
  RETENIDO = 'RETENIDO',         // cobro exitoso, fondos en escrow (RF31)
  LIBERADO = 'LIBERADO',         // liberado al arrendador con comisión descontada (RF32)
  REEMBOLSADO = 'REEMBOLSADO',   // devuelto al arrendatario (RF33)
  FALLIDO = 'FALLIDO',           // el cobro falló en el gateway (RF35)
}

export enum TipoTransaccion {
  COBRO = 'COBRO',
  LIBERACION = 'LIBERACION',
  REEMBOLSO = 'REEMBOLSO',
}
