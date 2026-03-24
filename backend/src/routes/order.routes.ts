import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { authorizePermission } from '../middlewares/authorize';

const router = Router();

// Customer routes
router.post('/', optionalAuth, orderController.createOrder);
router.get('/', authenticate, orderController.getMyOrders);
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.get('/:orderNumber', authenticate, orderController.getOrderByNumber);

export default router;

// Admin routes
export const adminOrderRoutes = Router();

adminOrderRoutes.get(
  '/',
  authenticate,
  authorizePermission('orders', 'read'),
  orderController.getAllOrders
);

adminOrderRoutes.patch(
  '/:id/status',
  authenticate,
  authorizePermission('orders', 'update'),
  orderController.updateOrderStatus
);

adminOrderRoutes.get(
  '/dashboard/stats',
  authenticate,
  authorizePermission('orders', 'read'),
  orderController.getDashboardStats
);
