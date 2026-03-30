import { Router } from 'express';
import multer from 'multer';
import * as claddingController from '../controllers/cladding.controller';
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
router.get('/price', claddingController.getCladdingPrice);
router.get('/panels', claddingController.listCladdingPanels);
router.get('/sku/:sku', claddingController.getCladdingBySku);

export default router;

// Admin routes
export const adminCladdingRoutes = Router();

adminCladdingRoutes.post(
  '/import',
  authenticate,
  authorizePermission('products', 'create'),
  upload.single('file'),
  claddingController.importCladdingPanels
);
