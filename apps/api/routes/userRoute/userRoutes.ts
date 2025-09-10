
import express from 'express';
import { getUserDetails } from '../../controllers/getUserDetails.js';
import { authMiddleware } from '../../middlewares/middleware.js';

const router = express.Router();

router.get('/me', authMiddleware, getUserDetails);

export default router;
