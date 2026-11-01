import { Router } from 'express';
import { getCurrentUser, login, logout, register, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getCurrentUser);
router.patch('/me', requireAuth, updateProfile);
router.post('/logout', requireAuth, logout);

export default router;
