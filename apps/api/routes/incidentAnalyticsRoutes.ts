import express from 'express';
import { 
  getIncidentAnalytics, 
  updateIncidentStatus,
  createIncidentUpdate,
  getIncidentUpdates
} from '../controllers/incidentAnalyticsController.js';
import { authMiddleware } from '../middlewares/middleware.js';
import { requirePermission } from '../middlewares/authorization.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/incidents/analytics/:incidentId - Get detailed analytics for a specific incident
// Read analytics requires reporting:view (aligns with seeded permissions)
router.get('/:incidentId', requirePermission('reporting:view'), getIncidentAnalytics);

// PUT /api/incidents/analytics/:incidentId/status - Update incident status  
// Update status requires incident:resolve
router.put('/:incidentId/status', requirePermission('incident:resolve'), updateIncidentStatus);

// POST /api/incidents/analytics/:incidentId/updates - Create incident update
// Create update requires incident:edit
router.post('/:incidentId/updates', requirePermission('incident:edit'), createIncidentUpdate);

// GET /api/incidents/analytics/:incidentId/updates - Get incident updates
// Read updates requires reporting:view
router.get('/:incidentId/updates', requirePermission('reporting:view'), getIncidentUpdates);

export default router;