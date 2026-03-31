import { Request, Response } from 'express';
import { adminUserService } from '../services/admin-user.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export const listAdminUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await adminUserService.listAdminUsers();
  ApiResponse.success({ res, data: users });
});

export const createAdminUser = catchAsync(async (req: Request, res: Response) => {
  const user = await adminUserService.createAdminUser(req.body);
  ApiResponse.created({ res, data: user });
});

export const updateAdminUser = catchAsync(async (req: Request, res: Response) => {
  const user = await adminUserService.updateAdminUser(req.params.id, req.body);
  ApiResponse.success({ res, data: user });
});

export const deleteAdminUser = catchAsync(async (req: Request, res: Response) => {
  await adminUserService.deleteAdminUser(req.params.id);
  ApiResponse.success({ res, message: 'User deleted' });
});

export const searchUserByEmail = catchAsync(async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) {
    return ApiResponse.success({ res, data: null });
  }
  const user = await adminUserService.findUserByEmail(email);
  ApiResponse.success({ res, data: user });
});

export const listRoles = catchAsync(async (_req: Request, res: Response) => {
  const roles = await adminUserService.listRoles();
  ApiResponse.success({ res, data: roles });
});

export const updateRole = catchAsync(async (req: Request, res: Response) => {
  const role = await adminUserService.updateRole(req.params.id, req.body);
  ApiResponse.success({ res, data: role });
});
