export function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS publishers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      default_event_type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
      simulate_failure INTEGER NOT NULL DEFAULT 0 CHECK (simulate_failure IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subscriber_event_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscriber_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE,
      UNIQUE (subscriber_id, event_type)
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      payload TEXT,
      publisher_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PROCESSED'
        CHECK (status IN ('PROCESSED', 'PARTIALLY_PROCESSED', 'NO_SUBSCRIBERS', 'FAILED')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (publisher_id) REFERENCES publishers(id)
    );

    CREATE TABLE IF NOT EXISTS event_deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      subscriber_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('PROCESSED', 'INACTIVE', 'FAILED')),
      message TEXT NOT NULL,
      processed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (subscriber_id) REFERENCES subscribers(id)
    );

    CREATE INDEX IF NOT EXISTS idx_subscriber_event_type
      ON subscriber_event_types(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_publisher ON events(publisher_id);
    CREATE INDEX IF NOT EXISTS idx_deliveries_event ON event_deliveries(event_id);
    CREATE INDEX IF NOT EXISTS idx_deliveries_subscriber ON event_deliveries(subscriber_id);
  `);
}

