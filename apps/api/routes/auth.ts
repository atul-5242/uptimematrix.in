import { Router } from 'express';
import { prismaClient } from '@uptimematrix/store';
import jwt from 'jsonwebtoken';

const router = Router();


// Add this new endpoint for session validation
router.post('/auth/validate-session', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user exists in the database
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        // Add other non-sensitive fields you want to return
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If we get here, the user exists and is valid
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      // Include any other user fields you need
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ error: 'Internal server error during session validation' });
  }
});

export default router;
