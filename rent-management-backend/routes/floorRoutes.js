import express from 'express';
import {
  getFloors,
  addFloor,
  updateFloor,
  deleteFloor,
  getFloorsByBuilding,
} from '../controllers/floorController.js';

const router = express.Router();

router.get('/getFloors', getFloors);
router.get('/getFloorsByBuilding/:buildingId', getFloorsByBuilding);
router.post('/addFloor', addFloor);
router.put('/updateFloor/:id', updateFloor);
router.delete('/deleteFloor/:id', deleteFloor);

export default router;
