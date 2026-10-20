import db, { seedDefaultSubscribers } from '../database/database.js';
import { EXAMPLE_EVENTS } from '../database/seedData.js';
import { publishEvent } from './eventBus.js';

const getPublisherByName = db.prepare('SELECT id FROM publishers WHERE name = ?');
const getSubscriberByName = db.prepare('SELECT * FROM subscribers WHERE name = ?');
const setSubscriberState = db.prepare(`
  UPDATE subscribers
  SET active = @active, simulate_failure = 0
  WHERE name = @name
`);
const insertSubscriber = db.prepare(`
  INSERT INTO subscribers (name, description, active, simulate_failure)
  VALUES (@name, @description, 1, 0)
`);
const insertSubscription = db.prepare(`
  INSERT OR IGNORE INTO subscriber_event_types (subscriber_id, event_type)
  VALUES (?, ?)
`);

function publishByNames(eventData) {
  const publisher = getPublisherByName.get(eventData.publisherName);
  if (!publisher) {
    throw new Error(`No existe el publicador ${eventData.publisherName}.`);
  }

  return publishEvent({
    publisherId: publisher.id,
    eventType: eventData.eventType,
    eventName: eventData.eventName,
    description: eventData.description,
    payload: eventData.payload,
    createdAt: eventData.createdAt,
  });
}

export function loadExampleEvents({ onlyIfEmpty = false } = {}) {
  const eventCount = db.prepare('SELECT COUNT(*) AS total FROM events').get().total;
  if (onlyIfEmpty && eventCount > 0) {
    return { created: 0, message: 'Los datos de ejemplo ya se encuentran disponibles.' };
  }

  const results = EXAMPLE_EVENTS.map((event) => publishByNames(event));
  return {
    created: results.length,
    message: 'Los datos de ejemplo fueron cargados correctamente.',
  };
}

export function resetDemo() {
  const reset = db.transaction(() => {
    db.prepare('DELETE FROM event_deliveries').run();
    db.prepare('DELETE FROM events').run();
    db.prepare('DELETE FROM subscriber_event_types').run();
    db.prepare('DELETE FROM subscribers').run();
    db.prepare(`
      DELETE FROM sqlite_sequence
      WHERE name IN ('subscribers', 'subscriber_event_types', 'events', 'event_deliveries')
    `).run();
    seedDefaultSubscribers();
  });

  reset();
  const examples = loadExampleEvents();
  return {
    ...examples,
    message: 'La demostración fue restablecida a su estado inicial.',
  };
}

function ensureSubscriberState(name, active = 1) {
  setSubscriberState.run({ name, active });
}

export function prepareScenario(scenario) {
  if (scenario === 'normal') {
    ['Notification Service', 'Audit Service', 'Analytics Service'].forEach((name) => {
      ensureSubscriberState(name, 1);
    });
    return {
      scenario,
      prepared: true,
      message: 'Los tres suscriptores requeridos quedaron activos y sin fallos simulados.',
    };
  }

  if (scenario === 'no-subscribers') {
    db.prepare(
      "DELETE FROM subscriber_event_types WHERE event_type = 'SYSTEM_UPDATE'",
    ).run();
    return {
      scenario,
      prepared: true,
      message: 'Se retiraron las suscripciones a SYSTEM_UPDATE para demostrar el envío sin receptores.',
    };
  }

  if (scenario === 'inactive-subscriber') {
    ensureSubscriberState('Notification Service', 0);
    ensureSubscriberState('Audit Service', 1);
    return {
      scenario,
      prepared: true,
      message: 'Notification Service quedó inactivo y Audit Service permanece disponible.',
    };
  }

  if (scenario === 'new-subscriber') {
    let welcomeService = getSubscriberByName.get('Welcome Service');
    if (!welcomeService) {
      const result = insertSubscriber.run({
        name: 'Welcome Service',
        description: 'Da la bienvenida a cada usuario recién registrado.',
      });
      welcomeService = { id: Number(result.lastInsertRowid) };
    } else {
      ensureSubscriberState('Welcome Service', 1);
    }
    insertSubscription.run(welcomeService.id, 'USER_REGISTERED');
    ensureSubscriberState('Audit Service', 1);
    return {
      scenario,
      prepared: true,
      message: 'Welcome Service fue incorporado y suscrito a USER_REGISTERED.',
    };
  }

  const error = new Error('El escenario solicitado no existe.');
  error.statusCode = 404;
  throw error;
}

export function executeScenario(scenario) {
  if (scenario === 'normal') {
    return publishByNames({
      publisherName: 'Payment Service',
      eventType: 'PAYMENT_COMPLETED',
      eventName: 'Pago de demostración confirmado',
      description: 'Evento controlado para demostrar la distribución normal.',
      payload: { paymentId: 'DEMO-PAY-001', amount: 250, currency: 'PEN' },
    });
  }

  if (scenario === 'no-subscribers') {
    return publishByNames({
      publisherName: 'System Service',
      eventType: 'SYSTEM_UPDATE',
      eventName: 'Actualización académica disponible',
      description: 'Evento guardado correctamente aunque no tiene suscriptores.',
      payload: { version: '1.1.0', maintenanceWindow: '22:00' },
    });
  }

  if (scenario === 'inactive-subscriber') {
    return publishByNames({
      publisherName: 'User Service',
      eventType: 'USER_REGISTERED',
      eventName: 'Registro con suscriptor inactivo',
      description: 'Notification Service no procesa; Audit Service continúa.',
      payload: { userId: 'DEMO-USR-002', profile: 'ESTUDIANTE' },
    });
  }

  if (scenario === 'new-subscriber') {
    return publishByNames({
      publisherName: 'User Service',
      eventType: 'USER_REGISTERED',
      eventName: 'Registro con suscriptor dinámico',
      description: 'Welcome Service recibe el evento sin cambios en User Service.',
      payload: { userId: 'DEMO-USR-003', welcomeFlow: true },
    });
  }

  const error = new Error('El escenario solicitado no existe.');
  error.statusCode = 404;
  throw error;
}

