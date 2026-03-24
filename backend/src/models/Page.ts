import mongoose, { Schema, Document } from 'mongoose';

export interface IPage extends Document {
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

const pageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true }
);


export default mongoose.model<IPage>('Page', pageSchema);
