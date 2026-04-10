import express from "express";
import {
  getRentEntries,
  createRentEntry,
  updateRentEntry,
  deleteRentEntry,
} from "../controllers/rentController.js";

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get("/getRentEntries", getRentEntries);
router.post("/createRentEntry", createRentEntry);
router.put("/updateRentEntry/:id", updateRentEntry);
router.delete("/deleteRentEntry/:id", deleteRentEntry);

export default router;
