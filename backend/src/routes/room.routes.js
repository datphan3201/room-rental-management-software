import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { createRoom, deleteRoom, listRooms, updateRoom } from '../controllers/room.controller.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', listRooms);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;
