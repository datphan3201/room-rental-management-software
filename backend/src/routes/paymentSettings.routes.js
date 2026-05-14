import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  readPaymentSettings,
  updatePaymentSettingsHandler,
} from '../controllers/paymentSettings.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', readPaymentSettings);
router.put('/', authorize('ADMIN'), updatePaymentSettingsHandler);

export default router;
