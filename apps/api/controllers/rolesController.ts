import { Request, Response } from 'express';
import { prismaClient } from '@uptimematrix/store';

const prisma = prismaClient;

export const listRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: true },
      orderBy: { name: 'asc' },
    });

    const data = roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      permissions: r.permissions.map((p) => p.name),
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error('listRoles error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description, permissions } = req.body as { name: string; description?: string; permissions: string[] };

    if (!name?.trim() || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({ error: 'Invalid payload: name and permissions are required' });
    }

    const existing = await prisma.role.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return res.status(400).json({ error: 'Role with this name already exists' });
    }

    const permRecords = await prisma.permission.findMany({
      where: { name: { in: permissions } },
      select: { id: true },
    });

    if (permRecords.length !== permissions.length) {
      return res.status(400).json({ error: 'One or more permissions are invalid' });
    }

    const role = await prisma.role.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        permissions: { connect: permRecords.map((p) => ({ id: p.id })) },
      },
      include: { permissions: true },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map((p) => p.name),
      },
    });
  } catch (err) {
    console.error('createRole error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body as { name: string; description?: string; permissions: string[] };

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    if (name) {
      const other = await prisma.role.findFirst({ where: { name: name.trim(), id: { not: roleId } } });
      if (other) {
        return res.status(400).json({ error: 'Another role with this name already exists' });
      }
    }

    let permissionOps = undefined as any;
    if (Array.isArray(permissions)) {
      const permRecords = await prisma.permission.findMany({
        where: { name: { in: permissions } },
        select: { id: true },
      });
      if (permRecords.length !== permissions.length) {
        return res.status(400).json({ error: 'One or more permissions are invalid' });
      }
      permissionOps = { set: permRecords.map((p) => ({ id: p.id })) };
    }

    const updated = await prisma.role.update({
      where: { id: roleId },
      data: {
        ...(name && { name: name.trim() }),
        ...(typeof description !== 'undefined' && { description: description?.trim() || null }),
        ...(permissionOps && { permissions: permissionOps }),
      },
      include: { permissions: true },
    });

    return res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        permissions: updated.permissions.map((p) => p.name),
      },
    });
  } catch (err) {
    console.error('updateRole error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Optional: prevent deleting built-in roles
    if (['Admin', 'Member', 'Responder', 'Team Lead', 'Billing Admin'].includes(role.name)) {
      return res.status(400).json({ error: 'Cannot delete a system role' });
    }

    await prisma.role.delete({ where: { id: roleId } });
    return res.json({ success: true, message: 'Role deleted' });
  } catch (err) {
    console.error('deleteRole error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignRoleToMember = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { userId } = req.body as { userId: string };

    if (!req.user?.organizationId) {
      return res.status(401).json({ error: 'Unauthorized: No organization selected' });
    }

    const organizationId = req.user.organizationId;

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) return res.status(404).json({ error: 'Role not found' });

    const orgMember = await prisma.organizationMember.findFirst({
      where: { organizationId, userId },
    });
    if (!orgMember) return res.status(404).json({ error: 'Organization member not found' });

    const updated = await prisma.organizationMember.update({
      where: { id: orgMember.id },
      data: { roleId: role.id },
    });

    return res.json({ success: true, message: 'Role assigned', data: { organizationMemberId: updated.id } });
  } catch (err) {
    console.error('assignRoleToMember error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
