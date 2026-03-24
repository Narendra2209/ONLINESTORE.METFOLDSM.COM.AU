import mongoose, { Schema, Document } from 'mongoose';

export interface IAttributeValue {
  value: string;
  label: string;
  sortOrder: number;
  metadata?: Record<string, any>;
}

export interface IAttribute extends Document {
  name: string;
  slug: string;
  type: 'select' | 'number' | 'text' | 'color-swatch';
  unit: string;
  isRequired: boolean;
  isFilterable: boolean;
  isVisibleOnProduct: boolean;
  sortOrder: number;
  values: IAttributeValue[];
}

const attributeValueSchema = new Schema<IAttributeValue>(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const attributeSchema = new Schema<IAttribute>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: {
      type: String,
      enum: ['select', 'number', 'text', 'color-swatch'],
      required: true,
    },
    unit: { type: String, default: '' },
    isRequired: { type: Boolean, default: false },
    isFilterable: { type: Boolean, default: true },
    isVisibleOnProduct: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    values: [attributeValueSchema],
  },
  { timestamps: true }
);


export default mongoose.model<IAttribute>('Attribute', attributeSchema);
