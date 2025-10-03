import express from 'express';
import {
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  updateTeamMember,
  getTeamMembers,
  getAvailableUsers,
  getAllOrganizationMembers
} from '../../../controllers/teamsSectionController.js';
import { authMiddleware } from '../../../middlewares/middleware.js';
import { requirePermission } from '../../../middlewares/authorization.js';

const router = express.Router();

// Team management routes
router.post('/', authMiddleware, requirePermission('team:create'), createTeam);
router.get('/', authMiddleware, requirePermission('team:view'), getTeams);
router.put('/:teamId', authMiddleware, requirePermission('team:edit'), updateTeam);
router.delete('/:teamId', authMiddleware, requirePermission('team:delete'), deleteTeam);

// Team member management routes
router.post('/:teamId/members', authMiddleware, requirePermission('team:add_member'), addMemberToTeam);
router.get('/:teamId/members', authMiddleware, requirePermission('team:view'), getTeamMembers);
router.put('/:teamId/members/:memberId', authMiddleware, requirePermission('team:edit'), updateTeamMember);
router.delete('/:teamId/members/:memberId', authMiddleware, requirePermission('team:remove_member'), removeMemberFromTeam);

// New route to get all organization members
router.get('/all-organization-members', authMiddleware, requirePermission('team:view'), getAllOrganizationMembers);

// Utility routes
router.get('/:teamId/available-users', authMiddleware, requirePermission('team:view'), getAvailableUsers);

export default router;
