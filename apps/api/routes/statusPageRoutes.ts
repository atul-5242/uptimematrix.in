import { Router } from 'express';
import { authMiddleware } from '../middlewares/middleware.js';
import { requirePermission } from '../middlewares/authorization.js';
import { getMonitorsForStatusPage, createStatusPage, getAllStatusPages, getStatusPageByDomain, provisionCustomDomain } from '../controllers/statusPageControl.js';

const router = Router();

// Get monitors for status page
router.get('/monitors', authMiddleware, requirePermission('monitor:view'), getMonitorsForStatusPage);

// Create a new status page
router.post('/', authMiddleware, requirePermission('status_page:create'), createStatusPage);

// Get all status pages for the organization
router.get('/', authMiddleware, requirePermission('reporting:view'), getAllStatusPages);

router.get('/by-domain', getStatusPageByDomain); // No auth needed - public route

// Add domain provisioning endpoint
router.post('/:id/provision-domain', authMiddleware, requirePermission('status_page:edit'), provisionCustomDomain);

export default router;
