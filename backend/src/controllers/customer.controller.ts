import { Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export const listCustomers = catchAsync(async (req: Request, res: Response) => {
  const result = await customerService.listCustomers(req.query as any);
  ApiResponse.paginated(res, result.customers, result.total, result.page, result.limit);
});

export const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  ApiResponse.success({ res, data: customer });
});
