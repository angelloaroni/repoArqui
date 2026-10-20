import db from '../database/database.js';
import { EVENT_TYPES } from '../database/seedData.js';

const insertEvent = db.prepare(`
  INSERT INTO events (
    event_name,
    event_type,
    description,
    payload,
    publisher_id,
    status,
    created_at
  )
  VALUES (
    @eventName,
    @eventType,
    @description,
    @payload,
    @publisherId,
    'NO_SUBSCRIBERS',
    COALESCE(@createdAt, CURRENT_TIMESTAMP)
  )
`);

const findRelevantSubscribers = db.prepare(`
  SELECT DISTINCT
    s.id,
    s.name,
    s.active,
    s.simulate_failure
  FROM subscribers s
  INNER JOIN subscriber_event_types setypes
    ON setypes.subscriber_id = s.id
  WHERE setypes.event_type = ?
  ORDER BY s.id
`);

const insertDelivery = db.prepare(`
  INSERT INTO event_deliveries (
    event_id,
    subscriber_id,
    status,
    message,
    processed_at
  )
  VALUES (
    @eventId,
    @subscriberId,
    @status,
    @message,
    COALESCE(@processedAt, CURRENT_TIMESTAMP)
  )
`);

const updateEventStatus = db.prepare('UPDATE events SET status = ? WHERE id = ?');
const getCurrentTimestamp = db.prepare('SELECT CURRENT_TIMESTAMP AS value');
const findEvent = db.prepare(`
  SELECT
    e.id,
    e.event_name AS eventName,
    e.event_type AS eventType,
    e.description,
    e.payload,
    e.status,
    e.created_at AS createdAt,
    p.id AS publisherId,
    p.name AS publisherName
  FROM events e
  INNER JOIN publishers p ON p.id = e.publisher_id
  WHERE e.id = ?
`);

function calculateGeneralStatus(deliveries) {
  if (deliveries.length === 0) {
    return 'NO_SUBSCRIBERS';
  }

  const processed = deliveries.filter((delivery) => delivery.status === 'PROCESSED').length;
  const failed = deliveries.filter((delivery) => delivery.status === 'FAILED').length;
  const inactive = deliveries.filter((delivery) => delivery.status === 'INACTIVE').length;

  if (failed === deliveries.length) {
    return 'FAILED';
  }

  if (failed > 0 || inactive > 0) {
    return 'PARTIALLY_PROCESSED';
  }

  return processed === deliveries.length ? 'PROCESSED' : 'FAILED';
}

function buildDelivery(eventId, subscriber, processedAt) {
  if (!subscriber.active) {
    return {
      eventId,
      subscriberId: subscriber.id,
      subscriberName: subscriber.name,
      status: 'INACTIVE',
      message: `${subscriber.name} está inactivo y no procesó el evento.`,
      processedAt,
    };
  }

  if (subscriber.simulate_failure) {
    return {
      eventId,
      subscriberId: subscriber.id,
      subscriberName: subscriber.name,
      status: 'FAILED',
      message: `${subscriber.name} registró el fallo simulado configurado.`,
      processedAt,
    };
  }

  return {
    eventId,
    subscriberId: subscriber.id,
    subscriberName: subscriber.name,
    status: 'PROCESSED',
    message: `${subscriber.name} procesó el evento correctamente.`,
    processedAt,
  };
}

const publishTransaction = db.transaction((eventData) => {
  const timestamp = eventData.createdAt || getCurrentTimestamp.get().value;
  const eventResult = insertEvent.run({
    eventName: eventData.eventName,
    eventType: eventData.eventType,
    description: eventData.description,
    publisherId: eventData.publisherId,
    payload: eventData.payload ? JSON.stringify(eventData.payload) : null,
    createdAt: timestamp,
  });
  const eventId = Number(eventResult.lastInsertRowid);
  const subscribers = findRelevantSubscribers.all(eventData.eventType);
  const deliveries = subscribers.map((subscriber) =>
    buildDelivery(eventId, subscriber, timestamp),
  );

  deliveries.forEach((delivery) =>
    insertDelivery.run({
      eventId: delivery.eventId,
      subscriberId: delivery.subscriberId,
      status: delivery.status,
      message: delivery.message,
      processedAt: delivery.processedAt,
    }),
  );

  const generalStatus = calculateGeneralStatus(deliveries);
  updateEventStatus.run(generalStatus, eventId);

  return { eventId, deliveries, generalStatus };
});

export function publishEvent(eventData) {
  if (!EVENT_TYPES.includes(eventData.eventType)) {
    const error = new Error('El tipo de evento seleccionado no es válido.');
    error.statusCode = 400;
    throw error;
  }

  const result = publishTransaction(eventData);
  const event = findEvent.get(result.eventId);
  const summary = {
    eventPublished: true,
    publisher: event.publisherName,
    eventType: event.eventType,
    subscribersFound: result.deliveries.length,
    processed: result.deliveries.filter((item) => item.status === 'PROCESSED').length,
    inactive: result.deliveries.filter((item) => item.status === 'INACTIVE').length,
    failed: result.deliveries.filter((item) => item.status === 'FAILED').length,
    generalStatus: result.generalStatus,
  };

  return {
    event: {
      ...event,
      payload: event.payload ? JSON.parse(event.payload) : null,
    },
    deliveries: result.deliveries,
    summary,
  };
}
