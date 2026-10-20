import { Router } from 'express';
import db from '../database/database.js';
import { sendSuccess } from './response.js';

const router = Router();

router.get('/', (req, res) => {
  const totals = {
    totalEvents: db.prepare('SELECT COUNT(*) AS value FROM events').get().value,
    totalDeliveries: db
      .prepare('SELECT COUNT(*) AS value FROM event_deliveries')
      .get().value,
    totalPublishers: db.prepare('SELECT COUNT(*) AS value FROM publishers').get().value,
    totalSubscribers: db
      .prepare('SELECT COUNT(*) AS value FROM subscribers')
      .get().value,
    activeSubscribers: db
      .prepare('SELECT COUNT(*) AS value FROM subscribers WHERE active = 1')
      .get().value,
    inactiveSubscribers: db
      .prepare('SELECT COUNT(*) AS value FROM subscribers WHERE active = 0')
      .get().value,
    processedDeliveries: db
      .prepare(
        "SELECT COUNT(*) AS value FROM event_deliveries WHERE status = 'PROCESSED'",
      )
      .get().value,
    noSubscriberEvents: db
      .prepare("SELECT COUNT(*) AS value FROM events WHERE status = 'NO_SUBSCRIBERS'")
      .get().value,
  };

  const recentEvents = db
    .prepare(`
      SELECT
        e.id,
        e.event_name AS eventName,
        e.event_type AS eventType,
        e.status,
        e.created_at AS createdAt,
        p.name AS publisherName
      FROM events e
      INNER JOIN publishers p ON p.id = e.publisher_id
      ORDER BY e.id DESC
      LIMIT 5
    `)
    .all();

  const eventsByType = db
    .prepare(`
      SELECT event_type AS label, COUNT(*) AS value
      FROM events
      GROUP BY event_type
      ORDER BY value DESC, label
    `)
    .all();

  const eventsByPublisher = db
    .prepare(`
      SELECT p.name AS label, COUNT(e.id) AS value
      FROM publishers p
      LEFT JOIN events e ON e.publisher_id = p.id
      GROUP BY p.id
      ORDER BY value DESC, label
    `)
    .all();

  const topSubscribers = db
    .prepare(`
      SELECT
        s.name AS label,
        COUNT(CASE WHEN ed.status = 'PROCESSED' THEN 1 END) AS value
      FROM subscribers s
      LEFT JOIN event_deliveries ed ON ed.subscriber_id = s.id
      GROUP BY s.id
      ORDER BY value DESC, label
      LIMIT 5
    `)
    .all();

  const statusSummary = db
    .prepare(`
      SELECT status AS label, COUNT(*) AS value
      FROM events
      GROUP BY status
      ORDER BY value DESC
    `)
    .all();

  return sendSuccess(res, 'Dashboard obtenido correctamente.', {
    totals,
    recentEvents,
    eventsByType,
    eventsByPublisher,
    topSubscribers,
    statusSummary,
  });
});

export default router;

