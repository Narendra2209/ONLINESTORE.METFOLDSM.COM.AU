import { Request, Response } from 'express';
import { claddingService } from '../services/cladding.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';

/**
 * GET /api/v1/cladding/price
 * Query: sku | (product, material, rib, cover) + length + quantity
 */
export const getCladdingPrice = catchAsync(async (req: Request, res: Response) => {
  const { sku, product, material, rib, cover, length, quantity } = req.query;

  if (!length) throw ApiError.badRequest('length is required');
  if (!quantity) throw ApiError.badRequest('quantity is required');

  const result = await claddingService.calculatePrice({
    sku: sku as string,
    product: product as string,
    material: material as string,
    rib: rib as string,
    cover: cover ? parseInt(cover as string) : undefined,
    length: parseFloat(length as string),
    quantity: parseInt(quantity as string),
  });

  ApiResponse.success({ res, data: result });
});

/**
 * GET /api/v1/cladding/panels
 * Query: product, material, rib (all optional filters)
 */
export const listCladdingPanels = catchAsync(async (req: Request, res: Response) => {
  const { product, material, rib } = req.query;

  const panels = await claddingService.listPanels({
    product: product as string,
    material: material as string,
    rib: rib as string,
  });

  ApiResponse.success({ res, data: panels });
});

/**
 * GET /api/v1/cladding/sku/:sku
 * Lookup a single panel by SKU
 */
export const getCladdingBySku = catchAsync(async (req: Request, res: Response) => {
  const { sku } = req.params;
  const panel = await claddingService.getBysku(sku);

  if (!panel) {
    throw ApiError.notFound(`Cladding panel with SKU "${sku}" not found`);
  }

  ApiResponse.success({ res, data: panel });
});

/**
 * POST /api/v1/admin/cladding/import
 * Upload an Excel file with columns: PRODUCT, MATERIAL, RIB, COVER, base price, GAUGE, SKU, UOM
 */
export const importCladdingPanels = catchAsync(async (req: Request, res: Response) => {
  console.log('[Cladding Import] File received:', req.file?.originalname, 'Size:', req.file?.size);
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
    if (val === 'PRODUCT' || val === 'PRODUCT NAME') colMap.product = colNumber;
    else if (val === 'MATERIAL') colMap.material = colNumber;
    else if (val === 'RIB') colMap.rib = colNumber;
    else if (val === 'COVER') colMap.cover = colNumber;
    else if (val.includes('PRICE') || val === 'BASE PRICE') colMap.basePrice = colNumber;
    else if (val === 'GAUGE') colMap.gauge = colNumber;
    else if (val === 'SKU') colMap.sku = colNumber;
    else if (val === 'UOM') colMap.uom = colNumber;
  });

  console.log('[Cladding Import] Column mapping:', JSON.stringify(colMap));
  if (!colMap.sku || !colMap.basePrice) {
    throw ApiError.badRequest('Excel must have at least SKU and base price columns. Found columns: ' + JSON.stringify(colMap));
  }

  const panels: Array<{
    product: string; material: string; rib: string;
    cover: number; basePrice: number; gauge: string; sku: string; uom: string;
  }> = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const sku = String(row.getCell(colMap.sku).value || '').trim();
    if (!sku) return; // skip empty rows

    panels.push({
      product: String(row.getCell(colMap.product || 0).value || '').trim(),
      material: String(row.getCell(colMap.material || 0).value || '').trim(),
      rib: String(row.getCell(colMap.rib || 0).value || '').trim(),
      cover: parseFloat(String(row.getCell(colMap.cover || 0).value || '0')),
      basePrice: parseFloat(String(row.getCell(colMap.basePrice).value || '0').toString().replace(/[$,]/g, '')),
      gauge: String(row.getCell(colMap.gauge || 0).value || '').trim(),
      sku,
      uom: String(row.getCell(colMap.uom || 0).value || 'LM').trim(),
    });
  });

  console.log('[Cladding Import] Parsed rows:', panels.length, 'First:', panels[0] ? JSON.stringify(panels[0]) : 'none');
  if (panels.length === 0) {
    throw ApiError.badRequest('No valid rows found in the file');
  }

  const results = await claddingService.bulkImport(panels);
  ApiResponse.success({ res, data: { ...results, totalRows: panels.length } });
});
