import express from 'express';
import multer from 'multer';
import { addTenant, updateTenant, getTenants, deleteTenant } from '../controllers/tenantController.js';

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/tenants');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed!'), false);
    cb(null, true);
  }
});

router.post('/addTenant', upload.array('files', 10), addTenant);
router.put('/updateTenant/:id', upload.array('files', 10), updateTenant);
router.get('/getTenants', getTenants);
router.delete('/deleteTenant/:id', deleteTenant);

export default router;
