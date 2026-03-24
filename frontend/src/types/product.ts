export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; publicId: string };
  parent: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
  productCount?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface AttributeValue {
  value: string;
  label: string;
  sortOrder: number;
  metadata?: Record<string, any>;
}

export interface Attribute {
  _id: string;
  name: string;
  slug: string;
  type: 'select' | 'number' | 'text' | 'color-swatch';
  unit?: string;
  isRequired: boolean;
  isFilterable: boolean;
  values: AttributeValue[];
}

export interface ProductImage {
  _id: string;
  url: string;
  publicId: string;
  alt: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface ConfigurableAttribute {
  attribute: Attribute;
  isRequired: boolean;
  sortOrder: number;
  allowedValues: string[];
}

export interface ProductVariant {
  _id: string;
  product: string;
  sku: string;
  attributes: Array<{
    attribute: string;
    attributeName: string;
    value: string;
  }>;
  priceOverride: number | null;
  stock: number;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  type: 'simple' | 'configurable';
  status: 'draft' | 'active' | 'archived';
  category: Category;
  categories: string[];
  tags: string[];
  shortDescription: string;
  description: string;
  images: ProductImage[];
  price?: number;
  compareAtPrice?: number;
  priceRange?: { min: number; max: number };
  configurableAttributes: ConfigurableAttribute[];
  pricingModel?: 'per_metre' | 'per_piece' | 'per_sheet' | 'quote_only';
  stock: number;
  trackInventory: boolean;
  minimumOrderQty?: number;
  minLength?: number;
  maxLength?: number;
  isVisible: boolean;
  isFeatured: boolean;
  availableTo: 'all' | 'retail' | 'trade';
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };
  specifications?: Record<string, string>;
  relatedProducts?: Product[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface PriceCalculationRequest {
  productId: string;
  selectedAttributes: Record<string, string>;
  length?: number;
  quantity: number;
}

export interface PriceCalculationResponse {
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

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  finishCategory?: string;
  colour?: string;
  thickness?: string;
  availability?: 'in_stock' | 'out_of_stock';
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}
