import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId | null;
  selectedAttributes: Array<{
    attribute: mongoose.Types.ObjectId;
    attributeName: string;
    value: string;
  }>;
  pricingModel: string;
  unitPrice: number;
  length: number | null;
  quantity: number;
  lineTotal: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId | null;
  sessionId: string;
  items: ICartItem[];
  coupon: mongoose.Types.ObjectId | null;
  expiresAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    selectedAttributes: [
      {
        attribute: { type: Schema.Types.ObjectId, ref: 'Attribute' },
        attributeName: { type: String },
        value: { type: String },
      },
    ],
    pricingModel: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    length: { type: Number, default: null },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: true }
);

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: String, default: '' },
    items: [cartItemSchema],
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ICart>('Cart', cartSchema);
