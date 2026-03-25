import { Response } from 'express';
import ExcelJS from 'exceljs';
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

export const downloadImportData = catchAsync(async (req: AuthRequest, res: Response) => {
  const job = await ImportJob.findById(req.params.id);
  if (!job) throw ApiError.notFound('Import job not found');

  // Fetch all products created by this import
  const products = await Product.find({
    _id: { $in: job.createdProductIds || [] },
  })
    .populate('category', 'name slug')
    .lean();

  // Fetch all variants created by this import
  const variants = await ProductVariant.find({
    _id: { $in: job.createdVariantIds || [] },
  }).lean();

  // Build product id → product map
  const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

  // Create Excel workbook — same format as the uploaded file (one row per variant/product)
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Products');

  // Columns matching the upload format
  sheet.columns = [
    { header: 'Product Name', key: 'product_name', width: 30 },
    { header: 'SKU', key: 'sku', width: 22 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Material', key: 'material', width: 18 },
    { header: 'Colour', key: 'colour', width: 18 },
    { header: 'Thickness', key: 'thickness', width: 12 },
    { header: 'Length', key: 'length', width: 12 },
    { header: 'Width', key: 'width', width: 12 },
    { header: 'Depth', key: 'depth', width: 12 },
    { header: 'Size', key: 'size', width: 12 },
    { header: 'Pack Size', key: 'pack_size', width: 14 },
    { header: 'Price', key: 'price', width: 12 },
    { header: 'Stock', key: 'stock', width: 10 },
    { header: 'Status', key: 'status', width: 12 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0074C5' } };
  headerRow.alignment = { vertical: 'middle' };

  if (variants.length > 0) {
    // Configurable products: one row per variant (same as upload format)
    for (const v of variants) {
      const parent = productMap.get(v.product?.toString()) as any;
      const getAttr = (name: string) =>
        v.attributes?.find((a: any) => a.attributeName === name)?.value || '';

      sheet.addRow({
        product_name: parent?.name || '',
        sku: v.sku,
        description: parent?.shortDescription || parent?.description || '',
        category: parent?.category?.name || '',
        material: getAttr('Material'),
        colour: getAttr('Colour'),
        thickness: getAttr('Thickness'),
        length: getAttr('Length'),
        width: getAttr('Width'),
        depth: getAttr('Depth'),
        size: getAttr('Size'),
        pack_size: getAttr('Pack Size'),
        price: v.priceOverride ?? '',
        stock: v.stock ?? '',
        status: v.isActive ? 'active' : 'inactive',
      });
    }
  }

  // Also add simple products (no variants)
  const variantProductIds = new Set(variants.map((v: any) => v.product?.toString()));
  for (const p of products) {
    if (variantProductIds.has((p as any)._id.toString())) continue; // already in variants
    const specs = p.specifications
      ? (p.specifications instanceof Map ? Object.fromEntries(p.specifications) : p.specifications)
      : {};
    sheet.addRow({
      product_name: p.name,
      sku: p.sku,
      description: p.shortDescription || p.description || '',
      category: (p.category as any)?.name || '',
      material: (specs as any)['Material'] || '',
      colour: (specs as any)['Colour'] || '',
      thickness: (specs as any)['Thickness'] || '',
      length: '',
      width: '',
      depth: '',
      size: '',
      pack_size: '',
      price: p.price ?? '',
      stock: p.stock ?? '',
      status: p.status,
    });
  }

  // Errors sheet (if any)
  if (job.importErrors && job.importErrors.length > 0) {
    const errorSheet = workbook.addWorksheet('Errors');
    errorSheet.columns = [
      { header: 'Row', key: 'row', width: 10 },
      { header: 'Field', key: 'field', width: 15 },
      { header: 'Error Message', key: 'message', width: 60 },
    ];
    errorSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    errorSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
    for (const err of job.importErrors) {
      errorSheet.addRow({ row: err.row, field: err.field || '', message: err.message });
    }
  }

  // Send as download
  const fileName = `${job.fileName.replace(/\.[^.]+$/, '')}_export.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  await workbook.xlsx.write(res);
  res.end();
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
