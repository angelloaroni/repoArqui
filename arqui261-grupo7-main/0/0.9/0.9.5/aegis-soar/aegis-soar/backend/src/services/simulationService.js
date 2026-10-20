import db from "../database/db.js";

const getPlaybook = db.prepare(
  "SELECT * FROM playbooks WHERE event_type = ? LIMIT 1"
);
const insertEvent = db.prepare(`
  INSERT INTO events (type, username, ip_address, path, payload, result)
  VALUES (@type, @username, @ip_address, @path, @payload, @result)
`);
const updateEventResult = db.prepare(
  "UPDATE events SET result = ? WHERE id = ?"
);
const insertIncident = db.prepare(`
  INSERT INTO incidents (type, severity, status, playbook_id, evidence)
  VALUES (?, ?, 'CONTAINED', ?, ?)
`);
const insertAction = db.prepare(`
  INSERT INTO actions (incident_id, action_type, description, result)
  VALUES (?, ?, ?, ?)
`);
const blockUser = db.prepare(`
  INSERT OR IGNORE INTO blocked_users (username, reason) VALUES (?, ?)
`);
const blockIp = db.prepare(`
  INSERT OR IGNORE INTO blocked_ips (ip_address, reason) VALUES (?, ?)
`);

function recordAction(incidentId, type, description, result = "Completada") {
  insertAction.run(incidentId, type, description, result);
}

export const simulateBruteForce = db.transaction(() => {
  const username = "demo.user";
  const ipAddress = "192.168.1.50";
  const eventIds = [];

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const event = insertEvent.run({
      type: "LOGIN_FAILED",
      username,
      ip_address: ipAddress,
      path: null,
      payload: null,
      result: "Registrado"
    });
    eventIds.push(event.lastInsertRowid);
  }

  const playbook = getPlaybook.get("LOGIN_FAILED");
  if (!playbook?.active) {
    eventIds.forEach((id) => updateEventResult.run("Playbook deshabilitado", id));
    recordAction(null, "PLAYBOOK_SKIPPED", "Brute Force Protection está deshabilitado", "Omitida");
    return {
      automated: false,
      message: "Eventos registrados. El Playbook se encuentra deshabilitado."
    };
  }

  const incident = insertIncident.run(
    "BRUTE_FORCE",
    "HIGH",
    playbook.id,
    "Cinco intentos fallidos consecutivos para el mismo usuario e IP."
  );
  const incidentId = incident.lastInsertRowid;

  updateEventResult.run("Incidente generado", eventIds[eventIds.length - 1]);
  blockUser.run(username, "Ataque de fuerza bruta");
  blockIp.run(ipAddress, "Ataque de fuerza bruta");
  recordAction(incidentId, "PLAYBOOK_EXECUTED", "Brute Force Protection ejecutado");
  recordAction(incidentId, "USER_BLOCKED", `Usuario ${username} bloqueado`);
  recordAction(incidentId, "IP_BLOCKED", `Dirección IP ${ipAddress} bloqueada`);

  return {
    automated: true,
    incidentId,
    message: "Ataque de fuerza bruta detectado. Usuario e IP bloqueados."
  };
});

export const simulateSqlInjection = db.transaction(({ disablePlaybook = false } = {}) => {
  const ipAddress = "10.0.0.25";

  if (disablePlaybook) {
    db.prepare(
      "UPDATE playbooks SET active = 0 WHERE event_type = 'SQL_INJECTION'"
    ).run();
  }

  const playbook = getPlaybook.get("SQL_INJECTION");
  const event = insertEvent.run({
    type: "SQL_INJECTION",
    username: null,
    ip_address: ipAddress,
    path: "/api/users",
    payload: "' OR 1=1 --",
    result: playbook?.active ? "Incidente generado" : "Playbook deshabilitado"
  });

  if (!playbook?.active) {
    recordAction(null, "PLAYBOOK_SKIPPED", "SQL Injection Response está deshabilitado", "Omitida");
    return {
      automated: false,
      eventId: event.lastInsertRowid,
      message: "Evento registrado. El Playbook se encuentra deshabilitado."
    };
  }

  const evidence = JSON.stringify({
    path: "/api/users",
    payload: "' OR 1=1 --",
    sourceIp: ipAddress
  });
  const incident = insertIncident.run(
    "SQL_INJECTION",
    "CRITICAL",
    playbook.id,
    evidence
  );
  const incidentId = incident.lastInsertRowid;

  blockIp.run(ipAddress, "Intento de SQL Injection");
  recordAction(incidentId, "PLAYBOOK_EXECUTED", "SQL Injection Response ejecutado");
  recordAction(incidentId, "IP_BLOCKED", `Dirección IP ${ipAddress} bloqueada`);
  recordAction(incidentId, "EVIDENCE_RECORDED", "Ruta, payload e IP de origen registrados");

  return {
    automated: true,
    eventId: event.lastInsertRowid,
    incidentId,
    message: "SQL Injection detectada. Incidente crítico creado."
  };
});

