import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middlewares/auth';

const getIdentifiers = (req: AuthRequest) => ({
  userId: req.user?._id?.toString() || null,
  sessionId: req.cookies?.sessionId || req.headers['x-session-id'] as string || '',
});

export const getCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, sessionId } = getIdentifiers(req);
  const cart = await cartService.getCart(userId, sessionId);
  const summary = cartService.getCartSummary(cart);
  ApiResponse.success({ res, data: { ...cart.toObject(), ...summary } });
});

export const addItem = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, sessionId } = getIdentifiers(req);
  const cart = await cartService.addItem(userId, sessionId, {
    ...req.body,
    userType: req.user?.userType,
  });
  const summary = cartService.getCartSummary(cart!);
  ApiResponse.success({ res, message: 'Item added to cart', data: { ...cart!.toObject(), ...summary } });
});

export const updateItemQuantity = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, sessionId } = getIdentifiers(req);
  const cart = await cartService.updateItemQuantity(
    userId, sessionId, req.params.itemId, req.body.quantity
  );
  const summary = cartService.getCartSummary(cart!);
  ApiResponse.success({ res, data: { ...cart!.toObject(), ...summary } });
});

export const removeItem = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, sessionId } = getIdentifiers(req);
  const cart = await cartService.removeItem(userId, sessionId, req.params.itemId);
  const summary = cartService.getCartSummary(cart!);
  ApiResponse.success({ res, data: { ...cart!.toObject(), ...summary } });
});

export const clearCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, sessionId } = getIdentifiers(req);
  await cartService.clearCart(userId, sessionId);
  ApiResponse.success({ res, message: 'Cart cleared' });
});
