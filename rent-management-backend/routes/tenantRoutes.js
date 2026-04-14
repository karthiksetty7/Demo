import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';

import {
  getTenants,
  addTenant,
  updateTenant,
  deleteTenant
} from '../controllers/tenantController.js';

// ✅ NEW IMPORTS
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// ✅ CLOUDINARY STORAGE
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tenants",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
  },
});

const upload = multer({ storage });

router.get('/getTenants', getTenants);
router.post('/addTenant', upload.array('documents', 5), addTenant);
router.put('/updateTenant/:id', upload.array('documents', 5), updateTenant);
router.delete('/deleteTenant/:id', deleteTenant);

export default router;
