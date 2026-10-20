import { Router } from 'express';
import db from '../database/database.js';
import { EVENT_TYPES } from '../database/seedData.js';
import { sendSuccess } from './response.js';

const router = Router();

const getSubscriber = db.prepare(`
  SELECT
    s.id,
    s.name,
    s.description,
    s.active,
    s.simulate_failure AS simulateFailure,
    s.created_at AS createdAt,
    (
      SELECT COUNT(*)
      FROM event_deliveries ed
      WHERE ed.subscriber_id = s.id AND ed.status = 'PROCESSED'
    ) AS eventsProcessed
  FROM subscribers s
  WHERE s.id = ?
`);

const getEventTypes = db.prepare(`
  SELECT event_type AS eventType
  FROM subscriber_event_types
  WHERE subscriber_id = ?
  ORDER BY event_type
`);

function serializeSubscriber(subscriber) {
  return {
    ...subscriber,
    active: Boolean(subscriber.active),
    simulateFailure: Boolean(subscriber.simulateFailure),
    eventTypes: getEventTypes.all(subscriber.id).map((item) => item.eventType),
  };
}

router.get('/', (req, res) => {
  const subscribers = db
    .prepare(`
      SELECT
        s.id,
        s.name,
        s.description,
        s.active,
        s.simulate_failure AS simulateFailure,
        s.created_at AS createdAt,
        (
          SELECT COUNT(*)
          FROM event_deliveries ed
          WHERE ed.subscriber_id = s.id AND ed.status = 'PROCESSED'
        ) AS eventsProcessed
      FROM subscribers s
      ORDER BY s.id
    `)
    .all()
    .map(serializeSubscriber);

  return sendSuccess(res, 'Suscriptores obtenidos correctamente.', subscribers);
});

router.post('/', (req, res, next) => {
  try {
    const { name, description, eventTypes, active = true } = req.body || {};
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedDescription =
      typeof description === 'string' ? description.trim() : '';

    if (!normalizedName || !normalizedDescription) {
      const error = new Error('El nombre y la descripción son obligatorios.');
      error.statusCode = 400;
      throw error;
    }

    if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
      const error = new Error('Seleccione al menos un tipo de evento.');
      error.statusCode = 400;
      throw error;
    }

    const uniqueEventTypes = [...new Set(eventTypes)];
    if (uniqueEventTypes.some((eventType) => !EVENT_TYPES.includes(eventType))) {
      const error = new Error('La selección contiene un tipo de evento no válido.');
      error.statusCode = 400;
      throw error;
    }

    const createSubscriber = db.transaction(() => {
      const result = db
        .prepare(`
          INSERT INTO subscribers (name, description, active, simulate_failure)
          VALUES (?, ?, ?, 0)
        `)
        .run(normalizedName, normalizedDescription, active ? 1 : 0);
      const subscriberId = Number(result.lastInsertRowid);
      const insertEventType = db.prepare(`
        INSERT INTO subscriber_event_types (subscriber_id, event_type)
        VALUES (?, ?)
      `);

      uniqueEventTypes.forEach((eventType) => {
        insertEventType.run(subscriberId, eventType);
      });

      return subscriberId;
    });

    const subscriberId = createSubscriber();
    const subscriber = serializeSubscriber(getSubscriber.get(subscriberId));
    return sendSuccess(
      res,
      'El suscriptor fue incorporado sin modificar la lógica del publicador.',
      subscriber,
      201,
    );
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      error.statusCode = 409;
      error.message = 'Ya existe un suscriptor con ese nombre.';
    }
    return next(error);
  }
});

router.patch('/:id/toggle', (req, res, next) => {
  try {
    const subscriber = getSubscriber.get(req.params.id);
    if (!subscriber) {
      const error = new Error('El suscriptor solicitado no existe.');
      error.statusCode = 404;
      throw error;
    }

    db.prepare('UPDATE subscribers SET active = ? WHERE id = ?').run(
      subscriber.active ? 0 : 1,
      subscriber.id,
    );
    const updated = serializeSubscriber(getSubscriber.get(subscriber.id));
    return sendSuccess(
      res,
      updated.active
        ? 'El suscriptor fue activado correctamente.'
        : 'El suscriptor fue desactivado; su historial se conserva.',
      updated,
    );
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/failure', (req, res, next) => {
  try {
    const subscriber = getSubscriber.get(req.params.id);
    if (!subscriber) {
      const error = new Error('El suscriptor solicitado no existe.');
      error.statusCode = 404;
      throw error;
    }

    db.prepare('UPDATE subscribers SET simulate_failure = ? WHERE id = ?').run(
      subscriber.simulateFailure ? 0 : 1,
      subscriber.id,
    );
    const updated = serializeSubscriber(getSubscriber.get(subscriber.id));
    return sendSuccess(
      res,
      updated.simulateFailure
        ? 'El fallo controlado quedó activo para el siguiente evento compatible.'
        : 'La simulación de fallo fue desactivada.',
      updated,
    );
  } catch (error) {
    return next(error);
  }
});

export default router;
