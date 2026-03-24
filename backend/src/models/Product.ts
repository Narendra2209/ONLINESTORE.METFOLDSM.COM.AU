import mongoose, { Schema, Document } from 'mongoose';

export interface IProductImage {
  url: string;
  publicId: string;
  alt: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface IConfigurableAttribute {
  attribute: mongoose.Types.ObjectId;
  isRequired: boolean;
  sortOrder: number;
  allowedValues: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  type: 'simple' | 'configurable';
  status: 'draft' | 'active' | 'archived';

  // Categorization
  category: mongoose.Types.ObjectId;
  categories: mongoose.Types.ObjectId[];
  tags: string[];

  // Description
  shortDescription: string;
  description: string;

  // Media
  images: IProductImage[];

  // Simple product pricing
  price: number | null;
  compareAtPrice: number | null;

  // Configurable product settings
  configurableAttributes: IConfigurableAttribute[];
  pricingModel: 'per_metre' | 'per_piece' | 'per_sheet' | 'quote_only' | null;

  // Stock
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;

  // Visibility
  isVisible: boolean;
  isFeatured: boolean;
  availableTo: 'all' | 'retail' | 'trade';

  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
  };

  // Technical
  specifications: Record<string, string>;
  technicalDocUrl: string;

  // Relationships
  relatedProducts: mongoose.Types.ObjectId[];

  // Audit
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;

  // Minimum order
  minimumOrderQty: number;
  maxLength: number | null;
  minLength: number | null;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
  }
);

const configurableAttributeSchema = new Schema<IConfigurableAttribute>(
  {
    attribute: { type: Schema.Types.ObjectId, ref: 'Attribute', required: true },
    isRequired: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    allowedValues: [{ type: String }],
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: ['simple', 'configurable'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },

    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    tags: [{ type: String }],

    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },

    images: [productImageSchema],

    price: { type: Number, default: null },
    compareAtPrice: { type: Number, default: null },

    configurableAttributes: [configurableAttributeSchema],
    pricingModel: {
      type: String,
      enum: ['per_metre', 'per_piece', 'per_sheet', 'quote_only', null],
      default: null,
    },

    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    trackInventory: { type: Boolean, default: true },

    isVisible: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    availableTo: {
      type: String,
      enum: ['all', 'retail', 'trade'],
      default: 'all',
    },

    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' },
    },

    specifications: { type: Map, of: String, default: {} },
    technicalDocUrl: { type: String, default: '' },

    relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },

    minimumOrderQty: { type: Number, default: 1 },
    maxLength: { type: Number, default: null },
    minLength: { type: Number, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
productSchema.index({ category: 1, status: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ status: 1, isVisible: 1, isFeatured: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', shortDescription: 'text', tags: 'text' });

export default mongoose.model<IProduct>('Product', productSchema);
