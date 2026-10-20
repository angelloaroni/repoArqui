import { Router } from 'express';
import {
  executeScenario,
  loadExampleEvents,
  prepareScenario,
  resetDemo,
} from '../services/demoService.js';
import { sendSuccess } from './response.js';

const router = Router();
const VALID_SCENARIOS = new Set([
  'normal',
  'no-subscribers',
  'inactive-subscriber',
  'new-subscriber',
]);

router.post('/seed', (req, res, next) => {
  try {
    const result = loadExampleEvents();
    return sendSuccess(res, result.message, result, 201);
  } catch (error) {
    return next(error);
  }
});

router.delete('/reset', (req, res, next) => {
  try {
    const result = resetDemo();
    return sendSuccess(res, result.message, result);
  } catch (error) {
    return next(error);
  }
});

router.post('/scenarios/:scenario', (req, res, next) => {
  try {
    const { scenario } = req.params;
    if (!VALID_SCENARIOS.has(scenario)) {
      const error = new Error('El escenario solicitado no existe.');
      error.statusCode = 404;
      throw error;
    }

    if (req.body?.action === 'prepare') {
      const preparation = prepareScenario(scenario);
      return sendSuccess(res, preparation.message, preparation);
    }

    const result = executeScenario(scenario);
    return sendSuccess(res, 'El escenario fue ejecutado correctamente.', result, 201);
  } catch (error) {
    return next(error);
  }
});

export default router;
