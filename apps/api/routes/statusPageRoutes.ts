import { Router } from 'express';
import { authMiddleware } from '../middlewares/middleware.js';
import { getMonitorsForStatusPage, createStatusPage, getAllStatusPages } from '../controllers/statusPageControl.js';

const router = Router();

// Get monitors for status page
router.get('/monitors', authMiddleware, getMonitorsForStatusPage);

// Create a new status page
router.post('/', authMiddleware, createStatusPage);

// Get all status pages for the organization
router.get('/', authMiddleware, getAllStatusPages);

export default router;
