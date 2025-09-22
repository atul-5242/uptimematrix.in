import { Router } from 'express';
import { authMiddleware } from '../middlewares/middleware.js';
import { getIncidentAnalytics, updateIncidentStatus, createIncidentUpdate, getIncidentUpdates } from '../controllers/incidentAnalyticsController.js';

const router = Router();

// Get incident analytics
router.get('/:incidentId', authMiddleware, getIncidentAnalytics);

// Update incident status
router.patch('/:incidentId/status', authMiddleware, updateIncidentStatus);

// Get incident updates
router.get('/:incidentId/updates', authMiddleware, getIncidentUpdates);

// Create incident update
router.post('/:incidentId/updates', authMiddleware, createIncidentUpdate);

export default router;
