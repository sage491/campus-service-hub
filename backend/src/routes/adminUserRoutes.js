import { Router } from 'express';
import { createUser, listUsers, updateUser } from '../controllers/adminUserController.js';
import { allowRoles, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', requireAuth, allowRoles('admin'), listUsers);
router.post('/', requireAuth, allowRoles('admin'), createUser);
router.patch('/:id', requireAuth, allowRoles('admin'), updateUser);

export default router;
