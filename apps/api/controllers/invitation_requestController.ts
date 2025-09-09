
import { scryptSync, randomBytes } from 'crypto';
import { prismaClient } from '@uptimematrix/store';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';


// Password helpers (same as in authControl.ts)
function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hashed = scryptSync(password, salt, 64);
  return salt.toString("hex") + ":" + hashed.toString("hex");
}


export const verifyInvitation = async (req: Request, res: Response) => {
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
}

export const acceptInvitation = async (req: Request, res: Response) => {
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
}
