import { createOnCallSchedule, getOnCallSchedules, updateOnCallSchedule, assignUserToOnCall, assignTeamToOnCall, getOnCallUsers, getOnCallTeams, updateOnCallUserAssignment, updateOnCallTeamAssignment, removeUserFromOnCall, removeTeamFromOnCall } from '../../controllers/onCallController.js';
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
router.delete('/schedules/:scheduleId/users/:onCallUserAssignmentId', authMiddleware, removeUserFromOnCall);
router.get('/schedules/:scheduleId/users', authMiddleware, getOnCallUsers);

// OnCallTeamAssignment routes
router.post('/schedules/:scheduleId/teams', authMiddleware, assignTeamToOnCall);
router.put('/schedules/:scheduleId/teams/:teamId', authMiddleware, updateOnCallTeamAssignment);
router.delete('/schedules/:scheduleId/teams/:onCallTeamAssignmentId', authMiddleware, removeTeamFromOnCall);
router.get('/schedules/:scheduleId/teams', authMiddleware, getOnCallTeams);

export default router;
