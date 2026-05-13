import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  confirmPaymentHandler,
  listMyPayments,
  listPayments,
} from '../controllers/payment.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('TENANT'), listMyPayments);
router.get('/', authorize('ADMIN'), listPayments);
router.post('/confirm', authorize('ADMIN'), confirmPaymentHandler);

export default router;
