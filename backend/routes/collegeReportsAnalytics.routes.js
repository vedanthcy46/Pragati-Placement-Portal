import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import * as analyticsController from '../controllers/collegeReportsAnalytics.controller.js';

const router = express.Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/companies', analyticsController.getCompaniesAnalytics);
router.get('/departments', analyticsController.getDepartmentsAnalytics);
router.get('/students', analyticsController.getStudentsAnalytics);
router.get('/export/pdf', analyticsController.exportAnalyticsPdf);

export default router;
