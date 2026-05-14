import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { revenueReport } from '../controllers/report.controller.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/revenue', revenueReport);

export default router;
