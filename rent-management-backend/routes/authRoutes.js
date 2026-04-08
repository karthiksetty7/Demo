import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { protect } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/dashboard', protect, (req, res) => {
  res.json({ success: true, message: `Welcome user ${req.user.id}` });
});

export default router;