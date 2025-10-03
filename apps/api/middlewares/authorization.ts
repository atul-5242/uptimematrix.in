import type { Request, Response, NextFunction } from 'express';
import { prismaClient } from '@uptimematrix/store';

// Checks whether a user (by req.user.id) has a given permission in the current organization (req.user.organizationId)
export async function userHasPermission(userId: string, organizationId: string, permission: string): Promise<boolean> {
  const userWithMemberships = await prismaClient.user.findUnique({
    where: { id: userId },
    include: {
      organizationMembers: {
        where: { organizationId },
        include: {
          role: { include: { permissions: true } },
        },
      },
    },
  });

  if (!userWithMemberships || userWithMemberships.organizationMembers.length === 0) {
    return false;
  }

  const orgMember = userWithMemberships.organizationMembers[0];
  if (orgMember?.role?.name === 'Admin') {
    return true;
  }

  return Boolean(orgMember?.role?.permissions?.some((p: any) => p.name === permission));
}

// Express middleware to enforce a specific permission
export function requirePermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not found' });
      }
      if (!organizationId) {
        return res.status(401).json({ error: 'Unauthorized: No organization selected' });
      }

      const allowed = await userHasPermission(userId, organizationId, permission);
      if (!allowed) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions', permission });
      }

      return next();
    } catch (err) {
      console.error('Authorization middleware error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Require at least one permission from a list
export function requireAnyPermission(permissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const organizationId = req.user?.organizationId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User not found' });
      }
      if (!organizationId) {
        return res.status(401).json({ error: 'Unauthorized: No organization selected' });
      }

      for (const perm of permissions) {
        if (await userHasPermission(userId, organizationId, perm)) {
          return next();
        }
      }

      return res.status(403).json({ error: 'Forbidden: Insufficient permissions', permissions });
    } catch (err) {
      console.error('Authorization middleware error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
