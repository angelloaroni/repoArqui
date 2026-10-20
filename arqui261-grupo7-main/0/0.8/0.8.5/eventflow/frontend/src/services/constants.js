export const EVENT_TYPES = [
  'USER_REGISTERED',
  'PAYMENT_COMPLETED',
  'ORDER_CREATED',
  'FILE_UPLOADED',
  'SECURITY_ALERT',
  'SYSTEM_UPDATE',
];

export const EVENT_SAMPLES = {
  USER_REGISTERED: {
    eventName: 'Registro de nuevo estudiante',
    description: 'Se creó una cuenta académica y se notificará a los interesados.',
    payload: { userId: 'USR-DEMO-101', profile: 'ESTUDIANTE' },
  },
  PAYMENT_COMPLETED: {
    eventName: 'Pago de matrícula confirmado',
    description: 'El pago fue validado y puede distribuirse a los suscriptores.',
    payload: { paymentId: 'PAY-DEMO-202', amount: 1850, currency: 'PEN' },
  },
  ORDER_CREATED: {
    eventName: 'Pedido de material creado',
    description: 'Se registró un pedido para el laboratorio académico.',
    payload: { orderId: 'ORD-DEMO-303', items: 3 },
  },
  FILE_UPLOADED: {
    eventName: 'Informe final cargado',
    description: 'El documento se almacenó correctamente en File Service.',
    payload: { fileId: 'FIL-DEMO-404', format: 'PDF' },
  },
  SECURITY_ALERT: {
    eventName: 'Acceso inusual detectado',
    description: 'Security Service detectó un acceso desde un equipo nuevo.',
    payload: { alertId: 'SEC-DEMO-505', severity: 'MEDIA' },
  },
  SYSTEM_UPDATE: {
    eventName: 'Actualización del sistema disponible',
    description: 'System Service publicó una actualización de mantenimiento.',
    payload: { version: '1.1.0', maintenanceWindow: '22:00' },
  },
};

export const STATUS_LABELS = {
  ACTIVE: 'Activo',
  PROCESSED: 'Procesado',
  PARTIALLY_PROCESSED: 'Procesado parcialmente',
  NO_SUBSCRIBERS: 'Publicado sin suscriptores',
  FAILED: 'Error simulado',
  INACTIVE: 'Inactivo',
  NO_SUBSCRIPTION: 'Sin suscripción',
  IGNORED: 'Ignorado',
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function formatDate(value) {
  if (!value) {
    return 'No aplica';
  }

  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(`${normalized}${normalized.endsWith('Z') ? '' : 'Z'}`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
