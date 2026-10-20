import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { initializeSchema } from './schema.js';
import { DEFAULT_SUBSCRIBERS, PUBLISHERS } from './seedData.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(currentDirectory, '../..');
const configuredPath = process.env.DATABASE_PATH || './data/eventflow.db';
const databasePath = path.isAbsolute(configuredPath)
  ? configuredPath
  : path.resolve(backendDirectory, configuredPath);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

function upsertPublishers() {
  const insert = db.prepare(`
    INSERT INTO publishers (name, description, default_event_type)
    VALUES (@name, @description, @defaultEventType)
    ON CONFLICT(name) DO UPDATE SET
      description = excluded.description,
      default_event_type = excluded.default_event_type
  `);

  PUBLISHERS.forEach((publisher) => insert.run(publisher));
}

export function seedDefaultSubscribers() {
  const insertSubscriber = db.prepare(`
    INSERT INTO subscribers (name, description, active, simulate_failure)
    VALUES (@name, @description, 1, 0)
    ON CONFLICT(name) DO UPDATE SET description = excluded.description
  `);
  const getSubscriber = db.prepare('SELECT id FROM subscribers WHERE name = ?');
  const insertEventType = db.prepare(`
    INSERT OR IGNORE INTO subscriber_event_types (subscriber_id, event_type)
    VALUES (?, ?)
  `);

  DEFAULT_SUBSCRIBERS.forEach((subscriber) => {
    insertSubscriber.run({
      name: subscriber.name,
      description: subscriber.description,
    });
    const { id } = getSubscriber.get(subscriber.name);
    subscriber.eventTypes.forEach((eventType) => {
      insertEventType.run(id, eventType);
    });
  });
}

export function initializeDatabase() {
  initializeSchema(db);
  const transaction = db.transaction(() => {
    upsertPublishers();
    seedDefaultSubscribers();
  });
  transaction();
}

initializeDatabase();

export default db;
