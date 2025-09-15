import { createOnCallSchedule, getOnCallSchedules, updateOnCallSchedule, assignUserToOnCall, assignTeamToOnCall, getOnCallUsers, getOnCallTeams, updateOnCallUserAssignment, updateOnCallTeamAssignment } from '../../controllers/onCallController.js';
import { authMiddleware } from '../../middlewares/middleware.js';
import express from "express";
const router = express.Router();

// OnCallSchedule routes
router.post('/schedules', authMiddleware, createOnCallSchedule);
router.get('/schedules', authMiddleware, getOnCallSchedules);
router.put('/schedules/:id', authMiddleware, updateOnCallSchedule);

// OnCallUserAssignment routes
router.post('/schedules/:scheduleId/users', authMiddleware, assignUserToOnCall);
router.put('/schedules/:scheduleId/users/:userId', authMiddleware, updateOnCallUserAssignment);
router.get('/schedules/:scheduleId/users', authMiddleware, getOnCallUsers);

// OnCallTeamAssignment routes
router.post('/schedules/:scheduleId/teams', authMiddleware, assignTeamToOnCall);
router.put('/schedules/:scheduleId/teams/:teamId', authMiddleware, updateOnCallTeamAssignment);
router.get('/schedules/:scheduleId/teams', authMiddleware, getOnCallTeams);

export default router;
