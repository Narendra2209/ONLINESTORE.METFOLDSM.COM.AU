import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingModifier {
  type: string;
  label: string;
  condition: {
    attribute: mongoose.Types.ObjectId;
    value: string;
  };
  adjustmentType: 'multiplier' | 'fixed_add' | 'percentage_add';
  adjustmentValue: number;
}

export interface IQuantityBreak {
  minQty: number;
  maxQty: number | null;
  discountType: 'percentage' | 'fixed_per_unit';
  discountValue: number;
}

export interface IPricingRule extends Document {
  product: mongoose.Types.ObjectId;
  name: string;
  baseRate: number;
  modifiers: IPricingModifier[];
  quantityBreaks: IQuantityBreak[];
  tradePriceModifier: {
    adjustmentType: 'percentage_discount' | 'fixed_price' | null;
    adjustmentValue: number;
  };
  isActive: boolean;
  priority: number;
}

const pricingModifierSchema = new Schema<IPricingModifier>(
  {
    type: { type: String, required: true },
    label: { type: String, required: true },
    condition: {
      attribute: { type: Schema.Types.ObjectId, ref: 'Attribute', required: true },
      value: { type: String, required: true },
    },
    adjustmentType: {
      type: String,
      enum: ['multiplier', 'fixed_add', 'percentage_add'],
      required: true,
    },
    adjustmentValue: { type: Number, required: true },
  },
  { _id: false }
);

const quantityBreakSchema = new Schema<IQuantityBreak>(
  {
    minQty: { type: Number, required: true },
    maxQty: { type: Number, default: null },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_per_unit'],
      required: true,
    },
    discountValue: { type: Number, required: true },
  },
  { _id: false }
);

const pricingRuleSchema = new Schema<IPricingRule>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    baseRate: { type: Number, required: true },
    modifiers: [pricingModifierSchema],
    quantityBreaks: [quantityBreakSchema],
    tradePriceModifier: {
      adjustmentType: {
        type: String,
        enum: ['percentage_discount', 'fixed_price', null],
        default: null,
      },
      adjustmentValue: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pricingRuleSchema.index({ product: 1, isActive: 1, priority: -1 });

export default mongoose.model<IPricingRule>('PricingRule', pricingRuleSchema);
