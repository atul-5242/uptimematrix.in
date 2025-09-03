import { Router } from 'express';
import { prismaClient } from '@uptimematrix/store';
import type { Request, Response } from 'express';

const router = Router();

// Session validation endpoint
router.post('/validate-session', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user exists in the database
    const user = await prismaClient.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true
      }
    });
    
    if (!user) {
      // Clear the auth cookies if user not found
      const response = {
        isAuthenticated: false,
        user: null
      };
      
      // Clear auth cookies
      res.cookie('auth_token', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: new Date(0),
      });
      
      res.cookie('auth_userId', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: new Date(0),
      });

      return res.status(200).json(response);
    }

    // If we get here, the user exists and is valid
    res.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ 
      isAuthenticated: false,
      error: 'Internal server error during session validation' 
    });
  }
});

export default router;
