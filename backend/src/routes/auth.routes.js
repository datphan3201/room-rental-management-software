import { Router } from 'express';
import {
  changeMyPassword,
  forgotPassword,
  login,
  me,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, me);
router.post('/change-password', authenticate, changeMyPassword);

export default router;
