import express from 'express';
import controller from '../controllers/ReservationController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';

const router = express.Router();

// RF18 / RF23 — disponibilidad pública para búsqueda de catálogo
router.get('/unavailable', controller.listUnavailable);
router.get('/availability/:vehicleId', controller.checkAvailability);

// El resto requiere autenticación (restricción 2.3 M3)
router.use(authMiddleware);

router.get('/user', controller.findByUser);
router.get('/owner', controller.findByOwner);

router.post('/', controller.create);

router.get('/:id', controller.findOne);
router.put('/:id', controller.update);
router.put('/:id/cancel', controller.cancel);
router.put('/:id/confirm', controller.confirm);
router.put('/:id/accept', controller.accept);
router.put('/:id/reject', controller.reject);
router.put('/:id/close', controller.close);

export default router;
