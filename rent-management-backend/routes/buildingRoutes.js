import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getBuildings, addBuilding, deleteBuilding,updateBuilding } from '../controllers/buildingController.js';

const router = express.Router();
router.use(protect); // ALL building routes require auth

router.get('/getBuildings', getBuildings);
router.post('/addBuilding', addBuilding);
router.delete('/deleteBuilding/:id', deleteBuilding);
router.put('/updateBuilding/:id', updateBuilding);

export default router;
