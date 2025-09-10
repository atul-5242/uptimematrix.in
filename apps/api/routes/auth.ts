import { Router } from 'express';
import { prismaClient } from '@uptimematrix/store';
import jwt from 'jsonwebtoken';
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';
import { signUp } from '../controllers/authControl.js';

// Password helpers (same as in authControl.ts)
function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hashed = scryptSync(password, salt, 64);
  return salt.toString("hex") + ":" + hashed.toString("hex");
}

const router = Router();

router.post('/auth/user/signup', signUp);

// Add this new endpoint for session validation
router.post('/auth/validate-session', async (req, res) => {
  try {
    const { userId } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token not provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user exists in the database
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
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
      fullName: user.fullName,
      // Include any other user fields you need
    });
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ error: 'Internal server error during session validation' });
  }
});

// Verify invitation endpoint
router.post('/auth/verify-invitation', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Verify the JWT token
    const decoded = jwt.verify(
      token,
      (process.env.INVITATION_SECRET || "").trim()
    ) as any;

    if (!decoded.email || !decoded.organizationId) {
      return res.status(400).json({ message: 'Invalid token format' });
    }

    console.log('[API] Looking for inactive membership:', {
      email: decoded.email,
      organizationId: decoded.organizationId,
      isVerified: false
    });

    // Check if there's an inactive membership for this invitation
    const inactiveMembership = await prismaClient.organizationMember.findFirst({
      where: {
        email: decoded.email,
        organizationId: decoded.organizationId,
        isVerified: false
      },
      include: {
        organization: true,
        invitedBy: {
          select: { fullName: true, email: true }
        }
      }
    });

    console.log('[API] Found inactive membership:', inactiveMembership ? 'YES' : 'NO');

    if (!inactiveMembership) {
      // Let's also check if there are any memberships for this email
      const anyMemberships = await prismaClient.organizationMember.findMany({
        where: { email: decoded.email },
        select: { id: true, organizationId: true, isVerified: true, userId: true }
      });
      console.log('[API] All memberships for this email:', anyMemberships);
      
      return res.status(404).json({ message: 'Invitation not found or already used' });
    }

    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email: decoded.email }
    });

    // If user exists, check if they're already a verified member of this organization
    if (existingUser) {
      const verifiedMembership = await prismaClient.organizationMember.findFirst({
        where: {
          userId: existingUser.id,
          organizationId: decoded.organizationId,
          isVerified: true
        }
      });

      if (verifiedMembership) {
        return res.status(400).json({ 
          message: 'You are already a member of this organization' 
        });
      }
    }

    res.json({
      invitation: {
        email: decoded.email,
        organizationName: inactiveMembership.organization?.name || 'Unknown Organization',
        inviterName: inactiveMembership.invitedBy?.fullName || inactiveMembership.invitedBy?.email || 'Someone',
        role: decoded.role || 'Member',
        userExists: !!existingUser
      }
    });

  } catch (error: any) {
    console.error('[API] Verify invitation error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid invitation token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invitation has expired' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

// Accept invitation endpoint
router.post('/auth/accept-invitation', async (req, res) => {
  try {
    const { token, password, fullName } = req.body;

    if (!token) {
      return res.status(400).json({ 
        message: 'Token is required' 
      });
    }

    // Verify the JWT token
    const decoded = jwt.verify(
      token,
      (process.env.INVITATION_SECRET || "").trim()
    ) as any;

    if (!decoded.email || !decoded.organizationId) {
      return res.status(400).json({ message: 'Invalid token format' });
    }

    // Find the inactive membership for this invitation
    const inactiveMembership = await prismaClient.organizationMember.findFirst({
      where: {
        email: decoded.email,
        organizationId: decoded.organizationId,
        isVerified: false
      }
    });

    if (!inactiveMembership) {
      return res.status(404).json({ message: 'Invitation not found or already used' });
    }

    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email: decoded.email }
    });

    if (existingUser) {
      // User exists - activate the membership
      await prismaClient.organizationMember.update({
        where: { id: inactiveMembership.id },
        data: {
          userId: existingUser.id,
          name: existingUser.fullName || existingUser.email.split('@')[0] || existingUser.email,
          isVerified: true
        }
      });

      console.log(`[API] Existing user ${existingUser.email} joined organization via invitation`);

      return res.json({
        message: 'Invitation accepted successfully',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          fullName: existingUser.fullName
        }
      });
    }

    // User doesn't exist - create new user and activate membership
    if (!password || !fullName) {
      return res.status(400).json({ 
        message: 'Password and full name are required for new users' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Hash the password
    const hashedPassword = hashPassword(password);

    // Create the user
    const user = await prismaClient.user.create({
      data: {
        email: decoded.email,
        password: hashedPassword,
        fullName: fullName.trim(),
      },
      select: {
        id: true,
        email: true,
        fullName: true
      }
    });

    // Activate the membership
    await prismaClient.organizationMember.update({
      where: { id: inactiveMembership.id },
      data: {
        userId: user.id,
        name: fullName.trim(),
        isVerified: true
      }
    });

    console.log(`[API] New user ${user.email} accepted invitation and joined organization`);

    res.json({
      message: 'Invitation accepted successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      }
    });

  } catch (error: any) {
    console.error('[API] Accept invitation error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid invitation token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invitation has expired' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
