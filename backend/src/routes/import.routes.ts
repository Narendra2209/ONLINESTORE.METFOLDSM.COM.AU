import { Router } from 'express';
import multer from 'multer';
import * as importController from '../controllers/import.controller';
import { authenticate } from '../middlewares/auth';
import { authorizePermission } from '../middlewares/authorize';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
});

const router = Router();

router.post(
  '/preview',
  authenticate,
  authorizePermission('imports', 'create'),
  upload.single('file'),
  importController.previewExcel
);

router.post(
  '/upload',
  authenticate,
  authorizePermission('imports', 'create'),
  upload.single('file'),
  importController.uploadExcel
);

router.get(
  '/',
  authenticate,
  authorizePermission('imports', 'read'),
  importController.getImportJobs
);

router.get(
  '/:id',
  authenticate,
  authorizePermission('imports', 'read'),
  importController.getImportJob
);

router.delete(
  '/:id',
  authenticate,
  authorizePermission('imports', 'create'),
  importController.deleteImportJob
);

export default router;
