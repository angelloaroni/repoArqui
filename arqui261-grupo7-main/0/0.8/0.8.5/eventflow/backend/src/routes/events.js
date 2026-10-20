import { Router } from 'express';
import db from '../database/database.js';
import { EVENT_TYPES } from '../database/seedData.js';
import { publishEvent } from '../services/eventBus.js';
import { sendSuccess } from './response.js';

const router = Router();

function parsePayload(payload) {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}

export function getEventList(filters = {}) {
  const clauses = [];
  const parameters = {};

  if (filters.eventType) {
    clauses.push('e.event_type = @eventType');
    parameters.eventType = filters.eventType;
  }
  if (filters.publisherId) {
    clauses.push('e.publisher_id = @publisherId');
    parameters.publisherId = Number(filters.publisherId);
  }
  if (filters.status) {
    clauses.push('e.status = @status');
    parameters.status = filters.status;
  }
  if (filters.search) {
    clauses.push(`
      (
        LOWER(e.event_name) LIKE @search
        OR LOWER(e.description) LIKE @search
        OR LOWER(p.name) LIKE @search
      )
    `);
    parameters.search = `%${filters.search.toLowerCase()}%`;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const requestedLimit = Number(filters.limit);
  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 200)
      : 100;

  const statement = db.prepare(`
      SELECT
        e.id,
        e.event_name AS eventName,
        e.event_type AS eventType,
        e.description,
        e.status,
        e.created_at AS createdAt,
        p.id AS publisherId,
        p.name AS publisherName,
        COUNT(ed.id) AS subscribersFound,
        COALESCE(SUM(CASE WHEN ed.status = 'PROCESSED' THEN 1 ELSE 0 END), 0) AS processed,
        COALESCE(SUM(CASE WHEN ed.status = 'INACTIVE' THEN 1 ELSE 0 END), 0) AS inactive,
        COALESCE(SUM(CASE WHEN ed.status = 'FAILED' THEN 1 ELSE 0 END), 0) AS failed
      FROM events e
      INNER JOIN publishers p ON p.id = e.publisher_id
      LEFT JOIN event_deliveries ed ON ed.event_id = e.id
      ${where}
      GROUP BY e.id
      ORDER BY e.id DESC
      LIMIT ${limit}
    `);

  return Object.keys(parameters).length > 0
    ? statement.all(parameters)
    : statement.all();
}

export function getEventDetail(eventId) {
  const event = db
    .prepare(`
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
    `)
    .get(eventId);

  if (!event) {
    return null;
  }

  const deliveries = db
    .prepare(`
      SELECT
        ed.id,
        ed.status,
        ed.message,
        ed.processed_at AS processedAt,
        s.id AS subscriberId,
        s.name AS subscriberName
      FROM event_deliveries ed
      INNER JOIN subscribers s ON s.id = ed.subscriber_id
      WHERE ed.event_id = ?
      ORDER BY ed.id
    `)
    .all(eventId);

  const deliveryBySubscriber = new Map(
    deliveries.map((delivery) => [delivery.subscriberId, delivery]),
  );
  const subscribers = db
    .prepare(`
      SELECT
        s.id,
        s.name,
        s.active,
        EXISTS (
          SELECT 1
          FROM subscriber_event_types setypes
          WHERE setypes.subscriber_id = s.id
            AND setypes.event_type = ?
        ) AS isSubscribed
      FROM subscribers s
      ORDER BY s.id
    `)
    .all(event.eventType);

  const distribution = subscribers.map((subscriber) => {
    const delivery = deliveryBySubscriber.get(subscriber.id);
    if (delivery) {
      return {
        subscriberId: subscriber.id,
        subscriberName: subscriber.name,
        status: delivery.status,
        message: delivery.message,
        processedAt: delivery.processedAt,
      };
    }

    if (subscriber.isSubscribed) {
      return {
        subscriberId: subscriber.id,
        subscriberName: subscriber.name,
        status: 'IGNORED',
        message: `${subscriber.name} no participó en esta publicación porque su relación es posterior.`,
        processedAt: null,
      };
    }

    return {
      subscriberId: subscriber.id,
      subscriberName: subscriber.name,
      status: 'NO_SUBSCRIPTION',
      message: `${subscriber.name} no está suscrito a ${event.eventType}.`,
      processedAt: null,
    };
  });

  return {
    ...event,
    payload: parsePayload(event.payload),
    deliveries,
    distribution,
    summary: {
      subscribersFound: deliveries.length,
      processed: deliveries.filter((item) => item.status === 'PROCESSED').length,
      inactive: deliveries.filter((item) => item.status === 'INACTIVE').length,
      failed: deliveries.filter((item) => item.status === 'FAILED').length,
      generalStatus: event.status,
    },
  };
}

router.get('/', (req, res) => {
  const events = getEventList(req.query);
  return sendSuccess(res, 'Eventos obtenidos correctamente.', events);
});

router.get('/:id', (req, res, next) => {
  try {
    const event = getEventDetail(req.params.id);
    if (!event) {
      const error = new Error('El evento solicitado no existe.');
      error.statusCode = 404;
      throw error;
    }
    return sendSuccess(res, 'Detalle del evento obtenido correctamente.', event);
  } catch (error) {
    return next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    const { publisherId, eventType, eventName, description, payload } = req.body || {};
    const normalizedName = typeof eventName === 'string' ? eventName.trim() : '';
    const normalizedDescription =
      typeof description === 'string' ? description.trim() : '';

    if (!publisherId || !eventType || !normalizedName || !normalizedDescription) {
      const error = new Error(
        'El publicador, tipo, nombre y descripción del evento son obligatorios.',
      );
      error.statusCode = 400;
      throw error;
    }

    if (!EVENT_TYPES.includes(eventType)) {
      const error = new Error('El tipo de evento seleccionado no es válido.');
      error.statusCode = 400;
      throw error;
    }

    const publisher = db
      .prepare('SELECT id FROM publishers WHERE id = ?')
      .get(publisherId);
    if (!publisher) {
      const error = new Error('El publicador seleccionado no existe.');
      error.statusCode = 400;
      throw error;
    }

    if (payload !== undefined && payload !== null && typeof payload !== 'object') {
      const error = new Error('Los datos adicionales deben tener formato JSON.');
      error.statusCode = 400;
      throw error;
    }

    const result = publishEvent({
      publisherId: publisher.id,
      eventType,
      eventName: normalizedName,
      description: normalizedDescription,
      payload: payload || null,
    });

    return sendSuccess(res, 'El evento recorrió el Event Bus correctamente.', result, 201);
  } catch (error) {
    return next(error);
  }
});

export default router;
