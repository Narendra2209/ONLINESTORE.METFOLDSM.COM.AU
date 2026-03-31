import { Router } from 'express';
import multer from 'multer';
import * as dambusterController from '../controllers/dambuster.controller';
import { authenticate } from '../middlewares/auth';
import { authorizePermission } from '../middlewares/authorize';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
});

const router = Router();

// Public routes
router.get('/price', dambusterController.getDambusterPrice);
router.get('/products', dambusterController.listDambusterProducts);
router.get('/filters', dambusterController.getDambusterFilters);
router.get('/sku/:sku', dambusterController.getDambusterBySku);

export default router;

// Admin routes
export const adminDambusterRoutes = Router();

adminDambusterRoutes.post(
  '/import',
  authenticate,
  authorizePermission('products', 'create'),
  upload.single('file'),
  dambusterController.importDambusterProducts
);
