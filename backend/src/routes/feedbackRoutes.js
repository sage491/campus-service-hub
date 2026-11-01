import { Router } from 'express';
import { listFeedback, submitFeedback } from '../controllers/feedbackController.js';
import { allowRoles, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.post('/', allowRoles('student'), submitFeedback);
router.get('/', allowRoles('admin'), listFeedback);

export default router;
