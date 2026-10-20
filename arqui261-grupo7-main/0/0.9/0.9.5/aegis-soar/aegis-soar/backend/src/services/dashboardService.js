import db from "../database/db.js";

const count = (table) => db.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get().total;

export function getDashboard() {
  const playbooksExecuted = db
    .prepare("SELECT COUNT(*) AS total FROM actions WHERE action_type = 'PLAYBOOK_EXECUTED'")
    .get().total;
  const criticalIncidents = db
    .prepare("SELECT COUNT(*) AS total FROM incidents WHERE severity = 'CRITICAL'")
    .get().total;
  const severityRows = db
    .prepare("SELECT severity, COUNT(*) AS total FROM incidents GROUP BY severity")
    .all();
  const distribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  severityRows.forEach((row) => {
    distribution[row.severity] = row.total;
  });

  return {
    stats: {
      events: count("events"),
      incidents: count("incidents"),
      playbooksExecuted,
      blockedUsers: count("blocked_users"),
      blockedIps: count("blocked_ips"),
      criticalIncidents
    },
    recentEvents: db.prepare("SELECT * FROM events ORDER BY id DESC LIMIT 5").all(),
    recentIncidents: db.prepare(`
      SELECT i.*, p.name AS playbook_name
      FROM incidents i
      LEFT JOIN playbooks p ON p.id = i.playbook_id
      ORDER BY i.id DESC LIMIT 5
    `).all(),
    severityDistribution: distribution
  };
}

