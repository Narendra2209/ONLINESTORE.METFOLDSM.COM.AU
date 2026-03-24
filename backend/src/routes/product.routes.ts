import { Router } from 'express';
import multer from 'multer';
import * as productController from '../controllers/product.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { authorizePermission } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import {
  createProductSchema,
  updateProductSchema,
  calculatePriceSchema,
  createAttributeSchema,
  createPricingRuleSchema,
} from '../validators/product.validator';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const router = Router();

// Public routes
router.get('/', productController.listProducts);
router.get('/attributes/filterable', productController.getFilterableAttributes);
router.get('/:slug', productController.getProductBySlug);
router.post(
  '/:id/calculate-price',
  optionalAuth,
  validate({ body: calculatePriceSchema }),
  productController.calculatePrice
);

export default router;

// Admin routes
export const adminProductRoutes = Router();

adminProductRoutes.get(
  '/',
  authenticate,
  authorizePermission('products', 'read'),
  productController.listProductsAdmin
);

adminProductRoutes.get(
  '/:id',
  authenticate,
  authorizePermission('products', 'read'),
  productController.getProductAdmin
);

adminProductRoutes.post(
  '/',
  authenticate,
  authorizePermission('products', 'create'),
  validate({ body: createProductSchema }),
  productController.createProduct
);

adminProductRoutes.put(
  '/:id',
  authenticate,
  authorizePermission('products', 'update'),
  validate({ body: updateProductSchema }),
  productController.updateProduct
);

adminProductRoutes.patch(
  '/:id/status',
  authenticate,
  authorizePermission('products', 'update'),
  productController.updateProductStatus
);

adminProductRoutes.delete(
  '/:id',
  authenticate,
  authorizePermission('products', 'delete'),
  productController.deleteProduct
);

adminProductRoutes.post(
  '/:id/duplicate',
  authenticate,
  authorizePermission('products', 'create'),
  productController.duplicateProduct
);

// Image upload
adminProductRoutes.post(
  '/:id/images',
  authenticate,
  authorizePermission('products', 'update'),
  upload.array('images', 10),
  productController.uploadProductImages
);

adminProductRoutes.delete(
  '/:id/images/:imageId',
  authenticate,
  authorizePermission('products', 'update'),
  productController.deleteProductImage
);

// Pricing rules
adminProductRoutes.post(
  '/:id/pricing-rules',
  authenticate,
  authorizePermission('pricing', 'create'),
  validate({ body: createPricingRuleSchema }),
  productController.createPricingRule
);

adminProductRoutes.post(
  '/pricing/simulate',
  authenticate,
  authorizePermission('pricing', 'read'),
  productController.simulatePricing
);

// Attributes (admin)
export const adminAttributeRoutes = Router();

adminAttributeRoutes.get(
  '/',
  authenticate,
  authorizePermission('attributes', 'read'),
  productController.listAttributes
);

adminAttributeRoutes.post(
  '/',
  authenticate,
  authorizePermission('attributes', 'create'),
  validate({ body: createAttributeSchema }),
  productController.createAttribute
);

adminAttributeRoutes.put(
  '/:id',
  authenticate,
  authorizePermission('attributes', 'update'),
  productController.updateAttribute
);

adminAttributeRoutes.delete(
  '/:id',
  authenticate,
  authorizePermission('attributes', 'delete'),
  productController.deleteAttribute
);
