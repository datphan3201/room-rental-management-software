import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  createContractHandler,
  deleteContract,
  listContracts,
  listMyContracts,
  updateContract,
} from '../controllers/contract.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', authorize('TENANT'), listMyContracts);
router.get('/', authorize('ADMIN'), listContracts);
router.post('/', authorize('ADMIN'), createContractHandler);
router.put('/:id', authorize('ADMIN'), updateContract);
router.delete('/:id', authorize('ADMIN'), deleteContract);

export default router;
