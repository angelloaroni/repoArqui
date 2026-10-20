import { Router } from 'express';
import { getEventList } from './events.js';
import { sendSuccess } from './response.js';

const router = Router();

router.get('/', (req, res) => {
  const events = getEventList(req.query);
  return sendSuccess(res, 'Historial obtenido correctamente.', events);
});

export default router;

