import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { createTenant, deleteTenant, listTenants, updateTenant } from '../controllers/tenant.controller.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', listTenants);
router.post('/', createTenant);
router.put('/:id', updateTenant);
router.delete('/:id', deleteTenant);

export default router;
