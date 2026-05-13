import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  createMaintenance,
  listMaintenanceRequests,
  listMyMaintenanceRequests,
  updateMaintenance,
} from '../controllers/maintenance.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('TENANT'), listMyMaintenanceRequests);
router.get('/', authorize('ADMIN'), listMaintenanceRequests);
router.post('/', authorize('TENANT', 'ADMIN'), createMaintenance);
router.put('/:id', authorize('ADMIN'), updateMaintenance);

export default router;
