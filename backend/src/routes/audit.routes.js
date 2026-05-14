import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { listAuditLogs } from '../controllers/audit.controller.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', listAuditLogs);

export default router;
