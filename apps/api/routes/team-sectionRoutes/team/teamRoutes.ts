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

const router = express.Router();

// Team management routes
router.post('/', authMiddleware,createTeam);
router.get('/', authMiddleware,getTeams);
router.put('/:teamId',authMiddleware, updateTeam);
router.delete('/:teamId',authMiddleware, deleteTeam);

// Team member management routes
router.post('/:teamId/members',authMiddleware, addMemberToTeam);
router.get('/:teamId/members',authMiddleware, getTeamMembers);
router.put('/:teamId/members/:memberId', authMiddleware,updateTeamMember);
router.delete('/:teamId/members/:memberId',authMiddleware, removeMemberFromTeam);

// New route to get all organization members
router.get('/all-organization-members', authMiddleware, getAllOrganizationMembers);

// Utility routes
router.get('/:teamId/available-users',authMiddleware, getAvailableUsers);

export default router;
