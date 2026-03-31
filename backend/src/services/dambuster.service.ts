import Dambuster, { IDambuster } from '../models/Dambuster';
import { ApiError } from '../utils/ApiError';
import { roundPrice } from '../utils/helpers';

export interface DambusterPriceInput {
  sku?: string;
  productName?: string;
  material?: string;
  type?: string;
  quantity: number;
}

export interface DambusterPriceResult {
  sku: string;
  productName: string;
  material: string;
  type: string;
  description: string;
  basePrice: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
}

export const dambusterService = {
  /**
   * Calculate dambuster price: basePrice * quantity
   */
  async calculatePrice(input: DambusterPriceInput): Promise<DambusterPriceResult> {
    let panel: IDambuster | null = null;

    if (input.sku) {
      panel = await Dambuster.findOne({
        sku: { $regex: new RegExp(`^${input.sku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        isActive: true,
      });
    }

    if (!panel && input.productName && input.material) {
      const query: any = {
        productName: { $regex: new RegExp(`^${input.productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        material: { $regex: new RegExp(`^${input.material.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        isActive: true,
      };
      if (input.type) {
        query.type = { $regex: new RegExp(`^${input.type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
      }
      panel = await Dambuster.findOne(query);
    }

    if (!panel) {
      throw ApiError.notFound('Dambuster product not found for this configuration');
    }

    if (input.quantity <= 0) {
      throw ApiError.badRequest('Quantity must be greater than 0');
    }

    const unitPrice = roundPrice(panel.basePrice);
    const lineTotal = roundPrice(unitPrice * input.quantity);

    return {
      sku: panel.sku,
      productName: panel.productName,
      material: panel.material,
      type: panel.type,
      description: panel.description,
      basePrice: panel.basePrice,
      quantity: input.quantity,
      unitPrice,
      lineTotal,
      currency: panel.currency,
    };
  },

  /**
   * List all dambuster products, optionally filtered
   */
  async listProducts(filters: {
    productName?: string;
    material?: string;
    type?: string;
  }) {
    const query: any = { isActive: true };
    if (filters.productName) query.productName = { $regex: new RegExp(filters.productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
    if (filters.material) query.material = { $regex: new RegExp(`^${filters.material.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    if (filters.type) query.type = { $regex: new RegExp(`^${filters.type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };

    return Dambuster.find(query).sort({ productName: 1, material: 1, type: 1 }).lean();
  },

  /**
   * Lookup by SKU
   */
  async getBySku(sku: string) {
    return Dambuster.findOne({
      sku: { $regex: new RegExp(`^${sku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      isActive: true,
    }).lean();
  },

  /**
   * Get distinct values for filters (product names, materials, types)
   */
  async getFilterOptions() {
    const [productNames, materials, types] = await Promise.all([
      Dambuster.distinct('productName', { isActive: true }),
      Dambuster.distinct('material', { isActive: true }),
      Dambuster.distinct('type', { isActive: true }),
    ]);
    return { productNames: productNames.sort(), materials: materials.sort(), types: types.sort() };
  },

  /**
   * Bulk import dambuster products from uploaded data
   */
  async bulkImport(products: Array<{
    productName: string;
    material: string;
    type: string;
    sku: string;
    description: string;
    basePrice: number;
    currency: string;
  }>) {
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const row of products) {
      try {
        const existing = await Dambuster.findOne({ sku: row.sku.toUpperCase() });
        await Dambuster.findOneAndUpdate(
          { sku: row.sku.toUpperCase() },
          {
            productName: row.productName,
            material: row.material,
            type: row.type,
            sku: row.sku.toUpperCase(),
            description: row.description,
            basePrice: row.basePrice,
            currency: row.currency || 'AUD',
            isActive: true,
          },
          { upsert: true, new: true }
        );
        if (existing) {
          results.updated++;
        } else {
          results.created++;
        }
      } catch (err: any) {
        results.errors.push(`SKU ${row.sku}: ${err.message}`);
      }
    }

    return results;
  },
};
