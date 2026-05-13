import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { adminStats, tenantStats } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(authenticate);

router.get('/admin', authorize('ADMIN'), adminStats);
router.get('/tenant', authorize('TENANT'), tenantStats);

export default router;
