import { Request, Response } from 'express';
import { dambusterService } from '../services/dambuster.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';

/**
 * GET /api/v1/dambuster/price
 * Query: sku | (productName, material, type) + quantity
 */
export const getDambusterPrice = catchAsync(async (req: Request, res: Response) => {
  const { sku, productName, material, type, quantity } = req.query;

  if (!quantity) throw ApiError.badRequest('quantity is required');

  const result = await dambusterService.calculatePrice({
    sku: sku as string,
    productName: productName as string,
    material: material as string,
    type: type as string,
    quantity: parseInt(quantity as string),
  });

  ApiResponse.success({ res, data: result });
});

/**
 * GET /api/v1/dambuster/products
 * Query: productName, material, type (all optional filters)
 */
export const listDambusterProducts = catchAsync(async (req: Request, res: Response) => {
  const { productName, material, type } = req.query;

  const products = await dambusterService.listProducts({
    productName: productName as string,
    material: material as string,
    type: type as string,
  });

  ApiResponse.success({ res, data: products });
});

/**
 * GET /api/v1/dambuster/filters
 * Returns distinct product names, materials, and types for filter dropdowns
 */
export const getDambusterFilters = catchAsync(async (_req: Request, res: Response) => {
  const filters = await dambusterService.getFilterOptions();
  ApiResponse.success({ res, data: filters });
});

/**
 * GET /api/v1/dambuster/sku/:sku
 * Lookup a single product by SKU
 */
export const getDambusterBySku = catchAsync(async (req: Request, res: Response) => {
  const { sku } = req.params;
  const product = await dambusterService.getBySku(sku);

  if (!product) {
    throw ApiError.notFound(`Dambuster product with SKU "${sku}" not found`);
  }

  ApiResponse.success({ res, data: product });
});

/**
 * POST /api/v1/admin/dambuster/import
 * Upload an Excel file with columns: PRODUCT NAME, Material, TYPE, Inventory, Description, Currency, BASE PRICE
 */
export const importDambusterProducts = catchAsync(async (req: Request, res: Response) => {
  console.log('[Dambuster Import] File received:', req.file?.originalname, 'Size:', req.file?.size);
  if (!req.file) {
    throw ApiError.badRequest('Excel file is required');
  }

  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer as any);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw ApiError.badRequest('No worksheet found in the file');

  // Read header row to map columns
  const headerRow = worksheet.getRow(1);
  const colMap: Record<string, number> = {};
  headerRow.eachCell((cell, colNumber) => {
    const val = String(cell.value || '').trim().toUpperCase();
    if (val === 'PRODUCT NAME' || val === 'PRODUCT_NAME' || val === 'PRODUCTNAME' || val === 'NAME') colMap.productName = colNumber;
    else if (val === 'MATERIAL') colMap.material = colNumber;
    else if (val === 'TYPE') colMap.type = colNumber;
    else if (val === 'INVENTORY' || val === 'INVENTORY_ID' || val === 'SKU' || val === 'SKU_CODE' || val === 'ITEM_CODE') colMap.sku = colNumber;
    else if (val === 'DESCRIPTION' || val === 'PRODUCT_DESCRIPTION') colMap.description = colNumber;
    else if (val === 'CURRENCY' || val === 'CURR' || val === 'CURR.') colMap.currency = colNumber;
    else if (val === 'BASE PRICE' || val === 'BASE_PRICE' || val === 'BASEPRICE' || val === 'PRICE' || val.includes('PRICE')) colMap.basePrice = colNumber;
  });

  console.log('[Dambuster Import] Column mapping:', JSON.stringify(colMap));
  if (!colMap.sku || !colMap.basePrice) {
    throw ApiError.badRequest('Excel must have at least SKU/Inventory and BASE PRICE columns. Found columns: ' + JSON.stringify(colMap));
  }

  const products: Array<{
    productName: string; material: string; type: string;
    sku: string; description: string; basePrice: number; currency: string;
  }> = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const sku = String(row.getCell(colMap.sku).value || '').trim();
    if (!sku) return; // skip empty rows

    const priceRaw = String(row.getCell(colMap.basePrice).value || '0').toString().replace(/[$,]/g, '');

    products.push({
      productName: String(row.getCell(colMap.productName || 0).value || '').trim(),
      material: String(row.getCell(colMap.material || 0).value || '').trim(),
      type: String(row.getCell(colMap.type || 0).value || '').trim(),
      sku,
      description: String(row.getCell(colMap.description || 0).value || '').trim(),
      basePrice: parseFloat(priceRaw),
      currency: String(row.getCell(colMap.currency || 0).value || 'AUD').trim(),
    });
  });

  console.log('[Dambuster Import] Parsed rows:', products.length, 'First:', products[0] ? JSON.stringify(products[0]) : 'none');
  if (products.length === 0) {
    throw ApiError.badRequest('No valid rows found in the file');
  }

  const results = await dambusterService.bulkImport(products);
  ApiResponse.success({ res, data: { ...results, totalRows: products.length } });
});
