import mongoose, { Schema, Document } from 'mongoose';

export interface IDambuster extends Document {
  productName: string;   // e.g., "DAM-BUSTER RAINHEAD WITH BOX GUTTER RECEIVER"
  material: string;      // e.g., "ZINC", "COLORBOND", "GAL"
  type: string;          // e.g., "Left Side", "Right Side"
  sku: string;           // e.g., "R200Z", "R200CB", "CR300Z"
  description: string;   // Product description
  basePrice: number;     // Base price in AUD
  currency: string;      // e.g., "AUD"
  isActive: boolean;
}

const dambusterSchema = new Schema<IDambuster>(
  {
    productName: { type: String, required: true, trim: true },
    material: { type: String, required: true, trim: true },
    type: { type: String, default: '', trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '', trim: true },
    basePrice: { type: Number, required: true },
    currency: { type: String, default: 'AUD', trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

dambusterSchema.index({ sku: 1 }, { unique: true });
dambusterSchema.index({ productName: 1, material: 1, type: 1 });
dambusterSchema.index({ material: 1, isActive: 1 });
dambusterSchema.index({ type: 1, isActive: 1 });

export default mongoose.model<IDambuster>('Dambuster', dambusterSchema);
