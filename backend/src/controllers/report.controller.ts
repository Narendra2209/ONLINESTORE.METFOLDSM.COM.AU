import { Request, Response } from 'express';
import { reportService } from '../services/report.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export const getRevenueReport = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, groupBy } = req.query;
  const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate as string) : new Date();

  const data = await reportService.getRevenueByPeriod(start, end, (groupBy as any) || 'day');
  ApiResponse.success({ res, data });
});

export const getTopProducts = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, limit } = req.query;
  const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = endDate ? new Date(endDate as string) : new Date();

  const data = await reportService.getTopProducts(start, end, parseInt(limit as string) || 10);
  ApiResponse.success({ res, data });
});

export const getOrdersByStatus = catchAsync(async (_req: Request, res: Response) => {
  const data = await reportService.getOrdersByStatus();
  ApiResponse.success({ res, data });
});

export const getCustomerAcquisition = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate as string) : new Date(new Date().setMonth(new Date().getMonth() - 3));
  const end = endDate ? new Date(endDate as string) : new Date();

  const data = await reportService.getCustomerAcquisition(start, end);
  ApiResponse.success({ res, data });
});

export const getInventoryValue = catchAsync(async (_req: Request, res: Response) => {
  const data = await reportService.getInventoryValue();
  ApiResponse.success({ res, data });
});

export const getDashboardSummary = catchAsync(async (_req: Request, res: Response) => {
  const data = await reportService.getDashboardSummary();
  ApiResponse.success({ res, data });
});
