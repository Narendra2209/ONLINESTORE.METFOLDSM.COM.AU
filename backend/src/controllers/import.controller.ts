import { Response } from 'express';
import { importService } from '../services/import.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middlewares/auth';
import ImportJob from '../models/ImportJob';
import Product from '../models/Product';
import ProductVariant from '../models/ProductVariant';
import PricingRule from '../models/PricingRule';

export const previewExcel = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const preview = await importService.previewExcel(req.file.buffer);

  ApiResponse.success({
    res,
    message: `Found ${preview.sheets.length} sheets with ${preview.totalRows} data rows`,
    data: preview,
  });
});

export const uploadExcel = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const importType = (req.body.type || 'products') as 'products' | 'prices' | 'stock';

  const job = await importService.processExcel(
    req.file.buffer,
    req.file.originalname,
    importType,
    req.user._id
  );

  ApiResponse.success({
    res,
    message: `Import ${job.status}: ${job.successCount} success, ${job.errorCount} errors`,
    data: job,
  });
});

export const getImportJobs = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await importService.getImportJobs(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20
  );
  ApiResponse.paginated(res, result.jobs, result.total, result.page, result.limit);
});

export const getImportJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const job = await importService.getImportJob(req.params.id);
  if (!job) throw ApiError.notFound('Import job not found');
  ApiResponse.success({ res, data: job });
});

export const deleteImportJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const job = await ImportJob.findById(req.params.id);
  if (!job) throw ApiError.notFound('Import job not found');

  let deletedProducts = 0;
  let deletedVariants = 0;
  let deletedPricingRules = 0;

  // Delete all variants created by this import
  if (job.createdVariantIds && job.createdVariantIds.length > 0) {
    const result = await ProductVariant.deleteMany({ _id: { $in: job.createdVariantIds } });
    deletedVariants = result.deletedCount;
  }

  // Delete all products created by this import (and their pricing rules)
  if (job.createdProductIds && job.createdProductIds.length > 0) {
    // Also delete any variants that belong to these products (in case some weren't tracked)
    const extraVariants = await ProductVariant.deleteMany({ product: { $in: job.createdProductIds } });
    deletedVariants += extraVariants.deletedCount;

    // Delete pricing rules for these products
    const prResult = await PricingRule.deleteMany({ product: { $in: job.createdProductIds } });
    deletedPricingRules = prResult.deletedCount;

    // Delete the products
    const pResult = await Product.deleteMany({ _id: { $in: job.createdProductIds } });
    deletedProducts = pResult.deletedCount;
  }

  // Delete the import job itself
  await ImportJob.findByIdAndDelete(req.params.id);

  ApiResponse.success({
    res,
    message: `Deleted import job along with ${deletedProducts} products, ${deletedVariants} variants, and ${deletedPricingRules} pricing rules`,
  });
});
