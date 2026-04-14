import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';

import {
  getTenants,
  addTenant,
  updateTenant,
  deleteTenant
} from '../controllers/tenantController.js';

const router = express.Router();

// Protect routes
router.use(protect);

// ✅ MEMORY STORAGE (IMPORTANT)
const storage = multer.memoryStorage();

const upload = multer({ storage });

router.get('/getTenants', getTenants);
router.post('/addTenant', upload.array('documents', 5), addTenant);
router.put('/updateTenant/:id', upload.array('documents', 5), updateTenant);
router.delete('/deleteTenant/:id', deleteTenant);

export default router;
