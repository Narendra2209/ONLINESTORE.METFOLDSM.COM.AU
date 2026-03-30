import CladdingPanel, { ICladdingPanel } from '../models/CladdingPanel';
import { ApiError } from '../utils/ApiError';
import { roundPrice } from '../utils/helpers';

export interface CladdingPriceInput {
  sku?: string;
  product?: string;
  material?: string;
  rib?: string;
  cover?: number;
  length: number;      // in metres
  quantity: number;
}

export interface CladdingPriceResult {
  sku: string;
  product: string;
  material: string;
  rib: string;
  cover: number;
  basePrice: number;   // per LM
  length: number;
  quantity: number;
  unitPrice: number;   // basePrice * length
  lineTotal: number;   // unitPrice * quantity
  uom: string;
}

export const claddingService = {
  /**
   * Calculate cladding panel price: basePrice * length * quantity
   */
  async calculatePrice(input: CladdingPriceInput): Promise<CladdingPriceResult> {
    let panel: ICladdingPanel | null = null;

    if (input.sku) {
      panel = await CladdingPanel.findOne({
        sku: { $regex: new RegExp(`^${input.sku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        isActive: true,
      });
    }

    if (!panel && input.product && input.material && input.rib && input.cover) {
      panel = await CladdingPanel.findOne({
        product: { $regex: new RegExp(`^${input.product}$`, 'i') },
        material: { $regex: new RegExp(`^${input.material}$`, 'i') },
        rib: input.rib,
        cover: input.cover,
        isActive: true,
      });
    }

    if (!panel) {
      throw ApiError.notFound('Cladding panel not found for this configuration');
    }

    if (input.length <= 0) {
      throw ApiError.badRequest('Length must be greater than 0');
    }
    if (input.quantity <= 0) {
      throw ApiError.badRequest('Quantity must be greater than 0');
    }

    const unitPrice = roundPrice(panel.basePrice * input.length);
    const lineTotal = roundPrice(unitPrice * input.quantity);

    return {
      sku: panel.sku,
      product: panel.product,
      material: panel.material,
      rib: panel.rib,
      cover: panel.cover,
      basePrice: panel.basePrice,
      length: input.length,
      quantity: input.quantity,
      unitPrice,
      lineTotal,
      uom: panel.uom,
    };
  },

  /**
   * List all cladding panels, optionally filtered
   */
  async listPanels(filters: {
    product?: string;
    material?: string;
    rib?: string;
  }) {
    const query: any = { isActive: true };
    if (filters.product) query.product = { $regex: new RegExp(`^${filters.product}$`, 'i') };
    if (filters.material) query.material = { $regex: new RegExp(`^${filters.material}$`, 'i') };
    if (filters.rib) query.rib = filters.rib;

    return CladdingPanel.find(query).sort({ product: 1, material: 1, rib: 1, cover: 1 }).lean();
  },

  /**
   * Lookup price by SKU
   */
  async getBysku(sku: string) {
    return CladdingPanel.findOne({
      sku: { $regex: new RegExp(`^${sku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      isActive: true,
    }).lean();
  },

  /**
   * Bulk import cladding panels from uploaded data
   */
  async bulkImport(panels: Array<{
    product: string;
    material: string;
    rib: string;
    cover: number;
    basePrice: number;
    gauge?: string;
    sku: string;
    uom?: string;
  }>) {
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const row of panels) {
      try {
        await CladdingPanel.findOneAndUpdate(
          { sku: row.sku.toUpperCase() },
          {
            product: row.product,
            material: row.material,
            rib: row.rib,
            cover: row.cover,
            basePrice: row.basePrice,
            gauge: row.gauge || '',
            sku: row.sku.toUpperCase(),
            uom: row.uom || 'LM',
            isActive: true,
          },
          { upsert: true, new: true }
        );
        results.created++;
      } catch (err: any) {
        results.errors.push(`SKU ${row.sku}: ${err.message}`);
      }
    }

    return results;
  },
};
