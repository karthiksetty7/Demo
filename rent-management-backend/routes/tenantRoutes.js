import express from 'express';
import multer from 'multer';
import {
  getTenants,
  addTenant,
  updateTenant,
  deleteTenant,
} from '../controllers/tenantController.js';

const router = express.Router();

// multer config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.get('/getTenants', getTenants);
router.post('/addTenant', upload.array('files'), addTenant);
router.put('/updateTenant/:id', upload.array('files'), updateTenant);
router.delete('/deleteTenant/:id', deleteTenant);

export default router;
