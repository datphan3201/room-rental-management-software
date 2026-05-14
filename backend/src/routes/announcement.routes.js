import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import {
  createAnnouncementHandler,
  deleteAnnouncement,
  listAnnouncements,
  listPinnedAnnouncements,
  updateAnnouncement,
} from '../controllers/announcement.controller.js';

const router = Router();

router.use(authenticate);

router.get('/pinned', listPinnedAnnouncements);
router.get('/', authorize('ADMIN'), listAnnouncements);
router.post('/', authorize('ADMIN'), createAnnouncementHandler);
router.put('/:id', authorize('ADMIN'), updateAnnouncement);
router.delete('/:id', authorize('ADMIN'), deleteAnnouncement);

export default router;
