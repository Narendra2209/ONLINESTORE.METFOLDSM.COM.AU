import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate } from '../middlewares/auth';
import { authorizePermission } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { createCategorySchema, updateCategorySchema } from '../validators/product.validator';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

export default router;

// Admin routes (mounted separately under /admin)
export const adminCategoryRoutes = Router();

adminCategoryRoutes.get(
  '/',
  authenticate,
  authorizePermission('categories', 'read'),
  categoryController.getAllCategoriesAdmin
);

adminCategoryRoutes.post(
  '/',
  authenticate,
  authorizePermission('categories', 'create'),
  validate({ body: createCategorySchema }),
  categoryController.createCategory
);

adminCategoryRoutes.put(
  '/:id',
  authenticate,
  authorizePermission('categories', 'update'),
  validate({ body: updateCategorySchema }),
  categoryController.updateCategory
);

adminCategoryRoutes.delete(
  '/:id',
  authenticate,
  authorizePermission('categories', 'delete'),
  categoryController.deleteCategory
);

adminCategoryRoutes.patch(
  '/reorder',
  authenticate,
  authorizePermission('categories', 'update'),
  categoryController.reorderCategories
);
