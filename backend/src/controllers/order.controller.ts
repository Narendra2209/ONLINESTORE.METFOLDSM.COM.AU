import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middlewares/auth';

export const createOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const input = {
    userId: req.user?._id?.toString() || null,
    sessionId: req.cookies?.sessionId || req.headers['x-session-id'] as string || '',
    customerEmail: req.body.customerEmail || req.user?.email,
    customerName: req.body.customerName || req.user?.fullName,
    userType: req.user?.userType || 'retail',
    shippingAddress: req.body.shippingAddress,
    billingAddress: req.body.billingAddress || req.body.shippingAddress,
    deliveryMethod: req.body.deliveryMethod || 'delivery',
    notes: req.body.notes,
    couponCode: req.body.couponCode,
  };

  // If frontend sends items directly, create order from them; otherwise fall back to DB cart
  let order;
  if (req.body.items && req.body.items.length > 0) {
    order = await orderService.createFromItems({
      ...input,
      items: req.body.items,
      subtotal: req.body.subtotal,
      taxAmount: req.body.taxAmount,
      total: req.body.total,
    });
  } else {
    order = await orderService.createFromCart(input);
  }
  ApiResponse.created({ res, message: 'Order placed successfully', data: order });
});

export const getMyOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query as any;
  const result = await orderService.getUserOrders(req.user._id, page, limit);
  ApiResponse.paginated(res, result.orders, result.total, result.page, result.limit);
});

export const getOrderByNumber = catchAsync(async (req: AuthRequest, res: Response) => {
  const order = await orderService.getByOrderNumber(req.params.orderNumber);

  // Ensure user can only view their own orders (unless admin)
  const isAdmin = ['super_admin', 'admin', 'manager', 'sales_staff'].includes(req.user?.role?.name);
  if (!isAdmin && order.user?.toString() !== req.user?._id?.toString()) {
    return ApiResponse.success({ res, statusCode: 403, message: 'Forbidden' });
  }

  ApiResponse.success({ res, data: order });
});

export const trackOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderNumber, email } = req.query as { orderNumber: string; email: string };
  if (!orderNumber || !email) {
    return ApiResponse.success({ res, statusCode: 400, message: 'Order number and email are required' });
  }
  const order = await orderService.trackOrder(orderNumber, email);
  ApiResponse.success({ res, data: order });
});

// Admin
export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await orderService.getAllOrders(req.query);
  ApiResponse.paginated(res, result.orders, result.total, result.page, result.limit);
});

export const updateOrderStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const order = await orderService.updateStatus(
    req.params.id,
    req.body.status,
    req.body.note || '',
    req.user._id
  );
  ApiResponse.success({ res, data: order });
});

export const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await orderService.getDashboardStats();
  ApiResponse.success({ res, data: stats });
});
