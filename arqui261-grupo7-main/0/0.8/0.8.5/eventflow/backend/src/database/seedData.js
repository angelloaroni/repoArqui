export const EVENT_TYPES = [
  'USER_REGISTERED',
  'PAYMENT_COMPLETED',
  'ORDER_CREATED',
  'FILE_UPLOADED',
  'SECURITY_ALERT',
  'SYSTEM_UPDATE',
];

export const PUBLISHERS = [
  {
    name: 'User Service',
    description: 'Gestiona el registro de usuarios y publica eventos de nuevas cuentas.',
    defaultEventType: 'USER_REGISTERED',
  },
  {
    name: 'Payment Service',
    description: 'Confirma transacciones y comunica pagos completados al sistema.',
    defaultEventType: 'PAYMENT_COMPLETED',
  },
  {
    name: 'Order Service',
    description: 'Registra pedidos y notifica su creación sin conocer a los receptores.',
    defaultEventType: 'ORDER_CREATED',
  },
  {
    name: 'File Service',
    description: 'Administra archivos y anuncia cuando una carga termina correctamente.',
    defaultEventType: 'FILE_UPLOADED',
  },
  {
    name: 'Security Service',
    description: 'Detecta situaciones de riesgo y publica alertas de seguridad.',
    defaultEventType: 'SECURITY_ALERT',
  },
  {
    name: 'System Service',
    description: 'Emite avisos de mantenimiento y actualizaciones generales.',
    defaultEventType: 'SYSTEM_UPDATE',
  },
];

export const DEFAULT_SUBSCRIBERS = [
  {
    name: 'Notification Service',
    description: 'Envía comunicaciones a usuarios cuando ocurren eventos relevantes.',
    eventTypes: ['USER_REGISTERED', 'PAYMENT_COMPLETED'],
  },
  {
    name: 'Audit Service',
    description: 'Conserva una traza académica de todos los tipos de eventos.',
    eventTypes: EVENT_TYPES,
  },
  {
    name: 'Analytics Service',
    description: 'Actualiza métricas de pedidos y pagos para análisis posterior.',
    eventTypes: ['ORDER_CREATED', 'PAYMENT_COMPLETED'],
  },
  {
    name: 'Security Service',
    description: 'Reacciona ante alertas y registra su procesamiento de seguridad.',
    eventTypes: ['SECURITY_ALERT'],
  },
];

export const EXAMPLE_EVENTS = [
  {
    publisherName: 'User Service',
    eventType: 'USER_REGISTERED',
    eventName: 'Registro de estudiante',
    description: 'Se creó la cuenta académica de Lucía Torres.',
    payload: { userId: 'USR-1042', profile: 'ESTUDIANTE' },
    createdAt: '2026-07-20 09:15:00',
  },
  {
    publisherName: 'Payment Service',
    eventType: 'PAYMENT_COMPLETED',
    eventName: 'Pago de matrícula confirmado',
    description: 'La matrícula del ciclo 2026-1 fue confirmada.',
    payload: { paymentId: 'PAY-2081', amount: 1850, currency: 'PEN' },
    createdAt: '2026-07-20 10:30:00',
  },
  {
    publisherName: 'Order Service',
    eventType: 'ORDER_CREATED',
    eventName: 'Pedido de material creado',
    description: 'Se solicitó material para el laboratorio de arquitectura.',
    payload: { orderId: 'ORD-3024', items: 4 },
    createdAt: '2026-07-21 11:20:00',
  },
  {
    publisherName: 'File Service',
    eventType: 'FILE_UPLOADED',
    eventName: 'Informe académico cargado',
    description: 'El informe final fue almacenado correctamente.',
    payload: { fileId: 'FIL-4077', format: 'PDF' },
    createdAt: '2026-07-22 14:05:00',
  },
  {
    publisherName: 'Security Service',
    eventType: 'SECURITY_ALERT',
    eventName: 'Acceso inusual detectado',
    description: 'Se registró un acceso desde un dispositivo no reconocido.',
    payload: { alertId: 'SEC-5013', severity: 'MEDIA' },
    createdAt: '2026-07-23 16:40:00',
  },
];

