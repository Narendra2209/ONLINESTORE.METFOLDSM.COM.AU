import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IVariantAttribute {
  attribute: mongoose.Types.ObjectId;
  attributeName: string;
  value: string;
}

export interface IProductVariant extends Document {
  product: mongoose.Types.ObjectId;
  sku: string;
  attributes: IVariantAttribute[];
  priceOverride: number | null;
  stock: number;
  image: { url: string; publicId: string } | null;
  isActive: boolean;
  attributeHash: string;
}

const variantAttributeSchema = new Schema<IVariantAttribute>(
  {
    attribute: { type: Schema.Types.ObjectId, ref: 'Attribute', required: true },
    attributeName: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const productVariantSchema = new Schema<IProductVariant>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    attributes: [variantAttributeSchema],
    priceOverride: { type: Number, default: null },
    stock: { type: Number, default: 0 },
    image: {
      type: {
        url: String,
        publicId: String,
      },
      default: null,
    },
    isActive: { type: Boolean, default: true },
    attributeHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Generate attribute hash before save
productVariantSchema.pre('save', function (next) {
  if (this.isModified('attributes')) {
    const sorted = this.attributes
      .map((a) => `${a.attribute}:${a.value}`)
      .sort()
      .join('|');
    this.attributeHash = crypto.createHash('md5').update(sorted).digest('hex');
  }
  next();
});

productVariantSchema.index({ product: 1, isActive: 1 });
productVariantSchema.index({ product: 1, attributeHash: 1 });

export default mongoose.model<IProductVariant>('ProductVariant', productVariantSchema);
