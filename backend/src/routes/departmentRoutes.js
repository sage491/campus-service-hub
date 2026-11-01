import { Router } from 'express';
import { createDepartment, listDepartments, updateDepartment } from '../controllers/departmentController.js';
import { allowRoles, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', listDepartments);
router.post('/', allowRoles('admin'), createDepartment);
router.patch('/:id', allowRoles('admin'), updateDepartment);

export default router;
