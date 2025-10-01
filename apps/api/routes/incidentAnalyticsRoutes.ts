import express from 'express';
import { 
  getIncidentAnalytics, 
  updateIncidentStatus,
  createIncidentUpdate,
  getIncidentUpdates
} from '../controllers/incidentAnalyticsController.js';
import { authMiddleware } from '../middlewares/middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/incidents/analytics/:incidentId - Get detailed analytics for a specific incident
router.get('/:incidentId', getIncidentAnalytics);

// PUT /api/incidents/analytics/:incidentId/status - Update incident status  
router.put('/:incidentId/status', updateIncidentStatus);

// POST /api/incidents/analytics/:incidentId/updates - Create incident update
router.post('/:incidentId/updates', createIncidentUpdate);

// GET /api/incidents/analytics/:incidentId/updates - Get incident updates
router.get('/:incidentId/updates', getIncidentUpdates);

export default router;