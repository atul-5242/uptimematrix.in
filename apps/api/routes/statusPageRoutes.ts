import { Router } from 'express';
import { authMiddleware } from '../middlewares/middleware.js';
import { getMonitorsForStatusPage, createStatusPage, getAllStatusPages, getStatusPageByDomain, provisionCustomDomain } from '../controllers/statusPageControl.js';

const router = Router();

// Get monitors for status page
router.get('/monitors', authMiddleware, getMonitorsForStatusPage);

// Create a new status page
router.post('/', authMiddleware, createStatusPage);

// Get all status pages for the organization
router.get('/', authMiddleware, getAllStatusPages);

router.get('/by-domain', getStatusPageByDomain); // No auth needed - public route

// Add domain provisioning endpoint
router.post('/:id/provision-domain', authMiddleware, provisionCustomDomain);

export default router;
