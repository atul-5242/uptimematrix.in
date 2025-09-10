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
        
        const orgMember = await prismaClient.organizationMember.findFirst({
            where: { userId: decoded.sub },
            select: { organizationId: true },
        });

        req.user = {
            id: decoded.sub,
            organizationId: orgMember?.organizationId
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            message: "Authentication failed",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}