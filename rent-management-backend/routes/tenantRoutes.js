import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getTenants,
  addTenant,
  updateTenant,
  deleteTenant
} from '../controllers/tenantController.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tenants');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (['image/png', 'image/jpeg', 'image/jpg'].includes(file.mimetype)) cb(null, true);
  else cb(null, false);
};

const upload = multer({ storage, fileFilter });

// Routes
router.get('/getTenants', getTenants);
router.post('/addTenant', upload.array('files', 5), addTenant);
router.put('/updateTenant/:id', upload.array('files', 5), updateTenant);
router.delete('/deleteTenant/:id', deleteTenant);

export default router;
