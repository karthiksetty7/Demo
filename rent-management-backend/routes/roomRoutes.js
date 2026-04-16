import express from 'express';
import {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected
router.use(protect);

router.get('/getRooms', getRooms);
router.post('/addRoom', addRoom);
router.put('/updateRoom/:id', updateRoom);
router.delete('/deleteRoom/:id', deleteRoom);

export default router;