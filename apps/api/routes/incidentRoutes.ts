import { Router } from 'express';
import { getIncidents, getIncidentStats } from '../controllers/incidentController.js';
import { authMiddleware } from '../middlewares/middleware.js';
import { requirePermission } from '../middlewares/authorization.js';

const router = Router();

// Get all incidents for an organization (reports/analytics viewing)
router.get('/:organizationId', authMiddleware, requirePermission('reporting:view'), getIncidents);

// Get incident statistics for an organization
router.get('/stats/:organizationId', authMiddleware, requirePermission('reporting:view'), getIncidentStats);

export default router;
