import { Router } from 'express';
import { addResolutionNote, assignRequest, createRequest, getHistory, getRequest, listRequests, updateStatus } from '../controllers/requestController.js';
import { allowRoles, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', listRequests);
router.post('/', allowRoles('student'), createRequest);
router.get('/:id', getRequest);
router.get('/:id/history', getHistory);
router.patch('/:id/assign', allowRoles('admin'), assignRequest);
router.patch('/:id/status', allowRoles('faculty', 'admin'), updateStatus);
router.post('/:id/resolution-notes', allowRoles('faculty', 'admin'), addResolutionNote);

export default router;
