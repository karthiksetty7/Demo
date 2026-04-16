import express from 'express';
import {
  getBills,
  addBill,
  updateBill,
  deleteBill,
  getLastBill
} from '../controllers/billController.js';

const router = express.Router();

router.get('/getBills', getBills);
router.post('/addBill', addBill);
router.put('/updateBill/:id', updateBill);
router.delete('/deleteBill/:id', deleteBill);
router.get('/last', getLastBill);

export default router;