import { Router } from 'express';
import * as adminUserController from '../controllers/admin-user.controller';
import { authenticate } from '../middlewares/auth';
import { authorizePermission } from '../middlewares/authorize';

const router = Router();

// Admin users
router.get('/', authenticate, authorizePermission('users', 'read'), adminUserController.listAdminUsers);
router.post('/', authenticate, authorizePermission('users', 'create'), adminUserController.createAdminUser);
router.put('/:id', authenticate, authorizePermission('users', 'update'), adminUserController.updateAdminUser);
router.delete('/:id', authenticate, authorizePermission('users', 'delete'), adminUserController.deleteAdminUser);

export default router;

// Role routes
export const roleRoutes = Router();

roleRoutes.get('/', authenticate, authorizePermission('roles', 'read'), adminUserController.listRoles);
roleRoutes.put('/:id', authenticate, authorizePermission('roles', 'update'), adminUserController.updateRole);
