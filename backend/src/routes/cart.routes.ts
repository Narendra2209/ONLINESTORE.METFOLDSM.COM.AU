import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { optionalAuth } from '../middlewares/auth';

const router = Router();

router.use(optionalAuth);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:itemId', cartController.updateItemQuantity);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
