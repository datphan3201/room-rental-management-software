import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  createInvoiceHandler,
  listInvoices,
  listMyInvoices,
  updateInvoice,
} from '../controllers/invoice.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('TENANT'), listMyInvoices);
router.get('/', authorize('ADMIN'), listInvoices);
router.post('/', authorize('ADMIN'), createInvoiceHandler);
router.put('/:id', authorize('ADMIN'), updateInvoice);

export default router;
