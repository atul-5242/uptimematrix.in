
import express from 'express';
import { getOrganizationDetails, deleteOrganization } from '../../controllers/organizationsController.js';
import { getAllOrganizationMembers, removeMemberFromOrganization } from '../../controllers/teamsSectionController.js';
import { getPendingInvitations } from '../../controllers/invitationController.js';
import { authMiddleware } from '../../middlewares/middleware.js';
import { acceptInvitation } from '../../controllers/invitationController.js';
import { requirePermission } from '../../middlewares/authorization.js';

const router = express.Router();

// Route to get details of a single organization
router.get('/:id', authMiddleware, requirePermission('member:view'), getOrganizationDetails);

// Route to delete an organization
router.delete('/:id', authMiddleware, requirePermission('organization:delete'), deleteOrganization);

// Route to get all organization members
router.get('/members', authMiddleware, requirePermission('member:view'), getAllOrganizationMembers);

// Route to remove a member from the current organization (keep user account)
router.delete('/members/:userId', authMiddleware, requirePermission('member:edit'), removeMemberFromOrganization);

// Route to get all pending invitations for the current organization
router.get('/invitations/pending', authMiddleware, requirePermission('member:view'), getPendingInvitations);

// Route to accept an organization invitation
router.post('/invitations/accept', authMiddleware, acceptInvitation);

export default router;
