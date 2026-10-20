import { Router } from "express";
import db from "../database/db.js";
import { getDashboard } from "../services/dashboardService.js";
import {
  simulateBruteForce,
  simulateSqlInjection
} from "../services/simulationService.js";

const router = Router();

const asyncSafe = (handler) => (req, res, next) => {
  try {
    handler(req, res);
  } catch (error) {
    next(error);
  }
};

router.get("/dashboard", asyncSafe((_req, res) => {
  res.json(getDashboard());
}));

router.get("/events", asyncSafe((_req, res) => {
  res.json(db.prepare("SELECT * FROM events ORDER BY id DESC").all());
}));

router.post("/events/brute-force", asyncSafe((_req, res) => {
  res.status(201).json(simulateBruteForce());
}));

router.post("/events/sql-injection", asyncSafe((_req, res) => {
  res.status(201).json(simulateSqlInjection());
}));

router.post("/events/sql-injection-disabled", asyncSafe((_req, res) => {
  res.status(201).json(simulateSqlInjection({ disablePlaybook: true }));
}));

router.get("/incidents", asyncSafe((_req, res) => {
  const incidents = db.prepare(`
    SELECT i.*, p.name AS playbook_name
    FROM incidents i
    LEFT JOIN playbooks p ON p.id = i.playbook_id
    ORDER BY i.id DESC
  `).all();
  res.json(incidents);
}));

router.get("/playbooks", asyncSafe((_req, res) => {
  const playbooks = db.prepare("SELECT * FROM playbooks ORDER BY id").all();
  res.json(playbooks.map((item) => ({
    ...item,
    active: Boolean(item.active),
    actions: JSON.parse(item.actions)
  })));
}));

router.patch("/playbooks/:id/toggle", asyncSafe((req, res) => {
  const playbook = db.prepare("SELECT * FROM playbooks WHERE id = ?").get(req.params.id);
  if (!playbook) {
    return res.status(404).json({ message: "Playbook no encontrado." });
  }
  const active = playbook.active ? 0 : 1;
  db.prepare("UPDATE playbooks SET active = ? WHERE id = ?").run(active, playbook.id);
  return res.json({
    id: playbook.id,
    active: Boolean(active),
    message: `Playbook ${active ? "activado" : "desactivado"}.`
  });
}));

router.get("/blocked-users", asyncSafe((_req, res) => {
  res.json(db.prepare("SELECT * FROM blocked_users ORDER BY id DESC").all());
}));

router.get("/blocked-ips", asyncSafe((_req, res) => {
  res.json(db.prepare("SELECT * FROM blocked_ips ORDER BY id DESC").all());
}));

router.get("/actions", asyncSafe((_req, res) => {
  res.json(db.prepare("SELECT * FROM actions ORDER BY id DESC").all());
}));

router.delete("/demo/reset", asyncSafe((_req, res) => {
  const reset = db.transaction(() => {
    db.prepare("DELETE FROM actions").run();
    db.prepare("DELETE FROM blocked_users").run();
    db.prepare("DELETE FROM blocked_ips").run();
    db.prepare("DELETE FROM incidents").run();
    db.prepare("DELETE FROM events").run();
    db.prepare("UPDATE playbooks SET active = 1").run();
    db.prepare(`
      DELETE FROM sqlite_sequence
      WHERE name IN ('events', 'incidents', 'actions', 'blocked_users', 'blocked_ips')
    `).run();
  });
  reset();
  res.json({ message: "Datos de demostración eliminados y Playbooks reactivados." });
}));

export default router;

