
import express from 'express';
import { getUserDetails } from '../../controllers/getUserDetails.js';
import { authMiddleware } from '../../middlewares/middleware.js';
import { getAllOrganizationMembers } from '../../controllers/teamsSectionController.js';

const router = express.Router();

router.get('/me', authMiddleware, getUserDetails);
router.get('/organization-members', authMiddleware, getAllOrganizationMembers);

export default router;
