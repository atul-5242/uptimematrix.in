import { Router } from 'express';
import { getIncidents, getIncidentStats } from '../controllers/incidentController.js';
import { authMiddleware } from '../middlewares/middleware.js';

const router = Router();

// Get all incidents for an organization
router.get('/:organizationId', authMiddleware, getIncidents);

// Get incident statistics for an organization
router.get('/stats/:organizationId', authMiddleware, getIncidentStats);

export default router;
