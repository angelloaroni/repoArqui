import db from "./db.js";

const schema = `
  CREATE TABLE IF NOT EXISTS playbooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    actions TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    username TEXT,
    ip_address TEXT,
    path TEXT,
    payload TEXT,
    result TEXT NOT NULL DEFAULT 'Registrado',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONTAINED',
    playbook_id INTEGER,
    evidence TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playbook_id) REFERENCES playbooks(id)
  );

  CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    result TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id)
  );

  CREATE TABLE IF NOT EXISTS blocked_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blocked_ips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

export function initializeDatabase() {
  db.exec(schema);

  const seedPlaybooks = db.prepare(`
    INSERT OR IGNORE INTO playbooks (name, event_type, severity, actions, active)
    VALUES (?, ?, ?, ?, 1)
  `);

  const insertDefaults = db.transaction(() => {
    seedPlaybooks.run(
      "Brute Force Protection",
      "LOGIN_FAILED",
      "HIGH",
      JSON.stringify(["Bloquear usuario", "Bloquear IP", "Crear incidente"])
    );
    seedPlaybooks.run(
      "SQL Injection Response",
      "SQL_INJECTION",
      "CRITICAL",
      JSON.stringify(["Bloquear IP", "Crear incidente", "Registrar evidencia"])
    );
  });

  insertDefaults();
}
