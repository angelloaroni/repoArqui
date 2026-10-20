import { Router } from 'express';
import db from '../database/database.js';
import { sendSuccess } from './response.js';

const router = Router();

router.get('/', (req, res) => {
  const publishers = db
    .prepare(`
      SELECT
        id,
        name,
        description,
        default_event_type AS defaultEventType,
        created_at AS createdAt
      FROM publishers
      ORDER BY id
    `)
    .all();

  return sendSuccess(res, 'Publicadores obtenidos correctamente.', publishers);
});

export default router;

