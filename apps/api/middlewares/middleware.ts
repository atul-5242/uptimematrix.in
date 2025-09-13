import type {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import { prismaClient } from "@uptimematrix/store";

// Extend the Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        organizationId?: string;
      };
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    
    if (!header) {
        return res.status(401).json({ message: "No authorization header" });
    }

    const token = header.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };

        // Verify user exists and get their current organization context
        const user = await prismaClient.user.findUnique({
          where: { id: decoded.sub },
          select: {
            id: true,
            selectedOrganizationId: true,
            organizationMembers: {
              select: { organizationId: true },
            },
          },
        });

        if (!user) {
          return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        
        // Determine organization ID to use (selected or first available)
        let organizationId = user.selectedOrganizationId;
        
        if (!organizationId) {
          return res.status(401).json({ message: 'Unauthorized: No organization access' });
        }

        req.user = {
          id: decoded.sub,
          organizationId: organizationId,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Authentication failed",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}