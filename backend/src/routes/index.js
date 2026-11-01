import { Router } from 'express';
import adminUserRoutes from './adminUserRoutes.js';
import authRoutes from './authRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import healthRoutes from './healthRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import noticeRoutes from './noticeRoutes.js';
import requestRoutes from './requestRoutes.js';

const router = Router();
router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', adminUserRoutes);
router.use('/departments', departmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/requests', requestRoutes);
router.use('/notices', noticeRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/notifications', notificationRoutes);

export default router;
