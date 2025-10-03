import express from 'express';
import { authMiddleware } from '../../../middlewares/middleware.js';
import { requirePermission } from '../../../middlewares/authorization.js';
import { listRoles, createRole, updateRole, deleteRole, assignRoleToMember } from '../../../controllers/rolesController.js';

const router = express.Router();

// Role management routes
router.get('/', authMiddleware, listRoles);
router.post('/', authMiddleware, requirePermission('role:create'), createRole);
router.put('/:roleId', authMiddleware, requirePermission('role:edit'), updateRole);
router.delete('/:roleId', authMiddleware, requirePermission('role:delete'), deleteRole);
router.post('/:roleId/assign', authMiddleware, requirePermission('role:assign'), assignRoleToMember);

export default router;
