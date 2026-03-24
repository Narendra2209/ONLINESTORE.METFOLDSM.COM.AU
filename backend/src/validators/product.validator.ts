import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  type: z.enum(['simple', 'configurable']),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.number().nullable().optional(),
  compareAtPrice: z.number().nullable().optional(),
  configurableAttributes: z
    .array(
      z.object({
        attribute: z.string(),
        isRequired: z.boolean().default(true),
        sortOrder: z.number().default(0),
        allowedValues: z.array(z.string()),
      })
    )
    .optional(),
  pricingModel: z.enum(['per_metre', 'per_piece', 'per_sheet', 'quote_only']).nullable().optional(),
  stock: z.number().default(0),
  trackInventory: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  availableTo: z.enum(['all', 'retail', 'trade']).default('all'),
  minimumOrderQty: z.number().default(1),
  maxLength: z.number().nullable().optional(),
  minLength: z.number().nullable().optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      canonicalUrl: z.string().optional(),
    })
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const calculatePriceSchema = z.object({
  selectedAttributes: z.record(z.string()),
  length: z.number().positive().optional(),
  quantity: z.number().int().positive().default(1),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  parent: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
    })
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createAttributeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  type: z.enum(['select', 'number', 'text', 'color-swatch']),
  unit: z.string().optional(),
  isRequired: z.boolean().default(false),
  isFilterable: z.boolean().default(true),
  isVisibleOnProduct: z.boolean().default(true),
  sortOrder: z.number().default(0),
  values: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        sortOrder: z.number().default(0),
        metadata: z.record(z.any()).optional(),
      })
    )
    .optional(),
});

export const createPricingRuleSchema = z.object({
  name: z.string().min(1),
  baseRate: z.number().positive(),
  modifiers: z
    .array(
      z.object({
        type: z.string(),
        label: z.string(),
        condition: z.object({
          attribute: z.string(),
          value: z.string(),
        }),
        adjustmentType: z.enum(['multiplier', 'fixed_add', 'percentage_add']),
        adjustmentValue: z.number(),
      })
    )
    .optional(),
  quantityBreaks: z
    .array(
      z.object({
        minQty: z.number().int().positive(),
        maxQty: z.number().int().positive().nullable(),
        discountType: z.enum(['percentage', 'fixed_per_unit']),
        discountValue: z.number().positive(),
      })
    )
    .optional(),
  tradePriceModifier: z
    .object({
      adjustmentType: z.enum(['percentage_discount', 'fixed_price']).nullable(),
      adjustmentValue: z.number(),
    })
    .optional(),
  isActive: z.boolean().default(true),
  priority: z.number().default(0),
});
