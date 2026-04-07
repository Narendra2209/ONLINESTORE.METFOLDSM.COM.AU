import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth';
import { authorizePermission } from '../middlewares/authorize';

const router = Router();

router.get('/', authenticate, authorizePermission('customers', 'read'), customerController.listCustomers);
router.patch('/:id', authenticate, authorizePermission('customers', 'update'), customerController.updateCustomer);

export default router;
