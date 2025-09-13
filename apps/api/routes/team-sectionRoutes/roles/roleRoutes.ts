import express from 'express';
import { getRoles } from '../../../controllers/teamsSectionController.js';
import { authMiddleware } from '../../../middlewares/middleware.js';

const router = express.Router();

// Role management routes
router.get('/',authMiddleware, getRoles);

export default router;
