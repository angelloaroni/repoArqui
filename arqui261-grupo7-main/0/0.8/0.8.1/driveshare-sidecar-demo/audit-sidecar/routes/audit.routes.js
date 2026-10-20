import { Router } from "express";

import auditController from "../controllers/audit.controller.js";

const router = Router();

router.post(
  "/events",
  auditController.receiveEvent
);

router.get(
  "/audit",
  auditController.getAuditLogs
);

export default router;