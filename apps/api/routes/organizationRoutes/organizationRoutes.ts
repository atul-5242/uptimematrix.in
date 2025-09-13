
import express from 'express';
import { getOrganizationDetails, deleteOrganization } from '../../controllers/organizationsController.js';
import { getAllOrganizationMembers } from '../../controllers/teamsSectionController.js';
import { authMiddleware } from '../../middlewares/middleware.js';

const router = express.Router();

// Route to get details of a single organization
router.get('/:id', authMiddleware, getOrganizationDetails);

// Route to delete an organization
router.delete('/:id', authMiddleware, deleteOrganization);

// Route to get all organization members
router.get('/members', authMiddleware, getAllOrganizationMembers);

export default router;
