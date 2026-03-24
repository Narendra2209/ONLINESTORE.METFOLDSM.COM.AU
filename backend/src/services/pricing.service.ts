import PricingRule, { IPricingRule } from '../models/PricingRule';
import Product, { IProduct } from '../models/Product';
import ProductVariant from '../models/ProductVariant';
import { ApiError } from '../utils/ApiError';
import { roundPrice } from '../utils/helpers';

export interface PriceCalculationInput {
  productId: string;
  selectedAttributes: Record<string, string>; // { attributeId: value }
  length?: number;
  quantity: number;
  userType?: 'retail' | 'trade';
}

export interface PriceBreakdown {
  baseRate: number;
  adjustments: Array<{
    type: string;
    label: string;
    adjustmentType: string;
    adjustmentValue: number;
    resultingRate: number;
  }>;
  calculatedRate: number;
  length: number | null;
  quantity: number;
  unitPrice: number;
  quantityDiscount: number;
  tradeDiscount: number;
  lineTotal: number;
  pricingModel: string;
}

export const pricingService = {
  /**
   * Core pricing engine — calculates the price for a product
   * based on selected attributes, length, quantity, and user type.
   */
  async calculatePrice(input: PriceCalculationInput): Promise<PriceBreakdown> {
    const product = await Product.findById(input.productId);
    if (!product) throw ApiError.notFound('Product not found');

    // Simple product — fixed price
    if (product.type === 'simple') {
      if (product.price == null) throw ApiError.badRequest('Product has no price set');
      const unitPrice = product.price;
      const lineTotal = roundPrice(unitPrice * input.quantity);
      return {
        baseRate: unitPrice,
        adjustments: [],
        calculatedRate: unitPrice,
        length: null,
        quantity: input.quantity,
        unitPrice,
        quantityDiscount: 0,
        tradeDiscount: 0,
        lineTotal,
        pricingModel: 'fixed',
      };
    }

    // Configurable product — use pricing rules
    if (product.pricingModel === 'quote_only') {
      return {
        baseRate: 0,
        adjustments: [],
        calculatedRate: 0,
        length: null,
        quantity: input.quantity,
        unitPrice: 0,
        quantityDiscount: 0,
        tradeDiscount: 0,
        lineTotal: 0,
        pricingModel: 'quote_only',
      };
    }

    // First check for variant with price override
    const variant = await this.findMatchingVariant(input.productId, input.selectedAttributes);
    if (variant?.priceOverride != null) {
      const unitPrice = variant.priceOverride;
      const lineTotal = roundPrice(unitPrice * input.quantity);
      return {
        baseRate: unitPrice,
        adjustments: [],
        calculatedRate: unitPrice,
        length: null,
        quantity: input.quantity,
        unitPrice,
        quantityDiscount: 0,
        tradeDiscount: 0,
        lineTotal,
        pricingModel: 'variant_override',
      };
    }

    // Find active pricing rule with highest priority
    const rule = await PricingRule.findOne({
      product: input.productId,
      isActive: true,
    }).sort({ priority: -1 });

    if (!rule) {
      throw ApiError.badRequest('No active pricing rule found for this product');
    }

    // Start with base rate
    let rate = rule.baseRate;
    const adjustments: PriceBreakdown['adjustments'] = [];

    // Apply modifiers based on selected attributes
    for (const modifier of rule.modifiers) {
      const attrId = modifier.condition.attribute.toString();
      const selectedValue = input.selectedAttributes[attrId];

      if (selectedValue && selectedValue === modifier.condition.value) {
        const prevRate = rate;

        switch (modifier.adjustmentType) {
          case 'multiplier':
            rate = rate * modifier.adjustmentValue;
            break;
          case 'fixed_add':
            rate = rate + modifier.adjustmentValue;
            break;
          case 'percentage_add':
            rate = rate * (1 + modifier.adjustmentValue / 100);
            break;
        }

        rate = roundPrice(rate);

        adjustments.push({
          type: modifier.type,
          label: modifier.label,
          adjustmentType: modifier.adjustmentType,
          adjustmentValue: modifier.adjustmentValue,
          resultingRate: rate,
        });
      }
    }

    const calculatedRate = rate;
    let unitPrice: number;
    const length = input.length || null;

    // Calculate unit price based on pricing model
    switch (product.pricingModel) {
      case 'per_metre':
        if (!input.length || input.length <= 0) {
          throw ApiError.badRequest('Length is required for per-metre pricing');
        }
        if (product.minLength && input.length < product.minLength) {
          throw ApiError.badRequest(`Minimum length is ${product.minLength}m`);
        }
        if (product.maxLength && input.length > product.maxLength) {
          throw ApiError.badRequest(`Maximum length is ${product.maxLength}m`);
        }
        unitPrice = roundPrice(rate * input.length);
        break;

      case 'per_piece':
      case 'per_sheet':
        unitPrice = rate;
        break;

      default:
        unitPrice = rate;
    }

    // Apply quantity breaks
    let quantityDiscount = 0;
    if (rule.quantityBreaks.length > 0) {
      const applicableBreak = rule.quantityBreaks
        .filter(
          (qb) =>
            input.quantity >= qb.minQty &&
            (qb.maxQty === null || input.quantity <= qb.maxQty)
        )
        .sort((a, b) => b.minQty - a.minQty)[0];

      if (applicableBreak) {
        if (applicableBreak.discountType === 'percentage') {
          quantityDiscount = roundPrice(unitPrice * (applicableBreak.discountValue / 100));
          unitPrice = roundPrice(unitPrice - quantityDiscount);
        } else {
          quantityDiscount = applicableBreak.discountValue;
          unitPrice = roundPrice(unitPrice - applicableBreak.discountValue);
        }
      }
    }

    // Apply trade pricing
    let tradeDiscount = 0;
    if (input.userType === 'trade' && rule.tradePriceModifier?.adjustmentType) {
      if (rule.tradePriceModifier.adjustmentType === 'percentage_discount') {
        tradeDiscount = roundPrice(
          unitPrice * (rule.tradePriceModifier.adjustmentValue / 100)
        );
        unitPrice = roundPrice(unitPrice - tradeDiscount);
      } else if (rule.tradePriceModifier.adjustmentType === 'fixed_price') {
        tradeDiscount = roundPrice(unitPrice - rule.tradePriceModifier.adjustmentValue);
        unitPrice = rule.tradePriceModifier.adjustmentValue;
      }
    }

    // Ensure minimum order quantity
    if (input.quantity < (product.minimumOrderQty || 1)) {
      throw ApiError.badRequest(
        `Minimum order quantity is ${product.minimumOrderQty}`
      );
    }

    const lineTotal = roundPrice(unitPrice * input.quantity);

    return {
      baseRate: rule.baseRate,
      adjustments,
      calculatedRate,
      length,
      quantity: input.quantity,
      unitPrice,
      quantityDiscount,
      tradeDiscount,
      lineTotal,
      pricingModel: product.pricingModel || 'per_piece',
    };
  },

  /**
   * Find a variant matching the selected attribute combination
   */
  async findMatchingVariant(productId: string, selectedAttributes: Record<string, string>) {
    const crypto = await import('crypto');
    const sorted = Object.entries(selectedAttributes)
      .map(([attrId, value]) => `${attrId}:${value}`)
      .sort()
      .join('|');
    const hash = crypto.createHash('md5').update(sorted).digest('hex');

    return ProductVariant.findOne({
      product: productId,
      attributeHash: hash,
      isActive: true,
    });
  },

  /**
   * Get price range for a product (for listing pages)
   */
  async getPriceRange(productId: string): Promise<{ min: number; max: number } | null> {
    const product = await Product.findById(productId);
    if (!product) return null;

    if (product.type === 'simple' && product.price != null) {
      return { min: product.price, max: product.price };
    }

    if (product.pricingModel === 'quote_only') return null;

    // Check variant price overrides
    const variants = await ProductVariant.find({
      product: productId,
      isActive: true,
      priceOverride: { $ne: null },
    }).select('priceOverride');

    if (variants.length > 0) {
      const prices = variants.map((v) => v.priceOverride!);
      return { min: Math.min(...prices), max: Math.max(...prices) };
    }

    // Use pricing rules to estimate range
    const rule = await PricingRule.findOne({
      product: productId,
      isActive: true,
    }).sort({ priority: -1 });

    if (!rule) return null;

    // Calculate min/max by simulating with modifier extremes
    let minRate = rule.baseRate;
    let maxRate = rule.baseRate;

    for (const modifier of rule.modifiers) {
      switch (modifier.adjustmentType) {
        case 'multiplier':
          if (modifier.adjustmentValue < 1) {
            minRate *= modifier.adjustmentValue;
          } else {
            maxRate *= modifier.adjustmentValue;
          }
          break;
        case 'fixed_add':
          if (modifier.adjustmentValue > 0) {
            maxRate += modifier.adjustmentValue;
          } else {
            minRate += modifier.adjustmentValue;
          }
          break;
        case 'percentage_add':
          if (modifier.adjustmentValue > 0) {
            maxRate *= 1 + modifier.adjustmentValue / 100;
          }
          break;
      }
    }

    return { min: roundPrice(minRate), max: roundPrice(maxRate) };
  },

  /**
   * Create or update a pricing rule
   */
  async upsertPricingRule(productId: string, ruleData: Partial<IPricingRule>) {
    const product = await Product.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');

    if (ruleData._id) {
      return PricingRule.findByIdAndUpdate(ruleData._id, ruleData, { new: true });
    }

    return PricingRule.create({ ...ruleData, product: productId });
  },
};
