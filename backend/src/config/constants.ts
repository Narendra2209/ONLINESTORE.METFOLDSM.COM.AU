export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
] as const;

export const USER_TYPES = ['retail', 'trade'] as const;

export const PRICING_MODELS = ['per_metre', 'per_piece', 'per_sheet', 'quote_only'] as const;

export const PRODUCT_TYPES = ['simple', 'configurable'] as const;

export const PRODUCT_STATUSES = ['draft', 'active', 'archived'] as const;

export const FINISH_CATEGORIES = [
  'colorbond',
  'galvanised',
  'matt_colorbond',
  'ultra',
  'zinc',
] as const;

export const ROLE_NAMES = [
  'super_admin',
  'admin',
  'manager',
  'sales_staff',
  'inventory_staff',
  'content_staff',
  'customer',
] as const;

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;

export const ADJUSTMENT_TYPES = ['multiplier', 'fixed_add', 'percentage_add'] as const;

export const ATTRIBUTE_TYPES = ['select', 'number', 'text', 'color-swatch'] as const;

export const GST_RATE = 0.1; // Australian GST 10%

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};
