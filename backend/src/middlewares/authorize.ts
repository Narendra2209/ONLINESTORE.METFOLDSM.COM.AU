import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ApiError } from '../utils/ApiError';

/**
 * Authorize by role names.
 * Usage: authorize('super_admin', 'admin')
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const userRole = req.user.role?.name || req.user.roleName;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};

/**
 * Authorize by permission (resource + action).
 * Usage: authorizePermission('products', 'create')
 */
export const authorizePermission = (resource: string, action: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const userRole = req.user.role;

    // Super admin has all permissions
    if (userRole?.name === 'super_admin') {
      return next();
    }

    const hasPermission = userRole?.permissions?.some(
      (perm: any) => perm.resource === resource && perm.actions.includes(action)
    );

    if (!hasPermission) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};
