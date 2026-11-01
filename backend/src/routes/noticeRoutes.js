import { Router } from 'express';
import { createNotice, listNotices, publish, removeNotice } from '../controllers/noticeController.js';
import { allowRoles, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', listNotices);
router.post('/', allowRoles('admin'), createNotice);
router.patch('/:id/publish', allowRoles('admin'), publish);
router.delete('/:id', allowRoles('admin'), removeNotice);

export default router;
