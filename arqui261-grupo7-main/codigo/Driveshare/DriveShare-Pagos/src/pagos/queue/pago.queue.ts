/** Nombre de la cola de cobros en BullMQ (Decisión 4, sección 4.4). */
export const COLA_PAGOS = 'cola-pagos';

export interface JobCobro {
  idempotencyKey: string;
  payload: any; // CobrarDto serializado
}
