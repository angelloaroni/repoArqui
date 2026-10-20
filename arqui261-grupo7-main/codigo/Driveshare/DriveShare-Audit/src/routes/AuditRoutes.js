import { Router } from 'express';

import controller from '../controllers/AuditController.js';

const router = Router();

router.post('/audit', controller.registrar);

export default router;