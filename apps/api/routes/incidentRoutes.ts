import { Router } from 'express';
import { getIncidents, getIncidentStats, acknowledgeIncident, resolveIncident, getIncident } from '../controllers/incidentController.js';
import { authMiddleware } from '../middlewares/middleware.js';
import { requirePermission } from '../middlewares/authorization.js';

const router = Router();

// Get all incidents for an organization (reports/analytics viewing)
router.get('/:organizationId', authMiddleware, requirePermission('reporting:view'), getIncidents);

// Get incident statistics for an organization
router.get('/stats/:organizationId', authMiddleware, requirePermission('reporting:view'), getIncidentStats);

// Get a specific incident by ID
router.get('/incident/:incidentId', authMiddleware, requirePermission('reporting:view'), getIncident);

// Acknowledge an incident (stops escalations)
router.patch('/incident/:incidentId/acknowledge', authMiddleware, requirePermission('incident:acknowledge'), acknowledgeIncident);

// Resolve an incident
router.patch('/incident/:incidentId/resolve', authMiddleware, requirePermission('incident:resolve'), resolveIncident);

export default router;
