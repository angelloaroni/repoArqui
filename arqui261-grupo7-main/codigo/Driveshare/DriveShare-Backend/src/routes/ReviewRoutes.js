import express from 'express';
import controller from '../controllers/ReviewController.js';
import authMiddleware from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.get('/', controller.findAll);
router.get('/vehicle/:vehicleId', controller.findByVehicle);

router.use(authMiddleware);

router.get('/user', controller.findByUser);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
