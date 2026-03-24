import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth';
import { authorizePermission } from '../middlewares/authorize';

const router = Router();

router.use(authenticate);

router.get('/dashboard', reportController.getDashboardSummary);
router.get('/revenue', authorizePermission('reports', 'read'), reportController.getRevenueReport);
router.get('/top-products', authorizePermission('reports', 'read'), reportController.getTopProducts);
router.get('/orders-by-status', authorizePermission('reports', 'read'), reportController.getOrdersByStatus);
router.get('/customer-acquisition', authorizePermission('reports', 'read'), reportController.getCustomerAcquisition);
router.get('/inventory', authorizePermission('reports', 'read'), reportController.getInventoryValue);

export default router;
