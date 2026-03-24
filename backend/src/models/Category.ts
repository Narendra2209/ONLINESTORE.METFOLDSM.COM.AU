import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image: { url: string; publicId: string } | null;
  parent: mongoose.Types.ObjectId | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    image: {
      type: {
        url: String,
        publicId: String,
      },
      default: null,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    level: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

categorySchema.index({ parent: 1, sortOrder: 1 });
categorySchema.index({ isActive: 1 });

export default mongoose.model<ICategory>('Category', categorySchema);
